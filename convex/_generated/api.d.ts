/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auditoria from "../auditoria.js";
import type * as auth from "../auth.js";
import type * as authorization from "../authorization.js";
import type * as backups from "../backups.js";
import type * as catalogoPendientes from "../catalogoPendientes.js";
import type * as contactos from "../contactos.js";
import type * as crons from "../crons.js";
import type * as notas from "../notas.js";
import type * as productos from "../productos.js";
import type * as reparaciones from "../reparaciones.js";
import type * as repuestos from "../repuestos.js";
import type * as ventas from "../ventas.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auditoria: typeof auditoria;
  auth: typeof auth;
  authorization: typeof authorization;
  backups: typeof backups;
  catalogoPendientes: typeof catalogoPendientes;
  contactos: typeof contactos;
  crons: typeof crons;
  notas: typeof notas;
  productos: typeof productos;
  reparaciones: typeof reparaciones;
  repuestos: typeof repuestos;
  ventas: typeof ventas;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
