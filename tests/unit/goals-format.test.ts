import { describe, expect, it } from "vitest";
import { formatGoalMoney, goalProgressPercent } from "@/lib/goals-format";

describe("goalProgressPercent", () => {
  it("calcula el porcentaje acotado entre 0 y 100", () => {
    expect(goalProgressPercent(500_000, 2_000_000)).toBe(25);
    expect(goalProgressPercent(3_000_000, 2_000_000)).toBe(100);
    expect(goalProgressPercent(-100, 2_000_000)).toBe(0);
  });

  it("devuelve 0 si el objetivo es invÃ¡lido", () => {
    expect(goalProgressPercent(100, 0)).toBe(0);
  });
});

describe("formatGoalMoney", () => {
  it("formatea en pesos colombianos", () => {
    expect(formatGoalMoney(1_000_000)).toContain("1");
  });
});
