(function () {
  const activeModuleStorageKey = "repairActiveModule";
  const panelLinks = document.querySelectorAll("[data-return-module]");

  function rememberModule(moduleName) {
    try {
      localStorage.setItem(activeModuleStorageKey, moduleName);
    } catch {}
  }

  panelLinks.forEach((link) => {
    link.addEventListener("click", () => rememberModule(link.dataset.returnModule || "permissions"));
  });
})();
