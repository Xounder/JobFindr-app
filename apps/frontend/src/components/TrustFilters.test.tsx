import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { TrustFilters } from "./TrustFilters";

describe("TrustFilters", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders with correct min attribute", () => {
    render(<TrustFilters value={0} onChange={() => {}} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("min", "0");
  });

  it("renders with correct max attribute", () => {
    render(<TrustFilters value={0} onChange={() => {}} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("max", "10");
  });

  it("renders with correct step attribute", () => {
    render(<TrustFilters value={0} onChange={() => {}} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("step", "0.5");
  });

  it("displays correct label text for minimum", () => {
    render(<TrustFilters value={0} onChange={() => {}} />);
    expect(screen.getByText("0 (Any)")).toBeDefined();
  });

  it("displays correct label text for maximum", () => {
    render(<TrustFilters value={0} onChange={() => {}} />);
    expect(screen.getByText("10 (Highest)")).toBeDefined();
  });

  it("displays current value in the label", () => {
    render(<TrustFilters value={6.5} onChange={() => {}} />);
    expect(screen.getByText("Minimum Trust Score: 6.5")).toBeDefined();
  });

  it("calls onChange with parsed number on slider change", () => {
    const handleChange = vi.fn();
    render(<TrustFilters value={0} onChange={handleChange} />);
    const slider = screen.getByRole("slider") as HTMLInputElement;

    fireEvent.change(slider, { target: { value: "5" } });

    expect(handleChange).toHaveBeenCalledWith(5);
  });

  it("calls onChange with decimal value", () => {
    const handleChange = vi.fn();
    render(<TrustFilters value={0} onChange={handleChange} />);
    const slider = screen.getByRole("slider") as HTMLInputElement;

    fireEvent.change(slider, { target: { value: "6.5" } });

    expect(handleChange).toHaveBeenCalledWith(6.5);
  });
});
