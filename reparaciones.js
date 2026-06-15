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
    [repair.customer, repair.deviceType, repair.brand, repair.model, repair.repairType, repair.status, repair.notes]
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
    <div class="table-action-icons">
      <button class="edit-button icon-action-button icon-edit-button" type="button" data-repair-id="${escapeHtml(id)}" aria-label="Editar ${escapeHtml(label)}" title="Editar">Editar</button>
      <button class="delete-button icon-action-button icon-delete-button" type="button" data-repair-id="${escapeHtml(id)}" aria-label="Eliminar ${escapeHtml(label)}" title="Eliminar">Eliminar</button>
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

  const filteredRepairs = (window.repairCloud?.isConfigured() ? repairs : getFilteredRepairs(repairs, search)).slice(0, 50);
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

  repairsTable.innerHTML = filteredRepairs.map((repair) => `
    <tr>
      <td>${repair.repairNumber || ""}</td>
      <td><strong>${escapeHtml(repair.customer || "Sin nombre")}</strong></td>
      <td>${escapeHtml(repair.deviceType || "")}</td>
      <td>${escapeHtml([repair.brand, repair.model].filter(Boolean).join(" "))}</td>
      <td>${escapeHtml(repair.repairType || "")}</td>
      <td>${formatCurrency(Number(repair.repairPrice) || 0)}</td>
      <td><span class="quality-pill">${escapeHtml(repair.status || "En proceso")}</span></td>
      <td>${formatRepairDate(repair.createdAt)}</td>
      <td>${renderRepairActions(repair)}</td>
    </tr>
  `).join("");
}

repairSearch.addEventListener("input", renderRepairs);
repairsTable.addEventListener("click", async (event) => {
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
colorModeToggle.addEventListener("click", () => {
  const nextMode = document.body.classList.contains("login-dark") ? "light" : "dark";
  setColorMode(nextMode);
});

setColorMode(localStorage.getItem(colorModeStorageKey) || "light");
updateDateTime();
setInterval(updateDateTime, 1000);
renderRepairs();
