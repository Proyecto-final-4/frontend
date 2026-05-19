import { describe, expect, it } from "vitest";
import {
  formatCurrency,
  formatTransactionDate,
  transactionTypeLabel,
} from "@/shared/utils/transaction";
describe("transaction utils", () => {
  it("formatea montos", () => {
    expect(formatCurrency(1500)).toMatch(/500/);
  });
  it("formatea fechas", () => {
    expect(formatTransactionDate("2026-05-01")).toMatch(/2026/);
  });
  it("traduce tipos", () => {
    expect(transactionTypeLabel("INCOME")).toBe("Ingreso");
    expect(transactionTypeLabel("EXPENSE")).toBe("Gasto");
  });
});
