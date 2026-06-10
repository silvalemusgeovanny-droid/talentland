(function () {
  const activeModuleStorageKey = "repairActiveModule";
  const panelLink = document.querySelector("[data-return-module]");
  const backButton = document.querySelector(".page-back-button");
  const nextButton = document.querySelector(".page-next-button");
  const currentModule = panelLink?.dataset.returnModule || "permissions";
  const pageOrder = ["parts", "repairs"];
  const pageUrls = {
    parts: "repuestos.html",
    repairs: "reparaciones.html",
  };

  function rememberModule(moduleName) {
    try {
      localStorage.setItem(activeModuleStorageKey, moduleName);
    } catch {}
  }

  function goToPanel() {
    rememberModule(currentModule);
    window.location.href = "index.html";
  }

  function goBack() {
    rememberModule(currentModule);
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    goToPanel();
  }

  function goForward() {
    const currentIndex = pageOrder.indexOf(currentModule);
    const nextModule = pageOrder[currentIndex + 1];

    if (nextModule) {
      rememberModule(nextModule);
      window.location.href = pageUrls[nextModule];
      return;
    }

    goToPanel();
  }

  panelLink?.addEventListener("click", () => rememberModule(currentModule));
  backButton?.addEventListener("click", goBack);
  nextButton?.addEventListener("click", goForward);
})();
