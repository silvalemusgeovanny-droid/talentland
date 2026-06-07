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

function loadRepairs() {
  const savedRepairs = localStorage.getItem(repairsStorageKey);
  return savedRepairs ? JSON.parse(savedRepairs) : [];
}

async function loadRepairsFromSource(search = "") {
  if (window.repairCloud?.isConfigured()) {
    return await window.repairCloud.listRepairs({ search, limit: 10000 });
  }

  return loadRepairs();
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

async function renderRepairs() {
  const search = repairSearch.value.trim();
  let repairs = [];

  try {
    repairs = await loadRepairsFromSource(search);
  } catch (error) {
    repairsTable.innerHTML = `<tr><td class="empty-table" colspan="8">${escapeHtml(error.message)}</td></tr>`;
    return;
  }

  const filteredRepairs = window.repairCloud?.isConfigured() ? repairs : getFilteredRepairs(repairs, search);
  const repairValue = repairs.reduce((sum, repair) => sum + (Number(repair.repairPrice) || 0), 0);
  const deliveredCount = repairs.filter((repair) => repair.status === "Entregado").length;

  totalRepairs.textContent = repairs.length;
  totalRepairValue.textContent = formatCurrency(repairValue);
  totalDelivered.textContent = deliveredCount;

  if (!filteredRepairs.length) {
    repairsTable.innerHTML = `<tr><td class="empty-table" colspan="8">No hay reparaciones con esa busqueda.</td></tr>`;
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
    </tr>
  `).join("");
}

repairSearch.addEventListener("input", renderRepairs);
colorModeToggle.addEventListener("click", () => {
  const nextMode = document.body.classList.contains("login-dark") ? "light" : "dark";
  setColorMode(nextMode);
});

setColorMode(localStorage.getItem(colorModeStorageKey) || "light");
updateDateTime();
setInterval(updateDateTime, 1000);
renderRepairs();
