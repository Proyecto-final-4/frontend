import { describe, expect, it } from "vitest";
import { formatGoalMoney, goalProgressPercent } from "@/lib/goals-format";

describe("goalProgressPercent", () => {
  it("computes percentage clamped between 0 and 100", () => {
    expect(goalProgressPercent(500_000, 2_000_000)).toBe(25);
    expect(goalProgressPercent(3_000_000, 2_000_000)).toBe(100);
    expect(goalProgressPercent(-100, 2_000_000)).toBe(0);
  });

  it("returns 0 when the target amount is invalid", () => {
    expect(goalProgressPercent(100, 0)).toBe(0);
  });
});

describe("formatGoalMoney", () => {
  it("formats amounts in Colombian pesos", () => {
    expect(formatGoalMoney(1_000_000)).toContain("1");
  });
});
