const storageKey = "inventoryParts";
const deletedOptionsStorageKey = "inventoryDeletedPartOptions";
const appSession = window.repairApp.session;
const appPermissions = window.repairApp.permissions;
const appParts = window.repairApp.parts;
const {
  parseMoneyCents,
  centsToMoney,
  parseMoney,
  getMoneyCents,
  normalizeStockQuantity,
  normalizeType: normalizePartType,
  normalizeCategory,
  normalizeSearch: normalizePartSearch,
  getCanonicalValue,
  getUniqueNormalizedValues,
  normalizeQuality,
  getQualityClass,
  getRecordId: getPartRecordId,
  getDuplicateKey: getPartDuplicateKey,
  findDuplicate: findDuplicatePart,
  getDuplicateMessage,
  hasModelSupplierConflict,
  getModelSupplierConflictMessage,
  isDuplicateError,
  normalizeForCloud: normalizePartForCloud,
  isSameOptionValue,
  normalizeOptionValue: normalizeOptionValueForField,
  withUpdatedOptionValue,
  hasDuplicatesAfterOptionChange: hasDuplicatePartsAfterOptionChange,
} = appParts;
const usersStorageKey = appSession.keys.users;

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
    quality: "GX",
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
const partsFormOverlay = document.querySelector("#partsFormOverlay");
const openPartsFormButton = document.querySelector("#openPartsForm");
const closePartsFormButton = document.querySelector("#closePartsForm");
const cancelPartsFormButton = document.querySelector("#cancelPartsForm");
const partsFormKicker = document.querySelector("#partsFormKicker");
const partsFormTitle = document.querySelector("#partsFormTitle");
const submitPartsButton = document.querySelector("#submitParts");
const partsTable = document.querySelector("#partsTable");
const partNameSelect = document.querySelector("#partNameSelect");
const partNameInput = document.querySelector("#partName");
const brandSelect = document.querySelector("#brandSelect");
const brandInput = document.querySelector("#brand");
const modelSelect = document.querySelector("#modelSelect");
const modelInput = document.querySelector("#model");
const supplierSelect = document.querySelector("#supplierSelect");
const supplierInput = document.querySelector("#supplier");
const categorySelect = document.querySelector("#category");
const publishedAtInput = document.querySelector("#publishedAt");
const updatedAtInput = document.querySelector("#updatedAt");
const partSearch = document.querySelector("#partSearch");
const partsPageSummary = document.querySelector("#partsPageSummary");
const previousPartsPageButton = document.querySelector("#previousPartsPage");
const nextPartsPageButton = document.querySelector("#nextPartsPage");
const totalParts = document.querySelector("#totalParts");
const totalValue = document.querySelector("#totalValue");
const totalProviders = document.querySelector("#totalProviders");
const partsHint = document.querySelector("#partsHint");
const currentDate = document.querySelector("#currentDate");
const currentTime = document.querySelector("#currentTime");
const colorModeToggle = document.querySelector("#colorModeToggle");
const partsLogoutButton = document.querySelector("#partsLogoutButton");
const partsLogoutConfirmOverlay = document.querySelector("#partsLogoutConfirmOverlay");
const cancelPartsLogoutButton = document.querySelector("#cancelPartsLogout");
const confirmPartsLogoutButton = document.querySelector("#confirmPartsLogout");
const colorModeStorageKey = "loginColorMode";
let lastDeletedPart = null;
let undoTimerId = null;
let partsCloudMigrationDone = false;
let currentPartsPage = 1;
const partsPerPage = 20;
const newOptionValue = "__new__";
const categoryOptions = ["Telefono", "Tablet", "Computadora", "Bocina"];
const optionFieldLabels = {
  name: "nombre de repuesto",
  brand: "marca",
  model: "modelo",
  supplier: "proveedor",
  category: "categoria",
};

function getStoredCurrentUser() {
  return appSession.getUser();
}

function updatePartsLogoutVisibility() {
  partsLogoutButton.hidden = !appSession.hasSession();
}

function openPartsLogoutConfirmation() {
  partsLogoutConfirmOverlay.hidden = false;
  confirmPartsLogoutButton.focus();
}

function closePartsLogoutConfirmation() {
  partsLogoutConfirmOverlay.hidden = true;
}

async function performPartsLogout() {
  confirmPartsLogoutButton.disabled = true;
  try {
    await appSession.logout();
  } catch {
    // The local session must still close if the network is unavailable.
  } finally {
    window.location.replace("index.html");
  }
}

function isPartsReadOnlyMode() {
  const storedUser = getStoredCurrentUser();
  return storedUser?.role === "activador" && appSession.hasSession() && !appPermissions.canManageParts(storedUser);
}

function applyPartsAccessMode() {
  const isReadOnly = isPartsReadOnlyMode();
  document.body.classList.toggle("parts-readonly-mode", isReadOnly);
  partsForm.hidden = isReadOnly;
  openPartsFormButton.hidden = isReadOnly;
  if (isReadOnly) closePartsForm();
  if (isReadOnly) {
    partsHint.textContent = "Modo consulta: tu rol puede ver repuestos, pero no agregar, editar ni eliminar.";
  }
}

function setPartsFormMode(mode) {
  const isEditing = mode === "edit";
  partsFormKicker.textContent = isEditing ? "Edicion de repuesto" : "Alta de repuesto";
  partsFormTitle.textContent = isEditing ? "Actualizar repuesto" : "Datos del repuesto";
  submitPartsButton.textContent = isEditing ? "Guardar cambios" : "Guardar repuesto";
}

function openPartsForm(mode = "create") {
  if (isPartsReadOnlyMode()) return;
  setPartsFormMode(mode);
  partsFormOverlay.hidden = false;
  document.body.classList.add("parts-form-modal-open");
  setTimeout(() => partNameSelect.focus(), 0);
}

function closePartsForm({ reset = true } = {}) {
  partsFormOverlay.hidden = true;
  document.body.classList.remove("parts-form-modal-open");
  if (!reset) return;
  delete partsForm.dataset.editingId;
  partsForm.reset();
  resetPartDates();
  setPartsFormMode("create");
}

function startNewPart() {
  closePartsForm();
  partsHint.textContent = "Captura los datos del nuevo repuesto.";
  openPartsForm("create");
}

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
  undoBar.querySelector("button").addEventListener("click", async () => {
    const undoButton = undoBar.querySelector("button");
    undoButton.disabled = true;
    undoButton.textContent = "Restaurando...";
    await onUndo();
    hideUndoBar();
  });
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

function loadDeletedOptions() {
  const savedOptions = localStorage.getItem(deletedOptionsStorageKey);
  return savedOptions ? JSON.parse(savedOptions) : {};
}

function saveDeletedOptions(options) {
  localStorage.setItem(deletedOptionsStorageKey, JSON.stringify(options));
}

function getDeletedOptionKeys(field) {
  return new Set(loadDeletedOptions()[field] || []);
}

function markOptionDeleted(field, value) {
  const options = loadDeletedOptions();
  const keys = new Set(options[field] || []);
  keys.add(normalizePartSearch(value));
  options[field] = [...keys];
  saveDeletedOptions(options);
}

function unmarkOptionDeleted(field, value) {
  const options = loadDeletedOptions();
  const keys = new Set(options[field] || []);
  keys.delete(normalizePartSearch(value));
  options[field] = [...keys];
  saveDeletedOptions(options);
}

function loadSystemUsers() {
  const defaultUsers = [
    { username: "root", password: "root123", role: "root", active: true },
  ];
  try {
    const savedUsers = localStorage.getItem(usersStorageKey);
    return savedUsers ? JSON.parse(savedUsers) : defaultUsers;
  } catch {
    return defaultUsers;
  }
}

async function verifyRootCredentials(username, password) {
  if (window.repairCloud?.isConfigured()) {
    await window.repairCloud.seedUsers();
    return await window.repairCloud.verifyRoot(username, password);
  }

  const normalizedUsername = String(username || "").trim().toLowerCase();
  return loadSystemUsers().some((user) =>
    user.username?.toLowerCase() === normalizedUsername &&
    user.password === password &&
    user.role === "root" &&
    user.active !== false
  );
}

async function requireRootForOptionDelete(field) {
  if (!["brand", "supplier"].includes(field)) return true;

  const currentUser = getStoredCurrentUser();
  if (currentUser?.role === "root") return true;

  const username = prompt("Solo root puede borrar marca o proveedor. Usuario root:");
  if (username === null) return false;
  const password = prompt("Contrasena de root:");
  if (password === null) return false;

  try {
    const isRoot = await verifyRootCredentials(username, password);
    if (!isRoot) {
      partsHint.textContent = "Autenticacion root incorrecta. No se elimino nada.";
      return false;
    }
    return true;
  } catch (error) {
    partsHint.textContent = `No se pudo validar root: ${error.message}`;
    return false;
  }
}

function formatCurrencyCents(cents) {
  return formatCurrency(centsToMoney(cents));
}

function formatMoneyInput(cents) {
  const normalizedCents = Number(cents) || 0;
  const pesos = Math.trunc(normalizedCents / 100);
  const centavos = Math.abs(normalizedCents % 100);
  if (centavos === 0) return String(pesos);
  if (centavos % 10 === 0) return `${pesos}.${String(centavos / 10)}`;
  return `${pesos}.${String(centavos).padStart(2, "0")}`;
}

function parseStockQuantity(value) {
  const normalizedValue = String(value ?? "").trim().replace(",", ".");
  if (!/^\d+$/.test(normalizedValue)) return null;
  return Number(normalizedValue);
}

async function migrateLocalPartsToCloud() {
  if (partsCloudMigrationDone || !window.repairCloud?.isConfigured()) return;
  partsCloudMigrationDone = true;
}

async function syncPartsFromSource() {
  if (!window.repairCloud?.isConfigured()) return loadParts();
  await migrateLocalPartsToCloud();
  const cloudParts = await window.repairCloud.listParts();
  const parts = cloudParts.map((part) => ({ ...part, id: part._id || part.id, stock: normalizeStockQuantity(part.stock) }));
  saveParts(parts);
  return parts;
}

async function refreshPartsView() {
  const hasRenderedRows = partsTable.children.length > 0;
  if (!hasRenderedRows) {
    renderPartTypeOptions();
    renderBrandOptions();
    renderModelOptions();
    renderSupplierOptions();
    renderCategoryOptions();
    renderParts();
    if (window.repairCloud?.isConfigured()) {
      partsHint.textContent = "Sincronizando con base de datos...";
    }
  }

  try {
    await syncPartsFromSource();
    partsHint.textContent = window.repairCloud?.isConfigured()
      ? "Datos sincronizados con base de datos."
      : partsHint.textContent;
  } catch (error) {
    partsHint.textContent = `Modo local: ${error.message}`;
  }
  renderPartTypeOptions();
  renderBrandOptions();
  renderModelOptions();
  renderSupplierOptions();
  renderCategoryOptions();
  applyPartsAccessMode();
  renderParts();
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
  const deletedKeys = getDeletedOptionKeys(field);
  return getUniqueNormalizedValues(loadParts().map((part) => part[field]))
    .filter((value) => !deletedKeys.has(normalizePartSearch(value)));
}

function getCategoryValues() {
  const deletedKeys = getDeletedOptionKeys("category");
  const values = getUniqueNormalizedValues([...categoryOptions, ...loadParts().map((part) => normalizeCategory(part.category))])
    .filter((value) => !deletedKeys.has(normalizePartSearch(value)));
  return values.length ? values : ["Telefono"];
}

function renderSelectOptions(select, values, placeholder) {
  delete select.dataset.editing;
  select.hidden = false;
  select.disabled = false;
  select.required = true;
  select.innerHTML = [
    `<option value="">${escapeHtml(placeholder)}</option>`,
    ...values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`),
    `<option value="${newOptionValue}">Agregar nuevo</option>`,
  ].join("");
}

function renderCategoryOptions(selectedValue = categorySelect.value || "Telefono") {
  const values = getCategoryValues();
  categorySelect.innerHTML = values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
  categorySelect.value = values.includes(selectedValue) ? selectedValue : "Telefono";
}

function syncManualField(select, input) {
  if (select.dataset.editing === "true") {
    input.hidden = false;
    input.required = true;
    select.required = false;
    if (select.value && select.value !== newOptionValue) input.value = select.value;
    if (select.value === newOptionValue) input.focus();
    return;
  }
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
  select.dataset.editing = "true";
  select.hidden = false;
  select.disabled = false;
  select.required = false;
  select.value = "";
  input.hidden = false;
  input.required = true;
  input.value = normalizePartType(value);
}

function setEditableSuggestions(input, values, datalistId) {
  let datalist = document.querySelector(`#${datalistId}`);
  if (!datalist) {
    datalist = document.createElement("datalist");
    datalist.id = datalistId;
    document.body.append(datalist);
  }
  datalist.innerHTML = values.map((option) => `<option value="${escapeHtml(option)}"></option>`).join("");
  input.setAttribute("list", datalistId);
}

function setSelectValueForEditingWithSuggestions(select, input, value, field, datalistId) {
  setSelectValueForEditing(select, input, value);
  setEditableSuggestions(input, getUniquePartValues(field), datalistId);
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

function getPartFormValues() {
  syncPartSelectFields();
  const optionDuplicateFields = [
    { field: "name", select: partNameSelect, input: partNameInput },
    { field: "brand", select: brandSelect, input: brandInput },
    { field: "model", select: modelSelect, input: modelInput },
    { field: "supplier", select: supplierSelect, input: supplierInput },
  ];
  const duplicateOption = optionDuplicateFields.find(({ field, select, input }) =>
    select.value === newOptionValue && isOptionValueDuplicate(field, input.value)
  );
  if (duplicateOption) {
    throw new Error(getOptionDuplicateMessage(duplicateOption.field, duplicateOption.input.value));
  }
  const priceCents = parseMoneyCents(document.querySelector("#price").value);
  const customerPriceCents = parseMoneyCents(document.querySelector("#customerPrice").value);
  const stock = parseStockQuantity(document.querySelector("#stock").value);
  return {
    name: normalizePartType(partNameInput.value),
    brand: normalizePartType(brandInput.value),
    model: normalizePartType(modelInput.value),
    supplier: normalizePartType(supplierInput.value),
    category: normalizeCategory(categorySelect.value),
    price: centsToMoney(priceCents),
    priceCents,
    customerPrice: centsToMoney(customerPriceCents),
    customerPriceCents,
    stock,
    quality: normalizeQuality(document.querySelector("#quality").value),
  };
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

function getPartSearchText(part) {
  return [part.name, part.brand, part.model, part.category, part.quality, part.supplier]
    .map(normalizePartSearch)
    .join(" ");
}

function compactPartSearch(value = "") {
  return normalizePartSearch(value).replace(/\s+/g, "");
}

function isOptionValueDuplicate(field, value) {
  if (!["name", "brand", "model", "supplier"].includes(field)) return false;
  const values = getUniquePartValues(field);
  return Boolean(getCanonicalValue(values, value));
}

function getOptionDuplicateMessage(field, value) {
  return `Ese ${optionFieldLabels[field]} ya existe: ${getCanonicalValue(getUniquePartValues(field), value) || normalizePartType(value)}. Seleccionalo de la lista.`;
}

function resetPartDates() {
  publishedAtInput.value = "Automatico al guardar";
  updatedAtInput.value = "Sin modificaciones";
}

function getFilteredParts(parts) {
  const query = normalizePartSearch(partSearch.value);
  const terms = query.split(/\s+/).filter(Boolean);
  if (!terms.length) return parts;
  const compactQuery = compactPartSearch(query);

  return parts.filter((part) => {
    const searchText = getPartSearchText(part);
    const compactText = compactPartSearch(searchText);
    return (
      searchText.includes(query) ||
      compactText.includes(compactQuery) ||
      terms.every((term) => searchText.includes(term) || compactText.includes(compactPartSearch(term)))
    );
  });
}

function renderParts() {
  const parts = loadParts();
  const filteredParts = getFilteredParts(parts);
  const isReadOnly = isPartsReadOnlyMode();
  const inventoryValueCents = parts.reduce((sum, part) => sum + getMoneyCents(part, "price", "priceCents") * normalizeStockQuantity(part.stock), 0);
  const providers = new Set(parts.map((part) => part.supplier.trim().toLowerCase()));

  totalParts.textContent = parts.length;
  totalValue.textContent = formatCurrencyCents(inventoryValueCents);
  totalProviders.textContent = providers.size;

  if (!filteredParts.length) {
    partsTable.innerHTML = `<tr><td class="empty-table" colspan="${isReadOnly ? 11 : 12}">No hay repuestos con esa busqueda.</td></tr>`;
    partsPageSummary.textContent = "0 repuestos";
    previousPartsPageButton.disabled = true;
    nextPartsPageButton.disabled = true;
    return;
  }

  const totalPages = Math.max(1, Math.ceil(filteredParts.length / partsPerPage));
  currentPartsPage = Math.min(Math.max(currentPartsPage, 1), totalPages);
  const startIndex = (currentPartsPage - 1) * partsPerPage;
  const visibleParts = filteredParts.slice(startIndex, startIndex + partsPerPage);
  const endIndex = startIndex + visibleParts.length;

  partsPageSummary.textContent = `${startIndex + 1}-${endIndex} de ${filteredParts.length} repuestos`;
  previousPartsPageButton.disabled = currentPartsPage === 1;
  nextPartsPageButton.disabled = currentPartsPage === totalPages;

  partsTable.innerHTML = visibleParts.map((part) => `
    <tr>
      <td><strong>${part.name}</strong></td>
      <td>${part.brand || "Sin marca"}</td>
      <td>${part.model || "Sin modelo"}</td>
      <td>${normalizeCategory(part.category)}</td>
      <td><span class="quality-pill ${getQualityClass(part.quality)}">${normalizeQuality(part.quality)}</span></td>
      <td>${part.supplier}</td>
      <td>${formatCurrencyCents(getMoneyCents(part, "price", "priceCents"))}</td>
      <td>${formatCurrencyCents(getMoneyCents(part, "customerPrice", "customerPriceCents"))}</td>
      <td>${normalizeStockQuantity(part.stock)}</td>
      <td>${formatPartDate(part.publishedAt)}</td>
      <td>${formatPartDate(part.updatedAt)}</td>
      ${isReadOnly ? "" : `<td>
        <div class="table-action-icons">
          <button class="edit-button icon-action-button icon-edit-button" type="button" data-id="${escapeHtml(getPartRecordId(part))}" aria-label="Editar ${escapeHtml(part.name)}" title="Editar">Editar</button>
          <button class="delete-button icon-action-button icon-delete-button" type="button" data-id="${escapeHtml(getPartRecordId(part))}" aria-label="Eliminar ${escapeHtml(part.name)}" title="Eliminar">Eliminar</button>
        </div>
      </td>`}
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
  document.documentElement.classList.toggle("login-dark", isDarkMode);
  document.body.classList.toggle("login-dark", isDarkMode);
  const toggleLabel = isDarkMode ? "Cambiar a modo dia" : "Cambiar a modo noche";
  colorModeToggle.setAttribute("aria-label", toggleLabel);
  colorModeToggle.setAttribute("title", toggleLabel);
  colorModeToggle.setAttribute("aria-pressed", String(isDarkMode));
  localStorage.setItem(colorModeStorageKey, isDarkMode ? "dark" : "light");
}

function getManagedOptionValue(field) {
  if (field === "category") return categorySelect.value;
  const controlMap = {
    name: partNameSelect,
    brand: brandSelect,
    model: modelSelect,
    supplier: supplierSelect,
  };
  const value = controlMap[field]?.value || "";
  if (!value || value === newOptionValue) return "";
  return value;
}

function getBlankOptionValue(field) {
  const blankValues = {
    name: "Sin repuesto",
    brand: "Sin marca",
    model: "Sin modelo",
    supplier: "Sin proveedor",
    category: "Sin categoria",
  };
  return blankValues[field] || "";
}

function getAffectedPartsByOption(parts, field, value) {
  return parts.filter((part) => isSameOptionValue(field, part[field], value));
}

function getCloudPatchForPart(part) {
  const normalizedPart = normalizePartForCloud(part);
  const { sourceId, ...patch } = normalizedPart;
  return patch;
}

async function persistOptionChanges(updatedParts, changedParts) {
  if (!window.repairCloud?.isConfigured()) return;
  for (const part of changedParts) {
    if (!part._id) continue;
    await window.repairCloud.updatePart(part._id, getCloudPatchForPart(part));
  }
  const cloudParts = await window.repairCloud.listParts();
  saveParts(cloudParts.map((part) => ({ ...part, id: part._id || part.id, stock: normalizeStockQuantity(part.stock) })));
}

async function restoreOptionDelete(previousParts, previousDeletedOptions, field, oldValue) {
  try {
    if (window.repairCloud?.isConfigured()) {
      const changedParts = previousParts.filter((part) => part._id && isSameOptionValue(field, part[field], oldValue));
      for (const part of changedParts) {
        await window.repairCloud.updatePart(part._id, getCloudPatchForPart(part));
      }
      const cloudParts = await window.repairCloud.listParts();
      saveParts(cloudParts.map((part) => ({ ...part, id: part._id || part.id, stock: normalizeStockQuantity(part.stock) })));
    } else {
      saveParts(previousParts);
    }
    saveDeletedOptions(previousDeletedOptions);
    partsHint.textContent = "Eliminacion deshecha.";
    await refreshPartsView();
  } catch (error) {
    partsHint.textContent = `No se pudo deshacer: ${error.message}`;
  }
}

async function editManagedOption(field) {
  const oldValue = getManagedOptionValue(field);
  if (!oldValue) {
    partsHint.textContent = `Selecciona un ${optionFieldLabels[field]} para editar.`;
    return;
  }

  const typedValue = prompt(`Nuevo ${optionFieldLabels[field]} para "${oldValue}":`, oldValue);
  if (typedValue === null) return;

  const newValue = normalizeOptionValueForField(field, typedValue);
  if (!newValue) {
    partsHint.textContent = `Escribe un ${optionFieldLabels[field]} valido.`;
    return;
  }

  if (isSameOptionValue(field, oldValue, newValue)) {
    partsHint.textContent = "No hubo cambios.";
    return;
  }

  const parts = loadParts();
  if (["name", "brand", "model", "supplier"].includes(field) && getCanonicalValue(getUniquePartValues(field), newValue)) {
    partsHint.textContent = getOptionDuplicateMessage(field, newValue);
    return;
  }

  if (hasDuplicatePartsAfterOptionChange(parts, field, oldValue, newValue)) {
    partsHint.textContent = "Ese cambio crearia repuestos duplicados. Edita el repuesto especifico primero.";
    return;
  }

  const updatedParts = parts.map((part) =>
    isSameOptionValue(field, part[field], oldValue) ? withUpdatedOptionValue(part, field, newValue) : part
  );
  const changedParts = updatedParts.filter((part, index) => part !== parts[index]);

  try {
    await persistOptionChanges(updatedParts, changedParts);
    if (!window.repairCloud?.isConfigured()) saveParts(updatedParts);
    markOptionDeleted(field, oldValue);
    unmarkOptionDeleted(field, newValue);
    partsHint.textContent = `${changedParts.length} registro${changedParts.length === 1 ? "" : "s"} actualizado${changedParts.length === 1 ? "" : "s"}.`;
  } catch (error) {
    partsHint.textContent = `No se pudo editar en Convex: ${error.message}`;
  }

  await refreshPartsView();
}

async function deleteManagedOption(field) {
  const oldValue = getManagedOptionValue(field);
  if (!oldValue) {
    partsHint.textContent = `Selecciona un ${optionFieldLabels[field]} para eliminar.`;
    return;
  }

  const hasRootPermission = await requireRootForOptionDelete(field);
  if (!hasRootPermission) return;

  const parts = loadParts();
  const previousParts = parts.map((part) => ({ ...part }));
  const previousDeletedOptions = loadDeletedOptions();
  const affectedParts = getAffectedPartsByOption(parts, field, oldValue);
  if (!affectedParts.length) {
    partsHint.textContent = "Ese valor ya no esta en uso.";
    await refreshPartsView();
    return;
  }

  const replacementValue = getBlankOptionValue(field);
  if (!confirm(`Eliminar "${oldValue}" de ${affectedParts.length} registro${affectedParts.length === 1 ? "" : "s"}?`)) return;

  if (hasDuplicatePartsAfterOptionChange(parts, field, oldValue, replacementValue)) {
    partsHint.textContent = "No se elimino porque eso crearia repuestos duplicados.";
    return;
  }

  const updatedParts = parts.map((part) =>
    isSameOptionValue(field, part[field], oldValue) ? withUpdatedOptionValue(part, field, replacementValue) : part
  );
  const changedParts = updatedParts.filter((part, index) => part !== parts[index]);

  try {
    await persistOptionChanges(updatedParts, changedParts);
    if (!window.repairCloud?.isConfigured()) saveParts(updatedParts);
    markOptionDeleted(field, oldValue);
    unmarkOptionDeleted(field, replacementValue);
    partsHint.textContent = `${optionFieldLabels[field]} eliminado de ${changedParts.length} registro${changedParts.length === 1 ? "" : "s"}.`;
    showUndoBar(`${optionFieldLabels[field]} eliminado.`, () =>
      restoreOptionDelete(previousParts, previousDeletedOptions, field, oldValue)
    );
  } catch (error) {
    partsHint.textContent = `No se pudo eliminar en Convex: ${error.message}`;
  }

  await refreshPartsView();
}

partsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (isPartsReadOnlyMode()) {
    partsHint.textContent = "Tu rol solo permite consultar repuestos.";
    return;
  }
  let formValues;
  try {
    formValues = getPartFormValues();
  } catch (error) {
    partsHint.textContent = error.message;
    return;
  }
  const parts = loadParts();
  const editingId = partsForm.dataset.editingId;
  if (formValues.stock === null) {
    partsHint.textContent = "La existencia debe ser una cantidad entera, sin decimales.";
    document.querySelector("#stock").focus();
    return;
  }

  if (hasModelSupplierConflict(formValues)) {
    partsHint.textContent = getModelSupplierConflictMessage();
    return;
  }

  const duplicatePart = findDuplicatePart(parts, formValues, editingId);

  if (duplicatePart) {
    partsHint.textContent = getDuplicateMessage(duplicatePart);
    return;
  }

  if (editingId) {
    const index = parts.findIndex((p) => getPartRecordId(p) === editingId);
    if (index !== -1) {
      const now = new Date().toISOString();
      const previousPart = { ...parts[index] };
      parts[index] = {
        ...parts[index],
        ...formValues,
        publishedAt: parts[index].publishedAt || now,
        updatedAt: now,
      };

      try {
        if (window.repairCloud?.isConfigured() && parts[index]._id) {
          await window.repairCloud.updatePart(parts[index]._id, {
            ...formValues,
            publishedAt: parts[index].publishedAt || now,
            updatedAt: now,
          });
        }
      } catch (error) {
        parts[index] = previousPart;
        if (isDuplicateError(error)) {
          partsHint.textContent = error.message;
          return;
        }
        partsHint.textContent = `Guardado localmente: ${error.message}`;
      }
    }
    delete partsForm.dataset.editingId;
    submitPartsButton.textContent = "Guardar repuesto";
    partsHint.textContent = "Repuesto actualizado correctamente.";
  } else {
    const now = new Date().toISOString();
    const part = {
      id: crypto.randomUUID(),
      ...formValues,
      publishedAt: now,
      updatedAt: "",
    };
    try {
      if (window.repairCloud?.isConfigured()) {
        await window.repairCloud.createPart(normalizePartForCloud(part));
      } else {
        parts.unshift(part);
      }
    } catch (error) {
      if (isDuplicateError(error)) {
        partsHint.textContent = error.message;
        return;
      }
      parts.unshift(part);
      partsHint.textContent = `Guardado localmente: ${error.message}`;
    }
    partsHint.textContent = "Repuesto guardado correctamente.";
  }

  ["name", "brand", "model", "supplier", "category"].forEach((field) => unmarkOptionDeleted(field, formValues[field]));
  saveParts(parts);
  partsForm.reset();
  resetPartDates();
  await refreshPartsView();
  closePartsForm();
});

partsTable.addEventListener("click", async (event) => {
  if (isPartsReadOnlyMode()) {
    partsHint.textContent = "Tu rol solo permite consultar repuestos.";
    return;
  }
  const editButton = event.target.closest(".edit-button");
  if (editButton) {
    const parts = loadParts();
    const part = parts.find((p) => getPartRecordId(p) === editButton.dataset.id);
    if (!part) {
      partsHint.textContent = "No se encontro el repuesto para editar. Actualiza el listado e intenta de nuevo.";
      await refreshPartsView();
      return;
    }
    setSelectValueForEditingWithSuggestions(partNameSelect, partNameInput, part.name, "name", "partNameEditOptions");
    setSelectValueForEditingWithSuggestions(brandSelect, brandInput, part.brand || "", "brand", "brandEditOptions");
    setSelectValueForEditingWithSuggestions(modelSelect, modelInput, part.model || "", "model", "modelEditOptions");
    renderCategoryOptions(normalizeCategory(part.category));
    document.querySelector("#price").value = formatMoneyInput(getMoneyCents(part, "price", "priceCents"));
    document.querySelector("#customerPrice").value = formatMoneyInput(getMoneyCents(part, "customerPrice", "customerPriceCents"));
    document.querySelector("#stock").value = normalizeStockQuantity(part.stock);
    document.querySelector("#quality").value = normalizeQuality(part.quality);
    setSelectValueForEditingWithSuggestions(supplierSelect, supplierInput, part.supplier, "supplier", "supplierEditOptions");
    publishedAtInput.value = formatPartDate(part.publishedAt);
    updatedAtInput.value = formatPartDate(part.updatedAt);
    partsForm.dataset.editingId = getPartRecordId(part);
    partsHint.textContent = "Editando repuesto: guarda para confirmar los cambios.";
    openPartsForm("edit");
    return;
  }

  const deleteButton = event.target.closest(".delete-button");
  if (!deleteButton) return;

  const parts = loadParts();
  const partIndex = parts.findIndex((part) => getPartRecordId(part) === deleteButton.dataset.id);
  const partToDelete = parts[partIndex];
  if (!partToDelete) {
    partsHint.textContent = "No se encontro el repuesto para eliminar. Actualiza el listado e intenta de nuevo.";
    await refreshPartsView();
    return;
  }

  if (!confirm(`¿Seguro que quieres eliminar "${partToDelete.name}"?`)) return;

  lastDeletedPart = { part: partToDelete, index: partIndex };
  parts.splice(partIndex, 1);
  try {
    if (window.repairCloud?.isConfigured() && partToDelete._id) {
      await window.repairCloud.removePart(partToDelete._id);
    }
  } catch (error) {
    partsHint.textContent = `Eliminado solo localmente: ${error.message}`;
  }
  saveParts(parts);
  partsHint.textContent = "Repuesto eliminado del listado.";
  refreshPartsView();

  showUndoBar("Repuesto eliminado.", async () => {
    if (!lastDeletedPart) return;
    try {
      if (window.repairCloud?.isConfigured()) {
        await window.repairCloud.createPart(normalizePartForCloud(lastDeletedPart.part));
      } else {
        const restoredParts = loadParts();
        restoredParts.splice(lastDeletedPart.index, 0, lastDeletedPart.part);
        saveParts(restoredParts);
      }
      partsHint.textContent = "Eliminacion deshecha.";
      lastDeletedPart = null;
      await refreshPartsView();
    } catch (error) {
      partsHint.textContent = `No se pudo deshacer: ${error.message}`;
    }
  });
});

partsForm.addEventListener("click", async (event) => {
  if (isPartsReadOnlyMode()) {
    event.preventDefault();
    partsHint.textContent = "Tu rol solo permite consultar repuestos.";
    return;
  }
  const optionButton = event.target.closest("[data-option-action]");
  if (!optionButton) return;

  const { optionAction, optionField } = optionButton.dataset;
  if (!optionField || !optionAction) return;

  if (optionAction === "edit") {
    await editManagedOption(optionField);
    return;
  }

  if (optionAction === "delete") {
    await deleteManagedOption(optionField);
  }
});

partSearch.addEventListener("input", () => {
  currentPartsPage = 1;
  renderParts();
});
previousPartsPageButton.addEventListener("click", () => {
  if (currentPartsPage <= 1) return;
  currentPartsPage -= 1;
  renderParts();
  document.querySelector(".parts-table-card").scrollIntoView({ behavior: "smooth", block: "start" });
});
nextPartsPageButton.addEventListener("click", () => {
  currentPartsPage += 1;
  renderParts();
  document.querySelector(".parts-table-card").scrollIntoView({ behavior: "smooth", block: "start" });
});
openPartsFormButton.addEventListener("click", startNewPart);
closePartsFormButton.addEventListener("click", () => closePartsForm());
cancelPartsFormButton.addEventListener("click", () => closePartsForm());
partsFormOverlay.addEventListener("click", (event) => {
  if (event.target === partsFormOverlay) closePartsForm();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !partsFormOverlay.hidden) closePartsForm();
});
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
partsLogoutButton.addEventListener("click", openPartsLogoutConfirmation);
cancelPartsLogoutButton.addEventListener("click", closePartsLogoutConfirmation);
confirmPartsLogoutButton.addEventListener("click", performPartsLogout);
partsLogoutConfirmOverlay.addEventListener("click", (event) => {
  if (event.target === partsLogoutConfirmOverlay) closePartsLogoutConfirmation();
});

setColorMode(localStorage.getItem(colorModeStorageKey) || "light");
updateDateTime();
setInterval(updateDateTime, 1000);
resetPartDates();
applyPartsAccessMode();
updatePartsLogoutVisibility();
refreshPartsView();
