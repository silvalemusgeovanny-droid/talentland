(function () {
  const activeModuleStorageKey = "repairActiveModule";
  const panelLink = document.querySelector("[data-return-module]");
  const currentModule = panelLink?.dataset.returnModule || "permissions";

  function rememberModule(moduleName) {
    try {
      localStorage.setItem(activeModuleStorageKey, moduleName);
    } catch {}
  }

  panelLink?.addEventListener("click", () => rememberModule(currentModule));
})();
