(function () {
  function getConvexUrl() {
    return String(window.CONVEX_URL || "").replace(/\/$/, "");
  }

  async function callConvex(kind, path, args) {
    const baseUrl = getConvexUrl();
    if (!baseUrl) return null;

    const response = await fetch(`${baseUrl}/api/${kind}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path, args, format: "json" }),
    });
    const result = await response.json();
    if (result.status !== "success") {
      const rawMessage = result.errorMessage || "Convex no pudo completar la operacion.";
      const cleanMessage = rawMessage.includes("Usuario y contrasena incorrectos")
        ? "Usuario y contrasena incorrectos."
        : rawMessage.includes("Usuario o contrasena incorrectos")
          ? "Usuario y contrasena incorrectos."
          : rawMessage.replace(/^.*Uncaught Error:\s*/s, "").replace(/\s+at handler[\s\S]*$/s, "").trim();
      throw new Error(cleanMessage || "Convex no pudo completar la operacion.");
    }
    return result.value;
  }

  function withSession(args = {}) {
    const sessionToken = window.repairApp.session.getToken() || "";
    return { ...args, sessionToken };
  }

  window.repairCloud = {
    isConfigured: () => Boolean(getConvexUrl()),
    listRepairs: (args = {}) => callConvex("query", "reparaciones:list", withSession(args)),
    createRepair: (repair) => callConvex("mutation", "reparaciones:create", withSession(repair)),
    updateRepair: (id, patch) => callConvex("mutation", "reparaciones:update", withSession({ id, patch })),
    removeRepair: (id) => callConvex("mutation", "reparaciones:remove", withSession({ id })),
    importRepairs: (repairs) => callConvex("mutation", "reparaciones:importBatch", withSession({ repairs })),
    seedUsers: (setupSecret = "") => callConvex("mutation", "auth:seedDefaultUsers", { setupSecret }),
    login: (username, password, sessionToken) =>
      callConvex("mutation", "auth:login", { username, password, sessionToken }),
    currentSession: (sessionToken) => callConvex("query", "auth:currentSession", { sessionToken }),
    heartbeatPresence: (sessionToken) => callConvex("mutation", "auth:heartbeatPresence", { sessionToken }),
    logout: (sessionToken) => callConvex("mutation", "auth:logout", { sessionToken }),
    verifyAdmin: (username, password) => callConvex("mutation", "auth:verifyAdmin", { username, password }),
    verifyRoot: (username, password) => callConvex("mutation", "auth:verifyRoot", { username, password }),
    listUsers: (sessionToken) => callConvex("query", "auth:listUsers", { sessionToken }),
    createUser: (sessionToken, user) => callConvex("mutation", "auth:createUser", { sessionToken, ...user }),
    updateUser: (sessionToken, id, user) => callConvex("mutation", "auth:updateUser", { sessionToken, id, ...user }),
    removeUser: (sessionToken, id) => callConvex("mutation", "auth:removeUser", { sessionToken, id }),
    unlockUser: (sessionToken, id) => callConvex("mutation", "auth:unlockUser", { sessionToken, id }),
    changeOwnPassword: (sessionToken, currentPassword, newPassword) =>
      callConvex("mutation", "auth:changeOwnPassword", { sessionToken, currentPassword, newPassword }),
    registrarAuditoria: (tipo, descripcion, usuario = "sistema", datos = "") =>
      callConvex("mutation", "auditoria:registrar", withSession({ tipo, descripcion, usuario, datos })),
    obtenerAuditoria: () => callConvex("query", "auditoria:obtener", withSession()),
    listNotes: () => callConvex("query", "notas:list", withSession({})),
    createNote: (note) => callConvex("mutation", "notas:create", withSession(note)),
    importNotes: (notes) => callConvex("mutation", "notas:importBatch", withSession({ notes })),
    toggleNote: (id, done) => callConvex("mutation", "notas:toggle", withSession({ id, done, updatedAt: new Date().toISOString() })),
    removeNote: (id) => callConvex("mutation", "notas:remove", withSession({ id })),
    listParts: () => callConvex("query", "repuestos:list", withSession({})),
    createPart: (part) => callConvex("mutation", "repuestos:create", withSession(part)),
    updatePart: (id, patch) => callConvex("mutation", "repuestos:update", withSession({ id, patch })),
    updatePartStockForSale: (id, quantityChange) =>
      callConvex("mutation", "repuestos:updateStockForSale", withSession({ id, quantityChange, updatedAt: new Date().toISOString() })),
    removePart: (id) => callConvex("mutation", "repuestos:remove", withSession({ id })),
    importParts: (parts) => callConvex("mutation", "repuestos:importBatch", withSession({ parts })),
    listCatalogPending: () => callConvex("query", "catalogoPendientes:list", withSession({ status: "pending", limit: 100 })),
    createCatalogPending: (pending) => callConvex("mutation", "catalogoPendientes:create", withSession(pending)),
    resolveCatalogPending: (id) =>
      callConvex("mutation", "catalogoPendientes:resolve", withSession({ id, resolvedAt: new Date().toISOString() })),
    dismissCatalogPending: (id) =>
      callConvex("mutation", "catalogoPendientes:dismiss", withSession({ id, resolvedAt: new Date().toISOString() })),
    listContacts: () => callConvex("query", "contactos:list", withSession({})),
    createContact: (contact) => callConvex("mutation", "contactos:create", withSession(contact)),
    updateContact: (id, patch) => callConvex("mutation", "contactos:update", withSession({ id, patch })),
    removeContact: (id) => callConvex("mutation", "contactos:remove", withSession({ id })),
    importContacts: (contacts) => callConvex("mutation", "contactos:importBatch", withSession({ contacts })),
    listProducts: () => callConvex("query", "productos:list", withSession({})),
    createProduct: (product) => callConvex("mutation", "productos:create", withSession(product)),
    updateProduct: (id, patch) => callConvex("mutation", "productos:update", withSession({ id, patch })),
    listSales: (limit = 500) => callConvex("query", "ventas:list", withSession({ limit })),
    createSale: (sale) => callConvex("mutation", "ventas:create", withSession(sale)),
    updateSale: (id, patch) => callConvex("mutation", "ventas:update", withSession({ id, patch })),
    removeSale: (id) => callConvex("mutation", "ventas:remove", withSession({ id })),
  };
})();
