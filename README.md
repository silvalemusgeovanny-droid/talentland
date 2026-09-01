# Sistema Doctor Movil - Documentacion tecnica

Actualizado al 17 de junio de 2026.

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

El bot de Telegram tambien puede consultar y crear notas cuando no esta limitado
al modo solo repuestos.

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

Comandos principales:

- `/buscar texto`
- `/repuestos texto`
- `/stock texto`
- `/precio texto`
- `/ia pregunta`
- `/mi_chat_id`
- `/reset`
- `/ayuda`

Variables del bot en `.env.local`:

```text
CONVEX_URL=https://tu-proyecto.convex.cloud
TELEGRAM_BOT_TOKEN=123456789:token_de_botfather
TELEGRAM_ALLOWED_CHAT_IDS=123456789
TELEGRAM_REQUIRE_AUTH=true
TELEGRAM_SILENT_UNAUTHORIZED=true
TELEGRAM_ONLY_PARTS=true
TELEGRAM_MAX_RESULTS=8
GOOGLE_AI_API_KEY=tu_api_key_de_google_ai_studio
GEMINI_MODEL=gemini-2.5-flash
CONVERSATION_MEMORY_LIMIT=8
```

Con `TELEGRAM_ONLY_PARTS=true`, el bot queda limitado a consultas de repuestos
para pruebas.

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
