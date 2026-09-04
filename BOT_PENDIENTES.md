# Pendientes del bot de Telegram

Completado:

1. Probado en Telegram con casos reales; el bot responde:
   - `/menu`
   - `/estado`
   - `/repuestos iphone 11`
   - `/precio samsung a12`
   - `/cliente garantia pantalla iphone 11`
   - `/ia compatibilidad pantalla iphone 11`

2. Mejorado Exa:
   - Confirmar cuando se activa.
   - Mostrar en la respuesta si uso referencias externas.
   - Agregar `/web` y `/investigar` para forzar busqueda externa.

3. Atencion a clientes exacta:
   - Agregar respuestas para garantias, cotizaciones, seguimiento de reparacion y quejas.
   - Conectar respuestas con reparaciones/clientes reales de Convex cuando este listo.

4. Persistir casos de cliente:
   - Guardar solicitudes de `/cliente` como nota, ticket o pendiente interno.

5. Pruebas mas formales:
   - Convertir `node telegram-bot.mjs --self-test` en pruebas Vitest reales.
   - Probar comandos principales sin depender de Telegram.

6. Mejorar logs:
   - Guardar errores importantes con fecha.
   - Registrar fallas de Telegram, Convex, Gemini o Exa.

Pendientes para continuar en la siguiente sesion:

1. Documentar cambios:
   - Actualizar `README.md` con `/menu`, `/estado`, `/cliente`, timeouts y self-test.

Siguiente paso recomendado: actualizar README.
