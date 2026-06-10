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
const sessionTokenStorageKey = "repairSessionToken";
const currentUserStorageKey = "repairCurrentUser";
const authModeStorageKey = "repairAuthMode";
const activeModuleStorageKey = "repairActiveModule";
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
    modules: ["permissions", "sales", "parts", "repairs", "statistics", "database", "users"],
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
    modules: ["permissions", "sales", "parts", "repairs", "statistics", "database"],
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

const moduleLabels = {
  permissions: "Inicio",
  sales: "Ventas",
  parts: "Repuestos",
  repairs: "Reparaciones",
  statistics: "Resumen",
  database: "Datos",
  users: "Usuarios",
};

const stage = document.querySelector("#loginStage");
const tabButtons = document.querySelectorAll(".tab-button");
const themeLabel = document.querySelector("#themeLabel");
const themeTitle = document.querySelector("#themeTitle");
const themeCopy = document.querySelector("#themeCopy");
const accessCard = document.querySelector("#accessCard");
const sideRepairsPanel = document.querySelector("#sideRepairsPanel");
const sideRepairsList = document.querySelector("#sideRepairsList");
const sideRepairSearch = document.querySelector("#sideRepairSearch");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const credentialHint = document.querySelector("#credentialHint");
const loginForm = document.querySelector("#loginForm");
const sessionPanel = document.querySelector("#sessionPanel");
const welcomeTitle = document.querySelector("#welcomeTitle");
const accessSummary = document.querySelector("#accessSummary");
const onlinePresence = document.querySelector("#onlinePresence");
const permissionList = document.querySelector("#permissionList");
const logoutButton = document.querySelector("#logoutButton");
const currentDate = document.querySelector("#currentDate");
const currentTime = document.querySelector("#currentTime");
const moduleTabs = document.querySelectorAll(".module-tab");
const modulePanels = document.querySelectorAll(".module-panel");
const moduleShortcuts = document.querySelectorAll("[data-module-shortcut]");
const moduleLink = document.querySelector("#moduleLink");
const moduleBackButton = document.querySelector("#moduleBackButton");
const moduleNextButton = document.querySelector("#moduleNextButton");
const moduleNavLabel = document.querySelector("#moduleNavLabel");
const quickPartsForm = document.querySelector("#quickPartsForm");
const quickPartsList = document.querySelector("#quickPartsList");
const quickPartsHint = document.querySelector("#quickPartsHint");
const quickPartNameSelect = document.querySelector("#quickPartNameSelect");
const quickPartNameInput = document.querySelector("#quickPartName");
const quickBrandSelect = document.querySelector("#quickBrandSelect");
const quickBrandInput = document.querySelector("#quickBrand");
const quickModelSelect = document.querySelector("#quickModelSelect");
const quickModelInput = document.querySelector("#quickModel");
const quickSupplierSelect = document.querySelector("#quickSupplierSelect");
const quickSupplierInput = document.querySelector("#quickSupplier");
const quickCategoryInput = document.querySelector("#quickCategory");
const partsStorageKey = "inventoryParts";
const newOptionValue = "__new__";
const colorModeToggle = document.querySelector("#colorModeToggle");
const colorModeStorageKey = "loginColorMode";
const notesStorageKey = "pendingNotes";
const notesSnoozeStorageKey = "pendingNotesSnoozeUntil";
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
const deletedPartOptionsStorageKey = "inventoryDeletedPartOptions";
const categoryOptions = ["Telefono", "Tablet", "Computadora", "Bocina"];
const partOptionFieldLabels = {
  name: "nombre de repuesto",
  brand: "marca",
  model: "modelo",
  supplier: "proveedor",
  category: "categoria",
};
const statisticsSummary = document.querySelector("#statisticsSummary");
const statisticsHint = document.querySelector("#statisticsHint");
const statisticsGrid = document.querySelector("#statisticsGrid");
const statisticsLists = document.querySelector("#statisticsLists");
const statisticsPeriodButtons = document.querySelectorAll("[data-statistics-period]");
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
let repairExcelDatabasePromise = null;
let pendingSale = null;
let pendingVoidSaleId = null;
let lastVoidedSale = null;
let undoTimerId = null;
let sideRepairSearchTimer = null;
let currentUser = null;
let notesCloudMigrationDone = false;
let partsCloudMigrationDone = false;
let presenceTimer = null;
let activeStatisticsPeriod = "month";
const presenceHeartbeatMs = 25000;

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

function generateSessionToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getSavedSessionToken() {
  return localStorage.getItem(sessionTokenStorageKey);
}

function saveSessionToken(token) {
  localStorage.setItem(sessionTokenStorageKey, token);
}

function clearSessionToken() {
  localStorage.removeItem(sessionTokenStorageKey);
}

function saveCurrentUser(user) {
  localStorage.setItem(currentUserStorageKey, JSON.stringify({
    id: user.id || user._id || "",
    username: user.username || "",
    name: user.name || user.username || "Usuario",
    role: user.role || "user",
  }));
}

function clearCurrentUser() {
  localStorage.removeItem(currentUserStorageKey);
}

function getStoredCurrentUser() {
  const savedUser = localStorage.getItem(currentUserStorageKey);
  if (!savedUser) return null;
  try {
    return JSON.parse(savedUser);
  } catch {
    return null;
  }
}

function finishSessionRestore() {
  document.documentElement.classList.remove("session-restoring");
}

function saveAuthMode(mode) {
  localStorage.setItem(authModeStorageKey, mode);
}

function getSavedAuthMode() {
  return localStorage.getItem(authModeStorageKey);
}

function getSavedActiveModule() {
  return localStorage.getItem(activeModuleStorageKey) || "permissions";
}

function saveActiveModule(moduleName) {
  localStorage.setItem(activeModuleStorageKey, moduleName);
}

function getRoleProfile(role) {
  return roleProfiles[role] || roleProfiles.user;
}

function canAccessModule(moduleName) {
  if (!currentUser) return false;
  return getRoleProfile(currentUser.role).modules.includes(moduleName);
}

function formatPresenceNames(users) {
  const usernames = users.map((user) => user.username || user.name).filter(Boolean);
  if (usernames.length <= 2) return usernames.join(" y ");
  return `${usernames.slice(0, -1).join(", ")} y ${usernames.at(-1)}`;
}

function renderOnlinePresence(users = []) {
  if (!onlinePresence) return;
  if (users.length < 2) {
    onlinePresence.hidden = true;
    onlinePresence.textContent = "";
    return;
  }

  onlinePresence.hidden = false;
  onlinePresence.textContent = `${users.length} en linea (${formatPresenceNames(users)})`;
}

async function refreshPresence() {
  if (!currentUser || !window.repairCloud?.isConfigured()) {
    renderOnlinePresence([]);
    return;
  }

  const sessionToken = getSavedSessionToken();
  if (!sessionToken) {
    renderOnlinePresence([]);
    return;
  }

  try {
    const users = await window.repairCloud.heartbeatPresence(sessionToken);
    renderOnlinePresence(Array.isArray(users) ? users : []);
  } catch {
    renderOnlinePresence([]);
  }
}

function stopPresenceUpdates() {
  if (presenceTimer) clearInterval(presenceTimer);
  presenceTimer = null;
  renderOnlinePresence([]);
}

function startPresenceUpdates() {
  stopPresenceUpdates();
  refreshPresence();
  if (!window.repairCloud?.isConfigured()) return;
  presenceTimer = setInterval(refreshPresence, presenceHeartbeatMs);
}

function applyAuthenticatedUser(user, message = "Sesion iniciada correctamente.") {
  currentUser = user;
  saveCurrentUser(user);
  migrateLegacyNoteAuthors(user);
  const roleProfile = getRoleProfile(user.role);
  welcomeTitle.textContent = `Bienvenido, ${user.name}`;
  accessSummary.textContent = `${roleProfile.label} - ${roleProfile.access}`;
  permissionList.innerHTML = roleProfile.permissions.map((p) => `<li>${p}</li>`).join("");
  loginForm.hidden = true;
  sessionPanel.hidden = false;
  credentialHint.textContent = message;
  setModule(getSavedActiveModule());
  renderQuickParts();
  renderSales();
  renderRepairs();
  renderDatabase();
  renderUsers();
  renderNotes();
  handlePendingRepairEdit();
  startPresenceUpdates();
}

async function signIn(username, password) {
  if (window.repairCloud?.isConfigured()) {
    await window.repairCloud.seedUsers();
    const sessionToken = generateSessionToken();
    const user = await window.repairCloud.login(username, password, sessionToken);
    saveSessionToken(sessionToken);
    saveAuthMode("convex");
    return user;
  }

  const selectedUser = loadUsers().find((user) =>
    user.username.toLowerCase() === username.trim().toLowerCase() &&
    user.password === password
  );

  if (!selectedUser) throw new Error("Usuario o contrasena incorrectos.");
  saveAuthMode("local");
  return selectedUser;
}

async function restoreSession() {
  const storedUser = getStoredCurrentUser();
  if (storedUser) {
    applyAuthenticatedUser(storedUser, "Restaurando sesion...");
  }

  if (!window.repairCloud?.isConfigured()) {
    saveAuthMode("local");
    finishSessionRestore();
    return;
  }

  if (getSavedAuthMode() === "local") {
    credentialHint.textContent = "Ahora hay conexion con Convex. Tu sesion anterior fue local; vuelve a iniciar sesion para validarla en Convex.";
    finishSessionRestore();
    return;
  }

  const sessionToken = getSavedSessionToken();
  if (!sessionToken) {
    credentialHint.textContent = "Modo Convex | Inicia sesion con tu usuario.";
    finishSessionRestore();
    return;
  }

  try {
    const user = await window.repairCloud.currentSession(sessionToken);
    if (!user) {
      clearSessionToken();
      clearCurrentUser();
      currentUser = null;
      sessionPanel.hidden = true;
      loginForm.hidden = false;
      credentialHint.textContent = "Tu sesion expiro. Inicia sesion nuevamente.";
      finishSessionRestore();
      return;
    }
    applyAuthenticatedUser(user, "Sesion recuperada desde Convex.");
  } catch (error) {
    credentialHint.textContent = error.message;
  } finally {
    finishSessionRestore();
  }
}

async function warnIfLocalSessionCanUseConvex() {
  if (getSavedAuthMode() !== "local" || !window.repairCloud?.isConfigured()) return;

  try {
    await window.repairCloud.seedUsers();
    credentialHint.textContent = "Conexion recuperada con Convex. Esta sesion fue validada localmente; cierra sesion e inicia de nuevo para usar Convex.";
  } catch {
    credentialHint.textContent = "Modo local | Convex aun no esta disponible.";
  }
}

function setLoginDemo() {
  usernameInput.value = "root";
  passwordInput.value = "root123";
  const authMode = window.repairCloud?.isConfigured() ? "Modo Convex" : "Modo local";
  credentialHint.textContent = `${authMode} | root: root / root123 | admin: admin / admin123 | usuario: usuario / user123`;
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

function loadDeletedPartOptions() {
  const savedOptions = localStorage.getItem(deletedPartOptionsStorageKey);
  return savedOptions ? JSON.parse(savedOptions) : {};
}

function saveDeletedPartOptions(options) {
  localStorage.setItem(deletedPartOptionsStorageKey, JSON.stringify(options));
}

function getDeletedPartOptionKeys(field) {
  return new Set(loadDeletedPartOptions()[field] || []);
}

function markPartOptionDeleted(field, value) {
  const options = loadDeletedPartOptions();
  const keys = new Set(options[field] || []);
  keys.add(normalizePartSearch(value));
  options[field] = [...keys];
  saveDeletedPartOptions(options);
}

function unmarkPartOptionDeleted(field, value) {
  const options = loadDeletedPartOptions();
  const keys = new Set(options[field] || []);
  keys.delete(normalizePartSearch(value));
  options[field] = [...keys];
  saveDeletedPartOptions(options);
}

function parseMoneyCents(value) {
  const normalizedValue = String(value ?? "").trim().replace(",", ".");
  const match = normalizedValue.match(/^(\d+)(?:\.(\d+))?$/);
  if (!match) return 0;

  const pesos = Number(match[1]);
  const decimalDigits = `${match[2] || ""}000`;
  const cents = Number(decimalDigits.slice(0, 2)) + (Number(decimalDigits[2]) >= 5 ? 1 : 0);
  return pesos * 100 + cents;
}

function centsToMoney(cents) {
  return (Number(cents) || 0) / 100;
}

function parseMoney(value) {
  return centsToMoney(parseMoneyCents(value));
}

function getMoneyCents(part, moneyField, centsField) {
  const cents = Number(part?.[centsField]);
  if (Number.isInteger(cents)) return cents;
  return parseMoneyCents(part?.[moneyField]);
}

function formatCurrencyCents(cents) {
  return formatCurrency(centsToMoney(cents));
}

function normalizeStockQuantity(value) {
  const stock = Number(value);
  if (!Number.isFinite(stock)) return 0;
  return Math.max(0, Math.trunc(stock));
}

function getPartStock(part) {
  return normalizeStockQuantity(part?.stock);
}

function normalizePartType(value) {
  const cleanedValue = String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
  if (!cleanedValue) return "";
  return cleanedValue.charAt(0).toUpperCase() + cleanedValue.slice(1);
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
  return categoryMap[value] || normalizePartType(value) || "Telefono";
}

function normalizePartSearch(value = "") {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase();
}

function getCanonicalValue(values, value) {
  const normalizedValue = normalizePartSearch(value);
  if (!normalizedValue) return "";
  return values.find((option) => normalizePartSearch(option) === normalizedValue) || "";
}

function getUniqueNormalizedValues(values) {
  const normalizedMap = new Map();
  values.forEach((value) => {
    const displayValue = normalizePartType(value);
    const key = normalizePartSearch(displayValue);
    if (key && !normalizedMap.has(key)) normalizedMap.set(key, displayValue);
  });
  return [...normalizedMap.values()].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
}

function normalizeQuality(value = "") {
  const quality = String(value || "").trim();
  const normalized = normalizePartSearch(quality);
  if (["premium", "premiun", "gx"].includes(normalized)) return "GX";
  if (["originall", "original"].includes(normalized)) return "Original";
  if (["amoled", "am oled"].includes(normalized)) return "Amoled";
  if (normalized === "oled") return "OLED";
  if (normalized === "tft") return "TFT";
  if (normalized === "ips") return "IPS";
  if (["generico", "generica"].includes(normalized)) return "Generica";
  return quality || "Original";
}

function getQualityClass(value = "") {
  return `quality-${normalizePartSearch(normalizeQuality(value)).replace(/\s+/g, "-") || "sin-calidad"}`;
}

function getPartDuplicateKey(part) {
  return [part.name, part.brand, part.model, normalizeCategory(part.category), normalizeQuality(part.quality)]
    .map(normalizePartSearch)
    .join("|");
}

function findDuplicatePart(parts, part, currentId = "") {
  const duplicateKey = getPartDuplicateKey(part);
  return parts.find((existingPart) => {
    if (existingPart.id === currentId || existingPart._id === currentId) return false;
    return getPartDuplicateKey(existingPart) === duplicateKey;
  });
}

function getDuplicateMessage(part) {
  return `Duplicado: ya existe ${part.name} ${part.brand} ${part.model}.`;
}

function hasModelSupplierConflict(part) {
  return Boolean(normalizePartSearch(part.model)) && normalizePartSearch(part.model) === normalizePartSearch(part.supplier);
}

function getModelSupplierConflictMessage() {
  return "Revisa el modelo y proveedor: no pueden ser iguales.";
}

function isDuplicateError(error) {
  return String(error?.message || "").toLowerCase().includes("duplicado");
}

function isOptionValueDuplicate(field, value) {
  const values = getUniquePartValues(field);
  return Boolean(getCanonicalValue(values, value));
}

function getOptionDuplicateMessage(field, value) {
  const labels = {
    name: "nombre de repuesto",
    brand: "marca",
    model: "modelo",
    supplier: "proveedor",
  };
  return `Ese ${labels[field]} ya existe: ${getCanonicalValue(getUniquePartValues(field), value) || normalizePartType(value)}. Seleccionalo de la lista.`;
}

async function verifyRootCredentials(username, password) {
  if (window.repairCloud?.isConfigured()) {
    await window.repairCloud.seedUsers();
    return await window.repairCloud.verifyRoot(username, password);
  }

  const normalizedUsername = String(username || "").trim().toLowerCase();
  return loadUsers().some((user) =>
    user.username?.toLowerCase() === normalizedUsername &&
    user.password === password &&
    user.role === "root" &&
    user.active !== false
  );
}

async function requireRootForPartOptionDelete(field) {
  if (!["brand", "supplier"].includes(field)) return true;
  if (currentUser?.role === "root") return true;

  const username = prompt("Solo root puede borrar marca o proveedor. Usuario root:");
  if (username === null) return false;
  const password = prompt("Contrasena de root:");
  if (password === null) return false;

  try {
    const isRoot = await verifyRootCredentials(username, password);
    if (!isRoot) {
      quickPartsHint.textContent = "Autenticacion root incorrecta. No se elimino nada.";
      return false;
    }
    return true;
  } catch (error) {
    quickPartsHint.textContent = `No se pudo validar root: ${error.message}`;
    return false;
  }
}

function getQuickManagedOptionValue(field) {
  if (field === "category") return quickCategoryInput.value;
  const controlMap = {
    name: quickPartNameSelect,
    brand: quickBrandSelect,
    model: quickModelSelect,
    supplier: quickSupplierSelect,
  };
  const value = controlMap[field]?.value || "";
  if (!value || value === newOptionValue) return "";
  return value;
}

function getBlankPartOptionValue(field) {
  const blankValues = {
    name: "Sin repuesto",
    brand: "Sin marca",
    model: "Sin modelo",
    supplier: "Sin proveedor",
    category: "Sin categoria",
  };
  return blankValues[field] || "";
}

function isSamePartOptionValue(field, currentValue, selectedValue) {
  const current = field === "category" ? normalizeCategory(currentValue) : currentValue;
  const selected = field === "category" ? normalizeCategory(selectedValue) : selectedValue;
  return normalizePartSearch(current) === normalizePartSearch(selected);
}

function normalizePartOptionValueForField(field, value) {
  if (field === "category") return normalizeCategory(value);
  return normalizePartType(value);
}

function withUpdatedPartOptionValue(part, field, value) {
  return { ...part, [field]: normalizePartOptionValueForField(field, value) };
}

function hasDuplicatePartsAfterOptionChange(parts, field, oldValue, newValue) {
  const projectedParts = parts.map((part) =>
    isSamePartOptionValue(field, part[field], oldValue) ? withUpdatedPartOptionValue(part, field, newValue) : part
  );
  const seenKeys = new Set();
  return projectedParts.some((part) => {
    const key = getPartDuplicateKey(part);
    if (seenKeys.has(key)) return true;
    seenKeys.add(key);
    return false;
  });
}

function getCloudPatchForPart(part) {
  const normalizedPart = normalizePartForCloud(part);
  const { sourceId, ...patch } = normalizedPart;
  return patch;
}

async function persistPartOptionChanges(changedParts) {
  if (!window.repairCloud?.isConfigured()) return;
  for (const part of changedParts) {
    if (!part._id) continue;
    await window.repairCloud.updatePart(part._id, getCloudPatchForPart(part));
  }
  const cloudParts = await window.repairCloud.listParts();
  saveParts(cloudParts.map((part) => ({ ...part, id: part._id || part.id, stock: normalizeStockQuantity(part.stock) })));
}

async function restorePartOptionDelete(previousParts, previousDeletedOptions, field, oldValue) {
  try {
    if (window.repairCloud?.isConfigured()) {
      const changedParts = previousParts.filter((part) => part._id && isSamePartOptionValue(field, part[field], oldValue));
      await persistPartOptionChanges(changedParts);
    } else {
      saveParts(previousParts);
    }
    saveDeletedPartOptions(previousDeletedOptions);
    quickPartsHint.textContent = "Eliminacion deshecha.";
    await refreshQuickPartsView();
  } catch (error) {
    quickPartsHint.textContent = `No se pudo deshacer: ${error.message}`;
  }
}

async function editQuickManagedOption(field) {
  const oldValue = getQuickManagedOptionValue(field);
  if (!oldValue) {
    quickPartsHint.textContent = `Selecciona un ${partOptionFieldLabels[field]} para editar.`;
    return;
  }

  const typedValue = prompt(`Nuevo ${partOptionFieldLabels[field]} para "${oldValue}":`, oldValue);
  if (typedValue === null) return;
  const newValue = normalizePartOptionValueForField(field, typedValue);
  if (!newValue) {
    quickPartsHint.textContent = `Escribe un ${partOptionFieldLabels[field]} valido.`;
    return;
  }
  if (isSamePartOptionValue(field, oldValue, newValue)) {
    quickPartsHint.textContent = "No hubo cambios.";
    return;
  }

  const parts = loadParts();
  if (["name", "brand", "model", "supplier"].includes(field) && getCanonicalValue(getUniquePartValues(field), newValue)) {
    quickPartsHint.textContent = getOptionDuplicateMessage(field, newValue);
    return;
  }
  if (hasDuplicatePartsAfterOptionChange(parts, field, oldValue, newValue)) {
    quickPartsHint.textContent = "Ese cambio crearia repuestos duplicados. Edita el repuesto especifico primero.";
    return;
  }

  const updatedParts = parts.map((part) =>
    isSamePartOptionValue(field, part[field], oldValue) ? withUpdatedPartOptionValue(part, field, newValue) : part
  );
  const changedParts = updatedParts.filter((part, index) => part !== parts[index]);

  try {
    await persistPartOptionChanges(changedParts);
    if (!window.repairCloud?.isConfigured()) saveParts(updatedParts);
    markPartOptionDeleted(field, oldValue);
    unmarkPartOptionDeleted(field, newValue);
    quickPartsHint.textContent = `${changedParts.length} registro${changedParts.length === 1 ? "" : "s"} actualizado${changedParts.length === 1 ? "" : "s"}.`;
    await refreshQuickPartsView();
  } catch (error) {
    quickPartsHint.textContent = `No se pudo editar en Convex: ${error.message}`;
  }
}

async function deleteQuickManagedOption(field) {
  const oldValue = getQuickManagedOptionValue(field);
  if (!oldValue) {
    quickPartsHint.textContent = `Selecciona un ${partOptionFieldLabels[field]} para eliminar.`;
    return;
  }
  if (!(await requireRootForPartOptionDelete(field))) return;

  const parts = loadParts();
  const previousParts = parts.map((part) => ({ ...part }));
  const previousDeletedOptions = loadDeletedPartOptions();
  const affectedParts = parts.filter((part) => isSamePartOptionValue(field, part[field], oldValue));
  if (!affectedParts.length) {
    quickPartsHint.textContent = "Ese valor ya no esta en uso.";
    await refreshQuickPartsView();
    return;
  }

  const replacementValue = getBlankPartOptionValue(field);
  if (!confirm(`Eliminar "${oldValue}" de ${affectedParts.length} registro${affectedParts.length === 1 ? "" : "s"}?`)) return;
  if (hasDuplicatePartsAfterOptionChange(parts, field, oldValue, replacementValue)) {
    quickPartsHint.textContent = "No se elimino porque eso crearia repuestos duplicados.";
    return;
  }

  const updatedParts = parts.map((part) =>
    isSamePartOptionValue(field, part[field], oldValue) ? withUpdatedPartOptionValue(part, field, replacementValue) : part
  );
  const changedParts = updatedParts.filter((part, index) => part !== parts[index]);

  try {
    await persistPartOptionChanges(changedParts);
    if (!window.repairCloud?.isConfigured()) saveParts(updatedParts);
    markPartOptionDeleted(field, oldValue);
    unmarkPartOptionDeleted(field, replacementValue);
    quickPartsHint.textContent = `${partOptionFieldLabels[field]} eliminado de ${changedParts.length} registro${changedParts.length === 1 ? "" : "s"}.`;
    showUndoBar(`${partOptionFieldLabels[field]} eliminado.`, () =>
      restorePartOptionDelete(previousParts, previousDeletedOptions, field, oldValue)
    );
    await refreshQuickPartsView();
  } catch (error) {
    quickPartsHint.textContent = `No se pudo eliminar en Convex: ${error.message}`;
  }
}

function normalizePartForCloud(part) {
  const now = new Date().toISOString();
  const priceCents = getMoneyCents(part, "price", "priceCents");
  const customerPriceCents = getMoneyCents(part, "customerPrice", "customerPriceCents");
  return {
    sourceId: part.sourceId || part.id || crypto.randomUUID(),
    name: normalizePartType(part.name),
    brand: normalizePartType(part.brand),
    model: normalizePartType(part.model),
    category: normalizeCategory(part.category),
    price: centsToMoney(priceCents),
    priceCents,
    customerPrice: centsToMoney(customerPriceCents),
    customerPriceCents,
    stock: Number(part.stock) || 0,
    quality: normalizeQuality(part.quality || "Original"),
    supplier: normalizePartType(part.supplier),
    publishedAt: part.publishedAt || now,
    updatedAt: part.updatedAt || "",
  };
}

async function migrateLocalPartsToCloud() {
  if (partsCloudMigrationDone || !window.repairCloud?.isConfigured()) return;
  partsCloudMigrationDone = true;
}

async function loadPartsFromSource() {
  if (window.repairCloud?.isConfigured()) {
    await migrateLocalPartsToCloud();
    const cloudParts = await window.repairCloud.listParts();
    const parts = cloudParts.map((part) => ({ ...part, id: part._id || part.id }));
    saveParts(parts);
    return parts;
  }

  return loadParts();
}

async function refreshQuickPartsView() {
  const hasRenderedParts = quickPartsList.children.length > 0;
  if (!hasRenderedParts) {
    renderQuickPartTypeOptions();
    renderQuickBrandOptions();
    renderQuickModelOptions();
    renderQuickSupplierOptions();
    renderQuickCategoryOptions();
    renderQuickParts();
  }

  try {
    await loadPartsFromSource();
  } catch (error) {
    quickPartsHint.textContent = `Modo local: ${error.message}`;
  }
  renderQuickPartTypeOptions();
  renderQuickBrandOptions();
  renderQuickModelOptions();
  renderQuickSupplierOptions();
  renderQuickCategoryOptions();
  renderQuickParts();
}

function getUniquePartValues(field) {
  const deletedKeys = getDeletedPartOptionKeys(field);
  return getUniqueNormalizedValues(loadParts().map((part) => part[field]))
    .filter((value) => !deletedKeys.has(normalizePartSearch(value)));
}

function getCategoryValues() {
  const deletedKeys = getDeletedPartOptionKeys("category");
  const values = getUniqueNormalizedValues([...categoryOptions, ...loadParts().map((part) => normalizeCategory(part.category))])
    .filter((value) => !deletedKeys.has(normalizePartSearch(value)));
  return values.length ? values : ["Telefono"];
}

function renderSelectOptions(select, values, placeholder) {
  select.innerHTML = [
    `<option value="">${escapeHtml(placeholder)}</option>`,
    ...values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`),
    `<option value="${newOptionValue}">Agregar nuevo</option>`,
  ].join("");
}

function renderQuickCategoryOptions(selectedValue = quickCategoryInput.value || "Telefono") {
  const values = getCategoryValues();
  quickCategoryInput.innerHTML = values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
  quickCategoryInput.value = values.includes(selectedValue) ? selectedValue : "Telefono";
}

function syncManualField(select, input) {
  const isNew = select.value === newOptionValue;
  input.hidden = !isNew;
  input.required = isNew;
  if (!isNew) input.value = select.value;
  if (isNew) input.focus();
}

function renderQuickPartTypeOptions() {
  renderSelectOptions(quickPartNameSelect, getUniquePartValues("name"), "Selecciona un repuesto");
  syncManualField(quickPartNameSelect, quickPartNameInput);
}

function syncQuickPartTypeText() {
  quickPartNameInput.value = normalizePartType(quickPartNameInput.value);
}

function renderQuickBrandOptions() {
  renderSelectOptions(quickBrandSelect, getUniquePartValues("brand"), "Selecciona una marca");
  syncManualField(quickBrandSelect, quickBrandInput);
}

function syncQuickBrandText() {
  quickBrandInput.value = normalizePartType(quickBrandInput.value);
}

function renderQuickModelOptions() {
  renderSelectOptions(quickModelSelect, getUniquePartValues("model"), "Selecciona un modelo");
  syncManualField(quickModelSelect, quickModelInput);
}

function syncQuickModelText() {
  quickModelInput.value = normalizePartType(quickModelInput.value);
}

function renderQuickSupplierOptions() {
  renderSelectOptions(quickSupplierSelect, getUniquePartValues("supplier"), "Selecciona un proveedor");
  syncManualField(quickSupplierSelect, quickSupplierInput);
}

function syncQuickSupplierText() {
  quickSupplierInput.value = normalizePartType(quickSupplierInput.value);
}

function syncQuickPartSelectFields() {
  syncManualField(quickPartNameSelect, quickPartNameInput);
  syncManualField(quickBrandSelect, quickBrandInput);
  syncManualField(quickModelSelect, quickModelInput);
  syncManualField(quickSupplierSelect, quickSupplierInput);
}

function loadNotes() {
  const savedNotes = localStorage.getItem(notesStorageKey);
  return savedNotes ? JSON.parse(savedNotes) : [];
}

function saveNotes(notes) {
  localStorage.setItem(notesStorageKey, JSON.stringify(notes));
}

function migrateLegacyNoteAuthors(user) {
  if (!user) return;
  const authorName = user.name || user.username || "Usuario";
  const authorUsername = user.username || "";
  const notes = loadNotes();
  let changed = false;
  const migratedNotes = notes.map((note) => {
    if (note.authorName) return note;
    changed = true;
    return { ...note, authorName, authorUsername };
  });
  if (changed) saveNotes(migratedNotes);
}

function normalizeNoteForCloud(note, user = currentUser) {
  const now = new Date().toISOString();
  return {
    sourceId: note.sourceId || note.id || crypto.randomUUID(),
    text: sanitizeNoteText(note.text),
    authorName: note.authorName || user?.name || user?.username || "Usuario",
    authorUsername: note.authorUsername || user?.username || "",
    done: Boolean(note.done),
    createdAt: note.createdAt || now,
    updatedAt: note.updatedAt || now,
  };
}

async function migrateLocalNotesToCloud(user = currentUser) {
  if (notesCloudMigrationDone || !window.repairCloud?.isConfigured() || !user) return;
  migrateLegacyNoteAuthors(user);
  const notes = loadNotes()
    .filter((note) => !note._id)
    .map((note) => normalizeNoteForCloud(note, user))
    .filter((note) => note.text);
  if (notes.length) await window.repairCloud.importNotes(notes);
  notesCloudMigrationDone = true;
}

async function loadNotesFromSource() {
  if (window.repairCloud?.isConfigured() && currentUser) {
    await migrateLocalNotesToCloud(currentUser);
    const cloudNotes = await window.repairCloud.listNotes();
    const notes = cloudNotes.map((note) => ({ ...note, id: note._id || note.id }));
    saveNotes(notes);
    return notes;
  }

  return loadNotes();
}

function isPendingAlertSnoozed() {
  return Number(localStorage.getItem(notesSnoozeStorageKey) || 0) > Date.now();
}

function snoozeNotesAlert() {
  localStorage.setItem(notesSnoozeStorageKey, String(Date.now() + 60 * 60 * 1000));
  renderNotes();
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

function normalizeSearch(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

async function loadRepairsFromSource(limit = 200, search = "") {
  if (window.repairCloud?.isConfigured()) {
    const repairs = await window.repairCloud.listRepairs({ limit, search });
    if (!search) saveRepairs(repairs);
    return repairs;
  }

  const repairs = loadRepairs();
  const term = normalizeSearch(search.trim());
  if (!term) return repairs;

  return repairs.filter((repair) =>
    [repair.customer, repair.deviceType, repair.brand, repair.model, repair.repairType, repair.status, repair.notes, repair.repairNumber]
      .some((field) => normalizeSearch(field).includes(term)),
  );
}

function saveRepairs(repairs) {
  localStorage.setItem(repairsStorageKey, JSON.stringify(repairs));
}

function normalizeRepairForCloud(repair) {
  return {
    sourceId: repair.sourceId || repair.id,
    repairNumber: Number(repair.repairNumber) || 0,
    customer: repair.customer || "Sin nombre",
    deviceType: repair.deviceType || "Telefono",
    phone: repair.phone || "",
    brand: repair.brand || "",
    model: repair.model || "Sin modelo",
    repairType: repair.repairType || "Reparacion",
    status: repair.status || "En proceso",
    createdAt: repair.createdAt || new Date().toISOString(),
    deliveredAt: repair.deliveredAt || "",
    repairPrice: Number(repair.repairPrice) || 0,
    notes: repair.notes || "",
  };
}

function getRepairRecordId(repair) {
  return repair?._id || repair?.id || repair?.sourceId || "";
}

function findRepairByRecordId(repairs, repairId) {
  return repairs.find((repair) => getRepairRecordId(repair) === repairId);
}

function loadRepairExcelDatabase() {
  if (Array.isArray(window.repairExcelDatabase)) {
    return Promise.resolve(window.repairExcelDatabase);
  }
  if (repairExcelDatabasePromise) return repairExcelDatabasePromise;

  repairExcelDatabasePromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "reparaciones-db.js";
    script.onload = () => resolve(Array.isArray(window.repairExcelDatabase) ? window.repairExcelDatabase : []);
    script.onerror = () => reject(new Error("No se pudo cargar reparaciones-db.js"));
    document.head.append(script);
  });

  return repairExcelDatabasePromise;
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

function sanitizeNoteText(value) {
  return String(value || "")
    .replace(/[^\p{L}\p{N}\s.,;:¿?¡!()\-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 280);
}

function cleanNoteTextInput(value) {
  return String(value || "")
    .replace(/[^\p{L}\p{N}\s.,;:¿?¡!()\-]/gu, "")
    .slice(0, 280);
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
      <span>${part.brand || "Sin marca"} ${part.model || ""} | Costo ${formatCurrencyCents(getMoneyCents(part, "price", "priceCents"))} | Cliente ${formatCurrencyCents(getMoneyCents(part, "customerPrice", "customerPriceCents"))} | <span class="quality-pill ${getQualityClass(part.quality)}">${normalizeQuality(part.quality)}</span> | ${part.supplier}</span>
    </article>
  `).join("");
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

async function renderNotes() {
  let notes = [];
  try {
    notes = await loadNotesFromSource();
  } catch (error) {
    notes = loadNotes();
    notesList.innerHTML = `<p class="hint">${escapeHtml(error.message)}</p>`;
  }
  const pendingNotes = notes.filter((note) => !note.done);
  const hasSession = Boolean(currentUser);

  notesToggle.hidden = !hasSession;
  notesBadge.hidden = !hasSession || pendingNotes.length === 0;
  notesBadge.textContent = hasSession ? pendingNotes.length : 0;
  pendingAlert.hidden = !hasSession || pendingNotes.length === 0 || isPendingAlertSnoozed();

  if (pendingNotes.length) {
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
  if (!currentUser) return;
  notesOverlay.hidden = false;
  renderNotes();
  noteTextInput.focus();
}

function closeNotesPanel() {
  notesOverlay.hidden = true;
  notesForm.reset();
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

async function setNextRepairNumber() {
  try {
    const repairs = await loadRepairsFromSource(1);
    repairNumberInput.value = repairs.reduce((max, repair) => Math.max(max, repair.repairNumber), 0) + 1;
  } catch {
    repairNumberInput.value = loadRepairs().reduce((max, repair) => Math.max(max, repair.repairNumber), 0) + 1;
  }
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

function renderRepairsList(repairs) {
  repairsCount.textContent = `${repairs.length} registro${repairs.length === 1 ? "" : "s"}`;
  if (importRepairsDatabaseButton) {
    const importCount = Array.isArray(window.repairExcelDatabase) ? window.repairExcelDatabase.length : 0;
    importRepairsDatabaseButton.hidden = !canAccessModule("database");
    importRepairsDatabaseButton.textContent = importCount ? `Subir a Convex (${importCount})` : "Cargar base Excel";
  }
  if (!repairs.length) {
    repairsList.innerHTML = `<p class="hint">Todavia no hay reparaciones registradas.</p>`;
    return;
  }
  repairsList.innerHTML = repairs.map((repair) => {
    const deliveredLabel = repair.deliveredAt
      ? `Entregado ${formatRepairDateTimeInput(repair.deliveredAt)}`
      : "Entrega pendiente";
    const repairId = getRepairRecordId(repair);
    const actions = repairId ? `
          <div class="table-action-icons repair-action-icons">
            <button class="edit-button icon-action-button icon-edit-button" type="button" data-repair-id="${escapeHtml(repairId)}" aria-label="Editar reparacion #${escapeHtml(repair.repairNumber || "")}" title="Editar">Editar</button>
            <button class="delete-button icon-action-button icon-delete-button" type="button" data-repair-id="${escapeHtml(repairId)}" aria-label="Eliminar reparacion #${escapeHtml(repair.repairNumber || "")}" title="Eliminar">Eliminar</button>
          </div>
        ` : "";
    return `
      <article class="compact-part-item repair-item">
        <div class="repair-item-heading">
          <strong>Reparacion #${repair.repairNumber} - ${escapeHtml(repair.customer)}</strong>
          ${actions}
        </div>
        <span>${escapeHtml(repair.deviceType)} ${repair.brand ? `${escapeHtml(repair.brand)} ` : ""}${escapeHtml(repair.model)} | ${escapeHtml(repair.status)}</span>
        <span>${escapeHtml(repair.repairType)} | Cel. ${escapeHtml(repair.phone)}</span>
        <span>Precio ${formatCurrency(Number(repair.repairPrice) || 0)}</span>
        <span>Ingreso ${formatRepairDateTimeInput(repair.createdAt)} | ${deliveredLabel}</span>
        ${repair.notes ? `<p>${escapeHtml(repair.notes)}</p>` : ""}
      </article>
    `;
  }).join("");
}

async function renderRepairs() {
  let repairs = [];
  const hasRenderedRepairs = repairsList.children.length > 0;

  if (!hasRenderedRepairs) {
    renderRepairsList(loadRepairs());
  }

  try {
    repairs = await loadRepairsFromSource(200);
  } catch (error) {
    repairsCount.textContent = "Error";
    repairsList.innerHTML = `<p class="hint">${escapeHtml(error.message)}</p>`;
    return;
  }

  renderRepairsList(repairs);
}

async function renderSideRepairs() {
  let repairs = [];
  const search = sideRepairSearch.value.trim();

  try {
    repairs = await loadRepairsFromSource(search ? 10000 : 50, search);
  } catch (error) {
    sideRepairsList.innerHTML = `<p class="hint">${escapeHtml(error.message)}</p>`;
    return;
  }

  if (!repairs.length) {
    sideRepairsList.innerHTML = `<p class="hint">No hay reparaciones con esa busqueda.</p>`;
    return;
  }

  const resultSummary = search
    ? `<p class="hint">${repairs.length} coincidencia${repairs.length === 1 ? "" : "s"}.</p>`
    : "";

  sideRepairsList.innerHTML = resultSummary + repairs.map((repair) => `
    <article class="side-repair-item">
      <strong>#${repair.repairNumber || ""} ${escapeHtml(repair.customer || "Sin nombre")}</strong>
      <span>${escapeHtml([repair.brand, repair.model].filter(Boolean).join(" ") || repair.deviceType || "Equipo")}</span>
      <span>${escapeHtml(repair.repairType || "Reparacion")} | ${escapeHtml(repair.status || "En proceso")}</span>
      <b>${formatCurrency(Number(repair.repairPrice) || 0)}</b>
    </article>
  `).join("");
}

function setLeftPanelForModule(moduleName) {
  const showRepairsPanel = moduleName === "repairs" && Boolean(currentUser);
  const showStatisticsPanel = moduleName === "statistics" && Boolean(currentUser);
  document.body.classList.toggle("statistics-active", showStatisticsPanel);
  accessCard.hidden = showRepairsPanel || showStatisticsPanel;
  sideRepairsPanel.hidden = !showRepairsPanel;
  if (showRepairsPanel) renderSideRepairs();
}

async function importExcelRepairs() {
  const excelRepairs = await loadRepairExcelDatabase();
  if (!excelRepairs.length) {
    repairsHint.textContent = "No se encontro la base de reparaciones del Excel.";
    return;
  }
  if (!canAccessModule("database")) {
    repairsHint.textContent = "Tu rol no puede importar la base de datos.";
    return;
  }

  if (!window.repairCloud?.isConfigured()) {
    repairsHint.textContent = "La base Excel se cargo, pero falta poner tu URL de Convex en convex-config.js para subirla.";
    renderRepairs();
    return;
  }

  const batchSize = 200;
  let inserted = 0;
  let skipped = 0;

  repairsHint.textContent = "Subiendo reparaciones a Convex...";
  for (let index = 0; index < excelRepairs.length; index += batchSize) {
    const batch = excelRepairs.slice(index, index + batchSize).map(normalizeRepairForCloud);
    const result = await window.repairCloud.importRepairs(batch);
    inserted += result.inserted || 0;
    skipped += result.skipped || 0;
    repairsHint.textContent = `Subiendo a Convex: ${Math.min(index + batchSize, excelRepairs.length)} de ${excelRepairs.length}.`;
  }

  repairsHint.textContent = `Convex listo: ${inserted} nuevas, ${skipped} ya existian.`;
  renderRepairs();
  renderDatabase();
  return;

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

function sameMonth(value, date = new Date()) {
  const itemDate = new Date(value);
  if (Number.isNaN(itemDate.getTime())) return false;
  return itemDate.getFullYear() === date.getFullYear() && itemDate.getMonth() === date.getMonth();
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getWeekStart(date) {
  const start = startOfDay(date);
  const day = start.getDay() || 7;
  return addDays(start, 1 - day);
}

function getQuarterStart(date) {
  return new Date(date.getFullYear(), Math.floor(date.getMonth() / 3) * 3, 1);
}

function getPeriodConfig(period, now = new Date()) {
  const configs = {
    day: {
      label: "Dia",
      start: startOfDay(now),
      end: addDays(startOfDay(now), 1),
      series: "hours",
    },
    week: {
      label: "Semana",
      start: getWeekStart(now),
      end: addDays(getWeekStart(now), 7),
      series: "days",
    },
    month: {
      label: "Mes",
      start: new Date(now.getFullYear(), now.getMonth(), 1),
      end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
      series: "weeks",
    },
    quarter: {
      label: "Trimestre",
      start: getQuarterStart(now),
      end: new Date(now.getFullYear(), getQuarterStart(now).getMonth() + 3, 1),
      series: "months",
    },
    year: {
      label: "Anual",
      start: new Date(now.getFullYear(), 0, 1),
      end: new Date(now.getFullYear() + 1, 0, 1),
      series: "months",
    },
  };
  return configs[period] || configs.month;
}

function getRecordDate(record, ...fields) {
  for (const field of fields) {
    const date = new Date(record?.[field]);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return null;
}

function isWithinPeriod(date, periodConfig) {
  return Boolean(date) && date >= periodConfig.start && date < periodConfig.end;
}

function filterRecordsByPeriod(records, periodConfig, ...fields) {
  return records.filter((record) => isWithinPeriod(getRecordDate(record, ...fields), periodConfig));
}

function getPeriodRepairSeries(repairs, periodConfig) {
  const series = [];
  const pushBucket = (label, start, end) => series.push({ label, start, end, value: 0 });

  if (periodConfig.series === "hours") {
    for (let hour = 0; hour < 24; hour += 4) {
      const start = new Date(periodConfig.start);
      start.setHours(hour, 0, 0, 0);
      const end = new Date(start);
      end.setHours(hour + 4, 0, 0, 0);
      pushBucket(`${String(hour).padStart(2, "0")}h`, start, end);
    }
  } else if (periodConfig.series === "days") {
    for (let index = 0; index < 7; index += 1) {
      const start = addDays(periodConfig.start, index);
      const end = addDays(start, 1);
      pushBucket(new Intl.DateTimeFormat("es-MX", { weekday: "short" }).format(start), start, end);
    }
  } else if (periodConfig.series === "weeks") {
    let start = new Date(periodConfig.start);
    let week = 1;
    while (start < periodConfig.end) {
      const end = new Date(Math.min(addDays(start, 7).getTime(), periodConfig.end.getTime()));
      pushBucket(`Sem ${week}`, start, end);
      start = end;
      week += 1;
    }
  } else {
    let start = new Date(periodConfig.start);
    while (start < periodConfig.end) {
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      pushBucket(new Intl.DateTimeFormat("es-MX", { month: "short" }).format(start), start, end);
      start = end;
    }
  }

  repairs.forEach((repair) => {
    const date = getRecordDate(repair, "createdAt");
    if (!date) return;
    const bucket = series.find((item) => date >= item.start && date < item.end);
    if (bucket) bucket.value += Number(repair.repairPrice) || 0;
  });

  return series.map(({ label, value }) => ({ label, value }));
}

function groupByMetric(items, keyGetter, valueGetter = () => 1) {
  const totals = new Map();
  items.forEach((item) => {
    const key = keyGetter(item) || "Sin dato";
    const value = valueGetter(item);
    totals.set(key, (totals.get(key) || 0) + value);
  });
  return [...totals.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function percentOf(value, max) {
  if (!max) return 0;
  return Math.max(4, Math.min(100, Math.round((value / max) * 100)));
}

function formatCompactCurrency(value) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function getRecentMonthSeries(repairs, monthCount = 6) {
  const now = new Date();
  const months = Array.from({ length: monthCount }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - index), 1);
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: new Intl.DateTimeFormat("es-MX", { month: "short" }).format(date),
      value: 0,
    };
  });
  const monthMap = new Map(months.map((month) => [month.key, month]));
  repairs.forEach((repair) => {
    const date = new Date(repair.createdAt);
    if (Number.isNaN(date.getTime())) return;
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const month = monthMap.get(key);
    if (month) month.value += Number(repair.repairPrice) || 0;
  });
  return months;
}

function renderKpiRail(cards) {
  return cards.map((card) => `
    <article class="control-kpi">
      <div>
        <strong>${escapeHtml(card.value)}</strong>
        <span>${escapeHtml(card.label)}</span>
      </div>
      <b>${escapeHtml(card.icon)}</b>
    </article>
  `).join("");
}

function renderLineChart(title, series, valueLabel) {
  const max = Math.max(...series.map((item) => item.value), 1);
  const points = series.map((item, index) => {
    const x = series.length === 1 ? 50 : (index / (series.length - 1)) * 100;
    const y = 88 - (item.value / max) * 72;
    return `${x},${y}`;
  }).join(" ");

  return `
    <section class="control-panel-card chart-card">
      <h3>${escapeHtml(title)}</h3>
      <svg class="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1="0" y1="88" x2="100" y2="88"></line>
        <line x1="0" y1="64" x2="100" y2="64"></line>
        <line x1="0" y1="40" x2="100" y2="40"></line>
        <polyline points="${points}"></polyline>
      </svg>
      <div class="chart-axis">
        ${series.map((item) => `<span>${escapeHtml(item.label)}</span>`).join("")}
      </div>
      <p>${escapeHtml(valueLabel)}</p>
    </section>
  `;
}

function renderBarPanel(title, items, formatValue = (value) => value, emptyText = "Sin datos suficientes.") {
  const rows = items.slice(0, 5);
  const max = Math.max(...rows.map((item) => Number(item.value) || 0), 0);
  return `
    <section class="control-panel-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="bar-list">
        ${rows.length ? rows.map((item) => `
          <div class="bar-row">
            <span>${escapeHtml(item.label)}</span>
            <div><i style="width: ${percentOf(Number(item.value) || 0, max)}%"></i></div>
            <b>${escapeHtml(formatValue(item.value, item))}</b>
          </div>
        `).join("") : `<p class="hint">${emptyText}</p>`}
      </div>
    </section>
  `;
}

function renderDonutPanel(title, items, total, formatValue = (value) => value) {
  const topItems = items.slice(0, 4);
  let current = 0;
  const colors = ["#176b87", "#e16636", "#21a39d", "#f2b84b"];
  const gradient = topItems.map((item, index) => {
    const start = current;
    const size = total ? (Number(item.value) || 0) / total * 100 : 0;
    current += size;
    return `${colors[index]} ${start}% ${current}%`;
  }).join(", ");

  return `
    <section class="control-panel-card donut-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="donut-wrap">
        <div class="donut-chart" style="background: conic-gradient(${gradient || "#dbe5e9 0 100%"});"></div>
        <div class="donut-legend">
          ${topItems.map((item, index) => `
            <span><i style="background: ${colors[index]}"></i>${escapeHtml(item.label)} - ${escapeHtml(formatValue(item.value, item))}</span>
          `).join("") || `<span>Sin datos suficientes.</span>`}
        </div>
      </div>
    </section>
  `;
}

function renderAlertPanel(title, parts, emptyText) {
  return `
    <section class="control-panel-card alert-panel">
      <h3>${escapeHtml(title)}</h3>
      <div class="alert-list">
        ${parts.length ? parts.slice(0, 4).map((part) => `
          <article>
            <strong>${escapeHtml(part.name || "Sin nombre")}</strong>
            <span>${escapeHtml([part.brand, part.model].filter(Boolean).join(" ") || "Sin modelo")}</span>
            <b>${getPartStock(part)} pza(s)</b>
          </article>
        `).join("") : `<p class="hint">${emptyText}</p>`}
      </div>
    </section>
  `;
}

function renderStatisticCards(cards) {
  statisticsGrid.innerHTML = cards.map((card) => `
    <article class="stat-card">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <small>${escapeHtml(card.detail || "")}</small>
    </article>
  `).join("");
}

function renderMetricList(title, items, formatValue = (value) => value, emptyText = "Sin datos suficientes.") {
  const rows = items.slice(0, 6);
  return `
    <section class="statistics-list-group">
      <h3>${escapeHtml(title)}</h3>
      <div class="compact-list statistics-list">
        ${rows.length ? rows.map((item) => `
          <article class="compact-part-item">
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(formatValue(item.value, item))}</span>
          </article>
        `).join("") : `<p class="hint">${emptyText}</p>`}
      </div>
    </section>
  `;
}

function renderPartAlertList(title, parts, emptyText) {
  return `
    <section class="statistics-list-group">
      <h3>${escapeHtml(title)}</h3>
      <div class="compact-list statistics-list">
        ${parts.length ? parts.slice(0, 6).map((part) => `
          <article class="compact-part-item">
            <strong>${escapeHtml(part.name || "Sin nombre")}</strong>
            <span>${escapeHtml([part.brand, part.model, part.quality].filter(Boolean).join(" | "))}</span>
            <span>Existencia ${getPartStock(part)} | Cliente ${formatCurrencyCents(getMoneyCents(part, "customerPrice", "customerPriceCents"))}</span>
          </article>
        `).join("") : `<p class="hint">${emptyText}</p>`}
      </div>
    </section>
  `;
}

async function renderStatistics() {
  if (!canAccessModule("statistics")) {
    statisticsSummary.textContent = "Sin acceso";
    statisticsHint.textContent = "Tu rol no puede ver estadisticas.";
    statisticsGrid.innerHTML = "";
    statisticsLists.innerHTML = `<p class="hint">Solo admin y root pueden ver este panel.</p>`;
    return;
  }

  if (!window.repairCloud?.isConfigured()) {
    statisticsSummary.textContent = "Base de datos requerida";
    statisticsHint.textContent = "Configura CONVEX_URL para recopilar datos.";
    statisticsGrid.innerHTML = "";
    statisticsLists.innerHTML = `<p class="hint">Este panel toma sus datos de base de datos, no del almacenamiento local del navegador.</p>`;
    return;
  }

  statisticsSummary.textContent = "Cargando...";
  statisticsHint.textContent = "Consultando base de datos";
  statisticsGrid.innerHTML = "";
  statisticsLists.innerHTML = `<p class="hint">Recopilando repuestos y reparaciones.</p>`;

  try {
    const [parts, repairs] = await Promise.all([
      window.repairCloud.listParts(),
      window.repairCloud.listRepairs({ limit: 10000 }),
    ]);

    const periodConfig = getPeriodConfig(activeStatisticsPeriod);
    const periodParts = filterRecordsByPeriod(parts, periodConfig, "publishedAt", "updatedAt");
    const periodRepairs = filterRecordsByPeriod(repairs, periodConfig, "createdAt");
    const totalStock = periodParts.reduce((sum, part) => sum + getPartStock(part), 0);
    const inventoryCostCents = periodParts.reduce((sum, part) => sum + getMoneyCents(part, "price", "priceCents") * getPartStock(part), 0);
    const inventorySaleCents = periodParts.reduce((sum, part) => sum + getMoneyCents(part, "customerPrice", "customerPriceCents") * getPartStock(part), 0);
    const estimatedProfitCents = inventorySaleCents - inventoryCostCents;
    const repairIncome = periodRepairs.reduce((sum, repair) => sum + (Number(repair.repairPrice) || 0), 0);
    const lowStockParts = periodParts.filter((part) => getPartStock(part) > 0 && getPartStock(part) <= 2);
    const zeroStockParts = periodParts.filter((part) => getPartStock(part) === 0);
    const priceIssues = periodParts.filter((part) => {
      const cost = getMoneyCents(part, "price", "priceCents");
      const customer = getMoneyCents(part, "customerPrice", "customerPriceCents");
      return cost <= 0 || customer <= 0 || customer <= cost;
    });
    const topProfitParts = periodParts
      .map((part) => ({
        label: `${part.name || "Sin nombre"} ${part.model || ""}`.trim(),
        value: (getMoneyCents(part, "customerPrice", "customerPriceCents") - getMoneyCents(part, "price", "priceCents")) * getPartStock(part),
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    statisticsSummary.textContent = `${periodParts.length} repuestos | ${periodRepairs.length} reparaciones`;
    statisticsHint.textContent = "Datos activos de base de datos";
    renderStatisticCards([
      { label: "Valor inventario", value: formatCurrencyCents(inventoryCostCents), detail: `${totalStock} piezas en existencia` },
      { label: "Venta potencial", value: formatCurrencyCents(inventorySaleCents), detail: "Precio cliente final x existencia" },
      { label: "Utilidad estimada", value: formatCurrencyCents(estimatedProfitCents), detail: "Antes de gastos operativos" },
      { label: "Ingresos reparaciones", value: formatCurrency(repairIncome), detail: `${periodRepairs.length} registros` },
      { label: periodConfig.label, value: formatCurrency(repairIncome), detail: `${periodRepairs.length} reparaciones` },
      { label: "Alertas", value: String(lowStockParts.length + zeroStockParts.length + priceIssues.length), detail: "Stock y precios por revisar" },
    ]);

    statisticsLists.innerHTML = [
      renderPartAlertList("Stock bajo", lowStockParts, "Sin repuestos con stock bajo."),
      renderPartAlertList("Sin existencia", zeroStockParts, "Sin repuestos agotados."),
      renderPartAlertList("Precios por revisar", priceIssues, "Sin precios problemáticos."),
      renderMetricList("Valor por proveedor", groupByMetric(parts, (part) => part.supplier, (part) => getMoneyCents(part, "price", "priceCents") * getPartStock(part)), (value) => formatCurrencyCents(value)),
      renderMetricList("Repuestos por categoria", groupByMetric(parts, (part) => normalizeCategory(part.category)), (value) => `${value} registro${value === 1 ? "" : "s"}`),
      renderMetricList("Reparaciones por estado", groupByMetric(repairs, (repair) => repair.status), (value) => `${value} registro${value === 1 ? "" : "s"}`),
      renderMetricList("Mayor utilidad potencial", topProfitParts, (value) => formatCurrencyCents(value)),
      renderMetricList("Reparaciones recientes", repairs.slice(0, 6).map((repair) => ({
        label: `#${repair.repairNumber || ""} ${repair.customer || "Sin nombre"}`,
        value: `${repair.status || "Sin estado"} | ${formatCurrency(Number(repair.repairPrice) || 0)}`,
      }))),
    ].join("");
    const categoryTotals = groupByMetric(periodParts, (part) => normalizeCategory(part.category));
    const providerValues = groupByMetric(periodParts, (part) => part.supplier, (part) => getMoneyCents(part, "price", "priceCents") * getPartStock(part));
    const repairStatusTotals = groupByMetric(periodRepairs, (repair) => repair.status);
    const periodRepairSeries = getPeriodRepairSeries(periodRepairs, periodConfig);

    statisticsGrid.innerHTML = `
      <div class="control-dashboard">
        <aside class="control-kpi-rail">
          ${renderKpiRail([
            { label: "Valor inventario", value: formatCompactCurrency(centsToMoney(inventoryCostCents)), icon: "VI" },
            { label: "Venta potencial", value: formatCompactCurrency(centsToMoney(inventorySaleCents)), icon: "VP" },
            { label: "Utilidad estimada", value: formatCompactCurrency(centsToMoney(estimatedProfitCents)), icon: "UE" },
            { label: "Ingresos reparacion", value: formatCompactCurrency(repairIncome), icon: "IR" },
            { label: `Reparaciones ${periodConfig.label.toLowerCase()}`, value: String(periodRepairs.length), icon: "RP" },
            { label: "Alertas", value: String(lowStockParts.length + zeroStockParts.length + priceIssues.length), icon: "AL" },
          ])}
        </aside>
        <div class="control-main-grid">
          ${renderLineChart("Ingresos de reparaciones", periodRepairSeries, `${periodConfig.label}: ${formatCurrency(repairIncome)}`)}
          ${renderDonutPanel("Repuestos por categoria", categoryTotals, periodParts.length, (value) => `${value}`)}
          ${renderBarPanel("Valor por proveedor", providerValues, (value) => formatCompactCurrency(centsToMoney(value)))}
          ${renderBarPanel("Reparaciones por estado", repairStatusTotals, (value) => `${value}`)}
          ${renderBarPanel("Mayor utilidad potencial", topProfitParts, (value) => formatCompactCurrency(centsToMoney(value)))}
          ${renderAlertPanel("Stock bajo y agotado", [...zeroStockParts, ...lowStockParts], "Sin alertas de stock.")}
        </div>
      </div>
    `;
    statisticsLists.innerHTML = "";
  } catch (error) {
    statisticsSummary.textContent = "Error";
    statisticsHint.textContent = "No se pudo consultar base de datos.";
    statisticsGrid.innerHTML = "";
    statisticsLists.innerHTML = `<p class="hint">${escapeHtml(error.message)}</p>`;
  }
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

function setColorMode(mode) {
  const isDarkMode = mode === "dark";
  document.documentElement.classList.toggle("login-dark", isDarkMode);
  document.body.classList.toggle("login-dark", isDarkMode);
  const toggleLabel = isDarkMode ? "Cambiar a modo dia" : "Cambiar a modo noche";
  colorModeToggle.setAttribute("aria-label", toggleLabel);
  colorModeToggle.setAttribute("title", toggleLabel);
  colorModeToggle.setAttribute("aria-pressed", String(isDarkMode));
  localStorage.setItem(colorModeStorageKey, mode);
}

function getAllowedModules() {
  if (!currentUser) return [];
  return getRoleProfile(currentUser.role).modules.filter((moduleName) => canAccessModule(moduleName));
}

function updateModuleNavigation(moduleName) {
  if (!moduleNavLabel || !moduleBackButton || !moduleNextButton) return;
  const allowedModules = getAllowedModules();
  const currentIndex = allowedModules.indexOf(moduleName);
  const canMove = allowedModules.length > 1 && currentIndex !== -1;

  moduleNavLabel.textContent = moduleLabels[moduleName] || "Panel";
  moduleBackButton.disabled = !canMove;
  moduleNextButton.disabled = !canMove;
}

function moveModule(direction) {
  const allowedModules = getAllowedModules();
  if (allowedModules.length < 2) return;

  const currentModule = getSavedActiveModule();
  const currentIndex = Math.max(0, allowedModules.indexOf(currentModule));
  const nextIndex = (currentIndex + direction + allowedModules.length) % allowedModules.length;
  setModule(allowedModules[nextIndex]);
}

function setModule(moduleName) {
  if (!canAccessModule(moduleName)) {
    credentialHint.textContent = "Tu rol no tiene permiso para abrir ese modulo.";
    moduleName = "permissions";
  }
  saveActiveModule(moduleName);
  sessionPanel.classList.toggle("control-panel-wide", moduleName === "statistics");
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
      (moduleName === "statistics" && panel.id === "statisticsModule") ||
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
  if (moduleName === "statistics") renderStatistics();
  if (moduleName === "users") renderUsers();
  if (moduleName === "parts") {
    moduleLink.href = "repuestos.html";
    moduleLink.textContent = "Ver pagina completa de repuestos";
    moduleLink.hidden = false;
  } else if (moduleName === "repairs") {
    moduleLink.href = "reparaciones.html";
    moduleLink.textContent = "Ver registros de reparaciones";
    moduleLink.hidden = false;
  } else {
    moduleLink.hidden = true;
  }
  updateModuleNavigation(moduleName);
  setLeftPanelForModule(moduleName);
}

tabButtons.forEach((button) => button.addEventListener("click", () => setTheme(button.dataset.theme)));
moduleTabs.forEach((button) => button.addEventListener("click", () => setModule(button.dataset.module)));
moduleBackButton?.addEventListener("click", () => moveModule(-1));
moduleNextButton?.addEventListener("click", () => moveModule(1));
statisticsPeriodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeStatisticsPeriod = button.dataset.statisticsPeriod || "day";
    statisticsPeriodButtons.forEach((periodButton) => {
      periodButton.classList.toggle("active", periodButton === button);
    });
    renderStatistics();
  });
});

sideRepairSearch.addEventListener("input", () => {
  clearTimeout(sideRepairSearchTimer);
  sideRepairSearchTimer = setTimeout(renderSideRepairs, 220);
});

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

notesToggle.addEventListener("click", openNotesPanel);
openNotesFromAlert.addEventListener("click", openNotesPanel);
closeNotesButton.addEventListener("click", closeNotesPanel);
snoozePendingAlert.addEventListener("click", snoozeNotesAlert);

notesForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const noteText = sanitizeNoteText(noteTextInput.value);
  if (!noteText) return;

  const notes = loadNotes();
  const note = {
    id: crypto.randomUUID(),
    text: noteText,
    authorName: currentUser?.name || currentUser?.username || "Usuario",
    authorUsername: currentUser?.username || "",
    done: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    if (window.repairCloud?.isConfigured() && currentUser) {
      await window.repairCloud.createNote(normalizeNoteForCloud(note, currentUser));
    } else {
      notes.unshift(note);
      saveNotes(notes);
    }
  } catch (error) {
    notes.unshift(note);
    saveNotes(notes);
    credentialHint.textContent = `Nota guardada localmente: ${error.message}`;
  }

  localStorage.removeItem(notesSnoozeStorageKey);
  notesForm.reset();
  renderNotes();
});

noteTextInput.addEventListener("input", () => {
  const safeText = cleanNoteTextInput(noteTextInput.value);
  if (noteTextInput.value !== safeText) noteTextInput.value = safeText;
});

notesList.addEventListener("click", async (event) => {
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

quickPartNameSelect.addEventListener("change", () => syncManualField(quickPartNameSelect, quickPartNameInput));
quickPartNameInput.addEventListener("blur", syncQuickPartTypeText);
quickPartNameInput.addEventListener("change", syncQuickPartTypeText);
quickBrandSelect.addEventListener("change", () => syncManualField(quickBrandSelect, quickBrandInput));
quickBrandInput.addEventListener("blur", syncQuickBrandText);
quickBrandInput.addEventListener("change", syncQuickBrandText);
quickModelSelect.addEventListener("change", () => syncManualField(quickModelSelect, quickModelInput));
quickModelInput.addEventListener("blur", syncQuickModelText);
quickModelInput.addEventListener("change", syncQuickModelText);
quickSupplierSelect.addEventListener("change", () => syncManualField(quickSupplierSelect, quickSupplierInput));
quickSupplierInput.addEventListener("blur", syncQuickSupplierText);
quickSupplierInput.addEventListener("change", syncQuickSupplierText);
quickPartsForm.addEventListener("click", async (event) => {
  const optionButton = event.target.closest("[data-option-action]");
  if (!optionButton) return;

  const { optionAction, optionField } = optionButton.dataset;
  if (!optionAction || !optionField) return;

  if (optionAction === "edit") {
    await editQuickManagedOption(optionField);
    return;
  }

  if (optionAction === "delete") {
    await deleteQuickManagedOption(optionField);
  }
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
importRepairsDatabaseButton.addEventListener("click", async () => {
  try {
    const excelRepairs = await loadRepairExcelDatabase();
    const destination = window.repairCloud?.isConfigured() ? "Convex" : "Convex cuando configures la URL";
    if (!confirm(`¿Quieres preparar ${excelRepairs.length} reparaciones para ${destination}?`)) return;
    await importExcelRepairs();
  } catch (error) {
    repairsHint.textContent = error.message;
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    credentialHint.textContent = "Validando credenciales...";
    const selectedUser = await signIn(usernameInput.value, passwordInput.value);
    applyAuthenticatedUser(selectedUser);
    window.repairCloud?.registrarAuditoria("LOGIN", "Sesion iniciada", selectedUser.username);
  } catch (error) {
    credentialHint.textContent = error.message;
    window.repairCloud?.registrarAuditoria("LOGIN_FALLIDO", "Intento de login fallido", usernameInput.value.trim());
    return;
  }
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

adminVoidForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const isAdmin = window.repairCloud?.isConfigured()
    ? await window.repairCloud.verifyAdmin(voidAdminUser.value, voidAdminPassword.value)
    : loadUsers().some((user) =>
        user.username.toLowerCase() === voidAdminUser.value.trim().toLowerCase() &&
        user.password === voidAdminPassword.value &&
        ["root", "admin"].includes(user.role)
      );

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
  window.repairCloud?.registrarAuditoria("VENTA_ANULADA", `Venta #${saleToVoid.saleNumber} anulada`, currentUser?.username, JSON.stringify({ total: saleToVoid.total, producto: saleToVoid.product }));
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

quickPartsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  syncQuickPartSelectFields();
  const duplicateOptionFields = [
    { field: "name", select: quickPartNameSelect, input: quickPartNameInput },
    { field: "brand", select: quickBrandSelect, input: quickBrandInput },
    { field: "model", select: quickModelSelect, input: quickModelInput },
    { field: "supplier", select: quickSupplierSelect, input: quickSupplierInput },
  ];
  const duplicateOption = duplicateOptionFields.find(({ field, select, input }) =>
    select.value === newOptionValue && isOptionValueDuplicate(field, input.value)
  );
  if (duplicateOption) {
    quickPartsHint.textContent = getOptionDuplicateMessage(duplicateOption.field, duplicateOption.input.value);
    return;
  }

  const formData = new FormData(quickPartsForm);
  const parts = loadParts();
  const now = new Date().toISOString();
  const priceCents = parseMoneyCents(formData.get("price"));
  const customerPriceCents = parseMoneyCents(formData.get("customerPrice"));
  const part = {
    id: crypto.randomUUID(),
    name: normalizePartType(formData.get("partName")),
    brand: normalizePartType(formData.get("brand")),
    model: normalizePartType(formData.get("model")),
    category: normalizeCategory(formData.get("category")),
    price: centsToMoney(priceCents),
    priceCents,
    customerPrice: centsToMoney(customerPriceCents),
    customerPriceCents,
    stock: normalizeStockQuantity(formData.get("stock")),
    quality: normalizeQuality(formData.get("quality")),
    supplier: normalizePartType(formData.get("supplier")),
    publishedAt: now,
    updatedAt: "",
  };
  if (hasModelSupplierConflict(part)) {
    quickPartsHint.textContent = getModelSupplierConflictMessage();
    return;
  }

  const duplicatePart = findDuplicatePart(parts, part);

  if (duplicatePart) {
    quickPartsHint.textContent = getDuplicateMessage(duplicatePart);
    return;
  }

  try {
    if (window.repairCloud?.isConfigured()) {
      await window.repairCloud.createPart(normalizePartForCloud(part));
    } else {
      parts.unshift(part);
    }
  } catch (error) {
    if (isDuplicateError(error)) {
      quickPartsHint.textContent = error.message;
      return;
    }
    parts.unshift(part);
    quickPartsHint.textContent = `Guardado localmente: ${error.message}`;
  }
  ["name", "brand", "model", "supplier", "category"].forEach((field) => unmarkPartOptionDeleted(field, part[field]));
  saveParts(parts);
  quickPartsForm.reset();
  quickPartsHint.textContent = "Repuesto guardado correctamente.";
  await refreshQuickPartsView();
});

repairsList.addEventListener("click", (event) => {
  const editButton = event.target.closest(".edit-button");
  if (!editButton) return;
  const repairs = loadRepairs();
  const repair = findRepairByRecordId(repairs, editButton.dataset.repairId);
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
  repairsForm.dataset.editingId = getRepairRecordId(repair);
  updateRepairDeliveredAt();
  repairsHint.textContent = "Editando reparacion - guarda para confirmar los cambios.";
  document.querySelector("#submitRepairs").textContent = "Guardar cambios";
  repairsForm.scrollIntoView({ behavior: "smooth", block: "start" });
});

function openRepairInForm(repair) {
  if (!repair) return;
  setModule("repairs");
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
  repairsForm.dataset.editingId = getRepairRecordId(repair);
  updateRepairDeliveredAt();
  repairsHint.textContent = "Editando reparacion - guarda para confirmar los cambios.";
  document.querySelector("#submitRepairs").textContent = "Guardar cambios";
  repairsForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handlePendingRepairEdit() {
  const pendingRepair = sessionStorage.getItem("pendingRepairEdit");
  if (!pendingRepair) return;
  sessionStorage.removeItem("pendingRepairEdit");

  try {
    openRepairInForm(JSON.parse(pendingRepair));
  } catch {
    repairsHint.textContent = "No se pudo abrir la reparacion para editar.";
  }
}

repairsList.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest(".delete-button[data-repair-id]");
  if (!deleteButton) return;

  const repairId = deleteButton.dataset.repairId;
  const repairs = loadRepairs();
  const repair = findRepairByRecordId(repairs, repairId);
  if (!repair) return;

  const label = repair.repairNumber ? `#${repair.repairNumber}` : repair.customer || "esta reparacion";
  if (!confirm(`Eliminar reparacion ${label}?`)) return;

  try {
    if (window.repairCloud?.isConfigured() && repair._id) {
      await window.repairCloud.removeRepair(repair._id);
      window.repairCloud?.registrarAuditoria("REPARACION_ELIMINADA", `Reparacion #${repair.repairNumber} eliminada`, currentUser?.username);
    }
    saveRepairs(repairs.filter((item) => getRepairRecordId(item) !== repairId));
    repairsHint.textContent = "Reparacion eliminada correctamente.";
    renderRepairs();
    renderSideRepairs();
  } catch (error) {
    repairsHint.textContent = `No se pudo eliminar: ${error.message}`;
  }
});

repairsForm.addEventListener("submit", async (event) => {
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
    const index = repairs.findIndex((repair) => getRepairRecordId(repair) === editingId);
    const existingRepair = index !== -1 ? repairs[index] : {};
    const updatedRepair = {
      ...existingRepair,
      id: existingRepair.id || editingId,
      repairNumber: Number(repairNumberInput.value) || Number(existingRepair.repairNumber) || 0,
      customer: formData.get("customer").trim(),
      deviceType: formData.get("deviceType"),
      phone: formData.get("phone").trim(),
      brand, model, repairType, status, createdAt, deliveredAt,
      repairPrice: Number(formData.get("repairPrice")) || 0,
      notes: formData.get("notes").trim(),
    };

    if (window.repairCloud?.isConfigured() && existingRepair._id) {
      await window.repairCloud.updateRepair(existingRepair._id, normalizeRepairForCloud(updatedRepair));
    }

    if (index !== -1) {
      repairs[index] = updatedRepair;
    }
    delete repairsForm.dataset.editingId;
    document.querySelector("#submitRepairs").textContent = "Guardar reparacion";
    repairsHint.textContent = "Reparacion actualizada correctamente.";
    window.repairCloud?.registrarAuditoria("REPARACION_EDITADA", `Reparacion #${updatedRepair.repairNumber} editada`, currentUser?.username);
  } else {
    const nextRepairNumber = Number(repairNumberInput.value) || repairs.reduce((max, r) => Math.max(max, r.repairNumber), 0) + 1;
    const repairData = {
      id: crypto.randomUUID(),
      repairNumber: nextRepairNumber,
      customer: formData.get("customer").trim(),
      deviceType: formData.get("deviceType"),
      phone: formData.get("phone").trim(),
      brand, model, repairType, status, createdAt, deliveredAt,
      repairPrice: Number(formData.get("repairPrice")) || 0,
      notes: formData.get("notes").trim(),
    };

    if (window.repairCloud?.isConfigured()) {
      await window.repairCloud.createRepair(normalizeRepairForCloud(repairData));
    } else {
      repairs.unshift(repairData);
    }
    repairsHint.textContent = "Reparacion guardada correctamente.";
  }

  if (!window.repairCloud?.isConfigured() || editingId) saveRepairs(repairs);
  repairsForm.reset();
  repairDeliveredAtInput.dataset.value = "";
  setNextRepairNumber();
  setRepairCreatedAt();
  updateRepairDeliveredAt();
  renderRepairs();
  renderSideRepairs();
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

logoutButton.addEventListener("click", async () => {
  const sessionToken = getSavedSessionToken();
  stopPresenceUpdates();
  if (sessionToken && window.repairCloud?.isConfigured()) {
    try {
      await window.repairCloud.logout(sessionToken);
    } catch (error) {
      credentialHint.textContent = error.message;
    }
  }
  clearSessionToken();
  clearCurrentUser();
  saveAuthMode("");
  currentUser = null;
  sessionPanel.hidden = true;
  loginForm.hidden = false;
  closeNotesPanel();
  renderNotes();
  setLeftPanelForModule("permissions");
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
refreshQuickPartsView();
renderNotes();
restoreSession();
window.addEventListener("online", warnIfLocalSessionCanUseConvex);
warnIfLocalSessionCanUseConvex();
setInterval(updateDateTime, 1000);
