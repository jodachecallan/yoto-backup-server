"""Library and backup folders, stored beside the app."""

import json
import os
import sys

CONFIG_NAME = "config.json"


def install_dir():
    """Writable directory: next to the executable when frozen, else next to this file."""
    if getattr(sys, "frozen", False):
        return os.path.dirname(os.path.abspath(sys.executable))
    return os.path.dirname(os.path.abspath(__file__))


def resource_dir():
    """Bundled files. PyInstaller unpacks these into a temp folder."""
    return getattr(sys, "_MEIPASS", install_dir())


def config_path():
    return os.path.join(install_dir(), CONFIG_NAME)


def default_config():
    root = install_dir()
    return {
        "library_dir": os.path.join(root, "library"),
        "backup_dir": os.path.join(root, "backups"),
    }


def resolve_dir(path):
    path = os.path.expanduser((path or "").strip())
    if not path:
        raise ValueError("Choose a folder.")
    if not os.path.isabs(path):
        path = os.path.join(install_dir(), path)
    return os.path.abspath(path)


def load_config():
    path = config_path()
    config = default_config()
    if os.path.exists(path):
        with open(path, encoding="utf-8") as handle:
            stored = json.load(handle)
        if isinstance(stored, dict):
            for key in ("library_dir", "backup_dir"):
                if stored.get(key):
                    config[key] = resolve_dir(stored[key])
    return config


def save_config(config):
    path = config_path()
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(
            {
                "library_dir": config["library_dir"],
                "backup_dir": config["backup_dir"],
            },
            handle,
            indent=2,
        )
        handle.write("\n")
