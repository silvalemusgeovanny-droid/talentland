const themes = {
  admin: {
    label: "Propuesta 1",
    title: "Acceso administrativo",
    copy: "Panel limpio para control general del negocio.",
  },
  technical: {
    label: "Propuesta 2",
    title: "Acceso por area",
    copy: "Entrada practica para administrador, vendedor y tecnico.",
  },
  visual: {
    label: "Propuesta 3",
    title: "Acceso moderno",
    copy: "Pantalla visual para una experiencia mas comercial.",
  },
};

const usersStorageKey = "systemUsers";
const defaultUsers = [
  {
    id: "root-user",
    username: "root",
    password: "root123",
    name: "Root",
    role: "root",
  },
  {
    id: "admin-user",
    username: "admin",
    password: "admin123",
    name: "Administrador",
    role: "admin",
  },
  {
    id: "standard-user",
    username: "usuario",
    password: "user123",
    name: "Usuario",
    role: "user",
  },
];

const roleProfiles = {
  root: {
    label: "Root",
    access: "Control total del sistema",
    modules: ["permissions", "sales", "parts", "repairs", "database", "users"],
    permissions: [
      "Modificar usuarios, roles y accesos",
      "Ver base de datos local completa",
      "Registrar ventas, repuestos y reparaciones",
      "Editar cualquier dato del sistema",
    ],
  },
  admin: {
    label: "Admin",
    access: "Administracion con restricciones",
    modules: ["permissions", "sales", "parts", "repairs", "database"],
    permissions: [
      "Registrar ventas, repuestos y reparaciones",
      "Ver base de datos local",
      "No puede borrar ni reemplazar al root",
      "No puede gestionar usuarios desde este panel",
    ],
  },
  user: {
    label: "Usuario",
    access: "Operacion basica sin base de datos",
    modules: ["permissions", "sales", "parts", "repairs"],
    permissions: [
      "Registrar operaciones del dia",
      "Consultar modulos operativos permitidos",
      "No puede ver la base de datos",
      "No puede gestionar usuarios ni roles",
    ],
  },
};

const stage = document.querySelector("#loginStage");
const tabButtons = document.querySelectorAll(".tab-button");
const themeLabel = document.querySelector("#themeLabel");
const themeTitle = document.querySelector("#themeTitle");
const themeCopy = document.querySelector("#themeCopy");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const credentialHint = document.querySelector("#credentialHint");
const loginForm = document.querySelector("#loginForm");
const sessionPanel = document.querySelector("#sessionPanel");
const welcomeTitle = document.querySelector("#welcomeTitle");
const accessSummary = document.querySelector("#accessSummary");
const permissionList = document.querySelector("#permissionList");
const logoutButton = document.querySelector("#logoutButton");
const currentDate = document.querySelector("#currentDate");
const currentTime = document.querySelector("#currentTime");
const moduleTabs = document.querySelectorAll(".module-tab");
const modulePanels = document.querySelectorAll(".module-panel");
const moduleShortcuts = document.querySelectorAll("[data-module-shortcut]");
const quickPartsForm = document.querySelector("#quickPartsForm");
const quickPartsList = document.querySelector("#quickPartsList");
const quickPartsHint = document.querySelector("#quickPartsHint");
const partsStorageKey = "inventoryParts";
const colorModeToggle = document.querySelector("#colorModeToggle");
const colorModeStorageKey = "loginColorMode";
const salesStorageKey = "inventorySales";
const salesForm = document.querySelector("#salesForm");
const saleNumberInput = document.querySelector("#saleNumber");
const saleQuantityInput = document.querySelector("#saleQuantity");
const salePriceInput = document.querySelector("#salePrice");
const saleDiscountInput = document.querySelector("#saleDiscount");
const saleReceivedInput = document.querySelector("#saleReceived");
const saleChangeInput = document.querySelector("#saleChange");
const saleTotal = document.querySelector("#saleTotal");
const salesHint = document.querySelector("#salesHint");
const salesList = document.querySelector("#salesList");
const dailySalesTotal = document.querySelector("#dailySalesTotal");
const dailySalesCount = document.querySelector("#dailySalesCount");
const repairsStorageKey = "inventoryRepairs";
const repairBrandsStorageKey = "inventoryRepairBrands";
const repairModelsStorageKey = "inventoryRepairModels";
const repairTypesStorageKey = "inventoryRepairTypes";
const repairsForm = document.querySelector("#repairsForm");
const repairNumberInput = document.querySelector("#repairNumber");
const repairCreatedAtInput = document.querySelector("#repairCreatedAt");
const repairCustomerInput = document.querySelector("#repairCustomer");
const repairPhoneInput = document.querySelector("#repairPhone");
const repairBrandInput = document.querySelector("#repairBrand");
const repairBrandOptions = document.querySelector("#repairBrandOptions");
const repairModelInput = document.querySelector("#repairModel");
const repairModelOptions = document.querySelector("#repairModelOptions");
const repairTypeInput = document.querySelector("#repairType");
const repairTypeOptions = document.querySelector("#repairTypeOptions");
const repairPriceInput = document.querySelector("#repairPrice");
const repairStatusInput = document.querySelector("#repairStatus");
const repairDeliveredAtInput = document.querySelector("#repairDeliveredAt");
const repairsHint = document.querySelector("#repairsHint");
const repairsCount = document.querySelector("#repairsCount");
const repairsList = document.querySelector("#repairsList");
const importRepairsDatabaseButton = document.querySelector("#importRepairsDatabase");
const saleConfirmOverlay = document.querySelector("#saleConfirmOverlay");
const saleConfirmList = document.querySelector("#saleConfirmList");
const editSaleButton = document.querySelector("#editSaleButton");
const confirmSaleButton = document.querySelector("#confirmSaleButton");
const adminVoidOverlay = document.querySelector("#adminVoidOverlay");
const adminVoidForm = document.querySelector("#adminVoidForm");
const voidAdminUser = document.querySelector("#voidAdminUser");
const voidAdminPassword = document.querySelector("#voidAdminPassword");
const adminVoidHint = document.querySelector("#adminVoidHint");
const cancelVoidButton = document.querySelector("#cancelVoidButton");
const databaseSummary = document.querySelector("#databaseSummary");
const databaseList = document.querySelector("#databaseList");
const usersForm = document.querySelector("#usersForm");
const usersList = document.querySelector("#usersList");
const usersHint = document.querySelector("#usersHint");
const managedNameInput = document.querySelector("#managedName");
const managedUsernameInput = document.querySelector("#managedUsername");
const managedPasswordInput = document.querySelector("#managedPassword");
const managedRoleInput = document.querySelector("#managedRole");
const submitUserButton = document.querySelector("#submitUser");
let pendingSale = null;
let pendingVoidSaleId = null;
let lastVoidedSale = null;
let undoTimerId = null;
let currentUser = null;

const starterParts = [
  {
    id: crypto.randomUUID(),
    name: "Pantalla iPhone 11",
    category: "Celular",
    price: 1250,
    stock: 4,
    quality: "Premium",
    supplier: "TecnoPartes MX",
  },
  {
    id: crypto.randomUUID(),
    name: "Bateria laptop HP",
    category: "Computadora",
    price: 890,
    stock: 3,
    quality: "Original",
    supplier: "CompuRefacciones",
  },
];

function setTheme(themeName) {
  const theme = themes[themeName];
  stage.className = `login-stage ${themeName}`;
  themeLabel.textContent = theme.label;
  themeTitle.textContent = theme.title;
  themeCopy.textContent = theme.copy;
  tabButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.theme === themeName);
  });
}

function loadUsers() {
  const savedUsers = localStorage.getItem(usersStorageKey);
  if (!savedUsers) {
    localStorage.setItem(usersStorageKey, JSON.stringify(defaultUsers));
    return defaultUsers;
  }
  return JSON.parse(savedUsers);
}

function saveUsers(users) {
  localStorage.setItem(usersStorageKey, JSON.stringify(users));
}

function getRoleProfile(role) {
  return roleProfiles[role] || roleProfiles.user;
}

function canAccessModule(moduleName) {
  if (!currentUser) return false;
  return getRoleProfile(currentUser.role).modules.includes(moduleName);
}

function setLoginDemo() {
  usernameInput.value = "root";
  passwordInput.value = "root123";
  credentialHint.textContent = "Demo root: root / root123 | admin: admin / admin123 | usuario: usuario / user123";
}

function updateDateTime() {
  const now = new Date();
  currentDate.textContent = new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(now);
  currentTime.textContent = new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(now);
}

function loadParts() {
  const savedParts = localStorage.getItem(partsStorageKey);
  if (!savedParts) {
    localStorage.setItem(partsStorageKey, JSON.stringify(starterParts));
    return starterParts;
  }
  return JSON.parse(savedParts);
}

function saveParts(parts) {
  localStorage.setItem(partsStorageKey, JSON.stringify(parts));
}

function loadSales() {
  const savedSales = localStorage.getItem(salesStorageKey);
  return savedSales ? JSON.parse(savedSales) : [];
}

function saveSales(sales) {
  localStorage.setItem(salesStorageKey, JSON.stringify(sales));
}

function loadRepairs() {
  const savedRepairs = localStorage.getItem(repairsStorageKey);
  return savedRepairs ? JSON.parse(savedRepairs) : [];
}

function saveRepairs(repairs) {
  localStorage.setItem(repairsStorageKey, JSON.stringify(repairs));
}

function normalizeSystemOption(value) {
  return value.trim().replace(/\s+/g, " ").toUpperCase();
}

function loadRepairOptions(storageKey, repairField) {
  const savedOptions = localStorage.getItem(storageKey);
  const savedList = savedOptions ? JSON.parse(savedOptions) : [];
  const repairOptions = loadRepairs().map((repair) => repair[repairField]).filter(Boolean);
  return [...new Set([...savedList, ...repairOptions].map(normalizeSystemOption).filter(Boolean))].sort();
}

function saveRepairOptions(storageKey, options) {
  localStorage.setItem(storageKey, JSON.stringify([...new Set(options.map(normalizeSystemOption).filter(Boolean))].sort()));
}

function addRepairOption(value, storageKey, repairField, renderOptions) {
  const normalizedValue = normalizeSystemOption(value);
  if (!normalizedValue) return "";
  saveRepairOptions(storageKey, [...loadRepairOptions(storageKey, repairField), normalizedValue]);
  renderOptions();
  return normalizedValue;
}

function renderRepairOptions(datalist, storageKey, repairField) {
  datalist.innerHTML = loadRepairOptions(storageKey, repairField)
    .map((option) => `<option value="${escapeHtml(option)}"></option>`)
    .join("");
}

function syncKnownRepairOptionCase(input, storageKey, repairField) {
  const typedValue = normalizeSystemOption(input.value);
  const knownValue = loadRepairOptions(storageKey, repairField).find((option) => option === typedValue);
  if (knownValue) input.value = knownValue;
}

function renderRepairBrandOptions() { renderRepairOptions(repairBrandOptions, repairBrandsStorageKey, "brand"); }
function renderRepairModelOptions() { renderRepairOptions(repairModelOptions, repairModelsStorageKey, "model"); }
function renderRepairTypeOptions() { renderRepairOptions(repairTypeOptions, repairTypesStorageKey, "repairType"); }
function addRepairBrand(brand) { return addRepairOption(brand, repairBrandsStorageKey, "brand", renderRepairBrandOptions); }
function addRepairModel(model) { return addRepairOption(model, repairModelsStorageKey, "model", renderRepairModelOptions); }
function addRepairType(repairType) { return addRepairOption(repairType, repairTypesStorageKey, "repairType", renderRepairTypeOptions); }
function syncKnownRepairBrandCase() { syncKnownRepairOptionCase(repairBrandInput, repairBrandsStorageKey, "brand"); }
function syncKnownRepairModelCase() { syncKnownRepairOptionCase(repairModelInput, repairModelsStorageKey, "model"); }
function syncKnownRepairTypeCase() { syncKnownRepairOptionCase(repairTypeInput, repairTypesStorageKey, "repairType"); }

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

function formatSaleDateTime(value) {
  const date = new Date(value);
  return {
    date: new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(date),
    time: new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(date),
  };
}

function formatRepairDateTimeInput(value) {
  const { date, time } = formatSaleDateTime(value);
  return `${date} | ${time}`;
}

function isToday(value) {
  const date = new Date(value);
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

function renderQuickParts() {
  const parts = loadParts().slice(0, 4);
  quickPartsList.innerHTML = parts.map((part) => `
    <article class="compact-part-item">
      <strong>${part.name}</strong>
      <span>${formatCurrency(part.price)} · ${part.quality} · ${part.supplier}</span>
    </article>
  `).join("");
}

function getSaleValues() {
  const quantity = Number(saleQuantityInput.value) || 0;
  const price = Number(salePriceInput.value) || 0;
  const discount = Number(saleDiscountInput.value) || 0;
  const received = Number(saleReceivedInput.value) || 0;
  const subtotal = quantity * price;
  const total = Math.max(subtotal - discount, 0);
  const change = Math.max(received - total, 0);
  return { quantity, price, discount, received, subtotal, total, change };
}

function updateSaleTotals() {
  const { total, change } = getSaleValues();
  saleTotal.textContent = formatCurrency(total);
  saleChangeInput.value = formatCurrency(change);
}

function setNextSaleNumber() {
  saleNumberInput.value = loadSales().reduce((max, sale) => Math.max(max, sale.saleNumber), 0) + 1;
}

function setNextRepairNumber() {
  repairNumberInput.value = loadRepairs().reduce((max, repair) => Math.max(max, repair.repairNumber), 0) + 1;
}

function setRepairCreatedAt() {
  repairCreatedAtInput.dataset.value = new Date().toISOString();
  repairCreatedAtInput.value = formatRepairDateTimeInput(repairCreatedAtInput.dataset.value);
}

function updateRepairDeliveredAt() {
  if (repairStatusInput.value !== "Entregado") {
    repairDeliveredAtInput.value = "";
    repairDeliveredAtInput.dataset.value = "";
    return;
  }
  if (!repairDeliveredAtInput.dataset.value) {
    repairDeliveredAtInput.dataset.value = new Date().toISOString();
  }
  repairDeliveredAtInput.value = formatRepairDateTimeInput(repairDeliveredAtInput.dataset.value);
}

function renderSales() {
  const dailySales = loadSales().filter((sale) => isToday(sale.createdAt));
  const dailyTotal = dailySales.reduce((sum, sale) => sum + sale.total, 0);
  dailySalesTotal.textContent = formatCurrency(dailyTotal);
  dailySalesCount.textContent = `${dailySales.length} venta${dailySales.length === 1 ? "" : "s"}`;
  if (!dailySales.length) {
    salesList.innerHTML = `<p class="hint">Todavia no hay ventas registradas hoy.</p>`;
    return;
  }
  salesList.innerHTML = dailySales.map((sale) => {
    const { date, time } = formatSaleDateTime(sale.createdAt);
    return `
      <article class="compact-part-item sale-item">
        <div class="sale-item-heading">
          <strong>Venta #${sale.saleNumber} - ${escapeHtml(sale.product)}</strong>
          <button class="delete-button void-sale-button" type="button" data-id="${sale.id}">Anular</button>
        </div>
        <span>${date} | ${time}</span>
        <span>${sale.quantity} pza(s) x ${formatCurrency(sale.price)} | Desc. ${formatCurrency(sale.discount)} | Total ${formatCurrency(sale.total)}</span>
        <span>Recibido ${formatCurrency(sale.received)} | Vuelto ${formatCurrency(sale.change)}</span>
      </article>
    `;
  }).join("");
}

function renderRepairs() {
  const repairs = loadRepairs();
  repairsCount.textContent = `${repairs.length} registro${repairs.length === 1 ? "" : "s"}`;
  if (importRepairsDatabaseButton) {
    const importCount = Array.isArray(window.repairExcelDatabase) ? window.repairExcelDatabase.length : 0;
    importRepairsDatabaseButton.hidden = !canAccessModule("database") || importCount === 0;
    importRepairsDatabaseButton.textContent = `Importar Excel (${importCount})`;
  }
  if (!repairs.length) {
    repairsList.innerHTML = `<p class="hint">Todavia no hay reparaciones registradas.</p>`;
    return;
  }
  repairsList.innerHTML = repairs.map((repair) => {
    const deliveredLabel = repair.deliveredAt
      ? `Entregado ${formatRepairDateTimeInput(repair.deliveredAt)}`
      : "Entrega pendiente";
    return `
      <article class="compact-part-item repair-item">
        <strong>Reparacion #${repair.repairNumber} - ${escapeHtml(repair.customer)}</strong>
        <span>${escapeHtml(repair.deviceType)} ${repair.brand ? `${escapeHtml(repair.brand)} ` : ""}${escapeHtml(repair.model)} | ${escapeHtml(repair.status)}</span>
        <span>${escapeHtml(repair.repairType)} | Cel. ${escapeHtml(repair.phone)}</span>
        <span>Precio ${formatCurrency(Number(repair.repairPrice) || 0)}</span>
        <span>Ingreso ${formatRepairDateTimeInput(repair.createdAt)} | ${deliveredLabel}</span>
        ${repair.notes ? `<p>${escapeHtml(repair.notes)}</p>` : ""}
        <button class="edit-button" type="button" data-repair-id="${repair.id}">Editar</button>
      </article>
    `;
  }).join("");
}

function importExcelRepairs() {
  const excelRepairs = Array.isArray(window.repairExcelDatabase) ? window.repairExcelDatabase : [];
  if (!excelRepairs.length) {
    repairsHint.textContent = "No se encontro la base de reparaciones del Excel.";
    return;
  }
  if (!canAccessModule("database")) {
    repairsHint.textContent = "Tu rol no puede importar la base de datos.";
    return;
  }

  const repairs = loadRepairs();
  const importedIds = new Set(repairs.map((repair) => repair.id));
  let nextRepairNumber = repairs.reduce((max, repair) => Math.max(max, Number(repair.repairNumber) || 0), 0) + 1;
  const newRepairs = excelRepairs
    .filter((repair) => !importedIds.has(repair.id))
    .map((repair) => ({
      ...repair,
      repairNumber: nextRepairNumber++,
    }));

  if (!newRepairs.length) {
    repairsHint.textContent = "La base de Excel ya estaba importada.";
    return;
  }

  saveRepairs([...newRepairs, ...repairs]);
  setNextRepairNumber();
  renderRepairBrandOptions();
  renderRepairModelOptions();
  renderRepairTypeOptions();
  renderRepairs();
  renderDatabase();
  repairsHint.textContent = `Se importaron ${newRepairs.length} reparaciones desde Excel.`;
}

function renderDatabase() {
  if (!canAccessModule("database")) {
    databaseSummary.textContent = "Sin acceso";
    databaseList.innerHTML = `<p class="hint">Tu rol no puede ver la base de datos.</p>`;
    return;
  }

  const datasets = [
    { label: "Usuarios", value: loadUsers().length },
    { label: "Ventas", value: loadSales().length },
    { label: "Repuestos", value: loadParts().length },
    { label: "Reparaciones", value: loadRepairs().length },
    { label: "Marcas conocidas", value: loadRepairOptions(repairBrandsStorageKey, "brand").length },
    { label: "Modelos conocidos", value: loadRepairOptions(repairModelsStorageKey, "model").length },
    { label: "Tipos de reparacion", value: loadRepairOptions(repairTypesStorageKey, "repairType").length },
  ];
  const total = datasets.reduce((sum, item) => sum + item.value, 0);
  databaseSummary.textContent = `${total} registro${total === 1 ? "" : "s"}`;
  databaseList.innerHTML = datasets.map((item) => `
    <article class="compact-part-item database-item">
      <strong>${item.label}</strong>
      <span>${item.value} registro${item.value === 1 ? "" : "s"}</span>
    </article>
  `).join("");
}

function renderUsers() {
  if (!canAccessModule("users")) {
    usersList.innerHTML = `<p class="hint">Solo root puede ver este panel.</p>`;
    return;
  }

  usersList.innerHTML = loadUsers().map((user) => `
    <article class="compact-part-item user-item">
      <div>
        <strong>${escapeHtml(user.name)} (${escapeHtml(user.username)})</strong>
        <span>${getRoleProfile(user.role).label}</span>
      </div>
      <div class="user-actions">
        <button class="edit-button" type="button" data-user-action="edit" data-user-id="${user.id}">Editar</button>
        <button class="delete-button" type="button" data-user-action="delete" data-user-id="${user.id}">Borrar</button>
      </div>
    </article>
  `).join("");
}

function renderSaleConfirmation(sale) {
  saleConfirmList.innerHTML = `
    <div><dt>Fecha y hora</dt><dd>${formatSaleDateTime(sale.createdAt).date} | ${formatSaleDateTime(sale.createdAt).time}</dd></div>
    <div><dt>No. venta</dt><dd>${sale.saleNumber}</dd></div>
    <div><dt>Producto</dt><dd>${escapeHtml(sale.product)}</dd></div>
    <div><dt>Cantidad</dt><dd>${sale.quantity}</dd></div>
    <div><dt>Precio unitario</dt><dd>${formatCurrency(sale.price)}</dd></div>
    <div><dt>Descuento</dt><dd>${formatCurrency(sale.discount)}</dd></div>
    <div><dt>Total</dt><dd>${formatCurrency(sale.total)}</dd></div>
    <div><dt>Billete recibido</dt><dd>${formatCurrency(sale.received)}</dd></div>
    <div><dt>Vuelto</dt><dd>${formatCurrency(sale.change)}</dd></div>
  `;
}

function openSaleConfirmation(sale) {
  pendingSale = sale;
  renderSaleConfirmation(sale);
  saleConfirmOverlay.hidden = false;
  confirmSaleButton.focus();
}

function closeSaleConfirmation() { saleConfirmOverlay.hidden = true; }

function openAdminVoid(saleId) {
  pendingVoidSaleId = saleId;
  adminVoidForm.reset();
  adminVoidHint.textContent = "Ingresa credenciales de administrador para continuar.";
  adminVoidOverlay.hidden = false;
  voidAdminUser.focus();
}

function closeAdminVoid() {
  adminVoidOverlay.hidden = true;
  pendingVoidSaleId = null;
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
  undoBar.querySelector("button").addEventListener("click", () => { onUndo(); hideUndoBar(); });
  undoTimerId = setInterval(() => {
    secondsLeft -= 1;
    undoBar.querySelector("small").textContent = `${secondsLeft}s`;
    if (secondsLeft <= 0) hideUndoBar();
  }, 1000);
}

function setColorMode(mode) {
  const isDarkMode = mode === "dark";
  document.body.classList.toggle("login-dark", isDarkMode);
  const toggleLabel = isDarkMode ? "Cambiar a modo dia" : "Cambiar a modo noche";
  colorModeToggle.setAttribute("aria-label", toggleLabel);
  colorModeToggle.setAttribute("title", toggleLabel);
  colorModeToggle.setAttribute("aria-pressed", String(isDarkMode));
  localStorage.setItem(colorModeStorageKey, mode);
}

function setModule(moduleName) {
  if (!canAccessModule(moduleName)) {
    credentialHint.textContent = "Tu rol no tiene permiso para abrir ese modulo.";
    moduleName = "permissions";
  }
  moduleTabs.forEach((button) => {
    const isAllowed = canAccessModule(button.dataset.module);
    button.hidden = !isAllowed;
    button.classList.toggle("active", isAllowed && button.dataset.module === moduleName);
  });
  modulePanels.forEach((panel) => {
    const isActive =
      (moduleName === "permissions" && panel.id === "permissionsModule") ||
      (moduleName === "sales" && panel.id === "salesModule") ||
      (moduleName === "parts" && panel.id === "partsModule") ||
      (moduleName === "repairs" && panel.id === "repairsModule") ||
      (moduleName === "database" && panel.id === "databaseModule") ||
      (moduleName === "users" && panel.id === "usersModule");
    panel.classList.toggle("active", isActive);
  });
  if (moduleName === "sales") { setNextSaleNumber(); updateSaleTotals(); renderSales(); }
  if (moduleName === "repairs") {
    setNextRepairNumber();
    if (!repairCreatedAtInput.dataset.value) setRepairCreatedAt();
    updateRepairDeliveredAt();
    renderRepairs();
  }
  if (moduleName === "database") renderDatabase();
  if (moduleName === "users") renderUsers();
}

tabButtons.forEach((button) => button.addEventListener("click", () => setTheme(button.dataset.theme)));
moduleTabs.forEach((button) => button.addEventListener("click", () => setModule(button.dataset.module)));

moduleShortcuts.forEach((button) => {
  button.addEventListener("click", () => {
    if (sessionPanel.hidden) {
      credentialHint.textContent = "Inicia sesion para abrir ese modulo.";
      loginForm.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setModule(button.dataset.moduleShortcut);
    sessionPanel.scrollIntoView({ behavior: "smooth", block: "center" });
  });
});

colorModeToggle.addEventListener("click", () => {
  const nextMode = document.body.classList.contains("login-dark") ? "light" : "dark";
  setColorMode(nextMode);
});

[saleQuantityInput, salePriceInput, saleDiscountInput, saleReceivedInput].forEach((input) => {
  input.addEventListener("input", updateSaleTotals);
});

repairPhoneInput.addEventListener("input", () => {
  repairPhoneInput.value = repairPhoneInput.value.replace(/\D/g, "").slice(0, 11);
});
repairBrandInput.addEventListener("blur", syncKnownRepairBrandCase);
repairBrandInput.addEventListener("change", syncKnownRepairBrandCase);
repairModelInput.addEventListener("input", () => { repairModelInput.value = repairModelInput.value.replace(/[^A-Za-z0-9 ]/g, ""); });
repairModelInput.addEventListener("blur", syncKnownRepairModelCase);
repairModelInput.addEventListener("change", syncKnownRepairModelCase);
repairTypeInput.addEventListener("blur", syncKnownRepairTypeCase);
repairTypeInput.addEventListener("change", syncKnownRepairTypeCase);
repairStatusInput.addEventListener("change", updateRepairDeliveredAt);
importRepairsDatabaseButton.addEventListener("click", () => {
  const excelCount = Array.isArray(window.repairExcelDatabase) ? window.repairExcelDatabase.length : 0;
  if (!confirm(`¿Quieres importar ${excelCount} reparaciones del Excel?`)) return;
  importExcelRepairs();
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const selectedUser = loadUsers().find((user) =>
    user.username.toLowerCase() === usernameInput.value.trim().toLowerCase() &&
    user.password === passwordInput.value
  );
  if (!selectedUser) {
    credentialHint.textContent = "Usuario o contrasena incorrectos.";
    return;
  }
  currentUser = selectedUser;
  const roleProfile = getRoleProfile(selectedUser.role);
  welcomeTitle.textContent = `Bienvenido, ${selectedUser.name}`;
  accessSummary.textContent = `${roleProfile.label} - ${roleProfile.access}`;
  permissionList.innerHTML = roleProfile.permissions.map((p) => `<li>${p}</li>`).join("");
  loginForm.hidden = true;
  sessionPanel.hidden = false;
  credentialHint.textContent = "Sesion iniciada correctamente.";
  setModule("permissions");
  renderQuickParts();
  renderSales();
  renderRepairs();
  renderDatabase();
  renderUsers();
});

salesForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(salesForm);
  const { quantity, price, discount, received, total, change } = getSaleValues();
  const nextSaleNumber = loadSales().reduce((max, sale) => Math.max(max, sale.saleNumber), 0) + 1;
  if (received < total) {
    salesHint.textContent = "El billete recibido no alcanza para cubrir el total.";
    return;
  }
  openSaleConfirmation({
    id: crypto.randomUUID(),
    saleNumber: nextSaleNumber,
    product: formData.get("product").trim(),
    quantity, price, discount, total, received, change,
    createdAt: new Date().toISOString(),
  });
});

editSaleButton.addEventListener("click", () => {
  closeSaleConfirmation();
  pendingSale = null;
  salesHint.textContent = "Puedes corregir la venta antes de guardarla.";
});

confirmSaleButton.addEventListener("click", () => {
  if (!pendingSale) return;
  const sales = loadSales();
  sales.unshift(pendingSale);
  saveSales(sales);
  salesForm.reset();
  saleQuantityInput.value = 1;
  setNextSaleNumber();
  updateSaleTotals();
  renderSales();
  closeSaleConfirmation();
  pendingSale = null;
  salesHint.textContent = "Se guardo registro.";
});

salesList.addEventListener("click", (event) => {
  const voidButton = event.target.closest(".void-sale-button");
  if (!voidButton) return;
  const sale = loadSales().find((item) => item.id === voidButton.dataset.id);
  const saleLabel = sale ? `Venta #${sale.saleNumber}` : "esta venta";
  if (!confirm(`¿Seguro que quieres anular ${saleLabel}?`)) return;
  openAdminVoid(voidButton.dataset.id);
});

cancelVoidButton.addEventListener("click", closeAdminVoid);

adminVoidForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const voidUser = loadUsers().find((user) =>
    user.username.toLowerCase() === voidAdminUser.value.trim().toLowerCase() &&
    user.password === voidAdminPassword.value
  );
  const isAdmin = voidUser && ["root", "admin"].includes(voidUser.role);
  if (!isAdmin) {
    adminVoidHint.textContent = "Credenciales de administrador incorrectas.";
    return;
  }
  const sales = loadSales();
  const saleIndex = sales.findIndex((sale) => sale.id === pendingVoidSaleId);
  const saleToVoid = sales[saleIndex];
  if (!saleToVoid) {
    closeAdminVoid();
    renderSales();
    salesHint.textContent = "No se encontro la venta para anular.";
    return;
  }
  lastVoidedSale = { sale: saleToVoid, index: saleIndex };
  sales.splice(saleIndex, 1);
  saveSales(sales);
  closeAdminVoid();
  renderSales();
  salesHint.textContent = "Venta anulada correctamente.";
  showUndoBar("Venta anulada.", () => {
    if (!lastVoidedSale) return;
    const restoredSales = loadSales();
    restoredSales.splice(lastVoidedSale.index, 0, lastVoidedSale.sale);
    saveSales(restoredSales);
    salesHint.textContent = "Anulacion deshecha.";
    lastVoidedSale = null;
    renderSales();
    setNextSaleNumber();
  });
});

quickPartsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(quickPartsForm);
  const parts = loadParts();
  parts.unshift({
    id: crypto.randomUUID(),
    name: formData.get("partName").trim(),
    category: "Repuesto",
    price: Number(formData.get("price")),
    stock: 1,
    quality: formData.get("quality"),
    supplier: formData.get("supplier").trim(),
  });
  saveParts(parts);
  quickPartsForm.reset();
  quickPartsHint.textContent = "Repuesto guardado correctamente.";
  renderQuickParts();
});

repairsList.addEventListener("click", (event) => {
  const editButton = event.target.closest(".edit-button");
  if (!editButton) return;
  const repairs = loadRepairs();
  const repair = repairs.find((r) => r.id === editButton.dataset.repairId);
  if (!repair) return;
  repairCustomerInput.value = repair.customer;
  repairPhoneInput.value = repair.phone;
  repairBrandInput.value = repair.brand;
  repairModelInput.value = repair.model;
  repairTypeInput.value = repair.repairType;
  repairPriceInput.value = repair.repairPrice ?? "";
  repairStatusInput.value = repair.status;
  document.querySelector("#repairDeviceType").value = repair.deviceType;
  document.querySelector("#repairNotes").value = repair.notes || "";
  repairCreatedAtInput.dataset.value = repair.createdAt;
  repairCreatedAtInput.value = formatRepairDateTimeInput(repair.createdAt);
  repairDeliveredAtInput.dataset.value = repair.deliveredAt || "";
  repairDeliveredAtInput.value = repair.deliveredAt ? formatRepairDateTimeInput(repair.deliveredAt) : "";
  repairNumberInput.value = repair.repairNumber;
  repairsForm.dataset.editingId = repair.id;
  repairsHint.textContent = "Editando reparacion — guarda para confirmar los cambios.";
  document.querySelector("#submitRepairs").textContent = "Guardar cambios";
  repairsForm.scrollIntoView({ behavior: "smooth", block: "start" });
});

repairsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(repairsForm);
  const repairs = loadRepairs();
  const editingId = repairsForm.dataset.editingId;
  const status = formData.get("status");
  const createdAt = repairCreatedAtInput.dataset.value || new Date().toISOString();
  const deliveredAt = status === "Entregado" ? repairDeliveredAtInput.dataset.value || new Date().toISOString() : "";
  const brand = addRepairBrand(formData.get("brand"));
  const model = addRepairModel(formData.get("model"));
  const repairType = addRepairType(formData.get("repairType"));

  if (editingId) {
    const index = repairs.findIndex((r) => r.id === editingId);
    if (index !== -1) {
      repairs[index] = {
        ...repairs[index],
        customer: formData.get("customer").trim(),
        deviceType: formData.get("deviceType"),
        phone: formData.get("phone").trim(),
        brand, model, repairType, status, createdAt, deliveredAt,
        repairPrice: Number(formData.get("repairPrice")) || 0,
        notes: formData.get("notes").trim(),
      };
    }
    delete repairsForm.dataset.editingId;
    document.querySelector("#submitRepairs").textContent = "Guardar reparacion";
    repairsHint.textContent = "Reparacion actualizada correctamente.";
  } else {
    const nextRepairNumber = repairs.reduce((max, r) => Math.max(max, r.repairNumber), 0) + 1;
    repairs.unshift({
      id: crypto.randomUUID(),
      repairNumber: nextRepairNumber,
      customer: formData.get("customer").trim(),
      deviceType: formData.get("deviceType"),
      phone: formData.get("phone").trim(),
      brand, model, repairType, status, createdAt, deliveredAt,
      repairPrice: Number(formData.get("repairPrice")) || 0,
      notes: formData.get("notes").trim(),
    });
    repairsHint.textContent = "Reparacion guardada correctamente.";
  }

  saveRepairs(repairs);
  repairsForm.reset();
  repairDeliveredAtInput.dataset.value = "";
  setNextRepairNumber();
  setRepairCreatedAt();
  updateRepairDeliveredAt();
  renderRepairs();
});

usersForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!canAccessModule("users")) {
    usersHint.textContent = "Solo root puede guardar usuarios.";
    return;
  }

  const formData = new FormData(usersForm);
  const users = loadUsers();
  const editingId = usersForm.dataset.editingId;
  const username = formData.get("username").trim();
  const duplicatedUser = users.find((user) =>
    user.username.toLowerCase() === username.toLowerCase() &&
    user.id !== editingId
  );

  if (duplicatedUser) {
    usersHint.textContent = "Ese usuario ya existe.";
    return;
  }

  const userData = {
    name: formData.get("name").trim(),
    username,
    password: formData.get("password").trim(),
    role: formData.get("role"),
  };

  if (editingId) {
    const index = users.findIndex((user) => user.id === editingId);
    if (index !== -1) {
      users[index] = { ...users[index], ...userData };
      if (currentUser.id === editingId) currentUser = users[index];
    }
    delete usersForm.dataset.editingId;
    submitUserButton.textContent = "Guardar usuario";
    usersHint.textContent = "Usuario actualizado correctamente.";
  } else {
    users.unshift({ id: crypto.randomUUID(), ...userData });
    usersHint.textContent = "Usuario guardado correctamente.";
  }

  saveUsers(users);
  usersForm.reset();
  managedRoleInput.value = "user";
  renderUsers();
  renderDatabase();
});

usersList.addEventListener("click", (event) => {
  if (!canAccessModule("users")) return;
  const button = event.target.closest("[data-user-action]");
  if (!button) return;

  const users = loadUsers();
  const user = users.find((item) => item.id === button.dataset.userId);
  if (!user) return;

  if (button.dataset.userAction === "edit") {
    managedNameInput.value = user.name;
    managedUsernameInput.value = user.username;
    managedPasswordInput.value = user.password;
    managedRoleInput.value = user.role;
    usersForm.dataset.editingId = user.id;
    submitUserButton.textContent = "Guardar cambios";
    usersHint.textContent = "Editando usuario.";
    return;
  }

  if (button.dataset.userAction === "delete") {
    if (user.role === "root") {
      usersHint.textContent = "El usuario root no se puede borrar.";
      return;
    }
    if (!confirm(`¿Seguro que quieres borrar a ${user.username}?`)) return;
    saveUsers(users.filter((item) => item.id !== user.id));
    usersHint.textContent = "Usuario borrado correctamente.";
    renderUsers();
    renderDatabase();
  }
});

logoutButton.addEventListener("click", () => {
  currentUser = null;
  sessionPanel.hidden = true;
  loginForm.hidden = false;
});

loadUsers();
setLoginDemo();
setColorMode(localStorage.getItem(colorModeStorageKey) || "light");
setNextSaleNumber();
setNextRepairNumber();
setRepairCreatedAt();
renderRepairBrandOptions();
renderRepairModelOptions();
renderRepairTypeOptions();
updateSaleTotals();
renderSales();
renderRepairs();
updateDateTime();
renderQuickParts();
setInterval(updateDateTime, 1000);
