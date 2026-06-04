import { trustLabel } from "@/utils";
import type { MatchBreakdown, TrustBreakdown } from "@/types";

/**
 * Build a human-readable explanation paragraph for the trust score.
 * Returns null when breakdown is null.
 */
export function buildTrustExplanation(
  trustScore: number,
  trustBreakdown: TrustBreakdown | null,
): string | null {
  if (!trustBreakdown) return null;

  const label = trustLabel(trustScore);
  const parts: string[] = [];

  // Core score
  parts.push(`Score ${trustScore.toFixed(1)}/10 — ${label}.`);

  // Freshness
  const days = trustBreakdown.signals.daysSincePosted;
  if (days === 0) {
    parts.push("Posted today (freshness: 10/10).");
  } else if (days === 1) {
    parts.push("Posted 1 day ago (freshness: 9.0/10).");
  } else {
    parts.push(
      `Posted ${days} days ago (freshness: ${trustBreakdown.freshnessScore.toFixed(1)}/10).`,
    );
  }

  // Provider reputation
  parts.push(
    `Provider reputation: ${trustBreakdown.signals.providerReputation.toFixed(1)}/10.`,
  );

  // Company adjustment
  if (trustBreakdown.companyAdjustment !== 0) {
    const sign = trustBreakdown.companyAdjustment >= 0 ? "+" : "";
    parts.push(`Company size bonus adds ${sign}${trustBreakdown.companyAdjustment.toFixed(1)}.`);
  }

  // Known employer
  if (trustBreakdown.signals.isKnownEmployer) {
    parts.push("This employer is known in our database.");
  }

  return parts.join(" ");
}

function matchThresholdLabel(score: number): string {
  if (score >= 85) return "Excellent match";
  if (score >= 70) return "Good match";
  if (score >= 50) return "Fair match";
  return "Low match";
}

/**
 * Build a human-readable explanation paragraph for the match score.
 * Returns null when breakdown is null.
 */
export function buildMatchExplanation(
  matchScore: number,
  matchBreakdown: MatchBreakdown | null,
): string | null {
  if (!matchBreakdown) return null;

  const label = matchThresholdLabel(matchScore);
  const totalSkills =
    matchBreakdown.matchedSkills.length + matchBreakdown.unmatchedSkills.length;
  const parts: string[] = [];

  // Core score
  parts.push(`${matchScore}% match — ${label}!`);

  // Skills breakdown
  if (totalSkills > 0) {
    parts.push(
      `${matchBreakdown.matchedSkills.length} of ${totalSkills} skills matched${matchBreakdown.matchedSkills.length > 0 ? ` (${matchBreakdown.matchedSkills.join(", ")})` : ""}.`,
    );
  }

  // Seniority match
  const seniorityLabels: Record<string, string> = {
    exact: "Seniority level is an exact match.",
    close: "Seniority level is a close match.",
    none: "Seniority level does not match.",
  };
  parts.push(seniorityLabels[matchBreakdown.seniorityMatch] ?? "");

  return parts.join(" ");
}
