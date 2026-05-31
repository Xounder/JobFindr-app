import type { SalaryInfo } from "@/types";

/**
 * Format a date string into a human-readable relative or absolute date.
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Truncate text to a given length, appending ellipsis if truncated.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/**
 * Transform a trust score (0–10) into a human-readable 6-level label.
 *
 * Thresholds:
 *  >= 9  → "High Trust"
 *  >= 8  → "Good Trust"
 *  >= 7  → "Trust"
 *  >= 6  → "Medium Trust"
 *  >= 5  → "Low Trust"
 *  <  5  → "Extreme Low Trust"
 */
export function trustLabel(score: number): string {
  if (score >= 9) return "High Trust";
  if (score >= 8) return "Good Trust";
  if (score >= 7) return "Trust";
  if (score >= 6) return "Medium Trust";
  if (score >= 5) return "Low Trust";
  return "Extreme Low Trust";
}

/**
 * Format a SalaryInfo object into a display string like "$80K - $120K/yr".
 */
export function formatSalary(salary: SalaryInfo): string {
  const fmt = (n: number) => {
    if (n >= 1000) return `$${Math.round(n / 1000)}K`;
    return `$${n}`;
  };
  const periodLabel =
    salary.period === "yearly" ? "/yr" : salary.period === "monthly" ? "/mo" : "/hr";
  return `${fmt(salary.min)} - ${fmt(salary.max)}${periodLabel}`;
}

/**
 * Build a URL search params string from an object, skipping empty/falsy values.
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  }

  const str = searchParams.toString();
  return str ? `?${str}` : "";
}
