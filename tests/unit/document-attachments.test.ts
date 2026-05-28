import { describe, expect, it } from "vitest";
import {
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENT_FILES,
  validateDocumentFiles,
} from "@/lib/document-attachments";

const pdf = (overrides: Partial<{ name: string; type: string; size: number }> = {}) => ({
  name: overrides.name ?? "extracto.pdf",
  type: overrides.type ?? "application/pdf",
  size: overrides.size ?? 1024,
});

describe("validateDocumentFiles", () => {
  it("accepts supported financial document types", () => {
    expect(
      validateDocumentFiles([
        pdf(),
        pdf({ name: "movimientos.csv", type: "text/csv" }),
        pdf({
          name: "recibo.png",
          type: "image/png",
        }),
      ]),
    ).toBeNull();
  });

  it("rejects too many files", () => {
    const files = Array.from({ length: MAX_DOCUMENT_FILES + 1 }, (_, index) =>
      pdf({ name: `file-${index}.pdf` }),
    );

    expect(validateDocumentFiles(files)).toContain("máximo");
  });

  it("rejects empty files", () => {
    expect(validateDocumentFiles([pdf({ size: 0 })])).toContain("vacío");
  });

  it("rejects unsupported MIME types", () => {
    expect(validateDocumentFiles([pdf({ name: "script.js", type: "application/javascript" })]))
      .toContain("no está soportado");
  });

  it("rejects files over the combined size limit", () => {
    expect(validateDocumentFiles([pdf({ size: MAX_DOCUMENT_BYTES + 1 })])).toContain("50 MB");
  });
});
