# Convex

Actualizado al 1 de septiembre de 2026.

Esta carpeta contiene el backend de Convex para el sistema Doctor Movil.

## Archivos

| Archivo | Funcion |
| --- | --- |
| `schema.ts` | Define tablas e indices. |
| `auth.ts` | Usuarios, login, sesiones, permisos root y presencia. |
| `repuestos.ts` | Inventario de repuestos. |
| `reparaciones.ts` | Ordenes de reparacion. |
| `productos.ts` | Catalogo de productos. |
| `ventas.ts` | Ventas registradas. |
| `contactos.ts` | Contactos de clientes. |
| `notas.ts` | Notas pendientes. |
| `auditoria.ts` | Eventos de auditoria. |
| `backups.ts` | Exportacion incremental y envio a Google Drive. |
| `crons.ts` | Cron diario de backup. |

## Tablas

- `usuarios`
- `sesiones`
- `presencias`
- `reparaciones`
- `auditoria`
- `respaldos`
- `notas`
- `contactos`
- `productos`
- `ventas`
- `repuestos`

## Desarrollo

Desde la raiz del proyecto:

```bash
npm install
npm run convex:dev
```

La app estatica usa la URL configurada en `convex-config.js`.

## Datos iniciales

El archivo `data/reparaciones-seed.json` contiene datos importables de
reparaciones. La importacion se hace con `reparaciones:importBatch`.

Los usuarios iniciales se crean con:

```text
auth:seedDefaultUsers({ setupSecret: SETUP_SEED_SECRET })
```

`SETUP_SEED_SECRET` debe existir en las variables de entorno de Convex. Es un
secreto temporal de inicializacion: no debe exponerse en el navegador ni
reutilizarse para backups u otras integraciones.

Usuarios creados:

- `root` / `root123`
- `admin` / `admin123`
- `usuario` / `user123`
- `activador` / `activador123`

Todas las cuentas iniciales quedan con `mustChangePassword: true`.

## Acceso a datos

Las queries de datos operativos requieren sesion y modulo correspondiente:

- `repuestos:list`: modulo `parts`.
- `productos:list`: modulo `sales`.
- `catalogoPendientes:list`: modulo `statistics`.
- `auditoria:obtener`: modulo `statistics`.

Los costos internos y precios sensibles se filtran en servidor segun permisos,
no solo desde la interfaz.

## Backups

`crons.ts` ejecuta la accion interna `backups:runScheduled` todos los dias a las
00:00 UTC. Con `BACKUP_TIMEZONE_OFFSET_MINUTES=-360`, eso equivale a 6:00 p.m.
local.

El backup se cifra en Convex antes de enviarse a Apps Script. El archivo guardado
en Drive usa extension `.json.enc` y requiere `BACKUP_ENCRYPTION_KEY` para
restaurarse.

Variables necesarias para subir a Google Drive:

```text
GOOGLE_DRIVE_BACKUP_WEBHOOK_URL
GOOGLE_DRIVE_BACKUP_SECRET=clave_para_validar_el_webhook_de_apps_script
BACKUP_ENCRYPTION_KEY=clave_para_cifrar_archivos_json_enc
BACKUP_MANUAL_RUN_SECRET=clave_para_ejecutar_backups_manual
BACKUP_TIMEZONE_OFFSET_MINUTES=-360
```

Si falta el webhook o el secreto, el backup devuelve `disabled: true` y no sube
archivos.

Si falta `BACKUP_ENCRYPTION_KEY`, el backup falla antes de subir para evitar
guardar datos planos. Las ejecuciones manuales (`backups:runManual` y
`backups:runMonthlyManual`) requieren `BACKUP_MANUAL_RUN_SECRET`; ese secreto no
es el mismo que `GOOGLE_DRIVE_BACKUP_SECRET`.
