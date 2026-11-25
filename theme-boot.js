// Aplica el modo oscuro guardado antes del primer pintado (sin parpadeo).
// Sin dependencias; debe cargarse de forma sincronica en <head>.
try {
  if (localStorage.getItem("loginColorMode") === "dark") document.documentElement.classList.add("login-dark");
} catch {}
