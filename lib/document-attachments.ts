export interface DocumentAttachmentMeta {
  name: string;
  type: string;
  size: number;
}

export const MAX_DOCUMENT_FILES = 5;
export const MAX_DOCUMENT_BYTES = 50 * 1024 * 1024;

export const ACCEPTED_DOCUMENT_MIME_TYPES = new Set([
  "application/pdf",
  "text/csv",
  "application/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

export const ACCEPTED_DOCUMENT_INPUT = [
  ".pdf",
  ".csv",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
].join(",");

export function formatDocumentSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function validateDocumentFiles(files: DocumentAttachmentMeta[]): string | null {
  if (files.length > MAX_DOCUMENT_FILES) {
    return `Puedes adjuntar máximo ${MAX_DOCUMENT_FILES} archivos por mensaje.`;
  }

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  if (totalBytes > MAX_DOCUMENT_BYTES) {
    return "Los documentos adjuntos no pueden superar 50 MB en total.";
  }

  for (const file of files) {
    if (file.size <= 0) {
      return `El archivo "${file.name}" está vacío.`;
    }

    if (!ACCEPTED_DOCUMENT_MIME_TYPES.has(file.type)) {
      return `El tipo de archivo de "${file.name}" no está soportado.`;
    }
  }

  return null;
}
