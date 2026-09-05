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
