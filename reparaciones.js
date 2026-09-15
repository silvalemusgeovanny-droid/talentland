const repairsStorageKey = "inventoryRepairs";

const repairsTable = document.querySelector("#repairsTable");
const repairSearch = document.querySelector("#repairSearch");
const totalRepairs = document.querySelector("#totalRepairs");
const totalRepairValue = document.querySelector("#totalRepairValue");
const totalDelivered = document.querySelector("#totalDelivered");
const currentDate = document.querySelector("#currentDate");
const currentTime = document.querySelector("#currentTime");
const colorModeToggle = document.querySelector("#colorModeToggle");
const colorModeStorageKey = "loginColorMode";
let renderedRepairs = [];

function loadRepairs() {
  const savedRepairs = localStorage.getItem(repairsStorageKey);
  return savedRepairs ? JSON.parse(savedRepairs) : [];
}

function saveRepairs(repairs) {
  localStorage.setItem(repairsStorageKey, JSON.stringify(repairs));
}

async function loadRepairsFromSource(search = "") {
  if (window.repairCloud?.isConfigured()) {
    const repairs = await window.repairCloud.listRepairs({ search, limit: 50 });
    if (!search) saveRepairs(repairs);
    return repairs;
  }

  const repairs = loadRepairs();
  if (search.trim()) return repairs;

  return [...repairs]
    .sort((a, b) => {
      const dateDiff = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (dateDiff) return dateDiff;
      return (Number(b.repairNumber) || 0) - (Number(a.repairNumber) || 0);
    })
    .slice(0, 50);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
}

function formatRepairDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getRepairDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "sin-fecha";
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getRepairStatusLabel(status) {
  return status === "Entregado no Reparado" ? "E. no reparado" : (status || "En proceso");
}

function updateDateTime() {
  const now = new Date();
  currentDate.textContent = new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(now);
  currentTime.textContent = new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(now);
}

function setColorMode(mode) {
  const isDarkMode = mode === "dark";
  document.body.classList.toggle("login-dark", isDarkMode);
  const toggleLabel = isDarkMode ? "Cambiar a modo dia" : "Cambiar a modo noche";
  colorModeToggle.setAttribute("aria-label", toggleLabel);
  colorModeToggle.setAttribute("title", toggleLabel);
  colorModeToggle.setAttribute("aria-pressed", String(isDarkMode));
  localStorage.setItem(colorModeStorageKey, isDarkMode ? "dark" : "light");
}

function getFilteredRepairs(repairs, search = repairSearch.value) {
  const term = search.trim().toLowerCase();
  if (!term) return repairs;
  return repairs.filter((repair) =>
    [repair.customer, repair.deviceType, repair.brand, repair.model, repair.repairType, repair.imei, repair.dui, repair.status, repair.notes]
      .some((field) => String(field || "").toLowerCase().includes(term)),
  );
}

function getRepairRecordId(repair) {
  return repair._id || repair.id || repair.sourceId || "";
}

function renderRepairActions(repair) {
  const id = getRepairRecordId(repair);
  if (!id) return "";
  const label = `reparacion #${repair.repairNumber || ""}`.trim();

  return `
    <div class="table-action-icons repair-action-icons">
      <button class="edit-button icon-action-button icon-edit-button" type="button" data-repair-id="${escapeHtml(id)}" aria-label="Editar ${escapeHtml(label)}" title="Editar">Editar</button>
      <button class="delete-button icon-action-button icon-delete-button" type="button" data-repair-id="${escapeHtml(id)}" aria-label="Eliminar ${escapeHtml(label)}" title="Eliminar">Eliminar</button>
      <button class="secondary-button icon-action-button status-icon-button" type="button" data-status-repair-id="${escapeHtml(id)}" aria-label="Cambiar estado de ${escapeHtml(label)}" title="Cambiar estado">Estado</button>
      <button class="edit-button icon-action-button icon-invoice-button" type="button" data-invoice-repair-id="${escapeHtml(id)}" aria-label="Generar factura de ${escapeHtml(label)}" title="Factura">Factura</button>
    </div>
  `;
}

async function renderRepairs() {
  const search = repairSearch.value.trim();
  let repairs = [];

  try {
    repairs = await loadRepairsFromSource(search);
  } catch (error) {
    repairsTable.innerHTML = `<tr><td class="empty-table" colspan="9">${escapeHtml(error.message)}</td></tr>`;
    return;
  }

  const filteredRepairs = (window.repairCloud?.isConfigured() ? repairs : getFilteredRepairs(repairs, search))
    .sort((left, right) => new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime())
    .slice(0, 50);
  renderedRepairs = filteredRepairs;
  const repairValue = repairs.reduce((sum, repair) => sum + (Number(repair.repairPrice) || 0), 0);
  const deliveredCount = repairs.filter((repair) => repair.status === "Entregado").length;

  totalRepairs.textContent = repairs.length;
  totalRepairValue.textContent = formatCurrency(repairValue);
  totalDelivered.textContent = deliveredCount;

  if (!filteredRepairs.length) {
    repairsTable.innerHTML = `<tr><td class="empty-table" colspan="9">No hay reparaciones con esa busqueda.</td></tr>`;
    return;
  }

  let previousDateKey = "";
  repairsTable.innerHTML = filteredRepairs.map((repair) => {
    const dateKey = getRepairDateKey(repair.createdAt);
    const dateSeparator = dateKey !== previousDateKey
      ? `<tr class="repair-date-separator"><td colspan="9">${escapeHtml(formatRepairDate(repair.createdAt))}</td></tr>`
      : "";
    previousDateKey = dateKey;
    return `${dateSeparator}
    <tr>
      <td>${repair.repairNumber || ""}</td>
      <td><strong>${escapeHtml(repair.customer || "Sin nombre")}</strong></td>
      <td>${escapeHtml(repair.deviceType || "")}</td>
      <td>${escapeHtml([repair.brand, repair.model].filter(Boolean).join(" "))}</td>
      <td>${escapeHtml(repair.repairType || "")}</td>
      <td>${formatCurrency(Number(repair.repairPrice) || 0)}</td>
      <td><span class="quality-pill">${escapeHtml(getRepairStatusLabel(repair.status))}</span></td>
      <td>${formatRepairDate(repair.createdAt)}</td>
      <td>${renderRepairActions(repair)}</td>
    </tr>`;
  }).join("");
}

repairSearch.addEventListener("input", renderRepairs);
function closeQuickStatusMenu() { document.querySelector("#quickStatusMenu")?.remove(); }
function openQuickStatusMenu(button, repair) {
  closeQuickStatusMenu();
  const rect = button.getBoundingClientRect();
  const menu = document.createElement("form");
  menu.id = "quickStatusMenu";
  menu.className = "quick-status-menu";
  menu.innerHTML = `<label for="quickRepairStatus">Cambiar estado</label><select id="quickRepairStatus" name="status">${["En proceso", "Listo", "Entregado", "Entregado no Reparado"].map((status) => `<option value="${status}"${repair.status === status ? " selected" : ""}>${status}</option>`).join("")}</select><div><button class="secondary-button" type="button" data-close-status-menu>Cancelar</button><button class="primary-button" type="submit">Guardar</button></div>`;
  menu.style.top = `${Math.min(window.innerHeight - 154, rect.bottom + 8)}px`;
  menu.style.left = `${Math.max(8, Math.min(window.innerWidth - 258, rect.right - 250))}px`;
  document.body.append(menu);
  menu.querySelector("[data-close-status-menu]")?.addEventListener("click", closeQuickStatusMenu);
  menu.addEventListener("submit", async (event) => {
    event.preventDefault(); const status = String(new FormData(menu).get("status") || "");
    if (!status || status === repair.status) return closeQuickStatusMenu();
    const patch = { status, deliveredAt: status === "Entregado" ? new Date().toISOString() : "" };
    try { if (window.repairCloud?.isConfigured() && repair._id) await window.repairCloud.updateRepair(repair._id, patch); saveRepairs(loadRepairs().map((item) => getRepairRecordId(item) === getRepairRecordId(repair) ? { ...item, ...patch } : item)); closeQuickStatusMenu(); await renderRepairs(); } catch (error) { alert(`No se pudo actualizar el estado: ${error.message}`); }
  });
}

repairsTable.addEventListener("click", async (event) => {
  const statusButton = event.target.closest("[data-status-repair-id]");
  const invoiceButton = event.target.closest("[data-invoice-repair-id]");
  if (statusButton || invoiceButton) {
    const button = statusButton || invoiceButton;
    const repair = renderedRepairs.find((item) => getRepairRecordId(item) === (button.dataset.statusRepairId || button.dataset.invoiceRepairId));
    if (!repair) return;
    if (statusButton) return openQuickStatusMenu(statusButton, repair);
    sessionStorage.setItem("pendingRepairEdit", JSON.stringify(repair)); localStorage.setItem("repairActiveModule", "repairs"); window.location.href = "index.html"; return;
  }
  const button = event.target.closest("[data-repair-id]");
  if (!button) return;

  const repairId = button.dataset.repairId;
  const repairs = loadRepairs();
  const repair = renderedRepairs.find((item) => getRepairRecordId(item) === repairId)
    || repairs.find((item) => getRepairRecordId(item) === repairId);
  if (!repair) return;

  if (button.classList.contains("edit-button")) {
    sessionStorage.setItem("pendingRepairEdit", JSON.stringify(repair));
    localStorage.setItem("repairActiveModule", "repairs");
    window.location.href = "index.html";
    return;
  }

  if (!button.classList.contains("delete-button")) return;
  const label = repair.repairNumber ? `#${repair.repairNumber}` : repair.customer || "esta reparacion";
  if (!confirm(`Eliminar reparacion ${label}?`)) return;

  try {
    if (window.repairCloud?.isConfigured() && repair._id) {
      await window.repairCloud.removeRepair(repair._id);
    }
    saveRepairs(repairs.filter((item) => getRepairRecordId(item) !== repairId));
    await renderRepairs();
  } catch (error) {
    alert(`No se pudo eliminar: ${error.message}`);
  }
});
document.addEventListener("pointerdown", (event) => { const menu = document.querySelector("#quickStatusMenu"); if (menu && !menu.contains(event.target) && !event.target.closest("[data-status-repair-id]")) closeQuickStatusMenu(); });
colorModeToggle.addEventListener("click", () => {
  const nextMode = document.body.classList.contains("login-dark") ? "light" : "dark";
  setColorMode(nextMode);
});

setColorMode(localStorage.getItem(colorModeStorageKey) || "light");
updateDateTime();
setInterval(updateDateTime, 1000);
renderRepairs();
