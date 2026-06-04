import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { ExpandableDescription } from "./ExpandableDescription";

describe("ExpandableDescription", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the full description when short", () => {
    const shortText = "Short description.";
    render(<ExpandableDescription description={shortText} />);
    expect(screen.getByText(shortText)).toBeDefined();
  });

  it("truncates long descriptions", () => {
    const longText = "A".repeat(300);
    render(<ExpandableDescription description={longText} maxLength={250} />);
    expect(screen.getByText(/A…$/)).toBeDefined();
  });

  it("shows 'Show more' button for long descriptions", () => {
    const longText = "A".repeat(300);
    render(<ExpandableDescription description={longText} maxLength={250} />);
    expect(screen.getByText("Show more")).toBeDefined();
  });

  it("does not show 'Show more' button for short descriptions", () => {
    render(<ExpandableDescription description="Short" />);
    expect(screen.queryByText("Show more")).toBeNull();
  });

  it("opens modal when 'Show more' is clicked", () => {
    const longText = "A".repeat(300);
    render(<ExpandableDescription description={longText} maxLength={250} />);

    fireEvent.click(screen.getByText("Show more"));

    // Modal should be visible with full description
    expect(screen.getByText("Job Description")).toBeDefined();
    expect(screen.getByText(longText)).toBeDefined();
  });

  it("closes modal when close button is clicked", () => {
    const longText = "A".repeat(300);
    render(<ExpandableDescription description={longText} maxLength={250} />);

    fireEvent.click(screen.getByText("Show more"));
    expect(screen.getByText("Job Description")).toBeDefined();

    fireEvent.click(screen.getByLabelText("Close modal"));
    expect(screen.queryByText("Job Description")).toBeNull();
  });

  it("closes modal on Escape key", () => {
    const longText = "A".repeat(300);
    render(<ExpandableDescription description={longText} maxLength={250} />);

    fireEvent.click(screen.getByText("Show more"));
    expect(screen.getByText("Job Description")).toBeDefined();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Job Description")).toBeNull();
  });

  it("does not show a 'Show less' button", () => {
    const longText = "A".repeat(300);
    render(<ExpandableDescription description={longText} maxLength={250} />);
    expect(screen.queryByText("Show less")).toBeNull();
  });

  it("uses custom maxLength", () => {
    const text = "This is a test description.";
    render(<ExpandableDescription description={text} maxLength={10} />);
    expect(screen.getByText(/…$/)).toBeDefined();
  });

  it("shows jobTitle as modal title when provided", () => {
    const longText = "A".repeat(300);
    render(<ExpandableDescription description={longText} maxLength={250} jobTitle="Senior Frontend Developer" />);

    fireEvent.click(screen.getByText("Show more"));

    expect(screen.getByText("Senior Frontend Developer")).toBeDefined();
  });

  it("falls back to 'Job Description' when jobTitle is not provided", () => {
    const longText = "A".repeat(300);
    render(<ExpandableDescription description={longText} maxLength={250} />);

    fireEvent.click(screen.getByText("Show more"));

    expect(screen.getByText("Job Description")).toBeDefined();
  });

  it("displays full description in modal with jobTitle", () => {
    const longText = "A".repeat(300);
    render(<ExpandableDescription description={longText} maxLength={250} jobTitle="Senior Frontend Developer" />);

    fireEvent.click(screen.getByText("Show more"));

    expect(screen.getByText("Senior Frontend Developer")).toBeDefined();
    expect(screen.getByText(longText)).toBeDefined();
  });
});
