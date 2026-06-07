(() => {
const notesStorageKey = "pendingNotes";
const notesSnoozeStorageKey = "pendingNotesSnoozeUntil";
const sessionTokenStorageKey = "repairSessionToken";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function loadNotes() {
  const savedNotes = localStorage.getItem(notesStorageKey);
  return savedNotes ? JSON.parse(savedNotes) : [];
}

function saveNotes(notes) {
  localStorage.setItem(notesStorageKey, JSON.stringify(notes));
}

function isPendingAlertSnoozed() {
  return Number(localStorage.getItem(notesSnoozeStorageKey) || 0) > Date.now();
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
            <textarea id="noteText" name="noteText" rows="4" placeholder="Ej. Llamar al cliente, revisar repuesto, confirmar entrega..." required></textarea>
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

  function renderNotes() {
    const notes = loadNotes();
    const pendingNotes = notes.filter((note) => !note.done);
    const hasSession = Boolean(localStorage.getItem(sessionTokenStorageKey));

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
        <span>${note.done ? "Completada" : "Pendiente"} | ${formatNoteDate(note.createdAt)}</span>
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
    if (!localStorage.getItem(sessionTokenStorageKey)) return;
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
    localStorage.setItem(notesSnoozeStorageKey, String(Date.now() + 60 * 60 * 1000));
    renderNotes();
  });

  notesForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const noteText = noteTextInput.value.trim();
    if (!noteText) return;

    const notes = loadNotes();
    notes.unshift({
      id: crypto.randomUUID(),
      text: noteText,
      done: false,
      createdAt: new Date().toISOString(),
    });
    saveNotes(notes);
    localStorage.removeItem(notesSnoozeStorageKey);
    notesForm.reset();
    renderNotes();
  });

  notesList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-note-action]");
    if (!button) return;

    const notes = loadNotes();
    const noteId = button.dataset.noteId;
    const action = button.dataset.noteAction;

    if (action === "toggle") {
      const note = notes.find((item) => item.id === noteId);
      if (note) note.done = !note.done;
    }

    if (action === "delete") {
      saveNotes(notes.filter((item) => item.id !== noteId));
      renderNotes();
      return;
    }

    saveNotes(notes);
    renderNotes();
  });

  window.addEventListener("storage", (event) => {
    if ([notesStorageKey, notesSnoozeStorageKey, sessionTokenStorageKey].includes(event.key)) renderNotes();
  });

  renderNotes();
}

setupPendingNotes();
})();
