const storageKey = "inventoryParts";

const starterParts = [
  {
    id: crypto.randomUUID(),
    name: "Pantalla iPhone 11",
    brand: "Apple",
    model: "Iphone 11",
    category: "Telefono",
    price: 1250,
    customerPrice: 1650,
    stock: 4,
    quality: "Premium",
    supplier: "TecnoPartes MX",
    publishedAt: new Date().toISOString(),
    updatedAt: "",
  },
  {
    id: crypto.randomUUID(),
    name: "Bateria laptop HP",
    brand: "Hp",
    model: "Laptop hp",
    category: "Computadora",
    price: 890,
    customerPrice: 1190,
    stock: 3,
    quality: "Original",
    supplier: "CompuRefacciones",
    publishedAt: new Date().toISOString(),
    updatedAt: "",
  },
  {
    id: crypto.randomUUID(),
    name: "Capacitor lavadora",
    brand: "Generica",
    model: "Lavadora",
    category: "Bocina",
    price: 180,
    customerPrice: 280,
    stock: 8,
    quality: "Generica",
    supplier: "ElectroStock",
    publishedAt: new Date().toISOString(),
    updatedAt: "",
  },
];

const partsForm = document.querySelector("#partsForm");
const partsTable = document.querySelector("#partsTable");
const partNameSelect = document.querySelector("#partNameSelect");
const partNameInput = document.querySelector("#partName");
const brandSelect = document.querySelector("#brandSelect");
const brandInput = document.querySelector("#brand");
const modelSelect = document.querySelector("#modelSelect");
const modelInput = document.querySelector("#model");
const supplierSelect = document.querySelector("#supplierSelect");
const supplierInput = document.querySelector("#supplier");
const publishedAtInput = document.querySelector("#publishedAt");
const updatedAtInput = document.querySelector("#updatedAt");
const partSearch = document.querySelector("#partSearch");
const totalParts = document.querySelector("#totalParts");
const totalValue = document.querySelector("#totalValue");
const totalProviders = document.querySelector("#totalProviders");
const partsHint = document.querySelector("#partsHint");
const currentDate = document.querySelector("#currentDate");
const currentTime = document.querySelector("#currentTime");
const colorModeToggle = document.querySelector("#colorModeToggle");
const colorModeStorageKey = "loginColorMode";
let lastDeletedPart = null;
let undoTimerId = null;
const newOptionValue = "__new__";

function getUndoBar() {
  let undoBar = document.querySelector("#undoBar");
  if (!undoBar) {
    undoBar = document.createElement("div");
    undoBar.className = "undo-bar";
    undoBar.id = "undoBar";
    document.body.append(undoBar);
  }
  return undoBar;
}

function hideUndoBar() {
  const undoBar = getUndoBar();
  undoBar.hidden = true;
  if (undoTimerId) { clearInterval(undoTimerId); undoTimerId = null; }
}

function showUndoBar(message, onUndo) {
  const undoBar = getUndoBar();
  let secondsLeft = 10;
  if (undoTimerId) clearInterval(undoTimerId);
  undoBar.innerHTML = `<span>${message}</span><small>${secondsLeft}s</small><button type="button">Deshacer</button>`;
  undoBar.hidden = false;
  undoBar.querySelector("button").addEventListener("click", () => { onUndo(); hideUndoBar(); });
  undoTimerId = setInterval(() => {
    secondsLeft -= 1;
    undoBar.querySelector("small").textContent = `${secondsLeft}s`;
    if (secondsLeft <= 0) hideUndoBar();
  }, 1000);
}

function loadParts() {
  const savedParts = localStorage.getItem(storageKey);
  if (!savedParts) {
    localStorage.setItem(storageKey, JSON.stringify(starterParts));
    return starterParts;
  }
  return JSON.parse(savedParts);
}

function saveParts(parts) {
  localStorage.setItem(storageKey, JSON.stringify(parts));
}

function normalizeCategory(value) {
  const categoryMap = {
    Celular: "Telefono",
    Telefono: "Telefono",
    Tablet: "Tablet",
    Computadora: "Computadora",
    Electrodomestico: "Bocina",
    Bocina: "Bocina",
  };
  return categoryMap[value] || "Telefono";
}

function normalizePartType(value) {
  const cleanedValue = String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
  if (!cleanedValue) return "";
  return cleanedValue.charAt(0).toUpperCase() + cleanedValue.slice(1);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getUniquePartValues(field) {
  return [...new Set(loadParts().map((part) => normalizePartType(part[field])).filter(Boolean))].sort();
}

function renderSelectOptions(select, values, placeholder) {
  select.hidden = false;
  select.innerHTML = [
    `<option value="">${escapeHtml(placeholder)}</option>`,
    ...values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`),
    `<option value="${newOptionValue}">Agregar nuevo</option>`,
  ].join("");
}

function syncManualField(select, input) {
  if (select.hidden) return;
  const isNew = select.value === newOptionValue;
  input.hidden = !isNew;
  input.required = isNew;
  if (!isNew) input.value = select.value;
  if (isNew) input.focus();
}

function setSelectValue(select, input, value) {
  const normalizedValue = normalizePartType(value);
  const optionExists = [...select.options].some((option) => option.value === normalizedValue);
  select.value = optionExists ? normalizedValue : newOptionValue;
  input.value = normalizedValue;
  syncManualField(select, input);
}

function setSelectValueForEditing(select, input, value) {
  select.hidden = true;
  input.hidden = false;
  input.required = true;
  input.value = normalizePartType(value);
}

function renderPartTypeOptions() {
  renderSelectOptions(partNameSelect, getUniquePartValues("name"), "Selecciona un repuesto");
  syncManualField(partNameSelect, partNameInput);
}

function syncPartTypeText() {
  partNameInput.value = normalizePartType(partNameInput.value);
}

function renderBrandOptions() {
  renderSelectOptions(brandSelect, getUniquePartValues("brand"), "Selecciona una marca");
  syncManualField(brandSelect, brandInput);
}

function syncBrandText() {
  brandInput.value = normalizePartType(brandInput.value);
}

function renderModelOptions() {
  renderSelectOptions(modelSelect, getUniquePartValues("model"), "Selecciona un modelo");
  syncManualField(modelSelect, modelInput);
}

function syncModelText() {
  modelInput.value = normalizePartType(modelInput.value);
}

function renderSupplierOptions() {
  renderSelectOptions(supplierSelect, getUniquePartValues("supplier"), "Selecciona un proveedor");
  syncManualField(supplierSelect, supplierInput);
}

function syncSupplierText() {
  supplierInput.value = normalizePartType(supplierInput.value);
}

function syncPartSelectFields() {
  syncManualField(partNameSelect, partNameInput);
  syncManualField(brandSelect, brandInput);
  syncManualField(modelSelect, modelInput);
  syncManualField(supplierSelect, supplierInput);
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(value);
}

function formatPartDate(value) {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function resetPartDates() {
  publishedAtInput.value = "Automatico al guardar";
  updatedAtInput.value = "Sin modificaciones";
}

function getFilteredParts(parts) {
  const term = partSearch.value.trim().toLowerCase();
  if (!term) return parts;
  return parts.filter((part) =>
    [part.name, part.brand, part.model, part.category, part.quality, part.supplier].some((field) =>
      field.toLowerCase().includes(term),
    ),
  );
}

function renderParts() {
  const parts = loadParts();
  const filteredParts = getFilteredParts(parts);
  const inventoryValue = parts.reduce((sum, part) => sum + part.price * part.stock, 0);
  const providers = new Set(parts.map((part) => part.supplier.trim().toLowerCase()));

  totalParts.textContent = parts.length;
  totalValue.textContent = formatCurrency(inventoryValue);
  totalProviders.textContent = providers.size;

  if (!filteredParts.length) {
    partsTable.innerHTML = `<tr><td class="empty-table" colspan="12">No hay repuestos con esa busqueda.</td></tr>`;
    return;
  }

  partsTable.innerHTML = filteredParts.map((part) => `
    <tr>
      <td><strong>${part.name}</strong></td>
      <td>${part.brand || "Sin marca"}</td>
      <td>${part.model || "Sin modelo"}</td>
      <td>${normalizeCategory(part.category)}</td>
      <td><span class="quality-pill">${part.quality}</span></td>
      <td>${part.supplier}</td>
      <td>${formatCurrency(part.price)}</td>
      <td>${formatCurrency(Number(part.customerPrice) || 0)}</td>
      <td>${part.stock}</td>
      <td>${formatPartDate(part.publishedAt)}</td>
      <td>${formatPartDate(part.updatedAt)}</td>
      <td>
        <button class="edit-button" type="button" data-id="${part.id}">Editar</button>
        <button class="delete-button" type="button" data-id="${part.id}">Eliminar</button>
      </td>
    </tr>
  `).join("");
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

partsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  syncPartSelectFields();
  const formData = new FormData(partsForm);
  const parts = loadParts();
  const editingId = partsForm.dataset.editingId;

  if (editingId) {
    const index = parts.findIndex((p) => p.id === editingId);
    if (index !== -1) {
      const now = new Date().toISOString();
      parts[index] = {
        ...parts[index],
        name: normalizePartType(formData.get("partName")),
        brand: normalizePartType(formData.get("brand")),
        model: normalizePartType(formData.get("model")),
        category: normalizeCategory(formData.get("category")),
        price: Number(formData.get("price")),
        customerPrice: Number(formData.get("customerPrice")) || 0,
        stock: Number(formData.get("stock")),
        quality: formData.get("quality"),
        supplier: normalizePartType(formData.get("supplier")),
        publishedAt: parts[index].publishedAt || now,
        updatedAt: now,
      };
    }
    delete partsForm.dataset.editingId;
    document.querySelector("#submitParts").textContent = "Guardar repuesto";
    partsHint.textContent = "Repuesto actualizado correctamente.";
  } else {
    const now = new Date().toISOString();
    parts.unshift({
      id: crypto.randomUUID(),
      name: normalizePartType(formData.get("partName")),
      brand: normalizePartType(formData.get("brand")),
      model: normalizePartType(formData.get("model")),
      category: normalizeCategory(formData.get("category")),
      price: Number(formData.get("price")),
      customerPrice: Number(formData.get("customerPrice")) || 0,
      stock: Number(formData.get("stock")),
      quality: formData.get("quality"),
      supplier: normalizePartType(formData.get("supplier")),
      publishedAt: now,
      updatedAt: "",
    });
    partsHint.textContent = "Repuesto guardado correctamente.";
  }

  saveParts(parts);
  partsForm.reset();
  resetPartDates();
  renderPartTypeOptions();
  renderBrandOptions();
  renderModelOptions();
  renderSupplierOptions();
  renderParts();
});

partsTable.addEventListener("click", (event) => {
  const editButton = event.target.closest(".edit-button");
  if (editButton) {
    const parts = loadParts();
    const part = parts.find((p) => p.id === editButton.dataset.id);
    if (!part) return;
    setSelectValueForEditing(partNameSelect, partNameInput, part.name);
    setSelectValueForEditing(brandSelect, brandInput, part.brand || "");
    setSelectValueForEditing(modelSelect, modelInput, part.model || "");
    document.querySelector("#category").value = normalizeCategory(part.category);
    document.querySelector("#price").value = part.price;
    document.querySelector("#customerPrice").value = part.customerPrice ?? "";
    document.querySelector("#stock").value = part.stock;
    document.querySelector("#quality").value = part.quality;
    setSelectValueForEditing(supplierSelect, supplierInput, part.supplier);
    publishedAtInput.value = formatPartDate(part.publishedAt);
    updatedAtInput.value = formatPartDate(part.updatedAt);
    partsForm.dataset.editingId = part.id;
    partsHint.textContent = "Editando repuesto — haz clic en Guardar para confirmar los cambios.";
    document.querySelector("#submitParts").textContent = "Guardar cambios";
    partsForm.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  const deleteButton = event.target.closest(".delete-button");
  if (!deleteButton) return;

  const parts = loadParts();
  const partIndex = parts.findIndex((part) => part.id === deleteButton.dataset.id);
  const partToDelete = parts[partIndex];
  if (!partToDelete) return;

  if (!confirm(`¿Seguro que quieres eliminar "${partToDelete.name}"?`)) return;

  lastDeletedPart = { part: partToDelete, index: partIndex };
  parts.splice(partIndex, 1);
  saveParts(parts);
  partsHint.textContent = "Repuesto eliminado del listado.";
  renderParts();

  showUndoBar("Repuesto eliminado.", () => {
    if (!lastDeletedPart) return;
    const restoredParts = loadParts();
    restoredParts.splice(lastDeletedPart.index, 0, lastDeletedPart.part);
    saveParts(restoredParts);
    partsHint.textContent = "Eliminacion deshecha.";
    lastDeletedPart = null;
    renderParts();
  });
});

partSearch.addEventListener("input", renderParts);
partNameSelect.addEventListener("change", () => syncManualField(partNameSelect, partNameInput));
partNameInput.addEventListener("blur", syncPartTypeText);
partNameInput.addEventListener("change", syncPartTypeText);
brandSelect.addEventListener("change", () => syncManualField(brandSelect, brandInput));
brandInput.addEventListener("blur", syncBrandText);
brandInput.addEventListener("change", syncBrandText);
modelSelect.addEventListener("change", () => syncManualField(modelSelect, modelInput));
modelInput.addEventListener("blur", syncModelText);
modelInput.addEventListener("change", syncModelText);
supplierSelect.addEventListener("change", () => syncManualField(supplierSelect, supplierInput));
supplierInput.addEventListener("blur", syncSupplierText);
supplierInput.addEventListener("change", syncSupplierText);
colorModeToggle.addEventListener("click", () => {
  const nextMode = document.body.classList.contains("login-dark") ? "light" : "dark";
  setColorMode(nextMode);
});

setColorMode(localStorage.getItem(colorModeStorageKey) || "light");
updateDateTime();
setInterval(updateDateTime, 1000);
renderPartTypeOptions();
renderBrandOptions();
renderModelOptions();
renderSupplierOptions();
resetPartDates();
renderParts();
