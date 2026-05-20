import { describe, expect, it } from "vitest";
import { getCurrentAndPreviousMonthRanges } from "@/lib/period";
import { savingsRateTone } from "@/lib/finance-format";
import { isEmptySummaryPeriod, topExpenseCategories } from "@/lib/summary-widget-helpers";
describe("summary widgets", () => {
  it("periodo y helpers", () => {
    const { current, previous } = getCurrentAndPreviousMonthRanges(new Date(2026, 4, 19));
    expect(current).toEqual({ from: "2026-05-01", to: "2026-05-31" });
    expect(previous.from).toBe("2026-04-01");
    expect(savingsRateTone(25)).toBe("positive");
    expect(
      isEmptySummaryPeriod({
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        savingsRate: null,
        incomeByCategory: [],
        expenseByCategory: [],
      }),
    ).toBe(true);
    expect(
      topExpenseCategories([
        { categoryId: "1", categoryName: "A", total: 100, percentage: 10 },
        { categoryId: "2", categoryName: "B", total: 500, percentage: 50 },
      ])[0].categoryName,
    ).toBe("B");
  });
});
