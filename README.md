# Inventario y Reparaciones

Aplicacion web estatica para demostrar un sistema basico de inicio de sesion por roles y administracion de repuestos para celulares, computadoras y electrodomesticos.

El proyecto funciona directamente en el navegador abriendo `index.html`. No requiere servidor, base de datos ni instalacion de dependencias.

## Para que sirve

El sistema sirve como prototipo visual y funcional de:

- Inicio de sesion con roles de Administrador, Vendedor y Tecnico.
- Pantalla de acceso con tres propuestas visuales: Administrativo, Tecnico y Moderno.
- Visualizacion de permisos segun el rol seleccionado.
- Registro rapido de repuestos desde el panel posterior al login.
- Pagina completa de inventario de repuestos.
- Busqueda, listado, resumen y eliminacion de repuestos.
- Persistencia temporal de datos usando el almacenamiento local del navegador.

## Archivos principales

### `index.html`

Es la pantalla principal del proyecto. Contiene:

- Panel de marca y descripcion del sistema.
- Selector de propuestas visuales para el login.
- Formulario de inicio de sesion.
- Panel de sesion activa despues de iniciar sesion.
- Modulo de permisos por rol.
- Modulo compacto para registrar repuestos.
- Enlace a la pagina completa `repuestos.html`.
- Indicador fijo de fecha y hora.

Este archivo carga los estilos desde `styles.css` y la logica desde `script.js`.

### `script.js`

Controla el comportamiento de `index.html`.

Sus responsabilidades principales son:

- Definir los tres temas visuales del login.
- Definir los usuarios de demostracion y sus permisos.
- Cambiar la apariencia del login segun la propuesta seleccionada.
- Autocompletar credenciales demo al cambiar de rol.
- Validar el acceso comparando usuario y contrasena escritos en el formulario.
- Mostrar el panel de sesion cuando las credenciales son correctas.
- Mostrar permisos del rol activo.
- Registrar repuestos rapidos en `localStorage`.
- Renderizar los ultimos repuestos guardados.
- Actualizar fecha y hora cada segundo.

Credenciales demo:

| Rol | Usuario | Contrasena |
| --- | --- | --- |
| Administrador | `admin` | `admin123` |
| Vendedor | `vendedor` | `venta123` |
| Tecnico | `tecnico` | `repara123` |

### `repuestos.html`

Es la pagina dedicada al inventario de repuestos. Contiene:

- Encabezado con enlace para volver al login.
- Resumen del inventario: total de repuestos, valor total y proveedores.
- Formulario completo de alta de repuestos.
- Tabla de consulta.
- Buscador por nombre, categoria, calidad o proveedor.
- Boton para eliminar registros.
- Indicador fijo de fecha y hora.

Este archivo carga los estilos desde `styles.css` y la logica desde `repuestos.js`.

### `repuestos.js`

Controla el comportamiento de `repuestos.html`.

Sus responsabilidades principales son:

- Cargar repuestos desde `localStorage`.
- Crear repuestos iniciales cuando no existen datos guardados.
- Guardar nuevos repuestos.
- Calcular el valor total del inventario.
- Contar proveedores unicos.
- Filtrar repuestos usando el buscador.
- Renderizar la tabla.
- Eliminar repuestos.
- Formatear valores en moneda mexicana.
- Actualizar fecha y hora cada segundo.

### `styles.css`

Contiene todo el diseno visual del proyecto.

Incluye:

- Variables de color y tipografia.
- Layout responsivo del login.
- Estilos de tarjetas, formularios, botones y tablas.
- Temas visuales para las propuestas de login.
- Estilos para la pagina de repuestos.
- Adaptaciones para tablet y movil mediante media queries.

## Flujo de uso

1. Abrir `index.html` en el navegador.
2. Elegir una propuesta visual si se desea.
3. Seleccionar un rol.
4. Usar las credenciales demo que aparecen en pantalla.
5. Iniciar sesion.
6. Consultar permisos del rol activo.
7. Registrar repuestos desde el modulo rapido o entrar a `repuestos.html`.
8. En `repuestos.html`, agregar, buscar o eliminar repuestos.

## Almacenamiento de datos

Los repuestos se guardan en `localStorage` con la clave:

```text
inventoryParts
```

Esto significa que los datos:

- Permanecen en el mismo navegador despues de recargar la pagina.
- No se comparten entre distintos navegadores o computadoras.
- Se pierden si el usuario limpia los datos del navegador.
- No estan guardados en una base de datos real.

## Limitaciones actuales

- No tiene backend: toda la logica corre en el navegador.
- No hay autenticacion real: los usuarios y contrasenas estan escritos en `script.js`.
- No hay cifrado de credenciales.
- Cualquier persona puede ver o modificar el codigo desde las herramientas del navegador.
- No existen permisos reales en servidor; los roles solo cambian lo que se muestra en pantalla.
- No hay base de datos centralizada.
- No hay control de sesiones persistente.
- No hay exportacion ni importacion real desde Excel, aunque el permiso de administrador lo menciona como una funcion esperada.
- No hay edicion de repuestos existentes; solo alta, busqueda y eliminacion.
- No hay validacion avanzada de datos duplicados, precios negativos fuera del control basico del input, nombres vacios con solo espacios o stock inconsistente.
- No hay confirmacion antes de eliminar un repuesto.
- No hay historial de cambios ni auditoria.
- No hay manejo de errores si `localStorage` esta bloqueado o si los datos guardados se corrompen.
- Los datos iniciales se generan con `crypto.randomUUID()`, por lo que los identificadores cambian cuando se crea una nueva lista inicial.
- La aplicacion depende de funciones modernas del navegador, como `crypto.randomUUID()`, `Intl.NumberFormat`, `Intl.DateTimeFormat` y `localStorage`.
- No cuenta con pruebas automatizadas.

## Posibles mejoras

- Crear un backend con Node.js, PHP, Python o similar.
- Conectar una base de datos real.
- Implementar autenticacion segura con contrasenas cifradas.
- Manejar sesiones y permisos desde servidor.
- Agregar edicion de repuestos.
- Agregar confirmacion antes de eliminar.
- Validar duplicados y campos con mayor detalle.
- Importar y exportar inventario desde Excel.
- Agregar reportes de ventas, reparaciones e inventario.
- Separar estilos por modulo si el proyecto crece.
- Agregar pruebas automatizadas para las funciones principales.

## Estado del proyecto

El proyecto es un prototipo funcional de interfaz. Es util para presentar la idea, probar flujos basicos y explicar la estructura de un sistema de inventario y reparaciones, pero no esta listo para usarse en produccion sin agregar backend, seguridad, base de datos y validaciones mas completas.
