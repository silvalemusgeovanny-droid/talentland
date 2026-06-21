(function () {
  const keys = Object.freeze({
    users: "systemUsers",
    sessionToken: "repairSessionToken",
    currentUser: "repairCurrentUser",
    authMode: "repairAuthMode",
    activeModule: "repairActiveModule",
    notes: "pendingNotes",
    notesSnoozeUntil: "pendingNotesSnoozeUntil",
  });

  const manageableModules = ["sales", "products", "parts", "repairs", "contacts", "notes", "statistics", "database", "users"];
  const roleProfiles = Object.freeze({
    root: {
      label: "Root",
      access: "Control total del sistema",
      modules: ["permissions", ...manageableModules],
      permissions: ["Modificar usuarios, roles y accesos", "Ver base de datos local completa", "Registrar ventas, repuestos y reparaciones", "Editar cualquier dato del sistema"],
    },
    admin: {
      label: "Admin",
      access: "Administracion con restricciones",
      modules: ["permissions", "sales", "products", "parts", "repairs", "contacts", "notes", "statistics", "database"],
      permissions: ["Registrar ventas, repuestos y reparaciones", "Ver base de datos local", "No puede borrar ni reemplazar al root", "No puede gestionar usuarios desde este panel"],
    },
    user: {
      label: "Usuario",
      access: "Operacion basica sin base de datos",
      modules: ["permissions", "sales", "parts", "repairs", "notes"],
      permissions: ["Registrar operaciones del dia", "Consultar modulos operativos permitidos", "No puede ver la base de datos", "No puede gestionar usuarios ni roles"],
    },
    activador: {
      label: "Activador",
      access: "Consulta de repuestos sin modificaciones",
      modules: ["parts"],
      permissions: ["Ver el modulo de repuestos", "Consultar existencias y precios", "No puede agregar repuestos", "No puede editar ni eliminar informacion"],
    },
  });

  function readJson(key, fallback = null) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function normalizeUser(user = {}) {
    return {
      id: user.id || user._id || "",
      username: user.username || "",
      name: user.name || user.username || "Usuario",
      role: user.role || "user",
      modules: Array.isArray(user.modules) ? user.modules : undefined,
      mustChangePassword: Boolean(user.mustChangePassword),
    };
  }

  const session = {
    keys,
    generateToken() {
      const bytes = new Uint8Array(32);
      crypto.getRandomValues(bytes);
      return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
    },
    getToken: () => localStorage.getItem(keys.sessionToken),
    saveToken: (token) => localStorage.setItem(keys.sessionToken, token),
    getUser: () => readJson(keys.currentUser),
    saveUser(user) {
      const normalizedUser = normalizeUser(user);
      writeJson(keys.currentUser, normalizedUser);
      window.dispatchEvent(new CustomEvent("repair-session-changed", { detail: { user: normalizedUser } }));
    },
    getAuthMode: () => localStorage.getItem(keys.authMode),
    saveAuthMode: (mode) => mode ? localStorage.setItem(keys.authMode, mode) : localStorage.removeItem(keys.authMode),
    hasSession() {
      return Boolean(this.getToken() || this.getUser());
    },
    clear() {
      localStorage.removeItem(keys.sessionToken);
      localStorage.removeItem(keys.currentUser);
      localStorage.removeItem(keys.authMode);
      window.dispatchEvent(new CustomEvent("repair-session-changed", { detail: { user: null } }));
    },
    async signIn(username, password, localUsers = []) {
      if (window.repairCloud?.isConfigured()) {
        await window.repairCloud.seedUsers();
        const token = this.generateToken();
        const user = await window.repairCloud.login(username, password, token);
        this.saveToken(token);
        this.saveAuthMode("convex");
        return user;
      }

      const normalizedUsername = String(username || "").trim().toLowerCase();
      const user = localUsers.find((item) => item.username?.toLowerCase() === normalizedUsername && item.password === password);
      if (!user || user.active === false) throw new Error("Usuario o contrasena incorrectos.");
      this.saveAuthMode("local");
      return user;
    },
    async restore() {
      const storedUser = this.getUser();
      if (!window.repairCloud?.isConfigured()) {
        this.saveAuthMode("local");
        return storedUser ? { status: "authenticated", user: storedUser, source: "local" } : { status: "anonymous", source: "local" };
      }
      if (this.getAuthMode() === "local") return { status: "reauth-required" };
      const token = this.getToken();
      if (!token) return { status: "anonymous" };
      const user = await window.repairCloud.currentSession(token);
      return user ? { status: "authenticated", user, source: "convex" } : { status: "expired" };
    },
    async logout() {
      const token = this.getToken();
      let remoteError = null;
      try {
        if (token && window.repairCloud?.isConfigured()) await window.repairCloud.logout(token);
      } catch (error) {
        remoteError = error;
      } finally {
        this.clear();
      }
      return { remoteError };
    },
  };

  const permissions = {
    roleProfiles,
    manageableModules,
    getRoleProfile(role) {
      return roleProfiles[role] || roleProfiles.user;
    },
    getUserModules(user) {
      const roleModules = this.getRoleProfile(user?.role).modules;
      if (user?.role === "root") return [...roleProfiles.root.modules];
      if (user?.role === "activador") {
        const assigned = Array.isArray(user.modules) ? user.modules : roleModules;
        return assigned.includes("notes") ? ["permissions", "parts", "notes"] : ["permissions", "parts"];
      }
      if (!Array.isArray(user?.modules)) return [...roleModules];
      const allowed = new Set(["permissions", ...manageableModules]);
      return [...new Set(["permissions", ...user.modules.filter((moduleName) => allowed.has(moduleName))])];
    },
    canAccess(user, moduleName) {
      return Boolean(user) && this.getUserModules(user).includes(moduleName);
    },
    canManageParts(user) {
      return user?.role === "root" || (this.canAccess(user, "parts") && user?.role !== "activador");
    },
    canUseNotes(user) {
      return this.canAccess(user, "notes");
    },
  };

  const parts = {
    parseMoneyCents(value) {
      const normalizedValue = String(value ?? "").trim().replace(",", ".");
      const match = normalizedValue.match(/^(\d+)(?:\.(\d+))?$/);
      if (!match) return 0;

      const pesos = Number(match[1]);
      const decimalDigits = `${match[2] || ""}000`;
      const cents = Number(decimalDigits.slice(0, 2)) + (Number(decimalDigits[2]) >= 5 ? 1 : 0);
      return pesos * 100 + cents;
    },
    centsToMoney(cents) {
      return (Number(cents) || 0) / 100;
    },
    parseMoney(value) {
      return this.centsToMoney(this.parseMoneyCents(value));
    },
    getMoneyCents(part, moneyField, centsField) {
      const cents = Number(part?.[centsField]);
      if (Number.isInteger(cents)) return cents;
      return this.parseMoneyCents(part?.[moneyField]);
    },
    normalizeStockQuantity(value) {
      const stock = Number(value);
      if (!Number.isFinite(stock)) return 0;
      return Math.max(0, Math.trunc(stock));
    },
    normalizeType(value) {
      const cleanedValue = String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
      if (!cleanedValue) return "";
      return cleanedValue.charAt(0).toUpperCase() + cleanedValue.slice(1);
    },
    normalizeCategory(value) {
      const categoryMap = {
        Celular: "Telefono",
        Telefono: "Telefono",
        Tablet: "Tablet",
        Computadora: "Computadora",
        Electrodomestico: "Bocina",
        Bocina: "Bocina",
      };
      return categoryMap[value] || this.normalizeType(value) || "Telefono";
    },
    normalizeSearch(value = "") {
      return String(value ?? "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, " ")
        .trim()
        .toLowerCase();
    },
    getCanonicalValue(values, value) {
      const normalizedValue = this.normalizeSearch(value);
      if (!normalizedValue) return "";
      return values.find((option) => this.normalizeSearch(option) === normalizedValue) || "";
    },
    getUniqueNormalizedValues(values) {
      const normalizedMap = new Map();
      values.forEach((value) => {
        const displayValue = this.normalizeType(value);
        const key = this.normalizeSearch(displayValue);
        if (key && !normalizedMap.has(key)) normalizedMap.set(key, displayValue);
      });
      return [...normalizedMap.values()].sort((a, b) => a.localeCompare(b, "es", { sensitivity: "base" }));
    },
    normalizeQuality(value = "") {
      const quality = String(value || "").trim();
      const normalized = this.normalizeSearch(quality);
      if (["premium", "premiun", "gx"].includes(normalized)) return "GX";
      if (["originall", "original"].includes(normalized)) return "Original";
      if (["amoled", "am oled"].includes(normalized)) return "Amoled";
      if (normalized === "oled") return "OLED";
      if (normalized === "tft") return "TFT";
      if (normalized === "ips") return "IPS";
      if (["generico", "generica"].includes(normalized)) return "Generica";
      return quality || "Original";
    },
    getQualityClass(value = "") {
      return `quality-${this.normalizeSearch(this.normalizeQuality(value)).replace(/\s+/g, "-") || "sin-calidad"}`;
    },
    getRecordId(part) {
      return String(part?.id || part?._id || part?.sourceId || "");
    },
    getDuplicateKey(part) {
      return [part.name, part.brand, part.model, this.normalizeCategory(part.category), this.normalizeQuality(part.quality)]
        .map((value) => this.normalizeSearch(value))
        .join("|");
    },
    findDuplicate(items, part, currentId = "") {
      const duplicateKey = this.getDuplicateKey(part);
      return items.find((existingPart) => {
        const normalizedCurrentId = String(currentId || "");
        const existingIds = [existingPart.id, existingPart._id, existingPart.sourceId]
          .filter(Boolean)
          .map(String);
        if (normalizedCurrentId && existingIds.includes(normalizedCurrentId)) return false;
        return this.getDuplicateKey(existingPart) === duplicateKey;
      });
    },
    getDuplicateMessage(part) {
      return `Duplicado: ya existe ${part.name} ${part.brand} ${part.model}.`;
    },
    hasModelSupplierConflict(part) {
      return Boolean(this.normalizeSearch(part.model)) && this.normalizeSearch(part.model) === this.normalizeSearch(part.supplier);
    },
    getModelSupplierConflictMessage() {
      return "Revisa el modelo y proveedor: no pueden ser iguales.";
    },
    isDuplicateError(error) {
      return String(error?.message || "").toLowerCase().includes("duplicado");
    },
    isSameOptionValue(field, currentValue, selectedValue) {
      const current = field === "category" ? this.normalizeCategory(currentValue) : currentValue;
      const selected = field === "category" ? this.normalizeCategory(selectedValue) : selectedValue;
      return this.normalizeSearch(current) === this.normalizeSearch(selected);
    },
    normalizeOptionValue(field, value) {
      if (field === "category") return this.normalizeCategory(value);
      return this.normalizeType(value);
    },
    withUpdatedOptionValue(part, field, value) {
      return { ...part, [field]: this.normalizeOptionValue(field, value) };
    },
    hasDuplicatesAfterOptionChange(items, field, oldValue, newValue) {
      const projectedParts = items.map((part) =>
        this.isSameOptionValue(field, part[field], oldValue) ? this.withUpdatedOptionValue(part, field, newValue) : part
      );
      const seenKeys = new Set();
      return projectedParts.some((part) => {
        const key = this.getDuplicateKey(part);
        if (seenKeys.has(key)) return true;
        seenKeys.add(key);
        return false;
      });
    },
    normalizeForCloud(part) {
      const now = new Date().toISOString();
      const priceCents = this.getMoneyCents(part, "price", "priceCents");
      const customerPriceCents = this.getMoneyCents(part, "customerPrice", "customerPriceCents");
      return {
        sourceId: part.sourceId || part.id || part._id || crypto.randomUUID(),
        name: this.normalizeType(part.name),
        brand: this.normalizeType(part.brand),
        model: this.normalizeType(part.model),
        category: this.normalizeCategory(part.category),
        price: this.centsToMoney(priceCents),
        priceCents,
        customerPrice: this.centsToMoney(customerPriceCents),
        customerPriceCents,
        stock: this.normalizeStockQuantity(part.stock),
        quality: this.normalizeQuality(part.quality || "Original"),
        supplier: this.normalizeType(part.supplier),
        publishedAt: part.publishedAt || now,
        updatedAt: part.updatedAt || "",
      };
    },
  };

  const notes = {
    sanitize(value) {
      return String(value || "").replace(/[^\p{L}\p{N}\s.,;:Â¿?Â¡!()\-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 280);
    },
    cleanInput(value) {
      return String(value || "").replace(/[^\p{L}\p{N}\s.,;:Â¿?Â¡!()\-]/gu, "").slice(0, 280);
    },
    load: () => readJson(keys.notes, []),
    save: (items) => writeJson(keys.notes, items),
    migrateAuthors(user) {
      if (!user) return;
      const items = this.load();
      let changed = false;
      const migrated = items.map((note) => {
        if (note.authorName) return note;
        changed = true;
        return { ...note, authorName: user.name || user.username || "Usuario", authorUsername: user.username || "" };
      });
      if (changed) this.save(migrated);
    },
    normalizeForCloud(note, user = session.getUser()) {
      const now = new Date().toISOString();
      return {
        sourceId: note.sourceId || note.id || crypto.randomUUID(),
        text: this.sanitize(note.text),
        authorName: note.authorName || user?.name || user?.username || "Usuario",
        authorUsername: note.authorUsername || user?.username || "",
        done: Boolean(note.done),
        createdAt: note.createdAt || now,
        updatedAt: note.updatedAt || now,
      };
    },
    async loadFromSource(user = session.getUser()) {
      if (!window.repairCloud?.isConfigured() || !user) return this.load();
      this.migrateAuthors(user);
      const localOnly = this.load()
        .filter((note) => !note._id)
        .map((note) => this.normalizeForCloud(note, user))
        .filter((note) => note.text);
      if (localOnly.length) await window.repairCloud.importNotes(localOnly);
      const cloudNotes = await window.repairCloud.listNotes();
      const normalized = cloudNotes.map((note) => ({ ...note, id: note._id || note.id }));
      this.save(normalized);
      return normalized;
    },
    isSnoozed: () => Number(localStorage.getItem(keys.notesSnoozeUntil) || 0) > Date.now(),
    snooze: () => localStorage.setItem(keys.notesSnoozeUntil, String(Date.now() + 60 * 60 * 1000)),
    clearSnooze: () => localStorage.removeItem(keys.notesSnoozeUntil),
  };

  const partsApi = Object.freeze(Object.fromEntries(
    Object.entries(parts).map(([name, method]) => [name, method.bind(parts)])
  ));

  window.repairApp = Object.freeze({ session, permissions, parts: partsApi, notes });
})();
