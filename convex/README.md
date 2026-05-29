# Convex

Estos archivos preparan la tabla `reparaciones` para subir la base que esta en:

```text
data/reparaciones-seed.json
```

Pasos cuando tengas tu proyecto de Convex:

```bash
npm install convex
npx convex dev
```

Despues importa los datos desde el dashboard de Convex o con un script que llame la mutacion `reparaciones:importBatch` en lotes.

La app estatica puede conectarse al deployment poniendo tu URL en `convex-config.js`.
