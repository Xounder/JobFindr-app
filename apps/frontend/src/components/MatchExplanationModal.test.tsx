import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { MatchExplanationModal } from "./MatchExplanationModal";

describe("MatchExplanationModal", () => {
  afterEach(() => {
    cleanup();
  });

  const defaultBreakdown = {
    matchedSkills: ["TypeScript", "React", "Node.js"],
    unmatchedSkills: ["Python", "Docker"],
    seniorityMatch: "exact" as const,
    weightedScore: 85,
    skillScoreContribution: 60,
    seniorityScoreContribution: 25,
  };

  const baseProps = {
    matchScore: 85,
    matchSummary: "3 of 5 skills match",
    matchBreakdown: defaultBreakdown,
    isOpen: true,
    onClose: vi.fn(),
  };

  it("renders title when open", () => {
    render(<MatchExplanationModal {...baseProps} />);
    expect(screen.getByText("Match Score Explanation")).toBeDefined();
  });

  it("does not render when closed", () => {
    render(<MatchExplanationModal {...baseProps} isOpen={false} />);
    expect(screen.queryByText("Match Score Explanation")).toBeNull();
  });

  it("displays the correct match percentage", () => {
    render(<MatchExplanationModal {...baseProps} />);
    expect(screen.getByText("85%")).toBeDefined();
    expect(screen.getByText("match")).toBeDefined();
  });

  it("renders matched skills list", () => {
    render(<MatchExplanationModal {...baseProps} />);
    expect(screen.getByText("Matched Skills")).toBeDefined();
    expect(screen.getByText("TypeScript")).toBeDefined();
    expect(screen.getByText("React")).toBeDefined();
    expect(screen.getByText("Node.js")).toBeDefined();
  });

  it("renders unmatched skills list", () => {
    render(<MatchExplanationModal {...baseProps} />);
    expect(screen.getByText("Unmatched Skills")).toBeDefined();
    expect(screen.getByText("Python")).toBeDefined();
    expect(screen.getByText("Docker")).toBeDefined();
  });

  it("shows seniority match indicator", () => {
    render(<MatchExplanationModal {...baseProps} />);
    expect(screen.getByText("Seniority Match")).toBeDefined();
    expect(screen.getByText("Exact Match")).toBeDefined();
  });

  it("shows score breakdown section", () => {
    render(<MatchExplanationModal {...baseProps} />);
    expect(screen.getByText("Score Breakdown")).toBeDefined();
    expect(screen.getByText("Weighted Score")).toBeDefined();
    expect(screen.getByText("Skill Score Contribution")).toBeDefined();
    expect(screen.getByText("Seniority Score Contribution")).toBeDefined();
  });

  it("renders fallback with matchSummary when breakdown is null", () => {
    render(
      <MatchExplanationModal
        {...baseProps}
        matchBreakdown={null}
      />,
    );
    expect(screen.getByText(/3 of 5 skills match/)).toBeDefined();
    expect(screen.queryByText("Matched Skills")).toBeNull();
  });

  it("renders fallback message when both breakdown and summary are null", () => {
    render(
      <MatchExplanationModal
        {...baseProps}
        matchBreakdown={null}
        matchSummary={null}
      />,
    );
    expect(screen.getByText("Detailed breakdown unavailable for this job.")).toBeDefined();
  });

  it("close button fires onClose", () => {
    const onClose = vi.fn();
    render(
      <MatchExplanationModal {...baseProps} onClose={onClose} />,
    );
    fireEvent.click(screen.getByLabelText("Close modal"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows close seniority badge", () => {
    render(
      <MatchExplanationModal
        {...baseProps}
        matchBreakdown={{
          ...defaultBreakdown,
          seniorityMatch: "close",
        }}
      />,
    );
    expect(screen.getByText("Close Match")).toBeDefined();
  });

  it("shows no match seniority badge", () => {
    render(
      <MatchExplanationModal
        {...baseProps}
        matchBreakdown={{
          ...defaultBreakdown,
          seniorityMatch: "none",
        }}
      />,
    );
    expect(screen.getByText("No Match")).toBeDefined();
  });
});
