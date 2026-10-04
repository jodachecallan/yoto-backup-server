const view = document.querySelector("#view");
const navButtons = document.querySelectorAll(".nav-btn");

const state = {
  page: "home",
  cardId: null,
  jobTimer: null,
  cards: [],
  query: "",
  author: "",
  category: "",
};

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.cardId = null;
    show(button.dataset.view);
  });
});

function show(page) {
  stopJobPoll();
  state.page = page;
  state.cardId = page === "library" ? state.cardId : null;
  navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === page);
  });
  if (page === "home") loadHome();
  if (page === "library") loadLibrary();
  if (page === "add") loadAdd();
  if (page === "settings") loadSettings();
}

function loadHome() {
  view.innerHTML = `
    <section class="home">
      <h2>A backup of the Yoto cards you already own</h2>
      <p class="lede">This page runs only on this computer. Paste a card’s Yoto URL and the app saves the cover, the audio, and the card details here, then writes a second copy you can keep somewhere else.</p>
      <ol class="steps">
        <li>
          <strong>Get the card URL.</strong>
          Read the card with a phone NFC app such as NXP TagInfo, then copy the link it shows.
        </li>
        <li>
          <strong>Add the cards.</strong>
          Paste one or more URLs. Each card is stored in your library folder, with its cover, tracks, and <code>card.json</code>.
        </li>
        <li>
          <strong>Keep a second copy.</strong>
          A zip of that card is written to your backup folder, separate from the library files.
        </li>
        <li>
          <strong>Keep the recovery list.</strong>
          <code>recovery.json</code> in the backup folder records the card id, title, and URL, so the cards can be downloaded again if the library files are lost.
        </li>
      </ol>
      <div class="home-actions">
        <button type="button" class="primary" id="go-library">Open library</button>
        <button type="button" class="ghost" id="go-add">Add cards</button>
      </div>
    </section>`;
  document.querySelector("#go-library").addEventListener("click", () => show("library"));
  document.querySelector("#go-add").addEventListener("click", () => show("add"));
}

async function api(path, options) {
  const response = await fetch(path, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.detail;
    throw new Error(typeof detail === "string" ? detail : "Request failed.");
  }
  return data;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function coverMarkup(card, className) {
  const letter = escapeHtml((card.title || "?").slice(0, 1));
  if (!card.cover) {
    return `<div class="${className} cover-fallback" aria-hidden="true">${letter}</div>`;
  }
  const src = `/api/cards/${encodeURIComponent(card.cardId)}/files/${encodeURIComponent(card.cover)}`;
  return `<img class="${className}" alt="" src="${src}" onerror="this.outerHTML='<div class=&quot;${className} cover-fallback&quot; aria-hidden=&quot;true&quot;>${letter}</div>'">`;
}

const ACCENTS = ["blue", "green", "purple", "coral", "yellow", "peach"];

const ICON_AUDIO = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 18V6l10-2v12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7" cy="18" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="17" cy="16" r="2.2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`;
const ICON_CHECK = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5 9.2 17 19 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_ALERT = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4.5 3.5 19.5h17L12 4.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M12 10v4.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="16.8" r="0.8" fill="currentColor"/></svg>`;
const ICON_SEARCH = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M16 16.5 20 20.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>`;

function accentFor(category) {
  let total = 0;
  for (const char of category) total += char.charCodeAt(0);
  return ACCENTS[total % ACCENTS.length];
}

function backupMarkup(card) {
  if (card.backedUp) {
    return `<span class="status status-ok">${ICON_CHECK}Backed up</span>`;
  }
  return `<span class="status status-warn">${ICON_ALERT}Needs a backup</span>`;
}

function backupSummary(list) {
  const backed = list.filter((card) => card.backedUp).length;
  const needs = list.length - backed;
  const parts = [`${backed} backed up`];
  if (needs) parts.push(`${needs} ${needs === 1 ? "needs" : "need"} a backup`);
  return parts.join(" · ");
}

function uniqueValues(cards, field) {
  const values = new Set();
  cards.forEach((card) => {
    const value = (card[field] || "").trim();
    if (value) values.add(value);
  });
  return [...values].sort((a, b) => a.localeCompare(b));
}

function cardMatches(card, query, author, category) {
  if (author && (card.author || "") !== author) return false;
  if (category && (card.category || "") !== category) return false;
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = [
    card.title,
    card.author,
    card.category,
    ...(card.languages || []),
    ...(card.trackTitles || []),
  ].join(" ").toLowerCase();
  return words.every((word) => haystack.includes(word));
}

function renderLibrary() {
  const cards = state.cards;
  const matched = cards.filter((card) => cardMatches(card, state.query, state.author, state.category));
  const authors = uniqueValues(cards, "author");
  const categories = uniqueValues(cards, "category");
  const authorOptions = [`<option value="">All authors</option>`]
    .concat(authors.map((author) => `<option value="${escapeHtml(author)}"${author === state.author ? " selected" : ""}>${escapeHtml(author)}</option>`))
    .join("");
  const categoryOptions = [`<option value="">All categories</option>`]
    .concat(categories.map((category) => `<option value="${escapeHtml(category)}"${category === state.category ? " selected" : ""}>${escapeHtml(category)}</option>`))
    .join("");
  const tiles = matched.map((card) => {
    const category = (card.category || "").trim();
    const badge = category
      ? `<span class="badge ${accentFor(category)}">${escapeHtml(category)}</span>`
      : "";
    const duration = card.readableDuration
      ? `<span class="muted">${escapeHtml(card.readableDuration)}</span>`
      : "";
    return `
    <button type="button" class="card-tile" data-id="${escapeHtml(card.cardId)}">
      <span class="cover-frame">${coverMarkup(card, "cover")}</span>
      <span class="tile-meta">
        <strong>${escapeHtml(card.title)}</strong>
        <span class="author">${escapeHtml(card.author || "Unknown author")}</span>
        <span class="meta-row">
          <span class="audio-mark">${ICON_AUDIO}Audio</span>
          ${duration}
          ${badge}
        </span>
        ${backupMarkup(card)}
      </span>
    </button>`;
  }).join("");
  const countLabel = matched.length === cards.length
    ? `${cards.length} ${cards.length === 1 ? "card" : "cards"}`
    : `${matched.length} of ${cards.length}`;
  const chips = categories.length > 0 && categories.length <= 8
    ? `<div class="chips" role="group" aria-label="Category">${
      [`<button type="button" class="chip${state.category ? "" : " is-selected"}" data-category="" aria-pressed="${state.category ? "false" : "true"}">All</button>`]
        .concat(categories.map((category) => `<button type="button" class="chip${category === state.category ? " is-selected" : ""}" data-category="${escapeHtml(category)}" aria-pressed="${category === state.category ? "true" : "false"}">${escapeHtml(category)}</button>`))
        .join("")
    }</div>`
    : "";
  view.innerHTML = `
    <div class="toolbar">
      <div>
        <h2>Your library</h2>
        <p class="library-stats" id="library-count">${countLabel} · ${backupSummary(matched)}</p>
      </div>
    </div>
    <div class="filters">
      <label class="search-field">
        <input id="library-search" type="search" placeholder="Search your stories…" value="${escapeHtml(state.query)}" aria-label="Search the library">
        ${ICON_SEARCH}
      </label>
      <select id="library-author" aria-label="Filter by author">${authorOptions}</select>
      <select id="library-category" aria-label="Filter by category">${categoryOptions}</select>
    </div>
    ${chips}
    ${matched.length
      ? `<div class="grid">${tiles}</div>`
      : `<p class="muted">No cards match.</p>`}`;
  const search = document.querySelector("#library-search");
  search.addEventListener("input", () => {
    state.query = search.value;
    const position = search.selectionStart;
    renderLibrary();
    const next = document.querySelector("#library-search");
    next.focus();
    if (position !== null) next.setSelectionRange(position, position);
  });
  document.querySelector("#library-author").addEventListener("change", (event) => {
    state.author = event.target.value;
    renderLibrary();
  });
  document.querySelector("#library-category").addEventListener("change", (event) => {
    state.category = event.target.value;
    renderLibrary();
  });
  view.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.category = chip.dataset.category || "";
      renderLibrary();
    });
  });
  view.querySelectorAll(".card-tile").forEach((tile) => {
    tile.addEventListener("click", () => openCard(tile.dataset.id));
  });
}

async function loadLibrary() {
  view.innerHTML = `<div class="toolbar"><h2>Your library</h2><p class="muted">Loading your library…</p></div>`;
  try {
    state.cards = await api("/api/cards");
    if (!state.cards.length) {
      state.query = "";
      state.author = "";
      state.category = "";
      view.innerHTML = `
        <section class="empty">
          <h2>Your library is empty</h2>
          <p>Add your first card to start building your backup library.</p>
          <button type="button" class="primary" id="empty-add">Add card</button>
        </section>`;
      document.querySelector("#empty-add").addEventListener("click", () => show("add"));
      return;
    }
    renderLibrary();
  } catch (error) {
    view.innerHTML = `<p class="banner">${escapeHtml(error.message)}</p>`;
  }
}

async function openCard(cardId) {
  state.cardId = cardId;
  navButtons.forEach((button) => button.classList.remove("is-active"));
  try {
    const card = await api(`/api/cards/${encodeURIComponent(cardId)}`);
    const facts = [
      "Audio",
      card.author,
      card.category,
      card.readableDuration,
      card.trackCount ? `${card.trackCount} tracks` : "",
      (card.languages || []).join(", "),
    ].filter(Boolean);
    const tracks = (card.chapters || []).map((chapter) => {
      const heading = chapter.title ? `<li class="chapter-label">${escapeHtml(chapter.title)}</li>` : "";
      const rows = (chapter.tracks || []).map((track) => `
        <li>
          <span class="num">${escapeHtml(track.number)}</span>
          <span>${escapeHtml(track.title)}</span>
          <span class="muted">${escapeHtml(track.readableDuration || "")}</span>
        </li>`).join("");
      return heading + rows;
    }).join("");
    view.innerHTML = `
      <button type="button" class="back" id="back">Back to library</button>
      <article class="detail-layout">
        <div class="cover-frame detail-frame">${coverMarkup(card, "detail-cover cover")}</div>
        <div class="detail-copy">
          <h2>${escapeHtml(card.title)}</h2>
          <div class="facts">${facts.map((fact) => `<span>${escapeHtml(fact)}</span>`).join("")}</div>
          ${card.description ? `<p class="description">${escapeHtml(card.description)}</p>` : ""}
          <ol class="tracks">${tracks}</ol>
        </div>
      </article>`;
    document.querySelector("#back").addEventListener("click", () => show("library"));
  } catch (error) {
    view.innerHTML = `<p class="banner">${escapeHtml(error.message)}</p>`;
  }
}

function renderJob(job) {
  const total = job.total || 0;
  const finished = job.finished || 0;
  const width = total ? Math.round((finished / total) * 100) : 0;
  const logs = (job.logs || []).map((line) => {
    const cls = line.level === "error" ? "error" : "";
    return `<div class="${cls}">${escapeHtml(line.message)}</div>`;
  }).join("");
  const succeeded = (job.succeeded || []).map((item) => `<p class="ok">${escapeHtml(item.title)} saved</p>`).join("");
  const failed = (job.failed || []).map((item) => `<p class="bad">${escapeHtml(item.url)} — ${escapeHtml(item.error)}</p>`).join("");
  const skipped = (job.skipped || []).map((item) => `<p class="muted">${escapeHtml(item.title)} already in the library</p>`).join("");
  const summary = job.status === "done" ? `<div class="summary">${succeeded}${skipped}${failed}</div>` : "";
  const status = job.status === "running"
    ? `Downloading ${Math.min(finished + 1, total)} of ${total}`
    : "Finished";
  return `
    <p class="muted" id="job-status">${escapeHtml(status)}</p>
    <div class="progress" aria-hidden="true"><span style="width:${width}%"></span></div>
    ${summary}
    <div class="log" id="job-log">${logs}</div>`;
}

async function loadAdd() {
  stopJobPoll();
  view.innerHTML = `
    <section class="panel">
      <h2>Add cards</h2>
      <p class="muted">Paste one or more Yoto URLs, one per line. Each card stays in your library, and a zip copy is written to the backup folder.</p>
      <form id="add-form">
        <div class="field">
          <label for="urls">Yoto URLs</label>
          <textarea id="urls" name="urls" placeholder="https://yoto.io/…"></textarea>
        </div>
        <label class="check">
          <input id="replace-existing" name="replace_existing" type="checkbox">
          Replace cards already in the library
        </label>
        <button class="primary" type="submit">Download</button>
      </form>
      <div id="job"></div>
    </section>`;
  document.querySelector("#add-form").addEventListener("submit", startJob);
  try {
    const current = await api("/api/jobs/current");
    if (current.status === "running") watchJob(current);
  } catch (_error) {
    // The form still works if the status check fails.
  }
}

async function startJob(event) {
  event.preventDefault();
  const urls = new FormData(event.target).get("urls") || "";
  const button = event.target.querySelector("button");
  button.disabled = true;
  try {
    const job = await api("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        urls,
        replace_existing: Boolean(event.target.replace_existing.checked),
      }),
    });
    watchJob(job);
  } catch (error) {
    document.querySelector("#job").innerHTML = `<p class="banner">${escapeHtml(error.message)}</p>`;
    button.disabled = false;
  }
}

function watchJob(job) {
  paintJob(job);
  stopJobPoll();
  state.jobTimer = setInterval(async () => {
    try {
      const latest = await api(`/api/jobs/${job.id}`);
      paintJob(latest);
      if (latest.status === "done") stopJobPoll();
    } catch (error) {
      stopJobPoll();
      document.querySelector("#job").innerHTML = `<p class="banner">${escapeHtml(error.message)}</p>`;
    }
  }, 700);
}

function paintJob(job) {
  const slot = document.querySelector("#job");
  if (!slot) return;
  slot.innerHTML = renderJob(job);
  const log = document.querySelector("#job-log");
  if (log) log.scrollTop = log.scrollHeight;
  const button = document.querySelector("#add-form button");
  if (button) button.disabled = job.status === "running";
}

function stopJobPoll() {
  if (state.jobTimer) {
    clearInterval(state.jobTimer);
    state.jobTimer = null;
  }
}

async function loadSettings() {
  stopJobPoll();
  view.innerHTML = `
    <section class="panel">
      <h2>Settings</h2>
      <p class="muted">The library is the cards you browse. Backups are zip copies in a different folder.</p>
      <form id="settings-form">
        <div class="field">
          <label for="library_dir">Library folder</label>
          <input id="library_dir" name="library_dir" type="text" required>
        </div>
        <div class="field">
          <label for="backup_dir">Backup folder</label>
          <input id="backup_dir" name="backup_dir" type="text" required>
        </div>
        <button class="primary" type="submit">Save settings</button>
      </form>
      <div id="settings-note"></div>
    </section>`;
  const form = document.querySelector("#settings-form");
  try {
    const settings = await api("/api/settings");
    form.library_dir.value = settings.library_dir;
    form.backup_dir.value = settings.backup_dir;
  } catch (error) {
    document.querySelector("#settings-note").innerHTML = `<p class="banner">${escapeHtml(error.message)}</p>`;
  }
  form.addEventListener("submit", saveSettings);
}

async function saveSettings(event) {
  event.preventDefault();
  const form = event.target;
  const note = document.querySelector("#settings-note");
  try {
    const saved = await api("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        library_dir: form.library_dir.value,
        backup_dir: form.backup_dir.value,
      }),
    });
    form.library_dir.value = saved.library_dir;
    form.backup_dir.value = saved.backup_dir;
    note.innerHTML = `<p class="ok">Saved.</p>`;
  } catch (error) {
    note.innerHTML = `<p class="banner">${escapeHtml(error.message)}</p>`;
  }
}

show("home");
