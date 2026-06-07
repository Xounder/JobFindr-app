import { describe, it, expect } from "vitest";
import { buildTrustExplanation, buildMatchExplanation } from "./explain";
import type { TrustBreakdown, MatchBreakdown } from "@/types";

describe("buildTrustExplanation", () => {
  const mockBreakdown: TrustBreakdown = {
    providerScore: 8.5,
    companyAdjustment: 0.5,
    freshnessScore: 7.0,
    signals: {
      providerReputation: 8.0,
      companySizeBonus: 0.3,
      isKnownEmployer: true,
      daysSincePosted: 5,
    },
  };

  it("returns null when breakdown is null", () => {
    expect(buildTrustExplanation(8.2, null)).toBeNull();
  });

  it("returns a non-empty string with valid breakdown", () => {
    const result = buildTrustExplanation(8.2, mockBreakdown);
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
    expect(result!.length).toBeGreaterThan(0);
  });

  it("includes the score and label", () => {
    const result = buildTrustExplanation(8.2, mockBreakdown);
    expect(result).toContain("Score 8.2/10");
    expect(result).toContain("Good Trust");
  });

  it("includes freshness information", () => {
    const result = buildTrustExplanation(8.2, mockBreakdown);
    expect(result).toContain("Posted 5 days ago");
    expect(result).toContain("freshness");
  });

  it("includes provider reputation", () => {
    const result = buildTrustExplanation(8.2, mockBreakdown);
    expect(result).toContain("Provider reputation: 8.0/10");
  });

  it("includes company adjustment when non-zero", () => {
    const result = buildTrustExplanation(8.2, mockBreakdown);
    expect(result).toContain("Company size bonus adds +0.5");
  });

  it("omits company adjustment when zero", () => {
    const breakdown: TrustBreakdown = {
      ...mockBreakdown,
      companyAdjustment: 0,
    };
    const result = buildTrustExplanation(8.2, breakdown);
    expect(result).not.toContain("Company size bonus");
  });

  it("mentions known employer when applicable", () => {
    const result = buildTrustExplanation(8.2, mockBreakdown);
    expect(result).toContain("known in our database");
  });

  it("omits known employer mention when not applicable", () => {
    const breakdown: TrustBreakdown = {
      ...mockBreakdown,
      signals: { ...mockBreakdown.signals, isKnownEmployer: false },
    };
    const result = buildTrustExplanation(8.2, breakdown);
    expect(result).not.toContain("known in our database");
  });

  it("handles posted today (daysSincePosted = 0)", () => {
    const breakdown: TrustBreakdown = {
      ...mockBreakdown,
      signals: { ...mockBreakdown.signals, daysSincePosted: 0 },
    };
    const result = buildTrustExplanation(8.2, breakdown);
    expect(result).toContain("Posted today");
  });

  it("handles posted 1 day ago", () => {
    const breakdown: TrustBreakdown = {
      ...mockBreakdown,
      signals: { ...mockBreakdown.signals, daysSincePosted: 1 },
    };
    const result = buildTrustExplanation(8.2, breakdown);
    expect(result).toContain("Posted 1 day ago");
  });
});

describe("buildMatchExplanation", () => {
  const mockBreakdown: MatchBreakdown = {
    matchedSkills: ["TypeScript", "React", "Node.js"],
    unmatchedSkills: ["Python", "Docker"],
    seniorityMatch: "exact",
    weightedScore: 85,
    skillScoreContribution: 60,
    seniorityScoreContribution: 25,
  };

  it("returns null when breakdown is null", () => {
    expect(buildMatchExplanation(85, null)).toBeNull();
  });

  it("returns a non-empty string with valid breakdown", () => {
    const result = buildMatchExplanation(85, mockBreakdown);
    expect(result).not.toBeNull();
    expect(typeof result).toBe("string");
    expect(result!.length).toBeGreaterThan(0);
  });

  it("includes the percentage and label", () => {
    const result = buildMatchExplanation(85, mockBreakdown);
    expect(result).toContain("85% match");
    expect(result).toContain("Excellent match");
  });

  it("includes matched skills count and names", () => {
    const result = buildMatchExplanation(85, mockBreakdown);
    expect(result).toContain("3 of 5 job skills matched");
    expect(result).toContain("TypeScript, React, Node.js");
  });

  it("handles empty matchedSkills gracefully", () => {
    const breakdown: MatchBreakdown = {
      ...mockBreakdown,
      matchedSkills: [],
    };
    const result = buildMatchExplanation(85, breakdown);
    expect(result).toContain("0 of 2 job skills matched");
  });

  it("shows seniority exact match", () => {
    const result = buildMatchExplanation(85, mockBreakdown);
    expect(result).toContain("Seniority level is an exact match");
  });

  it("shows seniority close match", () => {
    const breakdown: MatchBreakdown = {
      ...mockBreakdown,
      seniorityMatch: "close",
    };
    const result = buildMatchExplanation(85, breakdown);
    expect(result).toContain("Seniority level is a close match");
  });

  it("shows seniority no match", () => {
    const breakdown: MatchBreakdown = {
      ...mockBreakdown,
      seniorityMatch: "none",
    };
    const result = buildMatchExplanation(85, breakdown);
    expect(result).toContain("Seniority level does not match");
  });

  it("handles different match score thresholds", () => {
    expect(buildMatchExplanation(85, mockBreakdown)).toContain("Excellent match");
    expect(buildMatchExplanation(70, mockBreakdown)).toContain("Good match");
    expect(buildMatchExplanation(50, mockBreakdown)).toContain("Fair match");
    expect(buildMatchExplanation(30, mockBreakdown)).toContain("Low match");
  });
});
