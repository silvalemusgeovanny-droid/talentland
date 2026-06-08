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
      throw new Error(result.errorMessage || "Convex no pudo completar la operacion.");
    }
    return result.value;
  }

  window.repairCloud = {
    isConfigured: () => Boolean(getConvexUrl()),
    listRepairs: (args = {}) => callConvex("query", "reparaciones:list", args),
    createRepair: (repair) => callConvex("mutation", "reparaciones:create", repair),
    importRepairs: (repairs) => callConvex("mutation", "reparaciones:importBatch", { repairs }),
    seedUsers: () => callConvex("mutation", "auth:seedDefaultUsers", {}),
    login: (username, password, sessionToken) =>
      callConvex("mutation", "auth:login", { username, password, sessionToken }),
    currentSession: (sessionToken) => callConvex("query", "auth:currentSession", { sessionToken }),
    heartbeatPresence: (sessionToken) => callConvex("mutation", "auth:heartbeatPresence", { sessionToken }),
    logout: (sessionToken) => callConvex("mutation", "auth:logout", { sessionToken }),
    verifyAdmin: (username, password) => callConvex("mutation", "auth:verifyAdmin", { username, password }),
    registrarAuditoria: (tipo, descripcion, usuario = "sistema", datos = "") =>
      callConvex("mutation", "auditoria:registrar", { tipo, descripcion, usuario, datos }),
    obtenerAuditoria: () => callConvex("query", "auditoria:obtener", {}),
    listNotes: () => callConvex("query", "notas:list", {}),
    createNote: (note) => callConvex("mutation", "notas:create", note),
    importNotes: (notes) => callConvex("mutation", "notas:importBatch", { notes }),
    toggleNote: (id, done) => callConvex("mutation", "notas:toggle", { id, done, updatedAt: new Date().toISOString() }),
    removeNote: (id) => callConvex("mutation", "notas:remove", { id }),
    listParts: () => callConvex("query", "repuestos:list", {}),
    createPart: (part) => callConvex("mutation", "repuestos:create", part),
    updatePart: (id, patch) => callConvex("mutation", "repuestos:update", { id, patch }),
    removePart: (id) => callConvex("mutation", "repuestos:remove", { id }),
    importParts: (parts) => callConvex("mutation", "repuestos:importBatch", { parts }),
  };
})();
