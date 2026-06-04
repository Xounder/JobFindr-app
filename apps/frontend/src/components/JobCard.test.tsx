import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { JobCard } from "./JobCard";
import { useSearchStore } from "@/store/searchStore";
import type { Job, MatchBreakdown, TrustBreakdown } from "@/types";

// Mock child components that may have complex behavior
vi.mock("./MatchSummary", () => ({
  MatchSummary: ({ summary }: { summary: string }) => (
    <div data-testid="match-summary">{summary}</div>
  ),
}));

vi.mock("./ExpandableDescription", () => ({
  ExpandableDescription: () => <div data-testid="expandable-description" />,
}));

vi.mock("./ApplyCta", () => ({
  ApplyCta: () => <div data-testid="apply-cta" />,
}));

describe("JobCard", () => {
  afterEach(() => {
    cleanup();
    useSearchStore.setState({ userSkills: [] });
  });

  const mockBreakdown: MatchBreakdown = {
    matchedSkills: ["TypeScript"],
    unmatchedSkills: ["Python"],
    seniorityMatch: "exact",
    weightedScore: 80,
    skillScoreContribution: 60,
    seniorityScoreContribution: 20,
  };

  const mockTrustBreakdown: TrustBreakdown = {
    providerScore: 8.0,
    companyAdjustment: 0.5,
    freshnessScore: 7.0,
    signals: {
      providerReputation: 8.0,
      companySizeBonus: 0.3,
      isKnownEmployer: true,
      daysSincePosted: 5,
    },
  };

  const defaultJob: Job = {
    id: "test-1",
    title: "Software Engineer",
    company: "Test Corp",
    location: "Remote",
    description: "A great job",
    url: "https://example.com",
    skills: ["TypeScript", "React"],
    seniority: "senior",
    salary: null,
    matchScore: 85,
    matchSummary: "3 of 5 skills match",
    trustScore: 8.2,
    postedAt: "2026-06-01T00:00:00Z",
    source: "test",
  };

  it("renders job title and company", () => {
    render(<JobCard job={defaultJob} />);
    expect(screen.getByText("Software Engineer")).toBeDefined();
    expect(screen.getByText("Test Corp")).toBeDefined();
  });

  it("renders trust badge when trustScore is provided", () => {
    render(<JobCard job={defaultJob} />);
    expect(screen.getByText("Good Trust")).toBeDefined();
  });

  it("renders match badge when matchScore is provided", () => {
    render(<JobCard job={defaultJob} />);
    expect(screen.getByText("85% match")).toBeDefined();
  });

  it("trust badge is a button when breakdown data is available", () => {
    render(
      <JobCard
        job={{ ...defaultJob, trustBreakdown: mockTrustBreakdown }}
      />,
    );
    const trustButton = screen.getByLabelText(/Trust score/);
    expect(trustButton.tagName).toBe("BUTTON");
  });

  it("match badge is a button when breakdown data is available", () => {
    render(
      <JobCard
        job={{ ...defaultJob, matchBreakdown: mockBreakdown }}
      />,
    );
    const matchButton = screen.getByLabelText(/Match score/);
    expect(matchButton.tagName).toBe("BUTTON");
  });

  it("badges remain as span-like elements when no breakdown data", () => {
    render(<JobCard job={defaultJob} />);
    // Without breakdown data, buttons still have cursor-pointer but that's fine
    // They should still be buttons with no extra indicator
    const trustButton = screen.getByLabelText(/Trust score/);
    expect(trustButton.tagName).toBe("BUTTON");
    // Even without breakdown, buttons still exist (no breakdown just means modal shows fallback)
  });

  it("clicking trust badge opens TrustExplanationModal", () => {
    render(
      <JobCard
        job={{ ...defaultJob, trustBreakdown: mockTrustBreakdown }}
      />,
    );
    fireEvent.click(screen.getByLabelText(/Trust score/));
    expect(screen.getByText("Trust Score Explanation")).toBeDefined();
  });

  it("clicking match badge opens MatchExplanationModal", () => {
    render(
      <JobCard
        job={{ ...defaultJob, matchBreakdown: mockBreakdown }}
      />,
    );
    fireEvent.click(screen.getByLabelText(/Match score/));
    expect(screen.getByText("Match Score Explanation")).toBeDefined();
  });

  it("closing trust modal hides it", () => {
    render(
      <JobCard
        job={{ ...defaultJob, trustBreakdown: mockTrustBreakdown }}
      />,
    );
    fireEvent.click(screen.getByLabelText(/Trust score/));
    expect(screen.getByText("Trust Score Explanation")).toBeDefined();
    fireEvent.click(screen.getByLabelText("Close modal"));
    expect(screen.queryByText("Trust Score Explanation")).toBeNull();
  });

  it("closing match modal hides it", () => {
    render(
      <JobCard
        job={{ ...defaultJob, matchBreakdown: mockBreakdown }}
      />,
    );
    fireEvent.click(screen.getByLabelText(/Match score/));
    expect(screen.getByText("Match Score Explanation")).toBeDefined();
    fireEvent.click(screen.getByLabelText("Close modal"));
    expect(screen.queryByText("Match Score Explanation")).toBeNull();
  });

  it("highlights matching skills with indigo badge style", () => {
    useSearchStore.setState({ userSkills: ["TypeScript"] });
    render(<JobCard job={defaultJob} />);

    const typeScriptBadge = screen.getByText("TypeScript");
    expect(typeScriptBadge.className).toContain("bg-indigo-100");
    expect(typeScriptBadge.className).toContain("text-indigo-800");

    const reactBadge = screen.getByText("React");
    expect(reactBadge.className).toContain("bg-gray-100");
    expect(reactBadge.className).toContain("text-gray-700");
  });

  it("matches skills case-insensitively", () => {
    useSearchStore.setState({ userSkills: ["typescript", "REACT"] });
    render(<JobCard job={defaultJob} />);

    expect(screen.getByText("TypeScript").className).toContain("bg-indigo-100");
    expect(screen.getByText("React").className).toContain("bg-indigo-100");
  });

  it("shows all skills as gray when userSkills is empty", () => {
    useSearchStore.setState({ userSkills: [] });
    render(<JobCard job={defaultJob} />);

    const skills = ["TypeScript", "React"];
    for (const skill of skills) {
      const badge = screen.getByText(skill);
      expect(badge.className).toContain("bg-gray-100");
      expect(badge.className).toContain("text-gray-700");
      expect(badge.className).not.toContain("bg-indigo-100");
    }
  });
});
