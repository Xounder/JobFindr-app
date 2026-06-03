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

  it("displays current value in the label", () => {
    render(<TrustFilters value={6.5} onChange={() => {}} />);
    expect(screen.getByText("Minimum Trust Score: 6.5")).toBeDefined();
  });

  it("displays trust label next to value", () => {
    render(<TrustFilters value={9} onChange={() => {}} />);
    expect(screen.getByText("(High Trust)")).toBeDefined();
  });

  it("displays trust label for medium value", () => {
    render(<TrustFilters value={6.5} onChange={() => {}} />);
    expect(screen.getByText("(Medium Trust)")).toBeDefined();
  });

  it("displays tick mark values", () => {
    render(<TrustFilters value={0} onChange={() => {}} />);
    expect(screen.getByText("0")).toBeDefined();
    expect(screen.getByText("10")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("4")).toBeDefined();
    expect(screen.getByText("6")).toBeDefined();
    expect(screen.getByText("8")).toBeDefined();
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
