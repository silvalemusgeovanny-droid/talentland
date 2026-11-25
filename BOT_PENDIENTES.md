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

7. Documentar cambios (5 de septiembre de 2026):
   - README actualizado con comandos, configuracion, timeouts, inicio y parada,
     logs, self-test y pruebas Vitest.

8. Notificaciones proactivas (6 de septiembre de 2026):
   - `NOTIFICATIONS_ENABLED`, `NOTIFICATIONS_INTERVAL_MINUTES` para avisar de
     estas alertas automaticamente.
   - La notificacion automatica avisa SOLO de reparaciones nuevas ingresadas
     (chat con sesion activa y modulo `repairs`). Listas/por vencer y stock bajo
     ya no se notifican de forma automatica; quedan bajo demanda con
     `/situacion` y `/faltantes`.
   - Deduplicacion por fingerprint: una misma reparacion se avisa una sola vez.
     Resumen diario (`NOTIFICATIONS_DAILY_HOUR`) disponible pero fuera de la
     programacion automatica. `/notifica` fuerza la revision manual.
   - Reparaciones nuevas: se detectan por `createdAt` posterior al ultimo aviso
     (`getNewRepairs`); las previas a la primera revision tras `/login` no se
     anuncian.
   - Pruebas en `notifications.test.js`. Se corrigio ademas el listado de
     `/notas` para incluir notas completadas propias.

9. Comandos mas amigables (7 de septiembre de 2026):
   - `/menu` rediseñado con emojis y descripcion por comando; alias naturales
     (`/faltantes`, `/situacion`, `/alerta`, `/piezas`, `/reporte`).
   - Frases variables al saludar, al no entender, al cancelar y sin resultados;
     prompt de IA con tono mas cercano.

10. Respaldo web con Exa (7 de septiembre de 2026):
    - Si `/repuestos` o `/precio` no encuentran nada en el inventario local y hay
      clave Exa, el bot muestra hasta 3 referencias web compactas dejando claro
      que NO son stock ni precios del negocio.
    - Formateador propio (`formatExaReferenceFallback`) con titulo, URL y resumen
      breve; pruebas en `notifications.test.js`.

11. Intervalos cortos (7 de septiembre de 2026):
    - `NOTIFICATIONS_INTERVAL_MINUTES` acepta decimales (minimo `0.1` = 6 s); en
      `.env.local` configurado a `0.25` (15 s) para avisar casi al momento.
    - Nuevo helper puro `notificationIntervalMs` con fallback a 30 min ante
      valores invalidos; pruebas en `notifications.test.js`.

12. Sesiones con expiracion por inactividad + tope absoluto (29 de septiembre de 2026):
    - La sesion expira tras 3 h sin actividad (cada mensaje/accion la renueva
      via `touchSession`) y como maximo a las 12 h de creada (tope absoluto en
      `convex/auth.ts`, obliga a login nuevo). Sin commit: cambio solo local.
    - El bot renueva la sesion del chat con cada mensaje (fire-and-forget).
    - README actualizado con la regla real. Pruebas del tope en
      `authorization.test.ts`; se ajustaron 2
      aserciones en `bot-access.test.js` por el keepalive `touch`.
    - Suite 251/252 (solo falla el obsoleto pre-existente en `tmp/`).
      SIN COMMIT por decision del usuario.

13. Ruido de snapshots en `tmp/` (29 de septiembre de 2026):
    - `tmp/` tiene 4 snapshots viejos del flujo Pages; su copia de
      `bot-access.test.js` fallaba siempre contra codigo actual.
    - Nuevo `vitest.config.js` que excluye `tmp/**`: suite real 70/70 verde.
      SIN COMMIT por decision del usuario (igual que punto 12).

14. XSS tapado + CSP (29 de septiembre de 2026):
    - `showUndoBar` en `script.js` y `repuestos.js` ahora escapa el mensaje.
    - Sin `<script>` inline: el arranque de tema/sesion y el cargador de la app
      se movieron a `theme-boot.js`, `session-boot.js` y `app-boot.js`.
    - CSP en las 4 paginas (scripts solo propios + Google/unpkg; estilos
      inline permitidos; sin objetos; sin iframes externos salvo Google).
      Nota: el script de Google GSI se permite pero no se usa en el JS.
    - Suite 70/70 verde. SIN COMMIT por decision del usuario.

Pendientes para continuar en la siguiente sesion:

1. Confirmar una respuesta desde el chat de Telegram. El 5 de septiembre de 2026
   se verifico `getMe` correctamente para @drmovilbot y la consulta real de
   repuestos en Convex devolvio 126 registros.
2. Verificar desde un chat privado `/login`, `/menu` y una consulta con usuarios
   de distintos permisos. Se implemento acceso por modulos el 5 de septiembre:
   consultas y notas usan la sesion del chat, sin recurrir a la cuenta activador
   interna. Menu, pendientes y contexto de IA respetan los modulos autorizados.
   La cobertura automatizada simula roles y permisos personalizados; no se
   cambiaron permisos del sistema ni se crearon notas reales de prueba.
3. Confirmar el guardado de un caso real con un usuario autorizado para notas.

Siguiente paso recomendado: iniciar sesion en Telegram y verificar el menu
personalizado y las consultas autorizadas.
