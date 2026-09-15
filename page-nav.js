(function () {
  const activeModuleStorageKey = "repairActiveModule";
  const panelLinks = document.querySelectorAll("[data-return-module]");
  const currentUser = window.repairApp?.session?.getUser?.();

  function rememberModule(moduleName) {
    try {
      localStorage.setItem(activeModuleStorageKey, moduleName);
    } catch {}
  }

  panelLinks.forEach((link) => {
    const moduleName = link.dataset.returnModule || "permissions";
    // Las páginas de registro conservan la misma navegación que el panel,
    // mostrando solo los módulos habilitados para la sesión actual.
    if (link.closest(".module-page-nav") && currentUser && !window.repairApp.permissions.canAccess(currentUser, moduleName)) {
      link.hidden = true;
      return;
    }
    link.addEventListener("click", () => rememberModule(link.dataset.returnModule || "permissions"));
  });
})();
