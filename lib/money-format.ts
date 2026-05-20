// Currency profiles available in the app
type MoneyProfile = "transaction" | "budget" | "goal" | "dashboard";

interface MoneyFormatConfig {
  locale: string;
  currency: string;
  minimumFractionDigits: number;
  maximumFractionDigits: number;
}

// Per-profile configuration.
// Unified locale es-AR / ARS (budget and goal previously used es-CO / COP).
// Fraction digits preserve each section's original behavior.
const MONEY_PROFILES: Record<MoneyProfile, MoneyFormatConfig> = {
  transaction: {
    locale: "es-AR",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  budget: { locale: "es-AR", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 0 },
  goal: { locale: "es-AR", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 0 },
  dashboard: {
    locale: "es-AR",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  },
};

// Formatter cache — flyweight to avoid recreating on every call
const formatterCache = new Map<MoneyProfile, Intl.NumberFormat>();

function getFormatter(profile: MoneyProfile): Intl.NumberFormat {
  if (!formatterCache.has(profile)) {
    const cfg = MONEY_PROFILES[profile];
    formatterCache.set(
      profile,
      new Intl.NumberFormat(cfg.locale, {
        style: "currency",
        currency: cfg.currency,
        minimumFractionDigits: cfg.minimumFractionDigits,
        maximumFractionDigits: cfg.maximumFractionDigits,
      }),
    );
  }
  return formatterCache.get(profile)!;
}

export function formatMoney(amount: number, profile: MoneyProfile = "transaction"): string {
  return getFormatter(profile).format(amount);
}

// Compatibility alias: same behavior as shared/utils/transaction (ARS, 2 decimals)
export const formatCurrency = (amount: number): string => formatMoney(amount, "transaction");
