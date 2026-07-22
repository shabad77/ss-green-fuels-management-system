// Shared helpers for turning a period selection (monthly/quarterly/annual)
// into a concrete date range, used by every report export route.

export type PeriodType = "monthly" | "quarterly" | "annual";

export function getPeriodRange(
  type: PeriodType,
  year: number,
  month?: number, // 1-12, required for monthly
  quarter?: number // 1-4, required for quarterly
): { start: Date; end: Date; label: string } {
  if (type === "monthly") {
    const m = month ?? 1;
    const start = new Date(Date.UTC(year, m - 1, 1));
    const end = new Date(Date.UTC(year, m, 1));
    const label = start.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    return { start, end, label };
  }

  if (type === "quarterly") {
    const q = quarter ?? 1;
    const startMonth = (q - 1) * 3;
    const start = new Date(Date.UTC(year, startMonth, 1));
    const end = new Date(Date.UTC(year, startMonth + 3, 1));
    const label = `Q${q} ${year}`;
    return { start, end, label };
  }

  // annual
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));
  return { start, end, label: `${year}` };
}
