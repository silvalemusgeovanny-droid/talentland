// Carga la app principal con cache-buster (solo pagina principal).
// Sin dependencias; se ejecuta al final de <body>.
const appScript = document.createElement("script");
appScript.src = `script.js?v=status-action-icons-20260914b-${Date.now()}`;
document.body.append(appScript);
