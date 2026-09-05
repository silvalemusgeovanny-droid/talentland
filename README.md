# Sistema Doctor Movil - Documentacion tecnica

Documentacion general al 17 de junio de 2026. Seccion del bot de Telegram
actualizada al 5 de septiembre de 2026.

Este repositorio contiene una aplicacion web estatica para administrar ventas,
reparaciones, repuestos, contactos, usuarios, notas pendientes, auditoria y
respaldos. La interfaz corre en el navegador con HTML, CSS y JavaScript, y usa
Convex como base de datos y backend serverless.

El proyecto se encuentra en:

```text
C:\Users\silva\OneDrive\Escritorio\talentland\proyecto
```

## Resumen del sistema

El sistema esta pensado para una tienda/servicio tecnico de reparacion y venta.
Sus funciones principales son:

- Inicio de sesion con usuarios guardados en Convex.
- Control de permisos por modulo.
- Panel principal con modulos de ventas, catalogo, repuestos, reparaciones,
  contactos, resumen, datos y usuarios.
- Registro y consulta de repuestos con persistencia en Convex.
- Registro y consulta de reparaciones con busqueda.
- Registro de ventas y catalogo de productos.
- Contactos de clientes con almacenamiento Convex y preparacion para Google
  Contacts.
- Notas pendientes.
- Auditoria de eventos importantes.
- Facturas imprimibles para reparaciones y ventas, con registro en auditoria.
- Bot de Telegram conectado a Convex.
- Respaldos periodicos hacia Google Drive mediante Google Apps Script.

## Tecnologias

- Frontend: HTML, CSS y JavaScript sin framework.
- Backend/base de datos: Convex.
- Bot: Node.js ESM con long polling de Telegram.
- Pruebas: Vitest.
- Integraciones opcionales: Google AI Studio/Gemini, Google Contacts y Google
  Drive mediante Apps Script.

## Archivos principales

| Archivo | Funcion |
| --- | --- |
| `index.html` | Pantalla principal, login y paneles de modulos. |
| `script.js` | Logica principal de sesion, modulos, ventas, productos, reparaciones, contactos, usuarios, resumen, facturas y auditoria. |
| `styles.css` | Diseno visual completo del sistema. |
| `convex-client.js` | Cliente del navegador para llamar queries y mutations de Convex por HTTP. |
| `convex-config.js` | Configuracion publica del deployment de Convex y Google Contacts. |
| `repuestos.html` | Vista dedicada del inventario de repuestos. |
| `repuestos.js` | Logica dedicada de repuestos, busqueda, alta, edicion, borrado y modo solo lectura. |
| `reparaciones.html` | Vista dedicada de reparaciones. |
| `reparaciones.js` | Logica dedicada de reparaciones. |
| `pending-notes.js` | Logica de notas pendientes. |
| `page-nav.js` | Navegacion auxiliar entre paginas. |
| `telegram-bot.mjs` | Bot de Telegram conectado a Convex. |
| `google-drive-backup-apps-script.js` | Script que recibe respaldos y los guarda en Google Drive. |
| `data/reparaciones-seed.json` | Datos iniciales/importables de reparaciones. |
| `login.test.js` | Pruebas automatizadas existentes con Vitest. |

## Estructura de Convex

La carpeta `convex/` contiene el backend:

| Archivo | Funcion |
| --- | --- |
| `schema.ts` | Define tablas, campos e indices. |
| `auth.ts` | Usuarios, login, sesiones, permisos root y presencia en linea. |
| `repuestos.ts` | CRUD e importacion de repuestos, validacion de duplicados, precios en centavos y normalizacion. |
| `reparaciones.ts` | CRUD e importacion de reparaciones, busqueda por varios campos. |
| `productos.ts` | Catalogo de productos para ventas. |
| `ventas.ts` | Registro y listado de ventas. |
| `contactos.ts` | Contactos de clientes, importacion y deduplicacion por telefono/sourceId/Google resource. |
| `notas.ts` | Notas pendientes, importacion, marcado y borrado. |
| `auditoria.ts` | Registro y consulta de eventos de auditoria. |
| `backups.ts` | Exportacion incremental y envio de respaldos a Google Drive. |
| `crons.ts` | Cron diario que llama `backups:runScheduled`. |
| `_generated/` | Archivos generados por Convex. No se editan manualmente. |

## Tablas actuales

Las tablas definidas en `convex/schema.ts` son:

- `usuarios`: usuarios del sistema, rol, modulos permitidos y estado activo.
- `sesiones`: sesiones activas con token hasheado y expiracion.
- `presencias`: usuarios activos para indicador en linea.
- `reparaciones`: ordenes de reparacion.
- `auditoria`: eventos importantes del sistema.
- `respaldos`: registros de backups enviados.
- `notas`: pendientes internos.
- `contactos`: clientes y datos de contacto.
- `productos`: catalogo de productos para ventas.
- `ventas`: ventas registradas.
- `repuestos`: inventario de piezas/refacciones.

Nota importante: al 17 de junio de 2026 no hay una tabla `facturas` definida en
el esquema actual. Las emisiones de factura se registran como eventos de
auditoria, por ejemplo `FACTURA_EMITIDA` y `FACTURA_VENTA_EMITIDA`.

## Deployment de Convex

El frontend apunta al deployment configurado en `convex-config.js`:

```js
window.CONVEX_URL = "https://intent-otter-921.convex.cloud";
window.GOOGLE_CONTACTS_CLIENT_ID = "";
```

Si se cambia el proyecto de Convex, hay que actualizar esa URL y verificar que
las funciones del backend esten desplegadas/sincronizadas.

## Modulos de la interfaz

El panel principal se organiza con estos modulos:

- `permissions`: inicio/resumen de permisos del usuario.
- `sales`: ventas del dia y generacion de factura de venta.
- `products`: catalogo de productos.
- `parts`: repuestos.
- `repairs`: reparaciones.
- `contacts`: contactos de clientes.
- `statistics`: resumen operativo con datos de Convex.
- `database`: herramientas/datos del sistema.
- `users`: panel de usuarios y permisos.

El modulo visible depende del rol y de la lista `modules` guardada para cada
usuario.

## Usuarios y roles

La mutacion `auth:seedDefaultUsers` crea usuarios iniciales solo si se envia el
secreto `SETUP_SEED_SECRET` configurado en Convex. Ese secreto es de
inicializacion y no debe vivir en el navegador ni reutilizarse para otros
procesos.

| Rol | Usuario | Contrasena inicial | Alcance |
| --- | --- | --- | --- |
| root | `root` | `root123` | Acceso completo, incluyendo usuarios. |
| admin | `admin` | `admin123` | Acceso administrativo sin gestionar usuarios desde el panel root. |
| user | `usuario` | `user123` | Acceso operativo limitado. |
| activador | `activador` | `activador123` | Solo consulta de repuestos. |

Las cuentas iniciales quedan marcadas con `mustChangePassword: true`. Las
contrasenas se guardan hasheadas en Convex como SHA-256 de `usuario:contrasena`.

El rol `activador` es especial: solo puede ver repuestos y no debe agregar,
editar ni borrar. Esa restriccion existe tanto en el panel principal como en
`repuestos.html`.

## Persistencia y fuente de verdad

La fuente principal de datos es Convex. Algunas partes conservan fallback a
`localStorage` cuando Convex no esta configurado o falla, pero el flujo real del
sistema debe verificarse contra el deployment de Convex.

Claves locales usadas por el navegador incluyen:

- `systemUsers`
- `customerContacts`
- datos de sesion/modulo activo
- caches o respaldos locales de algunos listados

Para repuestos, no se debe reimportar automaticamente informacion vieja de
`localStorage` a Convex porque eso puede revivir registros que ya fueron
borrados.

## Repuestos

Los repuestos se administran desde el panel principal y desde `repuestos.html`.

Funciones relevantes:

- `repuestos:list`
- `repuestos:create`
- `repuestos:update`
- `repuestos:remove`
- `repuestos:importBatch`

Reglas importantes:

- `repuestos:list` requiere una sesion activa con modulo `parts`.
- Los precios se manejan con `priceCents` y `customerPriceCents` para preservar
  montos exactos.
- El costo interno solo se devuelve a `root` o usuarios con `partsCost`; el
  precio a cliente solo se devuelve a `root` o usuarios con
  `partsCustomerPrice`.
- Se normalizan calidades como `GX`, `Original`, `Amoled`, `OLED`, `TFT`, `IPS`
  y `Generica`.
- Se valida que modelo y proveedor no sean iguales.
- Se bloquean duplicados por nombre, marca, modelo, categoria y calidad.
- La busqueda debe considerar nombre, marca, modelo, categoria, calidad y
  proveedor.

## Reparaciones

Las reparaciones se guardan en Convex en la tabla `reparaciones`.

Funciones relevantes:

- `reparaciones:list`
- `reparaciones:create`
- `reparaciones:update`
- `reparaciones:remove`
- `reparaciones:importBatch`

La busqueda revisa cliente, correo, tipo de dispositivo, marca, modelo, tipo de
reparacion, estado, notas y numero de reparacion.

## Ventas y productos

El catalogo usa la tabla `productos` y las ventas usan la tabla `ventas`.

Funciones relevantes:

- `productos:list`
- `productos:create`
- `productos:update`
- `ventas:list`
- `ventas:create`
- `ventas:remove`

El formulario de venta calcula total, recibido y cambio, y puede generar una
factura imprimible. La emision de factura de venta queda registrada en auditoria
como `FACTURA_VENTA_EMITIDA`.

`productos:list` requiere sesion activa con modulo `sales`. El costo proveedor
solo se devuelve a `root` o usuarios con permiso `partsCost`.

## Contactos

El modulo de contactos permite guardar nombre, telefono, correo y notas.

Funciones relevantes:

- `contactos:list`
- `contactos:create`
- `contactos:update`
- `contactos:remove`
- `contactos:importBatch`

La deduplicacion se hace por `googleResourceName`, `sourceId` o telefono
normalizado. `convex-config.js` contiene `GOOGLE_CONTACTS_CLIENT_ID`, pero al
dia de hoy esta vacio; por eso la integracion con Google Contacts queda como
configuracion pendiente.

## Notas pendientes

Las notas estan en la tabla `notas`.

Funciones relevantes:

- `notas:list`
- `notas:create`
- `notas:importBatch`
- `notas:toggle`
- `notas:remove`

El bot de Telegram tambien puede consultar y crear notas segun los permisos del
usuario que inicio sesion en el chat.

## Auditoria

La tabla `auditoria` guarda eventos con:

- `tipo`
- `descripcion`
- `usuario`
- `datos`
- `fecha`

Funciones relevantes:

- `auditoria:registrar`
- `auditoria:obtener`

`auditoria:obtener` requiere permiso `statistics`. `auditoria:registrar` valida
sesion y escribe como usuario real de la sesion; el cliente no decide el campo
`usuario`.

Eventos conocidos:

- `FACTURA_EMITIDA`
- `FACTURA_VENTA_EMITIDA`
- `BACKUP_DRIVE_CREADO`
- `BACKUP_DRIVE_OMITIDO`

## Facturas

Las facturas son documentos HTML imprimibles/generables como PDF desde el
navegador. Hay flujo para reparaciones y ventas.

Al emitir/imprimir/guardar, el sistema registra eventos en auditoria. No existe
tabla `facturas` en el esquema actual, asi que si se requiere historial formal
de facturas con folios, totales y detalle consultable, se debe agregar esa tabla
y las funciones Convex correspondientes.

## Resumen/estadisticas

El modulo `statistics` toma datos desde Convex, no desde almacenamiento local.
Agrupa informacion de repuestos, reparaciones, ventas y auditoria. Solo usuarios
con permisos suficientes deben verlo completo.

## Backup a Google Drive

El sistema tiene un flujo de respaldo en `convex/backups.ts`.

Caracteristicas:

- Carpeta raiz esperada: `copia de seguridad de sistema de ventas`.
- Subcarpetas por cadencia: `Diarios`, `Semanales`, `Mensuales`.
- Retencion: 7 diarios, 8 semanales y 12 mensuales.
- Cron diario: `convex/crons.ts` ejecuta la accion interna
  `backups:runScheduled` a las 00:00 UTC, equivalente a 6:00 p.m. con offset
  `-360`.
- El archivo subido a Drive es `.json.enc`. El JSON del backup se cifra antes de
  salir de Convex con `BACKUP_ENCRYPTION_KEY`.
- Si faltan `GOOGLE_DRIVE_BACKUP_WEBHOOK_URL` o `GOOGLE_DRIVE_BACKUP_SECRET`, el
  backup queda desactivado en modo seguro y no intenta subir.
- Si falta `BACKUP_ENCRYPTION_KEY`, el backup no se genera porque no puede
  proteger el contenido.
- Las funciones auxiliares de snapshot, registro y limpieza son internas. Las
  ejecuciones manuales publicas requieren `BACKUP_MANUAL_RUN_SECRET`.

Variables esperadas en Convex:

```text
GOOGLE_DRIVE_BACKUP_WEBHOOK_URL
GOOGLE_DRIVE_BACKUP_SECRET=clave_para_validar_el_webhook_de_apps_script
BACKUP_ENCRYPTION_KEY=clave_para_cifrar_archivos_json_enc
BACKUP_MANUAL_RUN_SECRET=clave_para_ejecutar_backups_manual
BACKUP_TIMEZONE_OFFSET_MINUTES=-360
```

El archivo `google-drive-backup-apps-script.js` se pega en Google Apps Script y
recibe el contenido base64 del backup protegido para guardarlo en Drive y avisar
por correo. Gmail no recibe datos planos del negocio, solo la notificacion y el
enlace al archivo protegido.

## Bot de Telegram

`telegram-bot.mjs` implementa un bot conectado a Convex mediante
`ConvexHttpClient`.

### Comandos

| Comando | Funcion |
| --- | --- |
| `/menu` o `/start` | Muestra el teclado de opciones. |
| `/ayuda` o `/help` | Muestra comandos y ejemplos. |
| `/estado` o `/status` | Muestra la configuracion activa sin revelar secretos. No sustituye una prueba de consulta a Convex. |
| `/buscar texto` o `/repuestos texto` | Busca repuestos por nombre, marca, modelo o categoria. |
| `/stock texto` | Busca repuestos con existencia. |
| `/precio texto` | Consulta el precio a cliente final. |
| `/stock_bajo` | Lista repuestos agotados o con poca existencia. |
| `/resumen` | Muestra el resumen operativo del dia. |
| `/pendientes` o `/alertas` | Consulta reparaciones listas o por vencer, catalogo pendiente y stock bajo. |
| `/cliente texto` o `/atencion texto` | Clasifica un caso de garantia, cotizacion, seguimiento o queja; busca reparaciones relacionadas e intenta guardar una nota interna en Convex. La respuesta indica si se guardo. |
| `/login` | Solicita el usuario y la contrasena del sistema para iniciar sesion en el chat. |
| `/logout` | Cierra la sesion del chat. |
| `/mi_usuario` | Muestra el usuario conectado. |
| `/cancelar` | Cancela la captura pendiente. |
| `/ia pregunta` | Responde con Gemini usando contexto interno y, cuando corresponde y esta configurado, referencias de Exa. |
| `/web pregunta` o `/investigar pregunta` | Fuerza la busqueda de referencias externas con Exa para la respuesta de IA. |
| `/mi_chat_id` | Muestra el ID necesario para autorizar el chat. |
| `/reset` o `/reiniciar` | Borra la memoria conversacional del chat. |
| `/reparaciones texto`, `/reparacion numero` | Consulta reparaciones con permiso `repairs`. |
| `/nota`, `/notas` | Muestra notas propias pendientes y completadas; root ve las de todos. Requiere `notes`. |
| `/nota texto` | Crea una nota a nombre del usuario conectado; activador no puede escribir. |

Ejemplos: `/repuestos iphone 11`, `/precio samsung a12`,
`/cliente garantia pantalla iphone 11` y `/ia compatibilidad pantalla iphone 11`.
El bot tambien interpreta consultas en lenguaje natural. Las respuestas de IA
indican el estado de las referencias externas.

### Configuracion

Variables del bot en `.env.local`:

```text
CONVEX_URL=https://tu-proyecto.convex.cloud
TELEGRAM_BOT_TOKEN=123456789:token_de_botfather
TELEGRAM_ALLOWED_CHAT_IDS=123456789
TELEGRAM_REQUIRE_AUTH=true
TELEGRAM_SILENT_UNAUTHORIZED=true
TELEGRAM_APP_USERNAME=usuario_del_bot
TELEGRAM_APP_PASSWORD=contrasena_del_bot
TELEGRAM_MAX_RESULTS=8
TELEGRAM_SUMMARY_RESULTS=5
TELEGRAM_LOW_STOCK_THRESHOLD=2
TELEGRAM_POLL_TIMEOUT_SECONDS=25
TELEGRAM_FETCH_TIMEOUT_MS=35000
GOOGLE_AI_API_KEY=tu_api_key_de_google_ai_studio
GEMINI_MODEL=gemini-2.5-flash
GEMINI_FETCH_TIMEOUT_MS=25000
EXA_API_KEY=tu_api_key_de_exa
EXA_MAX_RESULTS=5
EXA_FETCH_TIMEOUT_MS=12000
CONVERSATION_MEMORY_LIMIT=8
```

`CONVEX_URL` y `TELEGRAM_BOT_TOKEN` son obligatorios para cargar el bot.
Las credenciales `TELEGRAM_APP_USERNAME` y `TELEGRAM_APP_PASSWORD` se conservan
para la bitacora interna; no se usan para consultar datos ni guardar notas del
usuario. El acceso individual se gestiona con `/login` en un chat privado.
Cada consulta valida la sesion actual en Convex. Al reiniciar el bot hay que
iniciar sesion nuevamente. Las sesiones del navegador y Telegram son independientes.
Sin `TELEGRAM_ALLOWED_CHAT_IDS`, solo queda disponible `/mi_chat_id`.
No publicar `.env.local` ni copiar sus secretos en la documentacion.

`TELEGRAM_ONLY_PARTS` ya no controla el acceso. El menu y `/ayuda` muestran
comandos segun los modulos del usuario. Root conserva acceso completo; los demas
roles usan sus modulos configurados y, si no hay lista, los valores predeterminados
del sistema. Una lista vacia no concede acceso. Convex mantiene la validacion final.

| Permiso | Funciones disponibles |
| --- | --- |
| `parts` | Repuestos, stock y stock bajo. |
| `parts` + `partsCustomerPrice` | Consulta de precios a cliente. |
| `repairs` | Consulta de reparaciones. |
| `notes` | Lectura de notas; creacion y `/cliente` si el rol permite escribir. |
| `statistics` | Resumen y catalogo pendiente. El resumen solo consulta los otros modulos autorizados. |

`/pendientes` incluye solo las secciones autorizadas. `/cliente` guarda el caso
con la sesion del usuario y solo busca reparaciones si tiene permiso `repairs`.
Activador nunca puede escribir, incluso si se le asigna `notes`.
La consulta del bot `notas:listForBot` filtra en Convex por `authorUsername`
antes del limite de 500 registros; root puede consultar todos los autores.
El bot muestra hasta `TELEGRAM_MAX_RESULTS` notas recientes e indica el total
consultado. La creacion asigna el autor desde la sesion autenticada.
Las notas antiguas cuyo autor solo identifica una cuenta Telegram no se reasignan
automaticamente; root puede verlas. El listado de notas de la web conserva su alcance.
La IA usa el inventario permitido para el usuario y omite precios restringidos.
La memoria de IA se borra al cambiar de usuario, cerrar sesion o detectar cambios
de permisos. Los modulos del sistema sin comandos propios siguen disponibles en
la web; el numero de modulos no representa un rango de acceso.
Gemini acepta tambien `GEMINI_API_KEY` como alternativa a `GOOGLE_AI_API_KEY`.
Sin clave de Gemini no funciona `/ia`; sin Exa no hay referencias externas.

Los tiempos de espera de HTTP se expresan en milisegundos. El timeout de
Telegram vale por defecto el tiempo de long polling (25 segundos) mas 10 segundos.
Gemini espera hasta 25 segundos y Exa hasta 12 segundos. Ante errores de polling,
el bot registra el fallo y reintenta tras 2,5 segundos.

### Inicio, parada y logs en Windows

En primer plano: `npm.cmd run bot:telegram`. Detener con `Ctrl+C`.
Para ejecutarlo en segundo plano, abrir `iniciar-bot-telegram.bat`.
Para detener esa instancia, abrir `detener-bot-telegram.bat`.
Los scripts usan `.telegram-bot.pid` para identificar el proceso y escriben
`telegram-bot.out.log` y `telegram-bot.err.log`. Evitar iniciar varias instancias
con el mismo token de Telegram.

Los logs incluyen fecha UTC, nivel y servicio (Telegram, Convex, Gemini o Exa).
Los errores de servicios distintos de Convex tambien intentan registrarse en
la auditoria de Convex; si ese registro falla, queda una advertencia local.
Revisar `/estado` y hacer una consulta como `/repuestos iphone 11` despues de
iniciar: el mensaje de arranque por si solo no confirma conectividad.

Si aparece `fetch failed`, revisar la conexion y el acceso de red del proceso.
Si Convex rechaza `sessionToken` o devuelve errores de permisos, verificar las
funciones desplegadas y los permisos del usuario conectado. Un caso `/cliente`
no debe darse por guardado cuando la respuesta indica que fallo la nota.

### Pruebas del bot

```bash
node telegram-bot.mjs --self-test
npx vitest run telegram-bot.test.js
npx vitest run bot-access.test.js authorization.test.ts
```

En PowerShell se puede usar `npx.cmd`. El self-test valida funciones locales y
termina sin iniciar polling; Vitest comprueba intenciones, clasificacion de casos,
referencias externas y formatos de respuesta y logs sin depender de Telegram.
Ambos cargan el modulo del bot, por lo que requieren `CONVEX_URL` y
`TELEGRAM_BOT_TOKEN` en el entorno o `.env.local`; para estas pruebas locales
pueden usarse valores ficticios con una URL de Convex valida en formato.
Las pruebas de acceso simulan Convex y Telegram para verificar permisos por modulo,
sesiones, comandos directos, lenguaje natural y contexto de IA. No verifican
conectividad ni escrituras reales en Convex.

## Como correr el proyecto

Instalar dependencias:

```bash
npm install
```

Levantar Convex en desarrollo:

```bash
npm run convex:dev
```

Abrir el frontend:

- Opcion simple: abrir `index.html` directamente en el navegador.
- Opcion servidor local:

```bash
npx serve .
```

Ejecutar bot:

```bash
npm run bot:telegram
```

Ejecutar pruebas:

```bash
npm test
```

En Windows/PowerShell, si hay problemas con scripts, usar `npm.cmd` o `npx.cmd`.

## Publicacion

Este proyecto es una aplicacion estatica, por lo que puede publicarse en GitHub
Pages u otro hosting estatico. Hay que cuidar:

- Que la rama publicada sea la correcta (`main` o `master`, segun la
  configuracion real de Pages).
- Que los archivos JS/CSS tengan version/cache-busting cuando se necesite evitar
  cache del navegador.
- Que `convex-config.js` apunte al deployment correcto.
- Que las funciones y esquema de Convex esten desplegados antes de probar en
  produccion.

## Comandos utiles

```bash
cd "C:\Users\silva\OneDrive\Escritorio\talentland\proyecto"
npm install
npm run convex:dev
npx serve .
npm test
npm run bot:telegram
```

Para Git:

```bash
git status
git add .
git commit -m "descripcion del cambio"
git push origin master
```

Confirmar la rama remota antes de publicar, porque el sitio puede estar tomando
`main` o `master`.

## Pendientes y riesgos conocidos

- La integracion de Google Contacts requiere configurar
  `GOOGLE_CONTACTS_CLIENT_ID`.
- El backup a Google Drive requiere configurar el webhook y secreto en Convex.
- No existe tabla formal de facturas; solo eventos de auditoria para emisiones.
- Algunas rutas mantienen fallback local para trabajar sin Convex, pero la fuente
  real debe ser Convex.
- Las credenciales iniciales son conocidas; en uso real se deben cambiar.
- El sistema no usa framework ni bundler, asi que el orden de scripts en HTML es
  importante.
- Los archivos generados de Convex no deben editarse manualmente.

## Guia para otro programador

1. Revisar `convex-config.js` para confirmar el deployment real.
2. Ejecutar `npm install`.
3. Levantar `npm run convex:dev` si va a modificar backend.
4. Abrir `index.html` o servir el sitio con `npx serve .`.
5. Revisar `convex/schema.ts` antes de cambiar datos.
6. Usar `convex-client.js` para entender que funciones consume el frontend.
7. Revisar `script.js` para el flujo principal y `repuestos.js` para la vista
   dedicada de repuestos.
8. Antes de tocar permisos, probar con `root`, `admin`, `usuario` y `activador`.
9. Antes de tocar repuestos, verificar que no se reactive ninguna importacion
   automatica desde `localStorage`.
10. Si se agregan tablas o funciones Convex, desplegar/sincronizar Convex antes
    de validar en la interfaz.
