"""Local web API for the Yoto card library."""

import json
import os
import threading
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

import config
from extractor import extract_urls, sync_recovery_list

_jobs_lock = threading.Lock()
_jobs = {}
_active_job_id = None


def _read_card(folder):
    path = os.path.join(folder, "card.json")
    if not os.path.isfile(path):
        return None
    with open(path, encoding="utf-8") as handle:
        data = json.load(handle)
    if not isinstance(data, dict) or not data.get("cardId"):
        return None
    return data


def _track_titles(card):
    titles = []
    for chapter in card.get("chapters") or []:
        if not isinstance(chapter, dict):
            continue
        if chapter.get("title"):
            titles.append(str(chapter["title"]))
        for track in chapter.get("tracks") or []:
            if isinstance(track, dict) and track.get("title"):
                titles.append(str(track["title"]))
    return titles


def list_cards():
    library = config.load_config()["library_dir"]
    cards = []
    if not os.path.isdir(library):
        return cards
    for name in os.listdir(library):
        if name.startswith("."):
            continue
        folder = os.path.join(library, name)
        if not os.path.isdir(folder):
            continue
        try:
            card = _read_card(folder)
        except (OSError, json.JSONDecodeError):
            continue
        if card is None:
            continue
        cards.append({
            "cardId": card["cardId"],
            "title": card.get("title") or card["cardId"],
            "author": card.get("author") or "",
            "category": card.get("category"),
            "languages": card.get("languages") or [],
            "trackTitles": _track_titles(card),
            "trackCount": card.get("trackCount") or 0,
            "readableDuration": card.get("readableDuration"),
            "cover": card.get("cover"),
        })
    cards.sort(key=lambda item: item["title"].casefold())
    return cards


def get_card(card_id):
    if os.path.basename(card_id) != card_id or card_id.startswith("."):
        return None
    folder = os.path.join(config.load_config()["library_dir"], card_id)
    if not os.path.isdir(folder):
        return None
    try:
        return _read_card(folder)
    except (OSError, json.JSONDecodeError):
        return None


def card_file(card_id, relative):
    if os.path.basename(card_id) != card_id or card_id.startswith("."):
        raise HTTPException(status_code=404)
    library = os.path.realpath(config.load_config()["library_dir"])
    root = os.path.realpath(os.path.join(library, card_id))
    if os.path.commonpath([library, root]) != library:
        raise HTTPException(status_code=404)
    target = os.path.realpath(os.path.join(root, relative))
    if os.path.commonpath([root, target]) != root or not os.path.isfile(target):
        raise HTTPException(status_code=404)
    return target


class SettingsBody(BaseModel):
    library_dir: str
    backup_dir: str


class JobBody(BaseModel):
    urls: str


def _apply_event(job, event):
    kind = event.get("type")
    if kind == "log":
        job["logs"].append({"level": event.get("level", "info"), "message": event.get("message", "")})
        if len(job["logs"]) > 2000:
            del job["logs"][:-2000]
    elif kind == "status":
        job["total"] = event.get("total", job["total"])
        job["finished"] = event.get("finished", job["finished"])
        job["currentUrl"] = event.get("url") or ""
    elif kind == "result":
        if event.get("status") == "ok":
            job["succeeded"].append({
                "cardId": event.get("cardId"),
                "title": event.get("title"),
                "url": event.get("url"),
                "backup": event.get("backup"),
            })
        else:
            job["failed"].append({
                "url": event.get("url"),
                "error": event.get("error") or "Download failed.",
            })


def _run_job(job_id, urls):
    global _active_job_id
    settings = config.load_config()

    def on_event(event):
        with _jobs_lock:
            job = _jobs.get(job_id)
            if job is not None:
                _apply_event(job, event)

    try:
        extract_urls(urls, settings["library_dir"], settings["backup_dir"], on_event)
    except Exception as ex:
        on_event({"type": "log", "level": "error", "message": f"Download stopped: {ex}"})
    finally:
        with _jobs_lock:
            job = _jobs.get(job_id)
            if job is not None:
                job["status"] = "done"
                job["currentUrl"] = ""
            if _active_job_id == job_id:
                _active_job_id = None


def _public_job(job):
    return {
        "id": job["id"],
        "status": job["status"],
        "total": job["total"],
        "finished": job["finished"],
        "currentUrl": job["currentUrl"],
        "logs": list(job["logs"]),
        "succeeded": list(job["succeeded"]),
        "failed": list(job["failed"]),
    }


@asynccontextmanager
async def lifespan(_app):
    settings = config.load_config()
    os.makedirs(settings["library_dir"], exist_ok=True)
    os.makedirs(settings["backup_dir"], exist_ok=True)
    try:
        sync_recovery_list(settings["library_dir"], settings["backup_dir"])
    except OSError:
        pass
    yield


app = FastAPI(title="Yoto Library", lifespan=lifespan)


@app.get("/api/settings")
def read_settings():
    return config.load_config()


@app.put("/api/settings")
def write_settings(body: SettingsBody):
    global _active_job_id
    with _jobs_lock:
        if _active_job_id is not None:
            raise HTTPException(status_code=409, detail="Wait until the current download finishes.")
    try:
        library_dir = config.resolve_dir(body.library_dir)
        backup_dir = config.resolve_dir(body.backup_dir)
    except ValueError as ex:
        raise HTTPException(status_code=400, detail=str(ex)) from ex
    if os.path.realpath(library_dir) == os.path.realpath(backup_dir):
        raise HTTPException(status_code=400, detail="The library and backup folders must be different.")
    try:
        os.makedirs(library_dir, exist_ok=True)
        os.makedirs(backup_dir, exist_ok=True)
    except OSError as ex:
        raise HTTPException(status_code=400, detail=f"Could not use those folders: {ex}") from ex
    if not os.path.isdir(library_dir) or not os.path.isdir(backup_dir):
        raise HTTPException(status_code=400, detail="Both paths need to be folders.")
    saved = {"library_dir": library_dir, "backup_dir": backup_dir}
    config.save_config(saved)
    return saved


@app.get("/api/cards")
def read_cards():
    return list_cards()


@app.get("/api/cards/{card_id}")
def read_card(card_id: str):
    card = get_card(card_id)
    if card is None:
        raise HTTPException(status_code=404, detail="Card not found.")
    return card


@app.get("/api/cards/{card_id}/files/{file_path:path}")
def read_card_file(card_id: str, file_path: str):
    return FileResponse(card_file(card_id, file_path))


@app.get("/api/jobs/current")
def current_job():
    with _jobs_lock:
        if _active_job_id and _active_job_id in _jobs:
            return _public_job(_jobs[_active_job_id])
        return {"status": "idle"}


@app.get("/api/jobs/{job_id}")
def read_job(job_id: str):
    with _jobs_lock:
        job = _jobs.get(job_id)
        if job is None:
            raise HTTPException(status_code=404, detail="Download not found.")
        return _public_job(job)


@app.post("/api/jobs")
def start_job(body: JobBody):
    global _active_job_id
    urls = [line.strip() for line in body.urls.splitlines() if line.strip()]
    if not urls:
        raise HTTPException(status_code=400, detail="Paste at least one URL.")
    with _jobs_lock:
        if _active_job_id is not None:
            raise HTTPException(status_code=409, detail="A download is already running.")
        job_id = uuid.uuid4().hex
        job = {
            "id": job_id,
            "status": "running",
            "total": len(urls),
            "finished": 0,
            "currentUrl": "",
            "logs": [],
            "succeeded": [],
            "failed": [],
        }
        _jobs[job_id] = job
        _active_job_id = job_id
        finished = [
            item_id for item_id, item in _jobs.items()
            if item["status"] == "done" and item_id != job_id
        ]
        for item_id in finished[:-2]:
            _jobs.pop(item_id, None)
        public = _public_job(job)
    thread = threading.Thread(target=_run_job, args=(job_id, urls), daemon=True)
    thread.start()
    return public


static_dir = os.path.join(config.resource_dir(), "static")


@app.get("/")
def index_page():
    return FileResponse(os.path.join(static_dir, "index.html"))


app.mount("/assets", StaticFiles(directory=static_dir), name="assets")
