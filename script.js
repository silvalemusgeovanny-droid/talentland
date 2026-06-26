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

const appSession = window.repairApp.session;
const appPermissions = window.repairApp.permissions;
const appParts = window.repairApp.parts;
const appNotes = window.repairApp.notes;
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
  getDuplicateKey: getPartDuplicateKey,
  findDuplicate: findDuplicatePart,
  getDuplicateMessage,
  hasModelSupplierConflict,
  getModelSupplierConflictMessage,
  isDuplicateError,
  normalizeForCloud: normalizePartForCloud,
  isSameOptionValue: isSamePartOptionValue,
  normalizeOptionValue: normalizePartOptionValueForField,
  withUpdatedOptionValue: withUpdatedPartOptionValue,
  hasDuplicatesAfterOptionChange: hasDuplicatePartsAfterOptionChange,
} = appParts;
const usersStorageKey = appSession.keys.users;
const activeModuleStorageKey = appSession.keys.activeModule;
const repairInvoicePhone = "69966950";
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
  {
    id: "activator-user",
    username: "activador",
    password: "activador123",
    name: "Activador",
    role: "activador",
  },
];

const roleProfiles = appPermissions.roleProfiles;
const manageableModules = appPermissions.manageableModules;
const moduleLabels = {
  permissions: "Inicio",
  sales: "Ventas",
  products: "Catalogo productos",
  parts: "Repuestos",
  partsCost: "Ver costo interno",
  partsCustomerPrice: "Ver precio cliente final",
  repairs: "Reparaciones",
  contacts: "Contactos",
  notes: "Notas",
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
const brandHomeButton = document.querySelector("#brandHomeButton");
const sideRepairsPanel = document.querySelector("#sideRepairsPanel");
const sideUsersPanel = document.querySelector("#sideUsersPanel");
const sideRepairsList = document.querySelector("#sideRepairsList");
const sideRepairSearch = document.querySelector("#sideRepairSearch");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");
const passwordToggle = document.querySelector("#passwordToggle");
const credentialHint = document.querySelector("#credentialHint");
const loginForm = document.querySelector("#loginForm");
const sessionPanel = document.querySelector("#sessionPanel");
const welcomeTitle = document.querySelector("#welcomeTitle");
const accessSummary = document.querySelector("#accessSummary");
const onlinePresence = document.querySelector("#onlinePresence");
const permissionList = document.querySelector("#permissionList");
const logoutButton = document.querySelector("#logoutButton");
const logoutConfirmOverlay = document.querySelector("#logoutConfirmOverlay");
const cancelLogoutButton = document.querySelector("#cancelLogoutButton");
const confirmLogoutButton = document.querySelector("#confirmLogoutButton");
const currentDate = document.querySelector("#currentDate");
const currentTime = document.querySelector("#currentTime");
const moduleTabs = document.querySelectorAll(".module-tab");
const modulePanels = document.querySelectorAll(".module-panel");
const moduleLink = document.querySelector("#moduleLink");
const quickPartsForm = document.querySelector("#quickPartsForm");
const quickPartsSubmit = document.querySelector("#quickPartsSubmit");
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
const notesStorageKey = appSession.keys.notes;
const notesSnoozeStorageKey = appSession.keys.notesSnoozeUntil;
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
const productsStorageKey = "saleProducts";
const productCatalogForm = document.querySelector("#productCatalogForm");
const catalogProductNumberInput = document.querySelector("#catalogProductNumber");
const catalogProductNameInput = document.querySelector("#catalogProductName");
const catalogProductModelInput = document.querySelector("#catalogProductModel");
const catalogProductProviderPriceInput = document.querySelector("#catalogProductProviderPrice");
const catalogProductPriceInput = document.querySelector("#catalogProductPrice");
const catalogProductEstimatedProfitInput = document.querySelector("#catalogProductEstimatedProfit");
const catalogProductQuantityInput = document.querySelector("#catalogProductQuantity");
const submitProductCatalogButton = document.querySelector("#submitProductCatalog");
const productCatalogHint = document.querySelector("#productCatalogHint");
const productCatalogList = document.querySelector("#productCatalogList");
const salesForm = document.querySelector("#salesForm");
const saleNumberInput = document.querySelector("#saleNumber");
const saleQuantityInput = document.querySelector("#saleQuantity");
const saleProductInput = document.querySelector("#saleProduct");
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
const contactsStorageKey = "customerContacts";
const repairBrandsStorageKey = "inventoryRepairBrands";
const repairModelsStorageKey = "inventoryRepairModels";
const repairTypesStorageKey = "inventoryRepairTypes";
const repairsForm = document.querySelector("#repairsForm");
const repairNumberInput = document.querySelector("#repairNumber");
const repairCreatedAtInput = document.querySelector("#repairCreatedAt");
const repairCustomerInput = document.querySelector("#repairCustomer");
const repairPhoneInput = document.querySelector("#repairPhone");
const repairEmailInput = document.querySelector("#repairEmail");
const repairBrandInput = document.querySelector("#repairBrand");
const repairBrandOptions = document.querySelector("#repairBrandOptions");
const repairModelInput = document.querySelector("#repairModel");
const repairModelOptions = document.querySelector("#repairModelOptions");
const repairTypeInput = document.querySelector("#repairType");
const repairTypeOptions = document.querySelector("#repairTypeOptions");
const repairPriceInput = document.querySelector("#repairPrice");
const repairAbonoInput = document.querySelector("#repairAbono");
const repairStatusInput = document.querySelector("#repairStatus");
const repairDeliveredAtInput = document.querySelector("#repairDeliveredAt");
const repairsHint = document.querySelector("#repairsHint");
const repairsCount = document.querySelector("#repairsCount");
const repairsList = document.querySelector("#repairsList");
const importRepairsDatabaseButton = document.querySelector("#importRepairsDatabase");
const contactsForm = document.querySelector("#contactsForm");
const contactNameInput = document.querySelector("#contactName");
const contactPhoneInput = document.querySelector("#contactPhone");
const contactEmailInput = document.querySelector("#contactEmail");
const contactNotesInput = document.querySelector("#contactNotes");
const submitContactButton = document.querySelector("#submitContact");
const saveContactToGoogleButton = document.querySelector("#saveContactToGoogle");
const connectGoogleContactsButton = document.querySelector("#connectGoogleContacts");
const importGoogleContactsButton = document.querySelector("#importGoogleContacts");
const contactSearchInput = document.querySelector("#contactSearch");
const contactRepairOptions = document.querySelector("#contactRepairOptions");
const contactsHint = document.querySelector("#contactsHint");
const contactsCount = document.querySelector("#contactsCount");
const contactsList = document.querySelector("#contactsList");
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
const statisticsSectionButtons = document.querySelectorAll("[data-statistics-section]");
const saleConfirmOverlay = document.querySelector("#saleConfirmOverlay");
const saleConfirmList = document.querySelector("#saleConfirmList");
const editSaleButton = document.querySelector("#editSaleButton");
const printSaleInvoiceButton = document.querySelector("#printSaleInvoiceButton");
const confirmSaleButton = document.querySelector("#confirmSaleButton");
const saleCustomerOverlay = document.querySelector("#saleCustomerOverlay");
const saleCustomerForm = document.querySelector("#saleCustomerForm");
const saleCustomerNameInput = document.querySelector("#saleCustomerName");
const cancelSaleCustomerButton = document.querySelector("#cancelSaleCustomer");
const adminVoidOverlay = document.querySelector("#adminVoidOverlay");
const adminVoidForm = document.querySelector("#adminVoidForm");
const adminVoidTitle = document.querySelector("#adminVoidTitle");
const voidAdminUser = document.querySelector("#voidAdminUser");
const voidAdminPassword = document.querySelector("#voidAdminPassword");
const adminVoidHint = document.querySelector("#adminVoidHint");
const cancelVoidButton = document.querySelector("#cancelVoidButton");
const adminVoidSubmitButton = document.querySelector("#adminVoidSubmitButton");
const databaseSummary = document.querySelector("#databaseSummary");
const databaseList = document.querySelector("#databaseList");
const usersForm = document.querySelector("#usersForm");
const usersList = document.querySelector("#usersList");
const usersSummary = document.querySelector("#usersSummary");
const usersRoleSummary = document.querySelector("#usersRoleSummary");
const usersHint = document.querySelector("#usersHint");
const managedNameInput = document.querySelector("#managedName");
const managedUsernameInput = document.querySelector("#managedUsername");
const managedPasswordInput = document.querySelector("#managedPassword");
const managedRoleInput = document.querySelector("#managedRole");
const submitUserButton = document.querySelector("#submitUser");
const userPermissionGrid = document.querySelector("#userPermissionGrid");
const permissionRoleSummary = document.querySelector("#permissionRoleSummary");
const resetRolePermissionsButton = document.querySelector("#resetRolePermissions");
let repairExcelDatabasePromise = null;
let pendingSale = null;
let pendingSaleIsSaved = false;
let pendingInvoiceSale = null;
let pendingVoidSaleId = null;
let pendingAdminAction = null;
let pendingEditApproval = null;
let lastVoidedSale = null;
let undoTimerId = null;
let sideRepairSearchTimer = null;
let contactSearchTimer = null;
let contactRepairSearchTimer = null;
let repairContactSuggestions = [];
let salesCloudMigrationDone = false;
let currentUser = null;
let managedUsersCache = [];
let googleContactsAccessToken = "";
let partsCloudMigrationDone = false;
let presenceTimer = null;
let activeStatisticsPeriod = "month";
let activeStatisticsSection = "";
let statisticsRenderRequestId = 0;
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

function getFriendlyErrorMessage(error) {
  const message = String(error?.message || error || "No se pudo completar la operacion.");
  if (message.toLowerCase().includes("root puede gestionar usuarios")) {
    return "solo root puede gestionar usuarios";
  }
  if (
    message.includes("Usuario y contrasena incorrectos") ||
    message.includes("Usuario o contrasena incorrectos")
  ) {
    return "Usuario y contrasena incorrectos.";
  }
  return message
    .replace(/^.*Uncaught Error:\s*/s, "")
    .replace(/\s+at handler[\s\S]*$/s, "")
    .trim() || "No se pudo completar la operacion.";
}

async function loadManagedUsers() {
  if (window.repairCloud?.isConfigured()) {
    const sessionToken = getSavedSessionToken();
    if (sessionToken) {
      const cloudUsers = await window.repairCloud.listUsers(sessionToken);
      managedUsersCache = cloudUsers.map((user) => ({ ...user, password: "" }));
      return managedUsersCache;
    }
  }

  managedUsersCache = loadUsers();
  return managedUsersCache;
}

async function verifyPrivilegedCredentials(username, password) {
  const cleanUsername = String(username || "").trim();
  const normalizedUsername = cleanUsername.toLowerCase();
  if (!cleanUsername || !password) return null;

  if (window.repairCloud?.isConfigured()) {
    const isAuthorized = await window.repairCloud.verifyAdmin(cleanUsername, password);
    if (!isAuthorized) return null;
    let users = managedUsersCache;
    try {
      users = await loadManagedUsers();
    } catch {
      users = managedUsersCache;
    }
    const cloudUser = users.find((user) => String(user.username || "").toLowerCase() === normalizedUsername);
    return {
      username: cloudUser?.username || cleanUsername,
      name: cloudUser?.name || cleanUsername,
      role: cloudUser?.role || "admin",
    };
  }

  const localUser = loadUsers().find((user) =>
    String(user.username || "").toLowerCase() === normalizedUsername &&
    user.password === password &&
    ["root", "admin"].includes(user.role)
  );
  return localUser ? { username: localUser.username, name: localUser.name || localUser.username, role: localUser.role } : null;
}

function createApprovalRecord(type, approver, target = {}) {
  return {
    type,
    approvedBy: approver?.username || "",
    approvedByName: approver?.name || approver?.username || "Administrador",
    approverRole: approver?.role || "",
    requestedBy: currentUser?.username || "",
    requestedByName: currentUser?.name || currentUser?.username || "Usuario",
    approvedAt: new Date().toISOString(),
    ...target,
  };
}

function getSavedSessionToken() {
  return appSession.getToken();
}

function saveCurrentUser(user) {
  appSession.saveUser(user);
}

function resetLoginLayout() {
  document.body.classList.remove("left-panel-active", "statistics-active", "users-active", "entry-panel-active");
  if (accessCard) accessCard.hidden = false;
  if (sideRepairsPanel) sideRepairsPanel.hidden = true;
  if (sideUsersPanel) sideUsersPanel.hidden = true;
  sessionPanel.classList.remove("control-panel-wide");
}

function showLoggedOutView(message) {
  appSession.clear();
  currentUser = null;
  stopPresenceUpdates();
  sessionPanel.hidden = true;
  loginForm.hidden = false;
  if (logoutButton) logoutButton.hidden = true;
  resetLoginLayout();
  credentialHint.textContent = message;
}

function finishSessionRestore() {
  document.documentElement.classList.remove("session-restoring");
}

function getSavedAuthMode() {
  return appSession.getAuthMode();
}

function getSavedActiveModule() {
  return localStorage.getItem(activeModuleStorageKey) || "permissions";
}

function saveActiveModule(moduleName) {
  localStorage.setItem(activeModuleStorageKey, moduleName);
}

function getRoleProfile(role) {
  return appPermissions.getRoleProfile(role);
}

function getUserModules(user) {
  return appPermissions.getUserModules(user);
}

function canAccessModule(moduleName) {
  return appPermissions.canAccess(currentUser, moduleName);
}

function canManageParts() {
  return appPermissions.canManageParts(currentUser);
}

function canViewPartCost() {
  return appPermissions.canViewPartCost(currentUser);
}

function canViewPartCustomerPrice() {
  return appPermissions.canViewPartCustomerPrice(currentUser);
}

function canManageProducts() {
  return canAccessModule("sales") && canAccessModule("products") && ["root", "admin"].includes(currentUser?.role);
}

function canEditProductCatalog() {
  return canManageProducts() && canViewPartCost();
}

function getUserAccountStatus(user = {}) {
  if (user.active === false) return "disabled";
  return user.accountStatus || "active";
}

function getUserAccountStatusLabel(user = {}) {
  const status = getUserAccountStatus(user);
  if (status === "disabled") return "Inhabilitado";
  if (status === "pending_root") return "Pendiente de root";
  if (status === "locked") return "Bloqueado";
  if (user.mustChangePassword) return "Clave temporal";
  return "Activo";
}

function validateLocalPasswordPolicy(password) {
  const value = String(password || "");
  if (value.length < 8) return "La contrasena debe tener minimo 8 caracteres.";
  if (!/[a-z]/.test(value)) return "La contrasena debe incluir una minuscula.";
  if (!/[A-Z]/.test(value)) return "La contrasena debe incluir una mayuscula.";
  if (!/[0-9]/.test(value)) return "La contrasena debe incluir un numero.";
  if (!/[^A-Za-z0-9]/.test(value)) return "La contrasena debe incluir un simbolo.";
  return "";
}

async function endSessionForPasswordChange(message) {
  stopPresenceUpdates();
  await appSession.logout();
  currentUser = null;
  sessionPanel.hidden = true;
  loginForm.hidden = false;
  if (logoutButton) logoutButton.hidden = true;
  closeLogoutConfirmation();
  closeNotesPanel();
  renderNotes();
  resetLoginLayout();
  credentialHint.textContent = message;
}

async function requestPasswordChangeIfNeeded(user) {
  if (!user?.mustChangePassword || !window.repairCloud?.isConfigured()) return;
  const sessionToken = getSavedSessionToken();
  if (!sessionToken) return;

  credentialHint.textContent = "Debes cambiar la contrasena temporal para continuar.";
  const currentPassword = prompt("Escribe tu contrasena temporal actual:");
  if (currentPassword === null) {
    await endSessionForPasswordChange("Debes cambiar la contrasena temporal antes de trabajar.");
    return;
  }
  const newPassword = prompt("Escribe una nueva contrasena empresarial (minimo 8, mayuscula, minuscula, numero y simbolo):");
  if (newPassword === null) {
    await endSessionForPasswordChange("Debes cambiar la contrasena temporal antes de trabajar.");
    return;
  }
  const policyError = validateLocalPasswordPolicy(newPassword);
  if (policyError) {
    await endSessionForPasswordChange(policyError);
    return;
  }
  const repeatedPassword = prompt("Confirma la nueva contrasena:");
  if (repeatedPassword === null) {
    await endSessionForPasswordChange("Debes confirmar la nueva contrasena antes de trabajar.");
    return;
  }
  if (newPassword !== repeatedPassword) {
    await endSessionForPasswordChange("Las contrasenas no coinciden. Inicia sesion e intenta de nuevo.");
    return;
  }

  try {
    await window.repairCloud.changeOwnPassword(sessionToken, currentPassword, newPassword);
    currentUser.mustChangePassword = false;
    saveCurrentUser(currentUser);
    credentialHint.textContent = "Contrasena actualizada correctamente.";
    if (currentUser.role === "activador") {
      window.location.replace("repuestos.html");
    }
  } catch (error) {
    await endSessionForPasswordChange(getFriendlyErrorMessage(error));
  }
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
  const localUser = loadUsers().find((item) =>
    item.id === user.id || item.username?.toLowerCase() === user.username?.toLowerCase()
  );
  currentUser = { ...(localUser || {}), ...user };
  saveCurrentUser(currentUser);
  if (currentUser.role === "activador" && !currentUser.mustChangePassword) {
    window.location.replace("repuestos.html");
    return;
  }
  migrateLegacyNoteAuthors(currentUser);
  const roleProfile = getRoleProfile(currentUser.role);
  welcomeTitle.textContent = `Bienvenido, ${currentUser.name}`;
  accessSummary.textContent = `${roleProfile.label} - ${roleProfile.access}`;
  permissionList.innerHTML = getUserModules(currentUser).map((moduleName) =>
    `<li>${moduleLabels[moduleName] || moduleName}</li>`
  ).join("");
  loginForm.hidden = true;
  sessionPanel.hidden = false;
  if (logoutButton) logoutButton.hidden = false;
  credentialHint.textContent = message;
  setModule(getSavedActiveModule());
  renderQuickParts();
  renderProducts();
  renderSales();
  renderRepairs();
  renderDatabase();
  renderUsers();
  renderNotes();
  handlePendingRepairEdit();
  startPresenceUpdates();
  setTimeout(() => requestPasswordChangeIfNeeded(currentUser), 120);
}

function openLogoutConfirmation() {
  if (!currentUser) return;
  if (!logoutConfirmOverlay || !confirmLogoutButton) return;
  logoutConfirmOverlay.hidden = false;
  confirmLogoutButton.focus();
}

function closeLogoutConfirmation() {
  if (!logoutConfirmOverlay) return;
  logoutConfirmOverlay.hidden = true;
}

async function performLogout() {
  stopPresenceUpdates();
  const { remoteError } = await appSession.logout();
  if (remoteError) credentialHint.textContent = remoteError.message;
  currentUser = null;
  sessionPanel.hidden = true;
  loginForm.hidden = false;
  if (logoutButton) logoutButton.hidden = true;
  closeLogoutConfirmation();
  closeNotesPanel();
  renderNotes();
  resetLoginLayout();
}

async function signIn(username, password) {
  return await appSession.signIn(username, password, loadUsers());
}

async function restoreSession() {
  try {
    const restored = await appSession.restore();
    if (restored.status === "authenticated") {
      applyAuthenticatedUser(restored.user, restored.source === "convex" ? "Sesion recuperada desde internet." : "Restaurando sesion...");
    } else if (restored.status === "reauth-required") {
      showLoggedOutView("Ahora hay conexion con Convex. Tu sesion anterior fue local; vuelve a iniciar sesion para validarla en Convex.");
    } else if (restored.status === "expired") {
      showLoggedOutView("Tu sesion expiro. Inicia sesion nuevamente.");
    } else {
      showLoggedOutView(restored.source === "local" ? "Modo local | Inicia sesion con tu usuario." : "Modo Convex | Inicia sesion con tu usuario.");
    }
  } catch (error) {
    showLoggedOutView(getFriendlyErrorMessage(error));
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
  const authMode = window.repairCloud?.isConfigured() ? "Modo Convex" : "Modo local";
  credentialHint.textContent = `${authMode} | Ingresa con tu usuario interno autorizado.`;
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

function formatCurrencyCents(cents) {
  return formatCurrency(centsToMoney(cents));
}

function getPartStock(part) {
  return normalizeStockQuantity(part?.stock);
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
  renderQuickPartTypeOptions();
  renderQuickBrandOptions();
  renderQuickModelOptions();
  renderQuickSupplierOptions();
  renderQuickCategoryOptions();
  renderQuickParts();

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
  return appNotes.load();
}

function saveNotes(notes) {
  appNotes.save(notes);
}

function migrateLegacyNoteAuthors(user) {
  appNotes.migrateAuthors(user);
}

function normalizeNoteForCloud(note, user = currentUser) {
  return appNotes.normalizeForCloud(note, user);
}

async function loadNotesFromSource() {
  return await appNotes.loadFromSource(currentUser);
}

function isPendingAlertSnoozed() {
  return appNotes.isSnoozed();
}

function snoozeNotesAlert() {
  appNotes.snooze();
  renderNotes();
}

function loadSales() {
  const savedSales = localStorage.getItem(salesStorageKey);
  return savedSales ? JSON.parse(savedSales) : [];
}

function saveSales(sales) {
  localStorage.setItem(salesStorageKey, JSON.stringify(sales));
}

function getSaleRecordId(sale) {
  return sale?._id || sale?.id || sale?.sourceId || "";
}

function normalizeSaleForCloud(sale) {
  return {
    sourceId: sale.sourceId || sale.id,
    saleNumber: Number(sale.saleNumber) || 0,
    productId: sale.productId || "",
    product: sale.product || "Producto",
    productModel: sale.productModel || "",
    customerName: sale.customerName || "",
    quantity: Number(sale.quantity) || 0,
    price: Number(sale.price) || 0,
    discount: Number(sale.discount) || 0,
    total: Number(sale.total) || 0,
    received: Number(sale.received) || 0,
    change: Number(sale.change) || 0,
    createdAt: sale.createdAt || new Date().toISOString(),
  };
}

async function loadSalesFromSource(limit = 500) {
  if (window.repairCloud?.isConfigured()) {
    if (!salesCloudMigrationDone) {
      const localSales = loadSales().filter((sale) => !sale._id);
      for (const sale of localSales) {
        await window.repairCloud.createSale(normalizeSaleForCloud(sale));
      }
      salesCloudMigrationDone = true;
    }
    const sales = await window.repairCloud.listSales(limit);
    saveSales(sales);
    return sales;
  }
  return loadSales();
}

async function saveSaleToSource(sale) {
  if (window.repairCloud?.isConfigured()) {
    const id = await window.repairCloud.createSale(normalizeSaleForCloud(sale));
    return { ...sale, _id: id };
  }
  const sales = loadSales();
  sales.unshift(sale);
  saveSales(sales);
  return sale;
}

async function removeSaleFromSource(sale) {
  const saleId = getSaleRecordId(sale);
  if (window.repairCloud?.isConfigured() && sale._id) {
    await window.repairCloud.removeSale(sale._id);
    return;
  }
  saveSales(loadSales().filter((item) => getSaleRecordId(item) !== saleId));
}

async function updateSaleInSource(sale, patch) {
  const saleId = getSaleRecordId(sale);
  const nextSale = { ...sale, ...patch };
  if (window.repairCloud?.isConfigured() && sale._id) {
    await window.repairCloud.updateSale(sale._id, patch);
  }
  saveSales(loadSales().map((item) =>
    getSaleRecordId(item) === saleId ? { ...item, ...patch } : item,
  ));
  return nextSale;
}

function loadProducts() {
  const savedProducts = localStorage.getItem(productsStorageKey);
  return savedProducts ? JSON.parse(savedProducts) : [];
}

function saveProducts(products) {
  localStorage.setItem(productsStorageKey, JSON.stringify(products));
}

function getProductRecordId(product) {
  return product?._id || product?.id || product?.sourceId || "";
}

function normalizeProductForCloud(product) {
  const now = new Date().toISOString();
  return {
    sourceId: product.sourceId || product.id,
    productNumber: Number(product.productNumber) || 0,
    name: product.name || "Sin nombre",
    exactModel: product.exactModel || "",
    providerPrice: Number(product.providerPrice) || 0,
    price: Number(product.price) || 0,
    quantity: Math.max(0, Number(product.quantity) || 0),
    active: product.active !== false,
    createdAt: product.createdAt || now,
    updatedAt: product.updatedAt || now,
  };
}

async function loadProductsFromSource() {
  if (window.repairCloud?.isConfigured()) {
    const products = await window.repairCloud.listProducts();
    saveProducts(products);
    return products;
  }
  return loadProducts();
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

function getRecentRepairs(repairs, limit = 50) {
  return [...repairs]
    .sort((a, b) => {
      const dateDiff = new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      if (dateDiff) return dateDiff;
      return (Number(b.repairNumber) || 0) - (Number(a.repairNumber) || 0);
    })
    .slice(0, limit);
}

async function loadRepairsFromSource(limit = 50, search = "") {
  if (window.repairCloud?.isConfigured()) {
    const repairs = await window.repairCloud.listRepairs({ limit, search });
    if (!search) saveRepairs(repairs);
    return repairs;
  }

  const repairs = loadRepairs();
  const term = normalizeSearch(search.trim());
  if (!term) return getRecentRepairs(repairs, limit);

  return repairs.filter((repair) =>
    [repair.customer, repair.deviceType, repair.brand, repair.model, repair.repairType, repair.status, repair.notes, repair.repairNumber]
      .some((field) => normalizeSearch(field).includes(term)),
  ).slice(0, limit);
}

function saveRepairs(repairs) {
  localStorage.setItem(repairsStorageKey, JSON.stringify(repairs));
}

function loadContacts() {
  const savedContacts = localStorage.getItem(contactsStorageKey);
  return savedContacts ? JSON.parse(savedContacts) : [];
}

function saveContacts(contacts) {
  localStorage.setItem(contactsStorageKey, JSON.stringify(contacts));
}

function normalizePhoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function getContactRecordId(contact) {
  return contact?._id || contact?.id || contact?.sourceId || "";
}

function normalizeContactForCloud(contact) {
  const now = new Date().toISOString();
  return {
    sourceId: contact.sourceId || contact.id,
    googleResourceName: contact.googleResourceName || undefined,
    name: contact.name || "Sin nombre",
    phone: contact.phone || "",
    email: contact.email || "",
    notes: contact.notes || "",
    createdAt: contact.createdAt || now,
    updatedAt: contact.updatedAt || now,
  };
}

function getRepairContactKey(repair) {
  return normalizePhoneDigits(repair.phone) || normalizeSearch(repair.customer);
}

function buildRepairContactSuggestions(repairs) {
  const suggestionsByKey = new Map();

  for (const repair of repairs) {
    const name = String(repair.customer || "").trim();
    const key = getRepairContactKey(repair);
    if (!name || !key || suggestionsByKey.has(key)) continue;

    suggestionsByKey.set(key, {
      name,
      phone: String(repair.phone || "").trim(),
      email: String(repair.email || "").trim(),
      notes: [
        repair.repairNumber ? `Cliente de reparacion #${repair.repairNumber}` : "Cliente de reparaciones",
        [repair.brand, repair.model].filter(Boolean).join(" "),
        repair.repairType,
      ].filter(Boolean).join(" | "),
    });
  }

  return [...suggestionsByKey.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function renderRepairContactSuggestions(suggestions) {
  repairContactSuggestions = suggestions;
  if (!contactRepairOptions) return;
  contactRepairOptions.innerHTML = suggestions.slice(0, 40).map((contact) => {
    const label = [contact.phone, contact.email].filter(Boolean).join(" | ");
    return `<option value="${escapeHtml(contact.name)}" label="${escapeHtml(label)}"></option>`;
  }).join("");
}

async function refreshRepairContactSuggestions(search = "") {
  const term = search.trim();
  if (term.length < 2) {
    renderRepairContactSuggestions([]);
    return;
  }

  try {
    const repairs = await loadRepairsFromSource(10000, term);
    renderRepairContactSuggestions(buildRepairContactSuggestions(repairs));
  } catch {
    renderRepairContactSuggestions(buildRepairContactSuggestions(loadRepairs()));
  }
}

function applySelectedRepairContact() {
  const typedName = normalizeSearch(contactNameInput.value);
  const selected = repairContactSuggestions.find((contact) => normalizeSearch(contact.name) === typedName);
  if (!selected) return;

  if (!contactPhoneInput.value.trim()) contactPhoneInput.value = selected.phone;
  if (!contactEmailInput.value.trim()) contactEmailInput.value = selected.email;
  if (!contactNotesInput.value.trim()) contactNotesInput.value = selected.notes;
}

function isValidEmailFormat(value) {
  const email = String(value || "").trim();
  return !email || email.includes("@");
}

function validateEmailInput(input, hintElement) {
  if (!input) return true;
  const isValid = isValidEmailFormat(input.value);
  input.setCustomValidity(isValid ? "" : "formato incorrecto");
  if (!isValid && hintElement) hintElement.textContent = "formato incorrecto";
  return isValid;
}

async function loadContactsFromSource(search = "") {
  let contacts = [];

  if (window.repairCloud?.isConfigured()) {
    contacts = await window.repairCloud.listContacts();
    saveContacts(contacts);
  } else {
    contacts = loadContacts();
  }

  const term = normalizeSearch(search.trim());
  if (!term) return contacts;

  return contacts.filter((contact) =>
    [contact.name, contact.phone, contact.email, contact.notes]
      .some((field) => normalizeSearch(field).includes(term)),
  );
}

function normalizeRepairForCloud(repair) {
  return {
    sourceId: repair.sourceId || repair.id,
    repairNumber: Number(repair.repairNumber) || 0,
    customer: repair.customer || "Sin nombre",
    deviceType: repair.deviceType || "Telefono",
    phone: repair.phone || "",
    email: repair.email || "",
    brand: repair.brand || "",
    model: repair.model || "Sin modelo",
    repairType: repair.repairType || "Reparacion",
    status: repair.status || "En proceso",
    createdAt: repair.createdAt || new Date().toISOString(),
    deliveredAt: repair.deliveredAt || "",
    repairPrice: Number(repair.repairPrice) || 0,
    abono: Number(repair.abono) || 0,
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

function formatInvoiceDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

function getRepairInvoiceType(repair) {
  const type = normalizeSearch(repair.repairType || "");
  const checks = [
    { label: "CAMBIO DE PANTALLA", checked: type.includes("pantalla") },
    { label: "NO ENCIENDE", checked: type.includes("enciende") },
    { label: "PROBLEMA DE SENAL", checked: type.includes("senal") || type.includes("senal") },
    { label: "CAMB. DE JACK DE CARGA", checked: type.includes("carga") || type.includes("jack") },
    { label: "MOJADO", checked: type.includes("mojado") || type.includes("agua") },
    { label: "ACTIVACION", checked: type.includes("activacion") },
    { label: "LIBERACION", checked: type.includes("liberacion") },
    { label: "CONF. INICIAL", checked: type.includes("conf") || type.includes("configuracion") || type.includes("inicial") },
    { label: "CAMBIO DE SOFTWARE", checked: type.includes("software") },
  ];
  if (!checks.some((item) => item.checked) && repair.repairType) {
    checks.push({ label: String(repair.repairType).toUpperCase(), checked: true });
  }
  return checks;
}

function buildRepairInvoiceHtml(repair, options = {}) {
  const total = Number(repair.repairPrice) || 0;
  const abono = Math.max(0, Number(repair.abono) || 0);
  const resta = Math.max(0, total - abono);
  const date = formatInvoiceDate(repair.createdAt);
  const orderNumber = String(repair.repairNumber || "").padStart(4, "0");
  const showCanceledStamp = normalizeSearch(repair.status || "") === "listo";
  const shouldRecordInvoice = options.recordOnPrint !== false;
  const technicianName = repair.technicianName || currentUser?.name || currentUser?.username || "";
  const invoicePayload = {
    repairId: getRepairRecordId(repair),
    repairNumber: Number(repair.repairNumber) || 0,
    customer: repair.customer || "",
    phone: repair.phone || "",
    email: repair.email || "",
    brand: repair.brand || "",
    model: repair.model || "",
    repairType: repair.repairType || "",
    status: repair.status || "",
    total,
    abono,
    resta,
  };
  const invoicePayloadJson = JSON.stringify(invoicePayload).replace(/</g, "\\u003c");
  const checks = getRepairInvoiceType(repair);
  const leftChecks = checks.slice(0, Math.ceil(checks.length / 2));
  const rightChecks = checks.slice(Math.ceil(checks.length / 2));
  const renderChecks = (items) => items.map((item) => `
    <div class="check-row">
      <span data-template-lock="true">${escapeHtml(item.label)}</span>
      <b contenteditable="true">${item.checked ? "X" : ""}</b>
    </div>
  `).join("");

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Orden ${escapeHtml(orderNumber)} | Dr. Movil</title>
  <style>
    @page { size: letter; margin: 6mm; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #eef1f4; color: #18245b; font-family: Arial, Helvetica, sans-serif; }
    .page { width: 184mm; margin: 0 auto; padding: 4mm; background: #fff; }
    .invoice { position: relative; border: 1.6px solid #18245b; border-radius: 9px; padding: 8px; }
    .toolbar { position: sticky; top: 0; z-index: 10; display: flex; gap: 10px; justify-content: center; padding: 10px; background: #eef1f4; }
    .toolbar button { min-height: 38px; padding: 0 14px; border: 0; border-radius: 8px; background: #18245b; color: #fff; font-weight: 800; cursor: pointer; }
    .toolbar span { align-self: center; color: #52626e; font-size: 12px; font-weight: 800; }
    [contenteditable="true"] { outline: 1px dashed transparent; outline-offset: 2px; border-radius: 4px; }
    [contenteditable="true"]:focus { outline-color: #b14248; background: #fff8d8; }
    .stamp { position: absolute; top: 42%; left: 50%; z-index: 4; transform: translate(-50%, -50%) rotate(-16deg); padding: 8px 20px; border: 5px solid #b4212d; border-radius: 8px; color: #b4212d; font-size: 38px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.82; pointer-events: none; }
    .top { display: grid; grid-template-columns: 1fr 62mm; gap: 10px; align-items: start; }
    .brand { font-size: 28px; font-weight: 800; letter-spacing: 0.02em; }
    .brand small { display: block; margin-left: 58px; font-size: 11px; font-weight: 800; line-height: 1; }
    .services { margin-top: 6px; font-size: 10.5px; font-weight: 800; line-height: 1.16; text-transform: uppercase; user-select: none; }
    .address { margin-top: 4px; font-size: 11.5px; font-weight: 800; line-height: 1.12; }
    .order { border: 1.6px solid #18245b; border-radius: 8px; overflow: hidden; text-align: center; }
    .order strong { display: block; padding: 5px; background: #18245b; color: #fff; font-size: 22px; letter-spacing: 0.04em; }
    .order span { display: block; padding: 10px 6px; color: #b14248; font-size: 22px; font-weight: 800; }
    .box { margin-top: 6px; border: 1.6px solid #18245b; border-radius: 8px; padding: 7px; }
    .line { display: grid; grid-template-columns: 29mm 1fr; gap: 5px; align-items: end; min-height: 24px; border-bottom: 1.4px solid #18245b; }
    .line.two { grid-template-columns: 21mm 1fr 23mm 1fr; }
    .line.long-label { grid-template-columns: 39mm 1fr; }
    .line.diagnosis-line { grid-template-columns: 33mm 1fr; }
    .label { font-size: 14.5px; font-weight: 800; }
    .diagnosis-line .label { white-space: nowrap; }
    .value { min-height: 19px; color: #111; font-size: 15.5px; font-weight: 700; }
    .checks { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .check-row { display: grid; grid-template-columns: 1fr 20mm; gap: 6px; align-items: center; min-height: 23px; font-size: 14.5px; font-weight: 800; }
    .check-row b { display: grid; min-height: 18px; place-items: center; border: 1.6px solid #18245b; color: #111; font-size: 14px; }
    .comments { margin-top: 6px; }
    .diagnosis { min-height: 0; padding-top: 24px; }
    .diagnosis-line { margin-top: 0; }
    .costs { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 12px; }
    .costs div { display: grid; grid-template-columns: auto 1fr; gap: 5px; align-items: end; border-bottom: 1.4px solid #18245b; }
    .costs span { font-size: 15px; font-weight: 800; }
    .costs b { color: #111; font-size: 16px; }
    .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 26px; text-align: center; font-weight: 800; }
    .signatures div { border-top: 1.6px solid #18245b; padding-top: 5px; }
    .notice { margin-top: 8px; padding: 6px; background: #18245b; color: #fff; font-size: 14.5px; font-weight: 800; line-height: 1.15; text-align: center; }
    .thanks { margin-top: 6px; text-align: center; font-family: Georgia, serif; font-size: 20px; font-style: italic; font-weight: 800; }
    .phone { text-align: center; font-size: 18px; font-weight: 900; }
    @media print {
      body { background: #fff; }
      .page { width: auto; min-height: auto; padding: 0; zoom: 0.96; }
      .no-print { display: none; }
      [contenteditable="true"]:focus { outline: none; background: transparent; }
    }
  </style>
</head>
<body data-invoice-version="invoice-layout-lock-4">
  <div class="toolbar no-print">
    <button type="button" id="printInvoiceButton">Imprimir / Guardar PDF</button>
    <span id="invoiceStatus"></span>
  </div>
  <div class="page">
    <div class="invoice">
      ${showCanceledStamp ? `<div class="stamp">Cancelado</div>` : ""}
      <section class="top">
        <div>
          <div class="brand" data-template-lock="true">Dr. Movil<small>Servicio<br />Tecnico</small></div>
          <div class="services" contenteditable="false" data-locked="true">Liberaciones de red de todas companias,<br />reparaciones de celulares, tablets y computadoras Windows/Apple,<br />software, actualizaciones de sistema y configuracion inicial.</div>
          <div class="address" data-template-lock="true">Bo. El Centro, Calle Gerardo, Frente a Cruz Roja,<br />Chinameca, San Miguel.</div>
        </div>
        <div class="order"><strong data-template-lock="true">ORDEN</strong><span data-template-lock="true">No. ${escapeHtml(orderNumber)}</span></div>
      </section>

      <section class="box">
        <div class="line"><span class="label" data-template-lock="true">FECHA:</span><span class="value" contenteditable="true">${escapeHtml(date)}</span></div>
        <div class="line"><span class="label" data-template-lock="true">CLIENTE:</span><span class="value" contenteditable="true">${escapeHtml(repair.customer || "")}</span></div>
        <div class="line"><span class="label" data-template-lock="true">ESN/IMEI:</span><span class="value" contenteditable="true"></span></div>
        <div class="line two"><span class="label" data-template-lock="true">MARCA:</span><span class="value" contenteditable="true">${escapeHtml(repair.brand || "")}</span><span class="label" data-template-lock="true">MODELO:</span><span class="value" contenteditable="true">${escapeHtml(repair.model || "")}</span></div>
        <div class="line long-label"><span class="label" data-template-lock="true">ACCESORIOS:</span><span class="value" contenteditable="true"></span></div>
        <div class="line"><span class="label" data-template-lock="true">TELEFONO:</span><span class="value" contenteditable="true">${escapeHtml(repair.phone || "")}</span></div>
        ${repair.email ? `<div class="line"><span class="label" data-template-lock="true">CORREO:</span><span class="value" contenteditable="true">${escapeHtml(repair.email)}</span></div>` : ""}
      </section>

      <section class="box">
        <div class="checks"><div>${renderChecks(leftChecks)}</div><div>${renderChecks(rightChecks)}</div></div>
        <div class="comments line long-label"><span class="label" data-template-lock="true">COMENTARIOS:</span><span class="value" contenteditable="true">${escapeHtml(repair.notes || "")}</span></div>
      </section>

      <section class="box diagnosis">
        <div class="line diagnosis-line"><span class="label" data-template-lock="true">DIAGNOSTICO:</span><span class="value" contenteditable="true">${escapeHtml(repair.repairType || "")}</span></div>
        <div class="costs">
          <div><span data-template-lock="true">Costo Total $</span><b contenteditable="true">${total.toFixed(2)}</b></div>
          <div><span data-template-lock="true">Abono $</span><b contenteditable="true">${abono.toFixed(2)}</b></div>
          <div><span data-template-lock="true">Resta $</span><b contenteditable="true">${resta.toFixed(2)}</b></div>
        </div>
        <div class="signatures"><div data-template-lock="true">Tecnico: ${escapeHtml(technicianName)}</div><div data-template-lock="true">Bajo Riesgo del Cliente</div></div>
      </section>

      <div class="notice" data-template-lock="true">No se entregaran Telefonos si no se presenta este Documento<br />No se responde por aparatos no retirados despues de 30 dias</div>
      <div class="thanks" data-template-lock="true">Gracias por Preferirnos</div>
      <div class="phone" data-template-lock="true">Tel.: ${repairInvoicePhone}</div>
    </div>
  </div>
  <script>
    const lockedServices = document.querySelector(".services");
    const invoicePayload = ${invoicePayloadJson};
    const shouldRecordInvoice = ${shouldRecordInvoice ? "true" : "false"};
    const printButton = document.querySelector("#printInvoiceButton");
    const invoiceStatus = document.querySelector("#invoiceStatus");
    if (!shouldRecordInvoice) invoiceStatus.textContent = "Factura lista.";
    const isTemplateLockedEvent = (event) => {
      const selection = window.getSelection();
      return event.target?.closest?.(".services") ||
        event.target?.closest?.("[data-template-lock='true']") ||
        lockedServices?.contains(selection?.anchorNode) ||
        lockedServices?.contains(selection?.focusNode) ||
        selection?.anchorNode?.parentElement?.closest?.("[data-template-lock='true']") ||
        selection?.focusNode?.parentElement?.closest?.("[data-template-lock='true']");
    };
    ["beforeinput", "keydown", "paste", "drop", "cut"].forEach((eventName) => {
      document.addEventListener(eventName, (event) => {
        if (!isTemplateLockedEvent(event)) return;
        event.preventDefault();
        window.getSelection()?.removeAllRanges?.();
      }, true);
    });
    printButton?.addEventListener("click", async () => {
      if (!shouldRecordInvoice) {
        window.print();
        return;
      }
      if (!window.__invoiceRecorded) {
        if (window.__invoiceRecording) return;
        window.__invoiceRecording = true;
        printButton.disabled = true;
        invoiceStatus.textContent = "Registrando emision...";
        try {
          if (!window.opener?.recordRepairInvoiceIssued) throw new Error("No se encontro la ventana principal.");
          await window.opener.recordRepairInvoiceIssued(invoicePayload);
          window.__invoiceRecorded = true;
          invoiceStatus.textContent = "Emision registrada.";
        } catch (error) {
          window.__invoiceRecording = false;
          printButton.disabled = false;
          invoiceStatus.textContent = error.message || "No se pudo registrar la emision.";
          return;
        }
      }
      printButton.disabled = false;
      window.print();
    });
  <\/script>
</body>
</html>`;
}

async function recordRepairInvoiceIssued(invoice) {
  const issuedAt = new Date().toISOString();
  if (window.repairCloud?.isConfigured()) {
    await window.repairCloud?.registrarAuditoria(
      "FACTURA_EMITIDA",
      `Factura emitida para reparacion #${invoice.repairNumber || ""}`,
      currentUser?.username,
      JSON.stringify({
        repairId: invoice.repairId || "",
        repairNumber: Number(invoice.repairNumber) || 0,
        total: Number(invoice.total) || 0,
        abono: Number(invoice.abono) || 0,
        resta: Number(invoice.resta) || Math.max(0, (Number(invoice.total) || 0) - (Number(invoice.abono) || 0)),
        issuedAt,
        issuedByUsername: currentUser?.username || "",
        issuedByName: currentUser?.name || currentUser?.username || "Usuario",
      }),
    );
  }
}

window.recordRepairInvoiceIssued = recordRepairInvoiceIssued;

function openRepairInvoice(repair) {
  const invoiceWindow = window.open("", "_blank");
  if (!invoiceWindow) {
    repairsHint.textContent = "Permite ventanas emergentes para generar la factura.";
    return;
  }
  invoiceWindow.document.open();
  invoiceWindow.document.write(buildRepairInvoiceHtml(repair));
  invoiceWindow.document.close();
}

function isToday(value) {
  const date = new Date(value);
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}

function renderQuickParts() {
  const canEditParts = canManageParts() && canViewPartCost() && canViewPartCustomerPrice();
  quickPartsForm.hidden = !canEditParts;
  quickPartsSubmit.hidden = !canEditParts;
  if (!canEditParts && canAccessModule("parts")) {
    quickPartsHint.textContent = canManageParts()
      ? "Este usuario no tiene permiso para capturar precios de repuestos."
      : "Tu rol solo permite consultar repuestos.";
  }
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
  const canUseNotes = Boolean(currentUser) && canAccessModule("notes");
  if (!canUseNotes) {
    notesToggle.hidden = true;
    notesBadge.hidden = true;
    pendingAlert.hidden = true;
    notesOverlay.hidden = true;
    return;
  }

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
  if (!currentUser || !canAccessModule("notes")) return;
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

function resetSaleDefaults() {
  saleQuantityInput.value = 1;
  saleDiscountInput.value = "0.00";
  salePriceInput.value = "";
  updateSaleTotals();
}

async function setNextSaleNumber() {
  try {
    const sales = await loadSalesFromSource(1000);
    saleNumberInput.value = sales.reduce((max, sale) => Math.max(max, Number(sale.saleNumber) || 0), 0) + 1;
  } catch {
    saleNumberInput.value = loadSales().reduce((max, sale) => Math.max(max, Number(sale.saleNumber) || 0), 0) + 1;
  }
}

function getNextProductNumber(products = loadProducts()) {
  return products.reduce((max, product) => Math.max(max, Number(product.productNumber) || 0), 0) + 1;
}

function resetProductCatalogForm(products = loadProducts()) {
  delete productCatalogForm.dataset.editingId;
  productCatalogForm.reset();
  catalogProductNumberInput.value = getNextProductNumber(products);
  updateCatalogEstimatedProfit();
  submitProductCatalogButton.textContent = "Guardar producto";
}

function updateCatalogEstimatedProfit() {
  if (!catalogProductEstimatedProfitInput) return;
  if (!canViewPartCost()) {
    catalogProductEstimatedProfitInput.value = "••••";
    return;
  }
  const providerPrice = Number(catalogProductProviderPriceInput?.value) || 0;
  const salePrice = Number(catalogProductPriceInput?.value) || 0;
  catalogProductEstimatedProfitInput.value = formatCurrency(salePrice - providerPrice);
}

function getSelectedSaleProduct(products = loadProducts()) {
  const productId = saleProductInput?.value || "";
  return products.find((product) => getProductRecordId(product) === productId);
}

function applySelectedSaleProduct(products = loadProducts()) {
  const product = getSelectedSaleProduct(products);
  salePriceInput.value = product ? (Number(product.price) || 0).toFixed(2) : "";
  updateSaleTotals();
}

function renderProductCatalog(products) {
  const activeProducts = products.filter((product) => product.active !== false);
  const canEditProducts = canEditProductCatalog();
  productCatalogForm.hidden = !canEditProducts;
  saleProductInput.innerHTML = [
    `<option value="">Selecciona producto</option>`,
    ...activeProducts.map((product) =>
      `<option value="${escapeHtml(getProductRecordId(product))}">#${escapeHtml(product.productNumber || "")} ${escapeHtml(product.name)} ${escapeHtml(product.exactModel || "")} - ${formatCurrency(Number(product.price) || 0)} (${Number(product.quantity) || 0})</option>`,
    ),
  ].join("");
  catalogProductNumberInput.value = getNextProductNumber(products);

  if (!activeProducts.length) {
    productCatalogList.innerHTML = `<p class="hint">Todavia no hay productos guardados.</p>`;
    salePriceInput.value = "";
    updateSaleTotals();
    return;
  }

  productCatalogList.innerHTML = activeProducts.slice(0, 8).map((product) => `
    <article class="compact-part-item product-catalog-item">
      <strong>#${escapeHtml(product.productNumber || "")} ${escapeHtml(product.name)}</strong>
      <span>${escapeHtml(product.exactModel || "Sin modelo")} | ${canViewPartCost() ? `Proveedor ${formatCurrency(Number(product.providerPrice) || 0)} | ` : ""}Precio ${formatCurrency(Number(product.price) || 0)} | Cant. ${Number(product.quantity) || 0}</span>
      ${canEditProducts ? `<div class="table-action-icons">
        <button class="edit-button icon-action-button icon-edit-button" type="button" data-edit-product-id="${escapeHtml(getProductRecordId(product))}" aria-label="Editar ${escapeHtml(product.name)}" title="Editar">Editar</button>
        <button class="delete-button icon-action-button icon-delete-button" type="button" data-delete-product-id="${escapeHtml(getProductRecordId(product))}" aria-label="Eliminar ${escapeHtml(product.name)}" title="Eliminar">Eliminar</button>
      </div>` : ""}
    </article>
  `).join("");
  applySelectedSaleProduct(activeProducts);
}

async function renderProducts() {
  try {
    const products = await loadProductsFromSource();
    renderProductCatalog(products);
    const activeCount = products.filter((product) => product.active !== false).length;
    productCatalogHint.textContent = canEditProductCatalog()
      ? `${activeCount} producto${activeCount === 1 ? "" : "s"} disponible${activeCount === 1 ? "" : "s"}.`
      : canManageProducts()
        ? "Tu rol puede consultar el catalogo, pero no ver ni editar costos internos."
        : "Tu rol puede vender con productos guardados, pero no editar el catalogo.";
  } catch (error) {
    renderProductCatalog(loadProducts());
    productCatalogHint.textContent = `No se pudo consultar Convex: ${error.message}`;
  }
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

async function renderSales() {
  let sales = [];
  try {
    sales = await loadSalesFromSource(500);
  } catch (error) {
    sales = loadSales();
    salesHint.textContent = `No se pudo consultar ventas en Convex: ${error.message}`;
  }
  const dailySales = sales.filter((sale) => isToday(sale.createdAt));
  const dailyTotal = dailySales.reduce((sum, sale) => sum + sale.total, 0);
  dailySalesTotal.textContent = formatCurrency(dailyTotal);
  dailySalesCount.textContent = `${dailySales.length} venta${dailySales.length === 1 ? "" : "s"}`;
  if (!dailySales.length) {
    salesList.innerHTML = `<p class="hint">Todavia no hay ventas registradas hoy.</p>`;
    return;
  }
  salesList.innerHTML = dailySales.map((sale) => {
    const { date, time } = formatSaleDateTime(sale.createdAt);
    const saleId = getSaleRecordId(sale);
    return `
      <article class="compact-part-item sale-item">
        <div class="sale-item-heading">
          <strong>Venta #${sale.saleNumber} - ${escapeHtml(sale.product)} ${sale.productModel ? escapeHtml(sale.productModel) : ""}</strong>
          <div class="table-action-icons sale-action-icons">
            <button class="edit-button icon-action-button icon-edit-button" type="button" data-edit-sale-id="${escapeHtml(saleId)}" aria-label="Editar venta #${escapeHtml(sale.saleNumber || "")}" title="Editar">Editar</button>
            <button class="secondary-button icon-action-button icon-invoice-button sale-invoice-button" type="button" data-print-sale-id="${escapeHtml(saleId)}" aria-label="Imprimir factura de venta #${escapeHtml(sale.saleNumber || "")}" title="Factura">Factura</button>
            <button class="delete-button icon-action-button icon-delete-button void-sale-button" type="button" data-id="${escapeHtml(saleId)}" aria-label="Borrar venta #${escapeHtml(sale.saleNumber || "")}" title="Borrar">Borrar</button>
          </div>
        </div>
        <span>${date} | ${time}</span>
        <span>${sale.quantity} pza(s) x ${formatCurrency(sale.price)} | Desc. ${formatCurrency(sale.discount)} | Total ${formatCurrency(sale.total)}</span>
        <span>Recibido ${formatCurrency(sale.received)} | Vuelto ${formatCurrency(sale.change)}</span>
      </article>
    `;
  }).join("");
}

function renderRepairsList(repairs) {
  if (repairsCount) repairsCount.textContent = `${repairs.length} registro${repairs.length === 1 ? "" : "s"}`;
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
            <button class="edit-button icon-action-button icon-invoice-button" type="button" data-invoice-repair-id="${escapeHtml(repairId)}" aria-label="Generar factura de reparacion #${escapeHtml(repair.repairNumber || "")}" title="Factura">Factura</button>
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
        ${repair.email ? `<span>Correo ${escapeHtml(repair.email)}</span>` : ""}
        <span>Precio ${formatCurrency(Number(repair.repairPrice) || 0)} | Abono ${formatCurrency(Number(repair.abono) || 0)} | Resta ${formatCurrency(Math.max(0, (Number(repair.repairPrice) || 0) - (Number(repair.abono) || 0)))}</span>
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
    renderRepairsList(getRecentRepairs(loadRepairs(), 50));
  }

  try {
    repairs = await loadRepairsFromSource(50);
  } catch (error) {
    if (repairsCount) repairsCount.textContent = "Error";
    repairsList.innerHTML = `<p class="hint">${escapeHtml(error.message)}</p>`;
    return;
  }

  renderRepairsList(repairs);
}

function renderContactsList(contacts) {
  contactsCount.textContent = `${contacts.length} contacto${contacts.length === 1 ? "" : "s"}`;

  if (!contacts.length) {
    contactsList.innerHTML = `<p class="hint">Todavia no hay contactos guardados.</p>`;
    return;
  }

  contactsList.innerHTML = contacts.map((contact) => `
    <article class="compact-part-item contact-item">
      <strong>${escapeHtml(contact.name || "Sin nombre")}</strong>
      <span>Tel. ${escapeHtml(contact.phone || "Sin telefono")}${contact.email ? ` | ${escapeHtml(contact.email)}` : ""}</span>
      ${contact.notes ? `<span>${escapeHtml(contact.notes)}</span>` : ""}
    </article>
  `).join("");
}

async function renderContacts() {
  const search = contactSearchInput?.value.trim() || "";

  try {
    const contacts = await loadContactsFromSource(search);
    renderContactsList(contacts);
  } catch (error) {
    contactsCount.textContent = "Error";
    contactsList.innerHTML = `<p class="hint">${escapeHtml(error.message)}</p>`;
  }
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
  const showRepairsPanel = ["sales", "repairs"].includes(moduleName) && Boolean(currentUser);
  const showUsersPanel = moduleName === "users" && Boolean(currentUser);
  const showStatisticsPanel = moduleName === "statistics" && Boolean(currentUser);
  document.body.classList.toggle("left-panel-active", showRepairsPanel || showUsersPanel);
  document.body.classList.toggle("statistics-active", showStatisticsPanel);
  document.body.classList.toggle("users-active", showUsersPanel);
  if (accessCard) accessCard.hidden = showRepairsPanel || showStatisticsPanel;
  sideRepairsPanel.hidden = !showRepairsPanel;
  if (sideUsersPanel) sideUsersPanel.hidden = !showUsersPanel;
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

function getStatisticCardsHtml(cards) {
  return cards.map((card) => `
    <article class="stat-card">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <small>${escapeHtml(card.detail || "")}</small>
    </article>
  `).join("");
}

function renderStatisticCards(cards) {
  statisticsGrid.innerHTML = getStatisticCardsHtml(cards);
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

function parseAuditData(log) {
  try {
    return JSON.parse(log?.datos || "{}");
  } catch {
    return {};
  }
}

function renderSaleInvoiceHistory(logs) {
  const rows = logs.slice(0, 10);
  return `
    <section class="statistics-list-group">
      <h3>Emisiones de venta</h3>
      <div class="compact-list statistics-list">
        ${rows.length ? rows.map((log) => {
          const data = parseAuditData(log);
          return `
            <article class="compact-part-item">
              <strong>#${escapeHtml(data.saleNumber || "")} ${escapeHtml(data.product || "Venta")}</strong>
              <span>${escapeHtml(formatRepairDateTimeInput(log.fecha || data.issuedAt))} | ${escapeHtml(log.usuario || "Usuario")}</span>
              <span>${escapeHtml(data.productModel || "")}</span>
              <span>Total ${formatCurrency(Number(data.total) || 0)}</span>
            </article>
          `;
        }).join("") : `<p class="hint">Todavia no hay emisiones de venta.</p>`}
      </div>
    </section>
  `;
}

function getBackupCadenceLabel(cadence = "") {
  const labels = {
    daily: "Diario",
    weekly: "Semanal",
    monthly: "Mensual",
  };
  return labels[String(cadence)] || String(cadence || "Backup");
}

function renderBackupHistory(logs) {
  const rows = logs.slice(0, 10);
  return `
    <section class="statistics-list-group">
      <h3>Copias de seguridad</h3>
      <div class="compact-list statistics-list">
        ${rows.length ? rows.map((log) => {
          const data = parseAuditData(log);
          const cadenceLabel = getBackupCadenceLabel(data.cadence);
          const isCreated = log.tipo === "BACKUP_DRIVE_CREADO";
          const status = isCreated ? "Guardado en Google Drive" : `Omitido: ${data.reason || "Sin actividad"}`;
          const detail = isCreated
            ? `${data.fileName || "backup.json"} | ${Number(data.recordCount) || 0} registros`
            : `${formatRepairDateTimeInput(data.periodStart)} a ${formatRepairDateTimeInput(data.periodEnd)}`;
          return `
            <article class="compact-part-item">
              <strong>${escapeHtml(cadenceLabel)} - ${escapeHtml(status)}</strong>
              <span>${escapeHtml(formatRepairDateTimeInput(log.fecha))} | ${escapeHtml(log.usuario || "sistema")}</span>
              <span>${escapeHtml(detail)}</span>
            </article>
          `;
        }).join("") : `<p class="hint">Todavia no hay copias de seguridad registradas.</p>`}
      </div>
    </section>
  `;
}

function renderUserSecurityHistory(logs) {
  const rows = logs.slice(0, 10);
  return `
    <section class="statistics-list-group">
      <h3>Seguridad de usuarios</h3>
      <div class="compact-list statistics-list">
        ${rows.length ? rows.map((log) => {
          const data = parseAuditData(log);
          const labels = {
            LOGIN_EXITOSO: "Login exitoso",
            LOGIN_FALLIDO: "Login fallido",
            LOGOUT: "Cierre de sesion",
            USUARIO_BLOQUEADO: "Usuario bloqueado",
            USUARIO_DESBLOQUEADO: "Usuario autorizado",
            USUARIO_INHABILITADO: "Usuario inhabilitado",
            CONTRASENA_CAMBIADA: "Contrasena cambiada",
          };
          const username = data.username || log.usuario || "usuario";
          return `
            <article class="compact-part-item">
              <strong>${escapeHtml(labels[log.tipo] || log.tipo)} - ${escapeHtml(username)}</strong>
              <span>${escapeHtml(formatRepairDateTimeInput(log.fecha))} | ${escapeHtml(log.usuario || "sistema")}</span>
              <span>${escapeHtml(log.descripcion || "")}${data.failedLoginCount ? ` | Intentos ${Number(data.failedLoginCount)}` : ""}</span>
            </article>
          `;
        }).join("") : `<p class="hint">Todavia no hay eventos de seguridad de usuarios.</p>`}
      </div>
    </section>
  `;
}

function renderEditApprovalHistory(logs) {
  const rows = logs.slice(0, 10);
  return `
    <section class="statistics-list-group">
      <h3>Ediciones autorizadas</h3>
      <div class="compact-list statistics-list">
        ${rows.length ? rows.map((log) => {
          const data = parseAuditData(log);
          const isSale = log.tipo === "VENTA_EDITADA";
          const recordLabel = isSale ? `Venta #${data.saleNumber || ""}` : `Reparacion #${data.repairNumber || ""}`;
          const approvedBy = data.approvedByName || data.approvedBy || log.usuario || "Administrador";
          const requestedBy = data.requestedByName || data.requestedBy || "Usuario";
          const detail = isSale
            ? `${data.product || "Producto"} | Total ${formatCurrency(Number(data.total) || 0)}`
            : `${data.customer || "Cliente"} | ${formatCurrency(Number(data.repairPrice) || 0)}`;
          return `
            <article class="compact-part-item">
              <strong>${escapeHtml(recordLabel)}</strong>
              <span>${escapeHtml(formatRepairDateTimeInput(log.fecha || data.approvedAt))} | Aprobado por ${escapeHtml(approvedBy)}</span>
              <span>Solicitado por ${escapeHtml(requestedBy)}</span>
              <span>${escapeHtml(detail)}</span>
            </article>
          `;
        }).join("") : `<p class="hint">Todavia no hay ediciones autorizadas.</p>`}
      </div>
    </section>
  `;
}

function restoreStatisticsScroll(scrollTop, requestId) {
  if (requestId !== statisticsRenderRequestId) return;
  requestAnimationFrame(() => {
    if (requestId !== statisticsRenderRequestId) return;
    window.scrollTo({ top: scrollTop, left: window.scrollX, behavior: "auto" });
  });
}

async function loadStatisticsSection(sectionName = "dashboard", options = {}) {
  const { preserveContent = false, preserveScroll = false } = options;
  const requestId = ++statisticsRenderRequestId;
  const scrollTop = window.scrollY;
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
  statisticsHint.textContent = "Consultando seccion";
  const hasRenderedStatistics = Boolean(statisticsGrid.innerHTML.trim() || statisticsLists.innerHTML.trim());
  if (!preserveContent || !hasRenderedStatistics) {
    statisticsGrid.innerHTML = "";
    statisticsLists.innerHTML = `<p class="hint">Cargando informacion seleccionada.</p>`;
  }

  try {
    const needsAllStatistics = sectionName === "dashboard";
    const needsParts = needsAllStatistics || ["inventory", "alerts"].includes(sectionName);
    const needsRepairs = needsAllStatistics || sectionName === "repairs";
    const needsSales = needsAllStatistics || sectionName === "sales";
    const needsAudit = needsAllStatistics || ["repairs", "sales", "users", "audit", "backups"].includes(sectionName);
    const [parts, repairs, sales, auditLogs] = await Promise.all([
      needsParts ? window.repairCloud.listParts() : Promise.resolve([]),
      needsRepairs ? window.repairCloud.listRepairs({ limit: 10000 }) : Promise.resolve([]),
      needsSales ? window.repairCloud.listSales(10000) : Promise.resolve([]),
      needsAudit ? window.repairCloud.obtenerAuditoria() : Promise.resolve([]),
    ]);
    if (requestId !== statisticsRenderRequestId) return;

    const periodConfig = getPeriodConfig(activeStatisticsPeriod);
    const periodParts = filterRecordsByPeriod(parts, periodConfig, "publishedAt", "updatedAt");
    const periodRepairs = filterRecordsByPeriod(repairs, periodConfig, "createdAt");
    const periodSales = filterRecordsByPeriod(sales, periodConfig, "createdAt");
    const repairInvoiceLogs = auditLogs.filter((log) => log.tipo === "FACTURA_EMITIDA");
    const periodRepairInvoiceLogs = filterRecordsByPeriod(repairInvoiceLogs, periodConfig, "fecha");
    const saleInvoiceLogs = auditLogs.filter((log) => log.tipo === "FACTURA_VENTA_EMITIDA");
    const periodSaleInvoiceLogs = filterRecordsByPeriod(saleInvoiceLogs, periodConfig, "fecha");
    const editApprovalLogs = auditLogs.filter((log) => ["VENTA_EDITADA", "REPARACION_EDITADA"].includes(log.tipo));
    const periodEditApprovalLogs = filterRecordsByPeriod(editApprovalLogs, periodConfig, "fecha");
    const backupLogs = auditLogs.filter((log) => String(log.tipo || "").startsWith("BACKUP_DRIVE_"));
    const periodBackupLogs = filterRecordsByPeriod(backupLogs, periodConfig, "fecha");
    const createdBackupLogs = backupLogs.filter((log) => log.tipo === "BACKUP_DRIVE_CREADO");
    const periodCreatedBackupLogs = filterRecordsByPeriod(createdBackupLogs, periodConfig, "fecha");
    const userSecurityTypes = ["LOGIN_EXITOSO", "LOGIN_FALLIDO", "LOGOUT", "USUARIO_BLOQUEADO", "USUARIO_DESBLOQUEADO", "USUARIO_INHABILITADO", "CONTRASENA_CAMBIADA"];
    const userSecurityLogs = auditLogs.filter((log) => userSecurityTypes.includes(log.tipo));
    const periodUserSecurityLogs = filterRecordsByPeriod(userSecurityLogs, periodConfig, "fecha");
    const blockedUserLogs = userSecurityLogs.filter((log) => log.tipo === "USUARIO_BLOQUEADO");
    const periodBlockedUserLogs = filterRecordsByPeriod(blockedUserLogs, periodConfig, "fecha");
    const totalStock = periodParts.reduce((sum, part) => sum + getPartStock(part), 0);
    const inventoryCostCents = periodParts.reduce((sum, part) => sum + getMoneyCents(part, "price", "priceCents") * getPartStock(part), 0);
    const inventorySaleCents = periodParts.reduce((sum, part) => sum + getMoneyCents(part, "customerPrice", "customerPriceCents") * getPartStock(part), 0);
    const estimatedProfitCents = inventorySaleCents - inventoryCostCents;
    const repairIncome = periodRepairs.reduce((sum, repair) => sum + (Number(repair.repairPrice) || 0), 0);
    const salesIncome = periodSales.reduce((sum, sale) => sum + (Number(sale.total) || 0), 0);
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

    statisticsSummary.textContent = `${periodParts.length} repuestos | ${periodRepairs.length} reparaciones | ${periodSales.length} ventas`;
    statisticsHint.textContent = "Datos activos de base de datos";
    renderStatisticCards([
      canViewPartCost() ? { label: "Valor inventario", value: formatCurrencyCents(inventoryCostCents), detail: `${totalStock} piezas en existencia` } : null,
      canViewPartCustomerPrice() ? { label: "Venta potencial", value: formatCurrencyCents(inventorySaleCents), detail: "Precio cliente final x existencia" } : null,
      canViewPartCost() && canViewPartCustomerPrice() ? { label: "Utilidad estimada", value: formatCurrencyCents(estimatedProfitCents), detail: "Antes de gastos operativos" } : null,
      { label: "Ingresos reparaciones", value: formatCurrency(repairIncome), detail: `${periodRepairs.length} registros` },
      { label: "Ingresos ventas", value: formatCurrency(salesIncome), detail: `${periodSales.length} ventas` },
      { label: periodConfig.label, value: formatCurrency(repairIncome), detail: `${periodRepairs.length} reparaciones` },
      { label: "Emisiones reparacion", value: String(periodRepairInvoiceLogs.length), detail: `${repairInvoiceLogs.length} en auditoria` },
      { label: "Emisiones venta", value: String(periodSaleInvoiceLogs.length), detail: `${saleInvoiceLogs.length} en auditoria` },
      { label: "Ediciones aprobadas", value: String(periodEditApprovalLogs.length), detail: `${editApprovalLogs.length} en auditoria` },
      { label: "Copias seguridad", value: String(periodCreatedBackupLogs.length), detail: `${backupLogs.length} eventos en auditoria` },
      { label: "Usuarios bloqueados", value: String(periodBlockedUserLogs.length), detail: `${blockedUserLogs.length} eventos historicos` },
      { label: "Alertas", value: String(lowStockParts.length + zeroStockParts.length + (canViewPartCost() && canViewPartCustomerPrice() ? priceIssues.length : 0)), detail: "Stock y precios por revisar" },
    ].filter(Boolean));

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

    if (sectionName === "inventory") {
      statisticsSummary.textContent = `${periodParts.length} repuestos`;
      statisticsHint.textContent = `Inventario ${periodConfig.label.toLowerCase()}`;
      statisticsGrid.innerHTML = `
        <div class="control-dashboard">
          <aside class="control-kpi-rail">
            ${renderKpiRail([
              canViewPartCost() ? { label: "Valor inventario", value: formatCompactCurrency(centsToMoney(inventoryCostCents)), icon: "VI" } : null,
              canViewPartCustomerPrice() ? { label: "Venta potencial", value: formatCompactCurrency(centsToMoney(inventorySaleCents)), icon: "VP" } : null,
              canViewPartCost() && canViewPartCustomerPrice() ? { label: "Utilidad estimada", value: formatCompactCurrency(centsToMoney(estimatedProfitCents)), icon: "UE" } : null,
              { label: "Existencia", value: String(totalStock), icon: "EX" },
            ].filter(Boolean))}
          </aside>
          <div class="control-main-grid">
            ${renderDonutPanel("Repuestos por categoria", categoryTotals, periodParts.length, (value) => `${value}`)}
            ${canViewPartCost() ? renderBarPanel("Valor por proveedor", providerValues, (value) => formatCompactCurrency(centsToMoney(value))) : ""}
            ${canViewPartCost() && canViewPartCustomerPrice() ? renderBarPanel("Mayor utilidad potencial", topProfitParts, (value) => formatCompactCurrency(centsToMoney(value))) : ""}
          </div>
        </div>
      `;
      statisticsLists.innerHTML = "";
      return;
    }

    if (sectionName === "repairs") {
      statisticsSummary.textContent = `${periodRepairs.length} reparaciones`;
      statisticsHint.textContent = `Reparaciones ${periodConfig.label.toLowerCase()}`;
      renderStatisticCards([
        { label: "Ingresos reparaciones", value: formatCurrency(repairIncome), detail: `${periodRepairs.length} registros` },
        { label: periodConfig.label, value: formatCurrency(repairIncome), detail: `${periodRepairs.length} reparaciones` },
        { label: "Emisiones reparacion", value: String(periodRepairInvoiceLogs.length), detail: `${repairInvoiceLogs.length} en auditoria` },
      ]);
      statisticsGrid.innerHTML += `
        <div class="control-main-grid statistics-section-grid">
          ${renderLineChart("Ingresos de reparaciones", periodRepairSeries, `${periodConfig.label}: ${formatCurrency(repairIncome)}`)}
          ${renderBarPanel("Reparaciones por estado", repairStatusTotals, (value) => `${value}`)}
        </div>
      `;
      statisticsLists.innerHTML = renderMetricList("Reparaciones recientes", repairs.slice(0, 6).map((repair) => ({
        label: `#${repair.repairNumber || ""} ${repair.customer || "Sin nombre"}`,
        value: `${repair.status || "Sin estado"} | ${formatCurrency(Number(repair.repairPrice) || 0)}`,
      })));
      return;
    }

    if (sectionName === "sales") {
      const productTotals = groupByMetric(periodSales, (sale) => sale.product || "Producto", (sale) => Number(sale.total) || 0);
      statisticsSummary.textContent = `${periodSales.length} ventas`;
      statisticsHint.textContent = `Ventas ${periodConfig.label.toLowerCase()}`;
      renderStatisticCards([
        { label: "Ingresos ventas", value: formatCurrency(salesIncome), detail: `${periodSales.length} ventas` },
        { label: "Emisiones venta", value: String(periodSaleInvoiceLogs.length), detail: `${saleInvoiceLogs.length} en auditoria` },
      ]);
      statisticsGrid.innerHTML += `
        <div class="control-main-grid statistics-section-grid">
          ${renderBarPanel("Ventas por producto", productTotals, (value) => formatCurrency(Number(value) || 0))}
        </div>
      `;
      statisticsLists.innerHTML = renderSaleInvoiceHistory(saleInvoiceLogs);
      return;
    }

    if (sectionName === "users") {
      statisticsSummary.textContent = `${periodUserSecurityLogs.length} eventos`;
      statisticsHint.textContent = `Usuarios ${periodConfig.label.toLowerCase()}`;
      renderStatisticCards([
        { label: "Usuarios bloqueados", value: String(periodBlockedUserLogs.length), detail: `${blockedUserLogs.length} eventos historicos` },
        { label: "Eventos de seguridad", value: String(periodUserSecurityLogs.length), detail: "Periodo seleccionado" },
      ]);
      statisticsLists.innerHTML = renderUserSecurityHistory(periodUserSecurityLogs.length ? periodUserSecurityLogs : userSecurityLogs);
      return;
    }

    if (sectionName === "audit") {
      statisticsSummary.textContent = `${periodEditApprovalLogs.length} ediciones`;
      statisticsHint.textContent = `Auditoria ${periodConfig.label.toLowerCase()}`;
      renderStatisticCards([
        { label: "Ediciones aprobadas", value: String(periodEditApprovalLogs.length), detail: `${editApprovalLogs.length} en auditoria` },
      ]);
      statisticsLists.innerHTML = renderEditApprovalHistory(editApprovalLogs);
      return;
    }

    if (sectionName === "backups") {
      statisticsSummary.textContent = `${periodCreatedBackupLogs.length} respaldos`;
      statisticsHint.textContent = `Respaldos ${periodConfig.label.toLowerCase()}`;
      renderStatisticCards([
        { label: "Copias seguridad", value: String(periodCreatedBackupLogs.length), detail: `${backupLogs.length} eventos en auditoria` },
      ]);
      statisticsLists.innerHTML = renderBackupHistory(periodBackupLogs.length ? periodBackupLogs : backupLogs);
      return;
    }

    if (sectionName === "alerts") {
      statisticsSummary.textContent = `${lowStockParts.length + zeroStockParts.length + (canViewPartCost() && canViewPartCustomerPrice() ? priceIssues.length : 0)} alertas`;
      statisticsHint.textContent = `Alertas ${periodConfig.label.toLowerCase()}`;
      renderStatisticCards([
        { label: "Stock bajo", value: String(lowStockParts.length), detail: "Existencia de 1 a 2" },
        { label: "Sin existencia", value: String(zeroStockParts.length), detail: "Agotados" },
        canViewPartCost() && canViewPartCustomerPrice() ? { label: "Precios por revisar", value: String(priceIssues.length), detail: "Costo o precio invalido" } : null,
      ].filter(Boolean));
      statisticsGrid.innerHTML += `
        <div class="control-main-grid statistics-section-grid">
          ${renderAlertPanel("Stock bajo y agotado", [...zeroStockParts, ...lowStockParts], "Sin alertas de stock.")}
        </div>
      `;
      statisticsLists.innerHTML = [
        renderPartAlertList("Stock bajo", lowStockParts, "Sin repuestos con stock bajo."),
        renderPartAlertList("Sin existencia", zeroStockParts, "Sin repuestos agotados."),
        canViewPartCost() && canViewPartCustomerPrice() ? renderPartAlertList("Precios por revisar", priceIssues, "Sin precios problematicos.") : "",
      ].filter(Boolean).join("");
      return;
    }

    statisticsGrid.innerHTML = `
      <div class="control-dashboard">
        <aside class="control-kpi-rail">
          ${renderKpiRail([
            canViewPartCost() ? { label: "Valor inventario", value: formatCompactCurrency(centsToMoney(inventoryCostCents)), icon: "VI" } : null,
            canViewPartCustomerPrice() ? { label: "Venta potencial", value: formatCompactCurrency(centsToMoney(inventorySaleCents)), icon: "VP" } : null,
            canViewPartCost() && canViewPartCustomerPrice() ? { label: "Utilidad estimada", value: formatCompactCurrency(centsToMoney(estimatedProfitCents)), icon: "UE" } : null,
            { label: "Ingresos reparacion", value: formatCompactCurrency(repairIncome), icon: "IR" },
            { label: "Ingresos ventas", value: formatCompactCurrency(salesIncome), icon: "IV" },
            { label: `Reparaciones ${periodConfig.label.toLowerCase()}`, value: String(periodRepairs.length), icon: "RP" },
            { label: "Emisiones reparacion", value: String(periodRepairInvoiceLogs.length), icon: "ER" },
            { label: "Emisiones venta", value: String(periodSaleInvoiceLogs.length), icon: "EV" },
            { label: "Ediciones aprobadas", value: String(periodEditApprovalLogs.length), icon: "EA" },
            { label: "Copias seguridad", value: String(periodCreatedBackupLogs.length), icon: "CS" },
            { label: "Usuarios bloqueados", value: String(periodBlockedUserLogs.length), icon: "UB" },
            { label: "Alertas", value: String(lowStockParts.length + zeroStockParts.length + (canViewPartCost() && canViewPartCustomerPrice() ? priceIssues.length : 0)), icon: "AL" },
          ].filter(Boolean))}
        </aside>
        <div class="control-main-grid">
          ${renderLineChart("Ingresos de reparaciones", periodRepairSeries, `${periodConfig.label}: ${formatCurrency(repairIncome)}`)}
          ${renderDonutPanel("Repuestos por categoria", categoryTotals, periodParts.length, (value) => `${value}`)}
          ${canViewPartCost() ? renderBarPanel("Valor por proveedor", providerValues, (value) => formatCompactCurrency(centsToMoney(value))) : ""}
          ${renderBarPanel("Reparaciones por estado", repairStatusTotals, (value) => `${value}`)}
          ${canViewPartCost() && canViewPartCustomerPrice() ? renderBarPanel("Mayor utilidad potencial", topProfitParts, (value) => formatCompactCurrency(centsToMoney(value))) : ""}
          ${renderAlertPanel("Stock bajo y agotado", [...zeroStockParts, ...lowStockParts], "Sin alertas de stock.")}
        </div>
      </div>
    `;
    statisticsLists.innerHTML = [
      renderUserSecurityHistory(periodUserSecurityLogs.length ? periodUserSecurityLogs : userSecurityLogs),
      renderBackupHistory(periodBackupLogs.length ? periodBackupLogs : backupLogs),
      renderSaleInvoiceHistory(saleInvoiceLogs),
      renderEditApprovalHistory(editApprovalLogs),
    ].join("");
  } catch (error) {
    if (requestId !== statisticsRenderRequestId) return;
    statisticsSummary.textContent = "Error";
    statisticsHint.textContent = "No se pudo consultar base de datos.";
    statisticsGrid.innerHTML = "";
    statisticsLists.innerHTML = `<p class="hint">${escapeHtml(error.message)}</p>`;
  } finally {
    if (preserveScroll) restoreStatisticsScroll(scrollTop, requestId);
  }
}

function setStatisticsSectionActive(sectionName = "") {
  statisticsSectionButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.statisticsSection === sectionName);
  });
}

function renderStatisticsEmptyState() {
  statisticsGrid.innerHTML = `
    <section class="statistics-empty-state">
      <strong>Selecciona una seccion para cargar informacion</strong>
      <span>El resumen no consultara datos hasta que presiones un boton.</span>
      <button class="secondary-button" type="button" disabled>Actualizar</button>
    </section>
  `;
  statisticsLists.innerHTML = "";
}

async function renderStatistics() {
  setStatisticsSectionActive(activeStatisticsSection);
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

  statisticsSummary.textContent = "Panel de control";
  statisticsHint.textContent = "Elige una seccion";
  if (!activeStatisticsSection) {
    renderStatisticsEmptyState();
    return;
  }
  await loadStatisticsSection(activeStatisticsSection);
}

async function renderUsers() {
  if (!canAccessModule("users")) {
    usersList.innerHTML = `<p class="hint">Solo root puede ver este panel.</p>`;
    return;
  }

  renderPermissionEditor();
  let users = [];
  try {
    users = await loadManagedUsers();
  } catch (error) {
    usersHint.textContent = getFriendlyErrorMessage(error);
    users = managedUsersCache.length ? managedUsersCache : loadUsers();
  }
  usersSummary.textContent = `${users.length} usuario${users.length === 1 ? "" : "s"}`;
  if (usersRoleSummary) {
    const roleCounts = users.reduce((counts, user) => {
      const key = getUserAccountStatus(user) === "disabled" ? "disabled" : user.role;
      counts[key] = (counts[key] || 0) + 1;
      return counts;
    }, {});
    usersRoleSummary.innerHTML = ["root", "admin", "user", "activador", "disabled"].map((role) => `
      <article>
        <span>${escapeHtml(role === "disabled" ? "Inhabilitados" : getRoleProfile(role).label)}</span>
        <strong>${roleCounts[role] || 0}</strong>
      </article>
    `).join("");
  }
  usersList.innerHTML = users.map((user) => `
    <article class="compact-part-item user-item">
      <div class="user-card-main">
        <span class="role-badge">${escapeHtml(getRoleProfile(user.role).label)}</span>
        <strong>${escapeHtml(user.name)} (${escapeHtml(user.username)})</strong>
        <span>Estado: ${escapeHtml(getUserAccountStatusLabel(user))}${user.failedLoginCount ? ` | Intentos fallidos ${Number(user.failedLoginCount)}` : ""}</span>
        <span>${getUserModules(user).map((moduleName) => moduleLabels[moduleName]).filter(Boolean).join(" | ")}</span>
      </div>
      <div class="user-actions">
        <button class="edit-button icon-action-button icon-edit-button" type="button" data-user-action="edit" data-user-id="${user.id}" aria-label="Editar ${escapeHtml(user.username)}" title="Editar">Editar</button>
        ${getUserAccountStatus(user) !== "active" ? `<button class="edit-button" type="button" data-user-action="unlock" data-user-id="${user.id}">Autorizar</button>` : ""}
        <button class="edit-button" type="button" data-user-action="reset-password" data-user-id="${user.id}">Clave temp.</button>
        <button class="delete-button icon-action-button icon-delete-button" type="button" data-user-action="delete" data-user-id="${user.id}" aria-label="Inhabilitar ${escapeHtml(user.username)}" title="Inhabilitar">Inhabilitar</button>
      </div>
    </article>
  `).join("");
}

function getRoleDefaultModules(role) {
  return getRoleProfile(role).modules.filter((moduleName) => manageableModules.includes(moduleName));
}

function getSelectedPermissionModules() {
  const modules = [...userPermissionGrid.querySelectorAll("[data-user-permission]:checked")]
    .map((input) => input.value);
  if (modules.includes("partsCost") || modules.includes("partsCustomerPrice")) {
    modules.push("parts");
  }
  return [...new Set(modules)];
}

function renderPermissionEditor(selectedModules = null) {
  if (!userPermissionGrid) return;
  const role = managedRoleInput.value || "user";
  const enabledModules = new Set(selectedModules || getRoleDefaultModules(role));
  permissionRoleSummary.textContent = `Plantilla ${getRoleProfile(role).label}`;

  userPermissionGrid.innerHTML = manageableModules.map((moduleName) => {
    const checked = enabledModules.has(moduleName) ? "checked" : "";
    const required =
      (moduleName === "users" && role !== "root") ||
      (role === "activador" && !["parts", "partsCustomerPrice", "notes"].includes(moduleName))
        ? "disabled"
        : "";
    const isFinePermission = ["partsCost", "partsCustomerPrice"].includes(moduleName);
    return `
      <label class="permission-switch${isFinePermission ? " permission-switch-detail" : ""}">
        <input type="checkbox" value="${moduleName}" data-user-permission ${checked} ${required} />
        <span></span>
        <b>${moduleLabels[moduleName]}</b>
        <small>${checked ? "Permitido" : "Denegado"}</small>
      </label>
    `;
  }).join("");
}

function renderSaleConfirmation(sale) {
  saleConfirmList.innerHTML = `
    <div><dt>Fecha y hora</dt><dd>${formatSaleDateTime(sale.createdAt).date} | ${formatSaleDateTime(sale.createdAt).time}</dd></div>
    <div><dt>No. venta</dt><dd>${sale.saleNumber}</dd></div>
    <div><dt>Producto</dt><dd>${escapeHtml(sale.product)}</dd></div>
    <div><dt>Modelo exacto</dt><dd>${escapeHtml(sale.productModel || "")}</dd></div>
    <div><dt>Cantidad</dt><dd>${sale.quantity}</dd></div>
    <div><dt>Precio unitario</dt><dd>${formatCurrency(sale.price)}</dd></div>
    <div><dt>Descuento</dt><dd>${formatCurrency(sale.discount)}</dd></div>
    <div><dt>Total</dt><dd>${formatCurrency(sale.total)}</dd></div>
    <div><dt>Billete recibido</dt><dd>${formatCurrency(sale.received)}</dd></div>
    <div><dt>Vuelto</dt><dd>${formatCurrency(sale.change)}</dd></div>
  `;
}

function openSaleConfirmation(sale, options = {}) {
  pendingSale = sale;
  pendingSaleIsSaved = options.saved === true;
  renderSaleConfirmation(sale);
  editSaleButton.hidden = pendingSaleIsSaved;
  printSaleInvoiceButton.textContent = pendingSaleIsSaved ? "Imprimir" : "Factura";
  confirmSaleButton.textContent = pendingSaleIsSaved ? "Cerrar" : "Guardar";
  saleConfirmOverlay.hidden = false;
  (pendingSaleIsSaved ? printSaleInvoiceButton : confirmSaleButton).focus();
}

function closeSaleConfirmation() { saleConfirmOverlay.hidden = true; }

function getSaleCustomerName(sale) {
  return String(sale?.customerName || "").trim() || "Cliente general";
}

function openSaleCustomerDialog(sale) {
  pendingInvoiceSale = sale;
  saleCustomerNameInput.value = getSaleCustomerName(sale);
  saleCustomerOverlay.hidden = false;
  saleCustomerNameInput.focus();
  saleCustomerNameInput.select();
}

function closeSaleCustomerDialog() {
  saleCustomerOverlay.hidden = true;
  pendingInvoiceSale = null;
}

function buildSaleInvoiceHtml(sale) {
  const saleDate = new Date(sale.createdAt);
  const date = Number.isNaN(saleDate.getTime())
    ? formatInvoiceDate(new Date().toISOString())
    : new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" }).format(saleDate);
  const time = Number.isNaN(saleDate.getTime())
    ? ""
    : new Intl.DateTimeFormat("es-MX", { hour: "2-digit", minute: "2-digit" }).format(saleDate);
  const saleNumber = String(sale.saleNumber || "").padStart(6, "0");
  const customerName = getSaleCustomerName(sale);
  const attendedBy = currentUser?.name || currentUser?.username || "Usuario";
  const lineTotal = (Number(sale.quantity) || 0) * (Number(sale.price) || 0);

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Ticket venta ${escapeHtml(saleNumber)} | DR MOVIL</title>
  <style>
    @page { size: letter; margin: 8mm; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #edf2f4; color: #171f26; font-family: Arial, Helvetica, sans-serif; }
    .toolbar { position: sticky; top: 0; z-index: 10; display: flex; justify-content: center; padding: 10px; background: #edf2f4; }
    .toolbar button { min-height: 38px; padding: 0 14px; border: 0; border-radius: 8px; background: #0f4f6a; color: #fff; font-weight: 900; cursor: pointer; }
    .ticket { width: 82mm; margin: 0 auto; padding: 5mm; background: #fff; box-shadow: 0 18px 48px rgb(17 24 32 / 18%); }
    .brand { text-align: center; border-bottom: 1px dashed #84919b; padding-bottom: 7px; }
    .brand strong { display: block; color: #0f4f6a; font-size: 25px; letter-spacing: 0.08em; }
    .brand span { display: block; margin-top: 3px; font-size: 10.5px; font-weight: 800; line-height: 1.25; }
    .meta { display: grid; gap: 4px; padding: 8px 0; border-bottom: 1px dashed #84919b; font-size: 11px; font-weight: 800; }
    .meta div, .total-row { display: grid; grid-template-columns: 24mm minmax(0, 1fr); gap: 6px; }
    .label { color: #52626e; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { padding: 0 0 5px; border-bottom: 1px solid #d7e0e5; color: #52626e; font-size: 10px; text-align: left; text-transform: uppercase; }
    td { padding: 7px 0; border-bottom: 1px solid #edf2f4; font-size: 11px; font-weight: 800; vertical-align: top; }
    th:nth-child(1), td:nth-child(1) { width: 12mm; text-align: center; }
    th:nth-child(3), td:nth-child(3) { width: 22mm; text-align: right; }
    .product { word-break: break-word; }
    .summary { display: grid; gap: 3px; margin-top: 8px; padding: 7px 0; border-top: 1px dashed #84919b; border-bottom: 1px dashed #84919b; font-size: 11px; font-weight: 900; }
    .total-row b { text-align: right; }
    .grand { color: #0f4f6a; font-size: 12px; }
    .notice { margin-top: 8px; color: #52626e; font-size: 10px; font-weight: 800; line-height: 1.35; text-align: center; }
    .thanks { margin-top: 7px; color: #0f4f6a; font-size: 12px; font-weight: 900; text-align: center; }
    .cut { margin: 9px 0 0; border-top: 1px dashed #84919b; }
    @media print {
      body { background: #fff; }
      .ticket { width: 78mm; padding: 0; box-shadow: none; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="toolbar no-print"><button type="button" onclick="window.print()">Imprimir / Guardar PDF</button></div>
  <main class="ticket">
    <section class="brand">
      <strong>DR MOVIL</strong>
      <span>Bo. el centro, calle Gerardo frente a Cruz Roja<br />Chinameca, San Miguel Oeste</span>
      <span>Tel. ${escapeHtml(repairInvoicePhone)}</span>
    </section>
    <section class="meta">
      <div><span class="label">Ticket</span><b>No. ${escapeHtml(saleNumber)}</b></div>
      <div><span class="label">Fecha</span><b>${escapeHtml(date)} ${escapeHtml(time)}</b></div>
      <div><span class="label">Cliente</span><b>${escapeHtml(customerName)}</b></div>
      <div><span class="label">Atendido</span><b>${escapeHtml(attendedBy)}</b></div>
    </section>
      <table>
        <thead><tr><th>Cant.</th><th>Producto</th><th>Total</th></tr></thead>
        <tbody>
          <tr>
            <td>${escapeHtml(sale.quantity)}</td>
            <td class="product">${escapeHtml([sale.product, sale.productModel].filter(Boolean).join(" / "))}<br />${formatCurrency(Number(sale.price) || 0)} c/u</td>
            <td>${formatCurrency(lineTotal)}</td>
          </tr>
        </tbody>
      </table>
      <section class="summary">
        <div class="total-row"><span>Subtotal</span><b>${formatCurrency(lineTotal)}</b></div>
        <div class="total-row"><span>Descuento</span><b>${formatCurrency(Number(sale.discount) || 0)}</b></div>
        <div class="total-row grand"><span>Total</span><b>${formatCurrency(Number(sale.total) || 0)}</b></div>
        <div class="total-row"><span>Recibido</span><b>${formatCurrency(Number(sale.received) || 0)}</b></div>
        <div class="total-row"><span>Vuelto</span><b>${formatCurrency(Number(sale.change) || 0)}</b></div>
      </section>
    <p class="notice">Garantia valida con este comprobante. No cubre golpes, humedad o mala manipulacion.</p>
    <p class="thanks">Gracias por su compra</p>
    <div class="cut"></div>
  </main>
</body>
</html>`;
}

function openSaleInvoice(sale, invoiceWindow = window.open("", "_blank")) {
  if (!invoiceWindow) {
    salesHint.textContent = "Permite ventanas emergentes para generar la factura.";
    return;
  }
  window.repairCloud?.registrarAuditoria(
    "FACTURA_VENTA_EMITIDA",
    `Factura de venta #${sale.saleNumber || ""}`,
    currentUser?.username,
    JSON.stringify({
      saleId: getSaleRecordId(sale),
      saleNumber: Number(sale.saleNumber) || 0,
      product: sale.product || "",
      productModel: sale.productModel || "",
      customerName: getSaleCustomerName(sale),
      total: Number(sale.total) || 0,
      issuedAt: new Date().toISOString(),
    }),
  );
  invoiceWindow.document.open();
  invoiceWindow.document.write(buildSaleInvoiceHtml(sale));
  invoiceWindow.document.close();
}

function openAdminApproval({ title, hint, submitText = "Autorizar", onApprove }) {
  pendingAdminAction = onApprove;
  pendingVoidSaleId = null;
  adminVoidForm.reset();
  if (adminVoidTitle) adminVoidTitle.textContent = title || "Credenciales de administrador";
  if (adminVoidSubmitButton) adminVoidSubmitButton.textContent = submitText;
  adminVoidHint.textContent = hint || "Ingresa credenciales root o administrador para continuar.";
  adminVoidOverlay.hidden = false;
  voidAdminUser.focus();
}

function openAdminVoid(saleId) {
  openAdminApproval({
    title: "Anular venta",
    hint: "Ingresa credenciales root o administrador para anular esta venta.",
    submitText: "Anular",
    onApprove: (approver) => voidSaleWithApproval(saleId, approver),
  });
  pendingVoidSaleId = saleId;
}

function closeAdminVoid() {
  adminVoidOverlay.hidden = true;
  pendingVoidSaleId = null;
  pendingAdminAction = null;
  if (adminVoidTitle) adminVoidTitle.textContent = "Credenciales de administrador";
  if (adminVoidSubmitButton) adminVoidSubmitButton.textContent = "Autorizar";
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
  const navigableModules = new Set([...moduleTabs].map((button) => button.dataset.module));
  return getUserModules(currentUser).filter((moduleName) => navigableModules.has(moduleName));
}

function setModule(moduleName) {
  if (!canAccessModule(moduleName)) {
    credentialHint.textContent = "Tu rol no tiene permiso para abrir ese modulo.";
    moduleName = getAllowedModules()[0] || "permissions";
  }
  saveActiveModule(moduleName);
  document.body.classList.toggle("entry-panel-active", ["sales", "products", "parts", "repairs", "contacts"].includes(moduleName));
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
      (moduleName === "products" && panel.id === "productsModule") ||
      (moduleName === "parts" && panel.id === "partsModule") ||
      (moduleName === "repairs" && panel.id === "repairsModule") ||
      (moduleName === "contacts" && panel.id === "contactsModule") ||
      (moduleName === "statistics" && panel.id === "statisticsModule") ||
      (moduleName === "database" && panel.id === "databaseModule") ||
      (moduleName === "users" && panel.id === "usersModule");
    panel.classList.toggle("active", isActive);
  });
  if (moduleName === "sales") { setNextSaleNumber(); renderProducts(); updateSaleTotals(); renderSales(); }
  if (moduleName === "products") renderProducts();
  if (moduleName === "repairs") {
    setNextRepairNumber();
    if (!repairCreatedAtInput.dataset.value) setRepairCreatedAt();
    updateRepairDeliveredAt();
    renderRepairs();
  }
  if (moduleName === "database") renderDatabase();
  if (moduleName === "statistics") renderStatistics();
  if (moduleName === "contacts") renderContacts();
  if (moduleName === "users") renderUsers();
  if (moduleName === "parts") refreshQuickPartsView();
  if (moduleName === "repairs") {
    moduleLink.href = "reparaciones.html";
    moduleLink.textContent = "Ver registros de reparaciones";
    moduleLink.hidden = false;
  } else {
    moduleLink.hidden = true;
  }
  setLeftPanelForModule(moduleName);
}

tabButtons.forEach((button) => button.addEventListener("click", () => setTheme(button.dataset.theme)));
moduleTabs.forEach((button) => button.addEventListener("click", () => setModule(button.dataset.module)));
brandHomeButton?.addEventListener("click", () => {
  if (!sessionPanel.hidden && currentUser) {
    setModule("permissions");
    sessionPanel.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  loginForm.scrollIntoView({ behavior: "smooth", block: "center" });
});
statisticsPeriodButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeStatisticsPeriod = button.dataset.statisticsPeriod || "day";
    statisticsPeriodButtons.forEach((periodButton) => {
      periodButton.classList.toggle("active", periodButton === button);
    });
    if (activeStatisticsSection) {
      loadStatisticsSection(activeStatisticsSection, { preserveContent: true, preserveScroll: true });
      return;
    }
    renderStatistics();
  });
});
statisticsSectionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeStatisticsSection = button.dataset.statisticsSection || "";
    setStatisticsSectionActive(activeStatisticsSection);
    loadStatisticsSection(activeStatisticsSection, { preserveContent: true, preserveScroll: true });
  });
});

sideRepairSearch.addEventListener("input", () => {
  clearTimeout(sideRepairSearchTimer);
  sideRepairSearchTimer = setTimeout(renderSideRepairs, 220);
});

contactSearchInput?.addEventListener("input", () => {
  clearTimeout(contactSearchTimer);
  contactSearchTimer = setTimeout(renderContacts, 220);
});

contactNameInput?.addEventListener("input", () => {
  clearTimeout(contactRepairSearchTimer);
  contactRepairSearchTimer = setTimeout(async () => {
    await refreshRepairContactSuggestions(contactNameInput.value);
    applySelectedRepairContact();
  }, 180);
});

contactNameInput?.addEventListener("change", applySelectedRepairContact);

repairEmailInput?.addEventListener("input", () => validateEmailInput(repairEmailInput, repairsHint));
contactEmailInput?.addEventListener("input", () => validateEmailInput(contactEmailInput, contactsHint));

passwordToggle?.addEventListener("click", () => {
  const shouldShowPassword = passwordInput.type === "password";
  passwordInput.type = shouldShowPassword ? "text" : "password";
  passwordToggle.classList.toggle("is-visible", shouldShowPassword);
  passwordToggle.setAttribute("aria-pressed", String(shouldShowPassword));
  passwordToggle.setAttribute("aria-label", shouldShowPassword ? "Ocultar contrasena" : "Ver contrasena");
  passwordToggle.title = shouldShowPassword ? "Ocultar contrasena" : "Ver contrasena";
  passwordInput.focus();
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
  if (!canAccessModule("notes")) return;
  const noteText = appNotes.sanitize(noteTextInput.value);
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
  if (!canAccessModule("notes")) return;
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
  if (!canManageParts()) {
    event.preventDefault();
    quickPartsHint.textContent = "Tu rol solo permite consultar repuestos.";
    return;
  }
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

saleProductInput?.addEventListener("change", () => applySelectedSaleProduct());
catalogProductProviderPriceInput?.addEventListener("input", updateCatalogEstimatedProfit);
catalogProductPriceInput?.addEventListener("input", updateCatalogEstimatedProfit);

productCatalogForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canEditProductCatalog()) {
    productCatalogHint.textContent = canManageProducts()
      ? "Tu rol no puede editar costos internos del catalogo."
      : "Tu rol no puede editar el catalogo de productos.";
    return;
  }
  const now = new Date().toISOString();
  const editingId = productCatalogForm.dataset.editingId || "";
  const product = {
    id: editingId || crypto.randomUUID(),
    productNumber: Number(catalogProductNumberInput.value) || getNextProductNumber(),
    name: catalogProductNameInput.value.trim(),
    exactModel: catalogProductModelInput.value.trim(),
    providerPrice: Number(catalogProductProviderPriceInput.value) || 0,
    price: Number(catalogProductPriceInput.value) || 0,
    quantity: Math.max(0, Number(catalogProductQuantityInput.value) || 0),
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  if (!product.name || !product.exactModel || product.providerPrice <= 0 || product.price <= 0) {
    productCatalogHint.textContent = "Escribe producto, modelo exacto, costo interno y precio mayor a cero.";
    return;
  }

  try {
    const products = await loadProductsFromSource();
    const duplicated = products.find((item) =>
      getProductRecordId(item) !== editingId &&
      item.active !== false &&
      normalizeSearch(item.name) === normalizeSearch(product.name) &&
      normalizeSearch(item.exactModel) === normalizeSearch(product.exactModel)
    );
    if (duplicated) {
      productCatalogHint.textContent = "Ese producto y modelo ya existen.";
      return;
    }

    if (window.repairCloud?.isConfigured()) {
      if (editingId) {
        const existing = products.find((item) => getProductRecordId(item) === editingId) || {};
        await window.repairCloud.updateProduct(editingId, normalizeProductForCloud({ ...existing, ...product, createdAt: existing.createdAt || now }));
        await window.repairCloud.registrarAuditoria(
          "PRODUCTO_EDITADO",
          `Producto #${product.productNumber} editado`,
          currentUser?.username,
          JSON.stringify({ productId: editingId, name: product.name, exactModel: product.exactModel, quantity: product.quantity, providerPrice: product.providerPrice, price: product.price, editedAt: now }),
        );
        productCatalogHint.textContent = "Producto actualizado en Convex.";
      } else {
        await window.repairCloud.createProduct(normalizeProductForCloud(product));
        await window.repairCloud.registrarAuditoria(
          "PRODUCTO_AGREGADO",
          `Producto #${product.productNumber} agregado`,
          currentUser?.username,
          JSON.stringify({ name: product.name, exactModel: product.exactModel, quantity: product.quantity, providerPrice: product.providerPrice, price: product.price, createdAt: now }),
        );
        productCatalogHint.textContent = "Producto guardado en Convex.";
      }
    } else {
      if (editingId) {
        const index = products.findIndex((item) => getProductRecordId(item) === editingId);
        if (index !== -1) products[index] = { ...products[index], ...product, createdAt: products[index].createdAt || now };
        productCatalogHint.textContent = "Producto actualizado.";
      } else {
        products.unshift(product);
        productCatalogHint.textContent = "Producto guardado.";
      }
      saveProducts(products);
    }

    resetProductCatalogForm(products);
    await renderProducts();
  } catch (error) {
    productCatalogHint.textContent = `No se pudo guardar producto: ${error.message}`;
  }
});

productCatalogList?.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-product-id]");
  if (editButton) {
    if (!canEditProductCatalog()) {
      productCatalogHint.textContent = canManageProducts()
        ? "Tu rol no puede editar costos internos del catalogo."
        : "Tu rol no puede editar el catalogo de productos.";
      return;
    }
    const productId = editButton.dataset.editProductId;
    const product = loadProducts().find((item) => getProductRecordId(item) === productId);
    if (!product) {
      productCatalogHint.textContent = "No se encontro el producto.";
      return;
    }
    productCatalogForm.dataset.editingId = productId;
    catalogProductNumberInput.value = product.productNumber || "";
    catalogProductNameInput.value = product.name || "";
    catalogProductModelInput.value = product.exactModel || "";
    catalogProductProviderPriceInput.value = product.providerPrice ?? "";
    catalogProductPriceInput.value = product.price ?? "";
    updateCatalogEstimatedProfit();
    catalogProductQuantityInput.value = product.quantity ?? "";
    submitProductCatalogButton.textContent = "Guardar cambios";
    productCatalogHint.textContent = "Editando producto.";
    productCatalogForm.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  const button = event.target.closest("[data-delete-product-id]");
  if (!button) return;
  if (!canEditProductCatalog()) {
    productCatalogHint.textContent = canManageProducts()
      ? "Tu rol no puede editar costos internos del catalogo."
      : "Tu rol no puede editar el catalogo de productos.";
    return;
  }
  const productId = button.dataset.deleteProductId;

  try {
    const products = await loadProductsFromSource();
    const product = products.find((item) => getProductRecordId(item) === productId);
    if (window.repairCloud?.isConfigured()) {
      await window.repairCloud.updateProduct(productId, { active: false, updatedAt: new Date().toISOString() });
      await window.repairCloud.registrarAuditoria(
        "PRODUCTO_BORRADO",
        `Producto #${product?.productNumber || ""} desactivado`,
        currentUser?.username,
        JSON.stringify({ productId, name: product?.name || "", exactModel: product?.exactModel || "", deletedAt: new Date().toISOString() }),
      );
      productCatalogHint.textContent = "Producto desactivado en Convex.";
    } else {
      const products = loadProducts().map((product) =>
        getProductRecordId(product) === productId ? { ...product, active: false, updatedAt: new Date().toISOString() } : product,
      );
      saveProducts(products);
      productCatalogHint.textContent = "Producto desactivado.";
    }
    if (saleProductInput.value === productId) {
      saleProductInput.value = "";
      salePriceInput.value = "";
    }
    await renderProducts();
  } catch (error) {
    productCatalogHint.textContent = `No se pudo eliminar producto: ${error.message}`;
  }
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
importRepairsDatabaseButton?.addEventListener("click", async () => {
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
    credentialHint.textContent = getFriendlyErrorMessage(error);
    window.repairCloud?.registrarAuditoria("LOGIN_FALLIDO", "Intento de login fallido", usernameInput.value.trim());
    return;
  }
});

salesForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const selectedProduct = getSelectedSaleProduct();
  if (!selectedProduct) {
    salesHint.textContent = "Selecciona un producto del catalogo.";
    return;
  }
  salePriceInput.value = (Number(selectedProduct.price) || 0).toFixed(2);
  const { quantity, price, discount, received, total, change } = getSaleValues();
  const availableQuantity = Number(selectedProduct.quantity) || 0;
  if (quantity <= 0) {
    salesHint.textContent = "La cantidad debe ser mayor a cero.";
    return;
  }
  if (availableQuantity < quantity) {
    salesHint.textContent = `Solo hay ${availableQuantity} disponible${availableQuantity === 1 ? "" : "s"} de ese producto.`;
    return;
  }
  const existingSales = await loadSalesFromSource(1000);
  const nextSaleNumber = Number(saleNumberInput.value) || existingSales.reduce((max, sale) => Math.max(max, Number(sale.saleNumber) || 0), 0) + 1;
  if (received < total) {
    salesHint.textContent = "El billete recibido no alcanza para cubrir el total.";
    return;
  }
  openSaleConfirmation({
    id: crypto.randomUUID(),
    saleNumber: nextSaleNumber,
    productId: getProductRecordId(selectedProduct),
    product: selectedProduct.name,
    productModel: selectedProduct.exactModel || "",
    customerName: "",
    quantity, price, discount, total, received, change,
    createdAt: new Date().toISOString(),
  });
});

editSaleButton.addEventListener("click", () => {
  closeSaleConfirmation();
  pendingSale = null;
  pendingSaleIsSaved = false;
  salesHint.textContent = "Puedes corregir la venta antes de guardarla.";
});

async function savePendingSale(options = {}) {
  if (!pendingSale) return;
  if (pendingSaleIsSaved) return pendingSale;
  const saleToSave = pendingSale;
  const products = await loadProductsFromSource();
  const product = products.find((item) => getProductRecordId(item) === saleToSave.productId);
  const currentQuantity = Number(product?.quantity) || 0;
  if (!product || currentQuantity < saleToSave.quantity) {
    salesHint.textContent = "La existencia cambio. Revisa el producto antes de guardar la venta.";
    closeSaleConfirmation();
    pendingSale = null;
    pendingSaleIsSaved = false;
    await renderProducts();
    return null;
  }
  const nextQuantity = Math.max(0, currentQuantity - saleToSave.quantity);
  const updatedAt = new Date().toISOString();
  if (window.repairCloud?.isConfigured()) {
    await window.repairCloud.updateProduct(saleToSave.productId, { quantity: nextQuantity, updatedAt });
  } else {
    saveProducts(products.map((item) =>
      getProductRecordId(item) === saleToSave.productId ? { ...item, quantity: nextQuantity, updatedAt } : item,
    ));
  }
  const savedSale = await saveSaleToSource(saleToSave);
  if (pendingEditApproval?.type === "sale") {
    window.repairCloud?.registrarAuditoria(
      "VENTA_EDITADA",
      `Venta #${saleToSave.saleNumber} editada`,
      pendingEditApproval.approvedBy || currentUser?.username,
      JSON.stringify({
        ...pendingEditApproval,
        saleId: getSaleRecordId(savedSale || saleToSave),
        saleNumber: Number(saleToSave.saleNumber) || 0,
        product: saleToSave.product || "",
        productModel: saleToSave.productModel || "",
        quantity: Number(saleToSave.quantity) || 0,
        discount: Number(saleToSave.discount) || 0,
        total: Number(saleToSave.total) || 0,
        editedAt: new Date().toISOString(),
      }),
    );
    pendingEditApproval = null;
  }
  salesForm.reset();
  resetSaleDefaults();
  setNextSaleNumber();
  await renderProducts();
  await renderSales();
  if (options.keepConfirmationOpen) {
    openSaleConfirmation(savedSale, { saved: true });
  } else {
    closeSaleConfirmation();
    pendingSale = null;
    pendingSaleIsSaved = false;
  }
  return savedSale;
}

async function restoreSaleProductStock(sale) {
  if (!sale?.productId) return;
  const products = await loadProductsFromSource();
  const product = products.find((item) => getProductRecordId(item) === sale.productId);
  if (!product) return;
  const nextQuantity = (Number(product.quantity) || 0) + (Number(sale.quantity) || 0);
  const updatedAt = new Date().toISOString();
  if (window.repairCloud?.isConfigured()) {
    await window.repairCloud.updateProduct(sale.productId, { quantity: nextQuantity, updatedAt });
  } else {
    saveProducts(products.map((item) =>
      getProductRecordId(item) === sale.productId ? { ...item, quantity: nextQuantity, updatedAt } : item,
    ));
  }
}

async function beginEditSale(sale, approval) {
  pendingEditApproval = approval || null;
  await restoreSaleProductStock(sale);
  await removeSaleFromSource(sale);
  await renderProducts();
  saleProductInput.value = sale.productId || "";
  saleQuantityInput.value = sale.quantity || 1;
  saleDiscountInput.value = (Number(sale.discount) || 0).toFixed(2);
  saleReceivedInput.value = Number(sale.received) || "";
  salePriceInput.value = (Number(sale.price) || 0).toFixed(2);
  saleNumberInput.value = sale.saleNumber || saleNumberInput.value;
  updateSaleTotals();
  await renderSales();
  salesHint.textContent = `Editando venta autorizada por ${approval?.approvedByName || approval?.approvedBy || "administrador"}. Guarda de nuevo para confirmar.`;
  window.repairCloud?.registrarAuditoria(
    "VENTA_EDICION_AUTORIZADA",
    `Edicion autorizada para venta #${sale.saleNumber}`,
    approval?.approvedBy || currentUser?.username,
    JSON.stringify({
      ...approval,
      saleId: getSaleRecordId(sale),
      saleNumber: sale.saleNumber,
      product: sale.product,
      productModel: sale.productModel,
      total: Number(sale.total) || 0,
    }),
  );
  salesForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

confirmSaleButton.addEventListener("click", async () => {
  if (!pendingSale) return;
  if (pendingSaleIsSaved) {
    closeSaleConfirmation();
    pendingSale = null;
    pendingSaleIsSaved = false;
    return;
  }
  try {
    const savedSale = await savePendingSale();
    if (savedSale) salesHint.textContent = "Se guardo registro.";
  } catch (error) {
    salesHint.textContent = `No se pudo guardar venta: ${error.message}`;
  }
});

printSaleInvoiceButton?.addEventListener("click", async () => {
  if (!pendingSale) return;
  try {
    const savedSale = pendingSaleIsSaved
      ? pendingSale
      : await savePendingSale({ keepConfirmationOpen: true });
    if (!savedSale) {
      return;
    }
    closeSaleConfirmation();
    openSaleCustomerDialog(savedSale);
  } catch (error) {
    salesHint.textContent = `No se pudo generar factura: ${error.message}`;
  }
});

cancelSaleCustomerButton?.addEventListener("click", () => closeSaleCustomerDialog());

saleCustomerForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!pendingInvoiceSale) return;
  const invoiceWindow = window.open("", "_blank");
  if (!invoiceWindow) {
    salesHint.textContent = "Permite ventanas emergentes para generar la factura.";
    return;
  }
  try {
    const customerName = String(saleCustomerNameInput.value || "").trim() || "Cliente general";
    const saleWithCustomer = await updateSaleInSource(pendingInvoiceSale, { customerName });
    pendingSale = pendingSale && getSaleRecordId(pendingSale) === getSaleRecordId(saleWithCustomer)
      ? saleWithCustomer
      : pendingSale;
    await renderSales();
    openSaleInvoice(saleWithCustomer, invoiceWindow);
    closeSaleCustomerDialog();
    salesHint.textContent = "Factura lista.";
  } catch (error) {
    invoiceWindow.close();
    salesHint.textContent = `No se pudo generar factura: ${error.message}`;
  }
});

salesList.addEventListener("click", async (event) => {
  const printButton = event.target.closest("[data-print-sale-id]");
  if (printButton) {
    let sale = loadSales().find((item) => getSaleRecordId(item) === printButton.dataset.printSaleId);
    if (!sale) {
      try {
        const sales = await loadSalesFromSource(1000);
        sale = sales.find((item) => getSaleRecordId(item) === printButton.dataset.printSaleId);
      } catch {}
    }
    if (!sale) {
      salesHint.textContent = "No se encontro la venta para imprimir.";
      return;
    }
    openSaleCustomerDialog(sale);
    return;
  }

  const editButton = event.target.closest("[data-edit-sale-id]");
  if (editButton) {
    const sale = loadSales().find((item) => getSaleRecordId(item) === editButton.dataset.editSaleId);
    if (!sale) {
      salesHint.textContent = "No se encontro la venta para editar.";
      return;
    }
    openAdminApproval({
      title: "Editar venta",
      hint: "Ingresa credenciales root o administrador para editar esta venta.",
      submitText: "Autorizar",
      onApprove: async (approver) => {
        const approval = createApprovalRecord("sale", approver, {
          saleId: getSaleRecordId(sale),
          saleNumber: sale.saleNumber,
        });
        await beginEditSale(sale, approval);
      },
    });
    return;
  }

  const voidButton = event.target.closest(".void-sale-button");
  if (!voidButton) return;
  const sale = loadSales().find((item) => getSaleRecordId(item) === voidButton.dataset.id);
  const saleLabel = sale ? `Venta #${sale.saleNumber}` : "esta venta";
  if (!confirm(`¿Seguro que quieres anular ${saleLabel}?`)) return;
  openAdminVoid(voidButton.dataset.id);
});

cancelVoidButton.addEventListener("click", closeAdminVoid);

async function voidSaleWithApproval(saleId, approver) {
  const sales = await loadSalesFromSource(500);
  const saleIndex = sales.findIndex((sale) => getSaleRecordId(sale) === saleId);
  const saleToVoid = sales[saleIndex];
  if (!saleToVoid) {
    closeAdminVoid();
    renderSales();
    salesHint.textContent = "No se encontro la venta para anular.";
    return;
  }
  lastVoidedSale = { sale: saleToVoid, index: saleIndex };
  await restoreSaleProductStock(saleToVoid);
  await removeSaleFromSource(saleToVoid);
  closeAdminVoid();
  await renderProducts();
  await renderSales();
  salesHint.textContent = "Venta anulada correctamente.";
  window.repairCloud?.registrarAuditoria(
    "VENTA_ANULADA",
    `Venta #${saleToVoid.saleNumber} anulada`,
    approver?.username || currentUser?.username,
    JSON.stringify({
      approvedBy: approver?.username || "",
      approvedByName: approver?.name || approver?.username || "Administrador",
      requestedBy: currentUser?.username || "",
      requestedByName: currentUser?.name || currentUser?.username || "Usuario",
      total: saleToVoid.total,
      producto: saleToVoid.product,
    }),
  );
  lastVoidedSale = null;
}

adminVoidForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!pendingAdminAction) {
    adminVoidHint.textContent = "No hay una accion pendiente.";
    return;
  }

  try {
    const approver = await verifyPrivilegedCredentials(voidAdminUser.value, voidAdminPassword.value);
    if (!approver) {
      adminVoidHint.textContent = "Credenciales root o administrador incorrectas.";
      return;
    }
    const action = pendingAdminAction;
    await action(approver);
    closeAdminVoid();
  } catch (error) {
    adminVoidHint.textContent = `No se pudo autorizar: ${error.message}`;
  }
});

quickPartsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canManageParts()) {
    quickPartsHint.textContent = "Tu rol solo permite consultar repuestos.";
    return;
  }
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
  if (!editButton || editButton.dataset.invoiceRepairId) return;
  const repairs = loadRepairs();
  const repair = findRepairByRecordId(repairs, editButton.dataset.repairId);
  if (!repair) return;
  openAdminApproval({
    title: "Editar reparacion",
    hint: "Ingresa credenciales root o administrador para editar esta reparacion.",
    submitText: "Autorizar",
    onApprove: async (approver) => {
      const approval = createApprovalRecord("repair", approver, {
        repairId: getRepairRecordId(repair),
        repairNumber: repair.repairNumber,
      });
      openRepairInForm(repair, approval);
    },
  });
});

repairsList.addEventListener("click", (event) => {
  const invoiceButton = event.target.closest("[data-invoice-repair-id]");
  if (!invoiceButton) return;
  const repairs = loadRepairs();
  const repair = findRepairByRecordId(repairs, invoiceButton.dataset.invoiceRepairId);
  if (!repair) {
    repairsHint.textContent = "No se encontro la reparacion para generar factura.";
    return;
  }
  openRepairInvoice(repair);
});

function openRepairInForm(repair, approval = null) {
  if (!repair) return;
  pendingEditApproval = approval || null;
  setModule("repairs");
  repairCustomerInput.value = repair.customer;
  repairPhoneInput.value = repair.phone;
  repairEmailInput.value = repair.email || "";
  repairBrandInput.value = repair.brand;
  repairModelInput.value = repair.model;
  repairTypeInput.value = repair.repairType;
  repairPriceInput.value = repair.repairPrice ?? "";
  repairAbonoInput.value = repair.abono ?? "";
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
  repairsHint.textContent = approval
    ? `Editando reparacion autorizada por ${approval.approvedByName || approval.approvedBy}. Guarda para confirmar los cambios.`
    : "Editando reparacion - guarda para confirmar los cambios.";
  if (approval) {
    window.repairCloud?.registrarAuditoria(
      "REPARACION_EDICION_AUTORIZADA",
      `Edicion autorizada para reparacion #${repair.repairNumber}`,
      approval.approvedBy || currentUser?.username,
      JSON.stringify({
        ...approval,
        repairId: getRepairRecordId(repair),
        repairNumber: repair.repairNumber,
        customer: repair.customer,
        repairPrice: Number(repair.repairPrice) || 0,
      }),
    );
  }
  document.querySelector("#submitRepairs").textContent = "Guardar cambios";
  repairsForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handlePendingRepairEdit() {
  const pendingRepair = sessionStorage.getItem("pendingRepairEdit");
  if (!pendingRepair) return;
  sessionStorage.removeItem("pendingRepairEdit");

  try {
    const repair = JSON.parse(pendingRepair);
    openAdminApproval({
      title: "Editar reparacion",
      hint: "Ingresa credenciales root o administrador para editar esta reparacion.",
      submitText: "Autorizar",
      onApprove: async (approver) => {
        openRepairInForm(repair, createApprovalRecord("repair", approver, {
          repairId: getRepairRecordId(repair),
          repairNumber: repair.repairNumber,
        }));
      },
    });
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
  if (!validateEmailInput(repairEmailInput, repairsHint)) return;

  if (editingId) {
    if (pendingEditApproval?.type !== "repair") {
      repairsHint.textContent = "Necesitas autorizacion root o administrador para guardar esta edicion.";
      return;
    }
    const index = repairs.findIndex((repair) => getRepairRecordId(repair) === editingId);
    const existingRepair = index !== -1 ? repairs[index] : {};
    const updatedRepair = {
      ...existingRepair,
      id: existingRepair.id || editingId,
      repairNumber: Number(repairNumberInput.value) || Number(existingRepair.repairNumber) || 0,
      customer: formData.get("customer").trim(),
      deviceType: formData.get("deviceType"),
      phone: formData.get("phone").trim(),
      email: formData.get("email").trim(),
      brand, model, repairType, status, createdAt, deliveredAt,
      repairPrice: Number(formData.get("repairPrice")) || 0,
      abono: Number(formData.get("abono")) || 0,
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
    window.repairCloud?.registrarAuditoria(
      "REPARACION_EDITADA",
      `Reparacion #${updatedRepair.repairNumber} editada`,
      pendingEditApproval.approvedBy || currentUser?.username,
      JSON.stringify({
        ...pendingEditApproval,
        repairId: getRepairRecordId(updatedRepair),
        repairNumber: updatedRepair.repairNumber,
        customer: updatedRepair.customer,
        repairPrice: Number(updatedRepair.repairPrice) || 0,
        abono: Number(updatedRepair.abono) || 0,
        editedAt: new Date().toISOString(),
      }),
    );
    pendingEditApproval = null;
  } else {
    const nextRepairNumber = Number(repairNumberInput.value) || repairs.reduce((max, r) => Math.max(max, r.repairNumber), 0) + 1;
    const repairData = {
      id: crypto.randomUUID(),
      repairNumber: nextRepairNumber,
      customer: formData.get("customer").trim(),
      deviceType: formData.get("deviceType"),
      phone: formData.get("phone").trim(),
      email: formData.get("email").trim(),
      brand, model, repairType, status, createdAt, deliveredAt,
      repairPrice: Number(formData.get("repairPrice")) || 0,
      abono: Number(formData.get("abono")) || 0,
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

contactsForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  let contacts = [];
  const now = new Date().toISOString();
  const contact = {
    id: crypto.randomUUID(),
    name: contactNameInput.value.trim(),
    phone: contactPhoneInput.value.trim(),
    email: contactEmailInput.value.trim(),
    notes: contactNotesInput.value.trim(),
    createdAt: now,
    updatedAt: now,
  };

  if (!contact.name || !normalizePhoneDigits(contact.phone)) {
    contactsHint.textContent = "Nombre y telefono son obligatorios.";
    return;
  }
  if (!validateEmailInput(contactEmailInput, contactsHint)) return;

  try {
    contacts = await loadContactsFromSource("");
    const duplicated = contacts.find((item) => normalizePhoneDigits(item.phone) === normalizePhoneDigits(contact.phone));
    if (duplicated) {
      contactsHint.textContent = "Ese telefono ya existe en contactos.";
      return;
    }

    if (window.repairCloud?.isConfigured()) {
      await window.repairCloud.createContact(normalizeContactForCloud(contact));
      contactsHint.textContent = "Contacto guardado en Convex correctamente.";
    } else {
      contacts.unshift(contact);
      saveContacts(contacts);
      contactsHint.textContent = "Contacto guardado correctamente.";
    }

    contactsForm.reset();
    renderContacts();
  } catch (error) {
    contactsHint.textContent = `No se pudo guardar contacto: ${error.message}`;
  }
});

usersForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!canAccessModule("users")) {
    usersHint.textContent = "Solo root puede guardar usuarios.";
    return;
  }

  const formData = new FormData(usersForm);
  const users = window.repairCloud?.isConfigured() ? managedUsersCache : loadUsers();
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
    modules: getSelectedPermissionModules(),
  };

  if (!editingId && !userData.password) {
    usersHint.textContent = "Escribe una contrasena para el usuario nuevo.";
    return;
  }
  if (userData.password) {
    const policyError = validateLocalPasswordPolicy(userData.password);
    if (policyError) {
      usersHint.textContent = policyError;
      return;
    }
  }

  if (userData.role === "root" && !userData.modules.includes("users")) {
    userData.modules.push("users");
  }
  if (userData.modules.includes("products") && !userData.modules.includes("sales")) {
    userData.modules.push("sales");
  }
  if ((userData.modules.includes("partsCost") || userData.modules.includes("partsCustomerPrice")) && !userData.modules.includes("parts")) {
    userData.modules.push("parts");
  }
  if (userData.role === "activador") {
    userData.modules = ["parts", "partsCustomerPrice"];
  }

  try {
    if (window.repairCloud?.isConfigured()) {
      const sessionToken = getSavedSessionToken();
      if (!sessionToken) throw new Error("Vuelve a iniciar sesion para guardar usuarios.");
      if (editingId) {
        await window.repairCloud.updateUser(sessionToken, editingId, userData);
        usersHint.textContent = "Usuario actualizado en Convex correctamente.";
      } else {
        await window.repairCloud.createUser(sessionToken, userData);
        usersHint.textContent = "Usuario guardado en Convex correctamente.";
      }
    } else if (editingId) {
      const index = users.findIndex((user) => user.id === editingId);
      if (index !== -1) {
        users[index] = { ...users[index], ...userData, password: userData.password || users[index].password };
        if (currentUser.id === editingId) {
          currentUser = users[index];
          saveCurrentUser(currentUser);
          setModule(getSavedActiveModule());
        }
      }
      usersHint.textContent = "Usuario actualizado correctamente.";
    } else {
      users.unshift({ id: crypto.randomUUID(), ...userData });
      usersHint.textContent = "Usuario guardado correctamente.";
    }

    if (!window.repairCloud?.isConfigured()) saveUsers(users);
  } catch (error) {
    usersHint.textContent = getFriendlyErrorMessage(error);
    return;
  }

  delete usersForm.dataset.editingId;
  submitUserButton.textContent = "Guardar usuario";
  usersForm.reset();
  managedRoleInput.value = "user";
  renderPermissionEditor();
  renderUsers();
  renderDatabase();
});

managedRoleInput.addEventListener("change", () => {
  renderPermissionEditor();
});

resetRolePermissionsButton?.addEventListener("click", () => {
  renderPermissionEditor();
  usersHint.textContent = "Permisos restaurados segun el rol seleccionado.";
});

userPermissionGrid?.addEventListener("change", (event) => {
  const input = event.target.closest("[data-user-permission]");
  if (!input) return;
  if (["partsCost", "partsCustomerPrice"].includes(input.value) && input.checked) {
    const partsInput = userPermissionGrid.querySelector('[data-user-permission][value="parts"]');
    if (partsInput) {
      partsInput.checked = true;
      const partsStatus = partsInput.closest(".permission-switch")?.querySelector("small");
      if (partsStatus) partsStatus.textContent = "Permitido";
    }
  }
  if (input.value === "parts" && !input.checked) {
    ["partsCost", "partsCustomerPrice"].forEach((moduleName) => {
      const priceInput = userPermissionGrid.querySelector(`[data-user-permission][value="${moduleName}"]`);
      if (!priceInput) return;
      priceInput.checked = false;
      const priceStatus = priceInput.closest(".permission-switch")?.querySelector("small");
      if (priceStatus) priceStatus.textContent = "Denegado";
    });
  }
  const status = input.closest(".permission-switch")?.querySelector("small");
  if (status) status.textContent = input.checked ? "Permitido" : "Denegado";
});

usersList.addEventListener("click", async (event) => {
  if (!canAccessModule("users")) return;
  const button = event.target.closest("[data-user-action]");
  if (!button) return;

  const users = window.repairCloud?.isConfigured() ? managedUsersCache : loadUsers();
  const user = users.find((item) => item.id === button.dataset.userId);
  if (!user) return;

  if (button.dataset.userAction === "edit") {
    managedNameInput.value = user.name;
    managedUsernameInput.value = user.username;
    managedPasswordInput.value = "";
    managedRoleInput.value = user.role;
    renderPermissionEditor(getUserModules(user).filter((moduleName) => manageableModules.includes(moduleName)));
    usersForm.dataset.editingId = user.id;
    submitUserButton.textContent = "Guardar cambios";
    usersHint.textContent = "Editando usuario.";
    return;
  }

  if (button.dataset.userAction === "unlock") {
    try {
      if (window.repairCloud?.isConfigured()) {
        const sessionToken = getSavedSessionToken();
        if (!sessionToken) throw new Error("Vuelve a iniciar sesion para autorizar usuarios.");
        await window.repairCloud.unlockUser(sessionToken, user.id);
      } else {
        const index = users.findIndex((item) => item.id === user.id);
        if (index !== -1) users[index] = { ...users[index], active: true, accountStatus: "active", failedLoginCount: 0, lockedUntil: 0 };
        saveUsers(users);
      }
      usersHint.textContent = "Cuenta autorizada correctamente.";
      renderUsers();
      renderDatabase();
    } catch (error) {
      usersHint.textContent = getFriendlyErrorMessage(error);
    }
    return;
  }

  if (button.dataset.userAction === "reset-password") {
    const newPassword = prompt(`Nueva contrasena temporal para ${user.username}:`);
    if (newPassword === null) return;
    const policyError = validateLocalPasswordPolicy(newPassword);
    if (policyError) {
      usersHint.textContent = policyError;
      return;
    }

    try {
      const userPatch = {
        name: user.name,
        username: user.username,
        password: newPassword,
        role: user.role,
        modules: getUserModules(user).filter((moduleName) => manageableModules.includes(moduleName)),
      };
      if (window.repairCloud?.isConfigured()) {
        const sessionToken = getSavedSessionToken();
        if (!sessionToken) throw new Error("Vuelve a iniciar sesion para restablecer contrasenas.");
        await window.repairCloud.updateUser(sessionToken, user.id, userPatch);
      } else {
        const index = users.findIndex((item) => item.id === user.id);
        if (index !== -1) users[index] = { ...users[index], ...userPatch, active: true, accountStatus: "active", mustChangePassword: true, failedLoginCount: 0 };
        saveUsers(users);
      }
      usersHint.textContent = "Contrasena temporal guardada. El usuario debera cambiarla al entrar.";
      renderUsers();
      renderDatabase();
    } catch (error) {
      usersHint.textContent = getFriendlyErrorMessage(error);
    }
    return;
  }

  if (button.dataset.userAction === "delete") {
    if (user.role === "root") {
      usersHint.textContent = "El usuario root no se puede inhabilitar.";
      return;
    }
    if (!confirm(`Inhabilitar a ${user.username}? No podra iniciar sesion, pero su historial se conserva para auditoria.`)) return;
    if (window.repairCloud?.isConfigured()) {
      try {
        const sessionToken = getSavedSessionToken();
        if (!sessionToken) throw new Error("Vuelve a iniciar sesion para inhabilitar usuarios.");
        await window.repairCloud.removeUser(sessionToken, user.id);
        usersHint.textContent = "Usuario inhabilitado en Convex correctamente.";
      } catch (error) {
        usersHint.textContent = getFriendlyErrorMessage(error);
        return;
      }
    } else {
      const index = users.findIndex((item) => item.id === user.id);
      if (index !== -1) users[index] = { ...users[index], active: false, accountStatus: "disabled" };
      saveUsers(users);
      usersHint.textContent = "Usuario inhabilitado correctamente.";
    }
    renderUsers();
    renderDatabase();
  }
});

logoutButton?.addEventListener("click", openLogoutConfirmation);
cancelLogoutButton?.addEventListener("click", closeLogoutConfirmation);
confirmLogoutButton?.addEventListener("click", performLogout);
logoutConfirmOverlay?.addEventListener("click", (event) => {
  if (event.target === logoutConfirmOverlay) closeLogoutConfirmation();
});

const isBootRestoringSession = document.documentElement.classList.contains("session-restoring");

loadUsers();
setLoginDemo();
setColorMode(localStorage.getItem(colorModeStorageKey) || "light");
setNextSaleNumber();
setNextRepairNumber();
setRepairCreatedAt();
renderRepairBrandOptions();
renderRepairModelOptions();
renderRepairTypeOptions();
resetSaleDefaults();
updateDateTime();
if (!isBootRestoringSession) {
  renderProducts();
  renderSales();
  renderRepairs();
  refreshQuickPartsView();
  renderNotes();
}
restoreSession();
window.addEventListener("online", warnIfLocalSessionCanUseConvex);
warnIfLocalSessionCanUseConvex();
setInterval(updateDateTime, 1000);
