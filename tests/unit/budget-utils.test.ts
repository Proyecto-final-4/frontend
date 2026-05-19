import { describe, expect, it } from "vitest";
import {
  formatBudgetPeriod,
  formatCurrency,
  getProgressBarClass,
  getProgressWidth,
} from "@/shared/utils/budget";

describe("budget utils", () => {
  it("formatea periodos", () => {
    expect(formatBudgetPeriod("MONTHLY")).toBe("Mensual");
  });
  it("formatea moneda", () => {
    expect(formatCurrency(500000)).toContain("500");
  });
  it("barra roja al superar limite", () => {
    expect(getProgressBarClass(100)).toBe("bg-destructive");
  });
  it("barra ambar cerca del limite", () => {
    expect(getProgressBarClass(85)).toBe("bg-amber-500");
  });
  it("ancho maximo 100", () => {
    expect(getProgressWidth(150)).toBe(100);
  });
});
