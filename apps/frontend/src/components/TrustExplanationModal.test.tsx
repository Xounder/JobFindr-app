import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { TrustExplanationModal } from "./TrustExplanationModal";

describe("TrustExplanationModal", () => {
  afterEach(() => {
    cleanup();
  });

  const defaultBreakdown = {
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

  const baseProps = {
    trustScore: 8.2,
    trustLabel: "Good Trust",
    trustBreakdown: defaultBreakdown,
    isOpen: true,
    onClose: vi.fn(),
  };

  it("renders title when open", () => {
    render(<TrustExplanationModal {...baseProps} />);
    expect(screen.getByText("Trust Score Explanation")).toBeDefined();
  });

  it("does not render when closed", () => {
    render(<TrustExplanationModal {...baseProps} isOpen={false} />);
    expect(screen.queryByText("Trust Score Explanation")).toBeNull();
  });

  it("displays the correct trust score and label", () => {
    render(<TrustExplanationModal {...baseProps} />);
    expect(screen.getByText("8.2")).toBeDefined();
    expect(screen.getByText("Good Trust")).toBeDefined();
  });

  it("renders breakdown sections when trustBreakdown is provided", () => {
    render(<TrustExplanationModal {...baseProps} />);
    expect(screen.getByText("Provider Score")).toBeDefined();
    expect(screen.getByText("Freshness Score")).toBeDefined();
    expect(screen.getByText("Signals")).toBeDefined();
    expect(screen.getByText("Provider Reputation")).toBeDefined();
    // Company Size Bonus appears twice (main section + signals), use getAllByText
    const companySizeBonusElements = screen.getAllByText("Company Size Bonus");
    expect(companySizeBonusElements.length).toBe(2);
    expect(screen.getByText("Known Employer")).toBeDefined();
    expect(screen.getByText("Days Since Posted")).toBeDefined();
  });

  it("shows fallback message when trustBreakdown is null", () => {
    render(
      <TrustExplanationModal
        {...baseProps}
        trustBreakdown={null}
      />,
    );
    expect(screen.getByText("Detailed breakdown unavailable for this job.")).toBeDefined();
    expect(screen.queryByText("Provider Score")).toBeNull();
  });

  it("close button fires onClose", () => {
    const onClose = vi.fn();
    render(
      <TrustExplanationModal {...baseProps} onClose={onClose} />,
    );
    fireEvent.click(screen.getByLabelText("Close modal"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("overlay click fires onClose", () => {
    const onClose = vi.fn();
    render(
      <TrustExplanationModal {...baseProps} onClose={onClose} />,
    );
    const overlay = screen.getByRole("dialog");
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows provider score value", () => {
    render(<TrustExplanationModal {...baseProps} />);
    expect(screen.getByText("8.5 / 10")).toBeDefined();
  });

  it("shows company adjustment with sign", () => {
    render(<TrustExplanationModal {...baseProps} />);
    // There are two "Company Size Bonus" entries — one in the main section and one in Signals
    const companyAdjustments = screen.getAllByText(/\+0\.5|\+0\.3/);
    expect(companyAdjustments.length).toBeGreaterThanOrEqual(1);
  });
});
