(function () {
  const activeModuleStorageKey = "repairActiveModule";
  const currentUser = window.repairApp?.session?.getUser?.();
  const modules = [
    ["permissions", "Inicio", "⌂", "index.html"], ["sales", "Ventas", "▣", "ventas.html"],
    ["products", "Catálogo", "◇", "index.html"], ["parts", "Repuestos", "⚙", "repuestos.html"],
    ["repairs", "Reparaciones", "⌕", "reparaciones.html"], ["contacts", "Contactos", "♙", "index.html"],
    ["statistics", "Resumen", "▥", "index.html"], ["health", "Salud del sistema", "♥", "index.html"],
    ["database", "Datos", "▤", "index.html"], ["users", "Usuarios", "♚", "index.html"],
  ];

  function rememberModule(moduleName) {
    try {
      localStorage.setItem(activeModuleStorageKey, moduleName);
    } catch {}
  }

  document.querySelectorAll(".module-page-nav").forEach((nav) => {
    const activeModule = nav.querySelector(".active")?.dataset.returnModule || "permissions";
    nav.classList.add("module-tabs", "module-page-menu");
    nav.innerHTML = modules
      .filter(([moduleName]) => !currentUser || window.repairApp.permissions.canAccess(currentUser, moduleName))
      .map(([moduleName, label, icon, href]) => `<a class="module-page-tab${moduleName === activeModule ? " active" : ""}" href="${href}" data-return-module="${moduleName}"><span class="module-tab-icon" aria-hidden="true">${icon}</span><span>${label}</span></a>`)
      .join("");
  });

  document.querySelectorAll("[data-return-module]").forEach((link) => {
    const moduleName = link.dataset.returnModule || "permissions";
    link.addEventListener("click", () => rememberModule(link.dataset.returnModule || "permissions"));
  });
})();
