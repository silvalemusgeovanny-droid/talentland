# Convex

Actualizado al 17 de junio de 2026.

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
auth:seedDefaultUsers
```

Usuarios creados:

- `root` / `root123`
- `admin` / `admin123`
- `usuario` / `user123`
- `activador` / `activador123`

## Backups

`crons.ts` ejecuta `backups:runScheduled` todos los dias a las 00:00 UTC. Con
`BACKUP_TIMEZONE_OFFSET_MINUTES=-360`, eso equivale a 6:00 p.m. local.

Variables necesarias para subir a Google Drive:

```text
GOOGLE_DRIVE_BACKUP_WEBHOOK_URL
GOOGLE_DRIVE_BACKUP_SECRET
BACKUP_TIMEZONE_OFFSET_MINUTES=-360
```

Si falta el webhook o el secreto, el backup devuelve `disabled: true` y no sube
archivos.

