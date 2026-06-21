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

  window.repairApp = Object.freeze({ session, permissions, notes });
})();
