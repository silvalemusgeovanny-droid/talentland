const BACKUP_SECRET = "PEGA_AQUI_LA_CLAVE_SECRETA";
const BACKUP_NOTIFY_EMAIL = "";

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    if (payload.secret !== BACKUP_SECRET) {
      return jsonResponse({ ok: false, error: "No autorizado" }, 401);
    }

    const rootFolder = ensureFolder(payload.rootFolderName);
    const cadenceFolder = ensureFolder(payload.cadenceFolder, rootFolder);
    const bytes = Utilities.base64Decode(payload.contentBase64);
    const fileName = sanitizeFileName(payload.fileName || "backup.json");
    const file = cadenceFolder.createFile(Utilities.newBlob(bytes, "application/json", fileName));

    cleanupOldBackups(cadenceFolder, Number(payload.retentionCount || 0));
    sendBackupReadyEmail({
      cadence: payload.cadence || "",
      folderName: payload.cadenceFolder || "",
      fileName: file.getName(),
      fileUrl: file.getUrl(),
      recordCount: payload.recordCount || "",
    });

    return jsonResponse({
      ok: true,
      fileId: file.getId(),
      folderId: cadenceFolder.getId(),
      fileName: file.getName(),
    });
  } catch (error) {
    return jsonResponse({ ok: false, error: String(error && error.message ? error.message : error) }, 500);
  }
}

function ensureFolder(name, parent) {
  const folders = parent ? parent.getFoldersByName(name) : DriveApp.getFoldersByName(name);
  if (folders.hasNext()) return folders.next();
  return parent ? parent.createFolder(name) : DriveApp.createFolder(name);
}

function cleanupOldBackups(folder, keep) {
  if (!keep || keep < 1) return;
  const files = [];
  const iterator = folder.getFiles();
  while (iterator.hasNext()) {
    const file = iterator.next();
    if (file.getMimeType() === "application/json" && file.getName().startsWith("backup-")) {
      files.push(file);
    }
  }
  files.sort((a, b) => b.getDateCreated().getTime() - a.getDateCreated().getTime());
  files.slice(keep).forEach((file) => file.setTrashed(true));
}

function sanitizeFileName(name) {
  return String(name).replace(/[\\/:*?"<>|]/g, "-").slice(0, 180);
}

function sendBackupReadyEmail(details) {
  if (!BACKUP_NOTIFY_EMAIL) return;

  const cadenceLabels = {
    daily: "diaria",
    weekly: "semanal",
    monthly: "mensual",
  };
  const cadenceLabel = cadenceLabels[details.cadence] || details.cadence || "programada";
  const subject = "Copia de seguridad lista";
  const body = [
    "La copia de seguridad del sistema ya esta lista.",
    "",
    "Tipo: " + cadenceLabel,
    "Carpeta: " + details.folderName,
    "Archivo: " + details.fileName,
    details.recordCount ? "Registros incluidos: " + details.recordCount : "",
    "",
    "Abrir archivo:",
    details.fileUrl,
  ].filter(Boolean).join("\n");

  MailApp.sendEmail(BACKUP_NOTIFY_EMAIL, subject, body);
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
