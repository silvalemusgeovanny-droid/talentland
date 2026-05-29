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
  };
})();
