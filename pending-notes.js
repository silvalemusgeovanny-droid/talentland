(() => {
const appSession = window.repairApp.session;
const appPermissions = window.repairApp.permissions;
const appNotes = window.repairApp.notes;
const notesStorageKey = appSession.keys.notes;
const notesSnoozeStorageKey = appSession.keys.notesSnoozeUntil;
const sessionTokenStorageKey = appSession.keys.sessionToken;
const currentUserStorageKey = appSession.keys.currentUser;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadNotes() {
  return appNotes.load();
}

function saveNotes(notes) {
  appNotes.save(notes);
}

function getCurrentUser() {
  return appSession.getUser();
}

function canCurrentUserUseNotes(user = getCurrentUser()) {
  return appPermissions.canUseNotes(user);
}

function migrateLegacyNoteAuthors(user) {
  appNotes.migrateAuthors(user);
}

function normalizeNoteForCloud(note, user = getCurrentUser()) {
  return appNotes.normalizeForCloud(note, user);
}

function isPendingAlertSnoozed() {
  return appNotes.isSnoozed();
}

function formatNoteDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function createPendingNotesUi() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <button
        class="notes-toggle"
        type="button"
        id="notesToggle"
        aria-label="Abrir notas pendientes"
        title="Notas pendientes"
        hidden
      >
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M7 3h7l4 4v14H7z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="2" />
          <path d="M14 3v5h5M10 12h6M10 16h6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
        </svg>
        <span id="notesBadge" hidden>0</span>
      </button>

      <aside class="pending-alert" id="pendingAlert" role="status" hidden>
        <div class="pending-alert-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M7 17h10M8 17l1-7h6l1 7M10 10V7a2 2 0 0 1 4 0v3" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" />
            <path d="M5 10 3.5 8.5M19 10l1.5-1.5M12 3V1.5" fill="none" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
          </svg>
        </div>
        <div>
          <strong id="pendingAlertTitle">Pendientes activos</strong>
          <span id="pendingAlertCopy">Tienes notas por revisar.</span>
        </div>
        <button type="button" id="openNotesFromAlert">Ver</button>
        <button type="button" id="snoozePendingAlert">Ocultar 1 h</button>
      </aside>

      <div class="sale-confirm-overlay" id="notesOverlay" hidden>
        <section class="sale-confirm-card notes-card" role="dialog" aria-modal="true" aria-labelledby="notesTitle">
          <div>
            <span class="panel-kicker">Pendientes</span>
            <h2 id="notesTitle">Notas por hacer</h2>
            <p class="hint">Escribe recordatorios internos y marca lo resuelto.</p>
          </div>

          <form class="notes-form" id="notesForm">
            <label for="noteText">Nota</label>
            <textarea id="noteText" name="noteText" rows="4" maxlength="280" placeholder="Ej. Llamar al cliente, revisar repuesto, confirmar entrega..." required></textarea>
            <button class="primary-button" type="submit">Guardar nota</button>
          </form>

          <div class="notes-list" id="notesList"></div>

          <div class="sale-confirm-actions">
            <button class="secondary-button" type="button" id="closeNotesButton">Cerrar</button>
          </div>
        </section>
      </div>
    `,
  );
}

function setupPendingNotes() {
  createPendingNotesUi();

  const notesToggle = document.querySelector("#notesToggle");
  const notesBadge = document.querySelector("#notesBadge");
  const notesOverlay = document.querySelector("#notesOverlay");
  const notesForm = document.querySelector("#notesForm");
  const noteTextInput = document.querySelector("#noteText");
  const notesList = document.querySelector("#notesList");
  const closeNotesButton = document.querySelector("#closeNotesButton");
  const pendingAlert = document.querySelector("#pendingAlert");
  const pendingAlertTitle = document.querySelector("#pendingAlertTitle");
  const pendingAlertCopy = document.querySelector("#pendingAlertCopy");
  const openNotesFromAlert = document.querySelector("#openNotesFromAlert");
  const snoozePendingAlert = document.querySelector("#snoozePendingAlert");

  async function loadNotesFromSource(currentUser) {
    return await appNotes.loadFromSource(currentUser);
  }

  async function renderNotes() {
    const currentUser = getCurrentUser();
    if (!canCurrentUserUseNotes(currentUser)) {
      notesToggle.hidden = true;
      notesBadge.hidden = true;
      pendingAlert.hidden = true;
      notesOverlay.hidden = true;
      return;
    }
    migrateLegacyNoteAuthors(currentUser);
    let notes = [];
    try {
      notes = await loadNotesFromSource(currentUser);
    } catch (error) {
      notes = loadNotes();
      notesList.innerHTML = `<p class="hint">${escapeHtml(error.message)}</p>`;
    }
    const pendingNotes = notes.filter((note) => !note.done);
    const hasSession = appSession.hasSession();

    notesToggle.hidden = !hasSession;
    notesBadge.hidden = !hasSession || pendingNotes.length === 0;
    notesBadge.textContent = hasSession ? pendingNotes.length : 0;
    pendingAlert.hidden = !hasSession || pendingNotes.length === 0 || isPendingAlertSnoozed();

    if (hasSession && pendingNotes.length) {
      pendingAlertTitle.textContent = `${pendingNotes.length} pendiente${pendingNotes.length === 1 ? "" : "s"} activo${pendingNotes.length === 1 ? "" : "s"}`;
      pendingAlertCopy.textContent = pendingNotes[0].text;
    }

    if (!notes.length) {
      notesList.innerHTML = `<p class="hint">Todavia no hay notas pendientes.</p>`;
      return;
    }

    notesList.innerHTML = notes.map((note) => `
      <article class="note-item ${note.done ? "done" : ""}">
        <p>${escapeHtml(note.text)}</p>
        <span>${note.done ? "Completada" : "Pendiente"} | ${formatNoteDate(note.createdAt)} | Creada por ${escapeHtml(note.authorName || "Sin autor")}</span>
        <div class="note-actions">
          <button class="edit-button" type="button" data-note-action="toggle" data-note-id="${note.id}">
            ${note.done ? "Reabrir" : "Completar"}
          </button>
          <button class="delete-button" type="button" data-note-action="delete" data-note-id="${note.id}">Borrar</button>
        </div>
      </article>
    `).join("");
  }

  function openNotesPanel() {
    const currentUser = getCurrentUser();
    if (!appSession.hasSession() || !canCurrentUserUseNotes(currentUser)) return;
    notesOverlay.hidden = false;
    renderNotes();
    noteTextInput.focus();
  }

  function closeNotesPanel() {
    notesOverlay.hidden = true;
    notesForm.reset();
  }

  notesToggle.addEventListener("click", openNotesPanel);
  openNotesFromAlert.addEventListener("click", openNotesPanel);
  closeNotesButton.addEventListener("click", closeNotesPanel);
  snoozePendingAlert.addEventListener("click", () => {
    appNotes.snooze();
    renderNotes();
  });

  notesForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!canCurrentUserUseNotes()) return;
    const noteText = appNotes.sanitize(noteTextInput.value);
    if (!noteText) return;

    const notes = loadNotes();
    const currentUser = getCurrentUser();
    const now = new Date().toISOString();
    const note = {
      id: crypto.randomUUID(),
      text: noteText,
      authorName: currentUser?.name || currentUser?.username || "Usuario",
      authorUsername: currentUser?.username || "",
      done: false,
      createdAt: now,
      updatedAt: now,
    };

    try {
      if (window.repairCloud?.isConfigured() && currentUser) {
        await window.repairCloud.createNote(normalizeNoteForCloud(note, currentUser));
      } else {
        notes.unshift(note);
        saveNotes(notes);
      }
    } catch {
      notes.unshift(note);
      saveNotes(notes);
    }

    appNotes.clearSnooze();
    notesForm.reset();
    renderNotes();
    closeNotesPanel();
  });

  noteTextInput.addEventListener("input", () => {
    const safeText = appNotes.cleanInput(noteTextInput.value);
    if (noteTextInput.value !== safeText) noteTextInput.value = safeText;
  });

  notesList.addEventListener("click", async (event) => {
    if (!canCurrentUserUseNotes()) return;
    const button = event.target.closest("[data-note-action]");
    if (!button) return;

    const notes = loadNotes();
    const noteId = button.dataset.noteId;
    const action = button.dataset.noteAction;
    const note = notes.find((item) => String(item.id || item._id) === noteId);

    if (action === "toggle") {
      if (!note) return;
      const nextDone = !note.done;
      if (window.repairCloud?.isConfigured() && note._id) {
        await window.repairCloud.toggleNote(note._id, nextDone);
      } else {
        note.done = nextDone;
        note.updatedAt = new Date().toISOString();
        saveNotes(notes);
      }
    }

    if (action === "delete") {
      if (window.repairCloud?.isConfigured() && note?._id) {
        await window.repairCloud.removeNote(note._id);
      } else {
        saveNotes(notes.filter((item) => String(item.id || item._id) !== noteId));
      }
      renderNotes();
      return;
    }

    renderNotes();
  });

  window.addEventListener("storage", (event) => {
    if ([notesStorageKey, notesSnoozeStorageKey, sessionTokenStorageKey, currentUserStorageKey].includes(event.key)) renderNotes();
  });
  window.addEventListener("repair-session-changed", renderNotes);

  renderNotes();
}

setupPendingNotes();
})();
