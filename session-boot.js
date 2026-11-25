// Marca restauracion de sesion antes del primer pintado (solo pagina principal).
// Sin dependencias; debe cargarse de forma sincronica en <head>.
try {
  if (localStorage.getItem("repairSessionToken") || localStorage.getItem("repairCurrentUser")) {
    document.documentElement.classList.add("session-restoring");
  }
} catch {}
