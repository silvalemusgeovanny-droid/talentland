import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

type Cadence = "daily" | "weekly" | "monthly";

const rootFolderName = "copia de seguridad de sistema de ventas";
const cadenceFolders: Record<Cadence, string> = {
  daily: "Diarios",
  weekly: "Semanales",
  monthly: "Mensuales",
};
const retentionByCadence: Record<Cadence, number> = {
  daily: 7,
  weekly: 8,
  monthly: 12,
};

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getTimezoneOffsetMinutes() {
  return Number(process.env.BACKUP_TIMEZONE_OFFSET_MINUTES || "-360");
}

function requireBackupSecret(secret: string) {
  const expectedSecret = process.env.BACKUP_MANUAL_RUN_SECRET;
  if (!expectedSecret || secret !== expectedSecret) {
    throw new Error("No autorizado para ejecutar backups manuales.");
  }
}

function toLocalShifted(date: Date) {
  return new Date(date.getTime() + getTimezoneOffsetMinutes() * 60 * 1000);
}

function localIsoDate(date: Date) {
  return isoDate(toLocalShifted(date));
}

function fromLocalShifted(date: Date) {
  return new Date(date.getTime() - getTimezoneOffsetMinutes() * 60 * 1000);
}

function startOfLocalDay(date: Date) {
  const local = toLocalShifted(date);
  return fromLocalShifted(new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate())));
}

function startOfLocalMonth(date: Date) {
  const local = toLocalShifted(date);
  return fromLocalShifted(new Date(Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), 1)));
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setUTCMonth(next.getUTCMonth() + months);
  return next;
}

function getPeriods(now = new Date()) {
  const todayStart = startOfLocalDay(now);
  const currentMonthStart = startOfLocalMonth(now);
  return {
    daily: { start: todayStart, end: now },
    weekly: { start: addDays(todayStart, -6), end: now },
    monthly: { start: currentMonthStart, end: now },
  };
}

function shouldRunCadence(cadence: Cadence, now = new Date()) {
  if (cadence === "daily") return true;
  const local = toLocalShifted(now);
  const tomorrow = addDays(local, 1);
  if (cadence === "weekly") return local.getUTCDay() === 0;
  return tomorrow.getUTCDate() === 1 || addMonths(startOfLocalMonth(now), 1) <= now;
}

function isActiveInPeriod(item: Record<string, unknown>, start: Date, end: Date) {
  if (typeof item.tipo === "string" && item.tipo.startsWith("BACKUP_DRIVE_")) {
    return false;
  }
  const candidates = [
    item.createdAt,
    item.updatedAt,
    item.publishedAt,
    item.deliveredAt,
    item.fecha,
  ];
  return candidates.some((value) => {
    if (!value || typeof value !== "string") return false;
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) && date >= start && date < end;
  });
}

function countRecords(snapshot: Record<string, unknown[]>) {
  return Object.values(snapshot).reduce((sum, rows) => sum + rows.length, 0);
}

function mergeRowsById<T extends { _id: unknown }>(...groups: T[][]) {
  const rows = new Map<unknown, T>();
  groups.flat().forEach((row) => rows.set(row._id, row));
  return Array.from(rows.values());
}

function base64Encode(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function randomBytes(length: number) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

async function encryptBackupContent(content: string) {
  const encryptionKey = process.env.BACKUP_ENCRYPTION_KEY;
  if (!encryptionKey || encryptionKey.length < 16) {
    throw new Error("Falta BACKUP_ENCRYPTION_KEY de al menos 16 caracteres para proteger los backups.");
  }

  const keyDigest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(encryptionKey));
  const key = await crypto.subtle.importKey("raw", keyDigest, { name: "AES-GCM" }, false, ["encrypt"]);
  const iv = randomBytes(12);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(content));

  return JSON.stringify({
    format: "doctor-movil-backup-encrypted-v1",
    algorithm: "AES-256-GCM",
    exportedAt: new Date().toISOString(),
    ivBase64: base64Encode(iv),
    ciphertextBase64: base64Encode(new Uint8Array(ciphertext)),
  }, null, 2);
}

async function sendBackupToAppsScript(args: {
  cadence: Cadence;
  cadenceFolder: string;
  retentionCount: number;
  fileName: string;
  content: string;
  recordCount: number;
}) {
  const webhookUrl = process.env.GOOGLE_DRIVE_BACKUP_WEBHOOK_URL;
  const secret = process.env.GOOGLE_DRIVE_BACKUP_SECRET;
  if (!webhookUrl || !secret) {
    return { disabled: true, driveFileId: "", folderId: "" };
  }

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      secret,
      rootFolderName,
      cadence: args.cadence,
      cadenceFolder: args.cadenceFolder,
      retentionCount: args.retentionCount,
      fileName: args.fileName,
      recordCount: args.recordCount,
      contentBase64: base64Encode(new TextEncoder().encode(args.content)),
    }),
  });
  const result = await response.json();
  if (!response.ok || !result.ok) {
    throw new Error(result.error || "Google Apps Script rechazo el backup.");
  }
  return {
    disabled: false,
    driveFileId: String(result.fileId || ""),
    folderId: String(result.folderId || ""),
  };
}

export const exportSnapshot = internalQuery({
  args: {
    periodStart: v.string(),
    periodEnd: v.string(),
  },
  handler: async (ctx, args) => {
    const periodRange = (field: string) => (q: any) =>
      q.gte(field, args.periodStart).lt(field, args.periodEnd);

    const reparacionesCreated = await ctx.db
      .query("reparaciones")
      .withIndex("by_created_at", periodRange("createdAt"))
      .collect();
    const reparacionesDelivered = await ctx.db
      .query("reparaciones")
      .withIndex("by_delivered_at", periodRange("deliveredAt"))
      .collect();
    const notasCreated = await ctx.db
      .query("notas")
      .withIndex("by_created_at", periodRange("createdAt"))
      .collect();
    const notasUpdated = await ctx.db
      .query("notas")
      .withIndex("by_updated_at", periodRange("updatedAt"))
      .collect();
    const contactosCreated = await ctx.db
      .query("contactos")
      .withIndex("by_created_at", periodRange("createdAt"))
      .collect();
    const contactosUpdated = await ctx.db
      .query("contactos")
      .withIndex("by_updated_at", periodRange("updatedAt"))
      .collect();
    const productosCreated = await ctx.db
      .query("productos")
      .withIndex("by_created_at", periodRange("createdAt"))
      .collect();
    const productosUpdated = await ctx.db
      .query("productos")
      .withIndex("by_updated_at", periodRange("updatedAt"))
      .collect();
    const repuestosPublished = await ctx.db
      .query("repuestos")
      .withIndex("by_published_at", periodRange("publishedAt"))
      .collect();
    const repuestosUpdated = await ctx.db
      .query("repuestos")
      .withIndex("by_updated_at", periodRange("updatedAt"))
      .collect();
    const auditoria = await ctx.db
      .query("auditoria")
      .withIndex("by_fecha", periodRange("fecha"))
      .collect();

    const snapshot = {
      exportedAt: new Date().toISOString(),
      periodStart: args.periodStart,
      periodEnd: args.periodEnd,
      backupMode: "periodic-incremental",
      reparaciones: mergeRowsById(reparacionesCreated, reparacionesDelivered),
      ventas: await ctx.db
        .query("ventas")
        .withIndex("by_created_at", periodRange("createdAt"))
        .collect(),
      productos: mergeRowsById(productosCreated, productosUpdated),
      repuestos: mergeRowsById(repuestosPublished, repuestosUpdated),
      contactos: mergeRowsById(contactosCreated, contactosUpdated),
      usuarios: await ctx.db.query("usuarios").take(1000),
      auditoria: auditoria.filter((item) => !item.tipo.startsWith("BACKUP_DRIVE_")),
      notas: mergeRowsById(notasCreated, notasUpdated),
    };
    const hasActivity = Object.entries(snapshot).some(([key, value]) =>
      Array.isArray(value) &&
      key !== "usuarios" &&
      value.length > 0
    );
    return {
      snapshot,
      hasActivity,
      recordCount: countRecords(snapshot as unknown as Record<string, unknown[]>),
    };
  },
});

export const registerBackup = internalMutation({
  args: {
    cadence: v.string(),
    fileName: v.string(),
    driveFileId: v.string(),
    folderId: v.string(),
    periodStart: v.string(),
    periodEnd: v.string(),
    bytes: v.number(),
    recordCount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("respaldos", {
      ...args,
      createdAt: new Date().toISOString(),
      status: "uploaded",
    });
    await ctx.db.insert("auditoria", {
      tipo: "BACKUP_DRIVE_CREADO",
      descripcion: `Backup ${args.cadence} guardado en Google Drive`,
      usuario: "sistema",
      datos: JSON.stringify({
        fileName: args.fileName,
        driveFileId: args.driveFileId,
        periodStart: args.periodStart,
        periodEnd: args.periodEnd,
        recordCount: args.recordCount,
      }),
      fecha: new Date().toISOString(),
    });
  },
});

export const registerSkippedBackup = internalMutation({
  args: {
    cadence: v.string(),
    periodStart: v.string(),
    periodEnd: v.string(),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("auditoria", {
      tipo: "BACKUP_DRIVE_OMITIDO",
      descripcion: `Backup ${args.cadence} omitido`,
      usuario: "sistema",
      datos: JSON.stringify(args),
      fecha: new Date().toISOString(),
    });
  },
});

export const listOldBackups = internalQuery({
  args: {
    cadence: v.string(),
    keep: v.number(),
  },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("respaldos")
      .withIndex("by_cadence", (q) => q.eq("cadence", args.cadence))
      .collect();
    return rows
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(args.keep);
  },
});

export const removeBackupRecord = internalMutation({
  args: {
    id: v.id("respaldos"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

async function runBackupCadence(ctx: any, cadence: Cadence, period: { start: Date; end: Date }) {
  const periodStart = period.start.toISOString();
  const periodEnd = period.end.toISOString();
  const { snapshot, hasActivity, recordCount } = await ctx.runQuery(internal.backups.exportSnapshot, {
    periodStart,
    periodEnd,
  });

  if (!hasActivity) {
    await ctx.runMutation(internal.backups.registerSkippedBackup, {
      cadence,
      periodStart,
      periodEnd,
      reason: "Sin actividad en el periodo",
    });
    return { cadence, skipped: true };
  }

  const fileName = `backup-${cadence}-${localIsoDate(period.start)}-a-${localIsoDate(period.end)}.json.enc`;
  const content = JSON.stringify({ cadence, folder: cadenceFolders[cadence], ...snapshot }, null, 2);
  const protectedContent = await encryptBackupContent(content);
  const uploaded = await sendBackupToAppsScript({
    cadence,
    cadenceFolder: cadenceFolders[cadence],
    retentionCount: retentionByCadence[cadence],
    fileName,
    content: protectedContent,
    recordCount,
  });
  if (uploaded.disabled) {
    return { cadence, disabled: true };
  }

  await ctx.runMutation(internal.backups.registerBackup, {
    cadence,
    fileName,
    driveFileId: uploaded.driveFileId,
    folderId: uploaded.folderId,
    periodStart,
    periodEnd,
    bytes: new TextEncoder().encode(protectedContent).length,
    recordCount,
  });
  const oldBackups = await ctx.runQuery(internal.backups.listOldBackups, {
    cadence,
    keep: retentionByCadence[cadence],
  });
  for (const oldBackup of oldBackups) {
    await ctx.runMutation(internal.backups.removeBackupRecord, { id: oldBackup._id });
  }

  return { cadence, skipped: false, fileName };
}

export const runScheduled = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = new Date();
    const periods = getPeriods(now);
    const results = [];

    for (const cadence of ["daily", "weekly", "monthly"] as Cadence[]) {
      if (!shouldRunCadence(cadence, now)) continue;
      const period = periods[cadence];
      results.push(await runBackupCadence(ctx, cadence, period));
    }

    return results;
  },
});

export const runManual = action({
  args: {
    cadence: v.union(v.literal("daily"), v.literal("weekly"), v.literal("monthly")),
    backupSecret: v.string(),
  },
  handler: async (ctx, args) => {
    requireBackupSecret(args.backupSecret);
    const now = new Date();
    const periods = getPeriods(now);
    return runBackupCadence(ctx, args.cadence, periods[args.cadence]);
  },
});

export const runMonthlyManual = action({
  args: {
    backupSecret: v.string(),
  },
  handler: async (ctx, args) => {
    requireBackupSecret(args.backupSecret);
    const now = new Date();
    const periods = getPeriods(now);
    return runBackupCadence(ctx, "monthly", periods.monthly);
  },
});
