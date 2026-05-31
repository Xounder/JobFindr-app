import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { SortToggle } from "./SortToggle";

describe("SortToggle", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders both options", () => {
    render(<SortToggle value="trust" onChange={() => {}} />);
    expect(screen.getByText("Trust Score")).toBeDefined();
    expect(screen.getByText("Match %")).toBeDefined();
  });

  it("has correct aria attributes", () => {
    render(<SortToggle value="trust" onChange={() => {}} />);
    const radiogroup = screen.getByRole("radiogroup");
    expect(radiogroup).toHaveAttribute("aria-label", "Sort order");

    const trustRadio = screen.getByRole("radio", { name: "Trust Score" });
    expect(trustRadio).toHaveAttribute("aria-checked", "true");

    const matchRadio = screen.getByRole("radio", { name: "Match %" });
    expect(matchRadio).toHaveAttribute("aria-checked", "false");
  });

  it("click calls onChange with correct value", () => {
    const handleChange = vi.fn();
    render(<SortToggle value="trust" onChange={handleChange} />);

    fireEvent.click(screen.getByText("Match %"));
    expect(handleChange).toHaveBeenCalledWith("match");
  });

  it("active option has indigo background class", () => {
    render(<SortToggle value="trust" onChange={() => {}} />);
    const trustButton = screen.getByRole("radio", { name: "Trust Score" });
    expect(trustButton.className).toContain("bg-indigo-600");
    expect(trustButton.className).toContain("text-white");
  });

  it("inactive option does not have indigo background", () => {
    render(<SortToggle value="trust" onChange={() => {}} />);
    const matchButton = screen.getByRole("radio", { name: "Match %" });
    expect(matchButton.className).not.toContain("bg-indigo-600");
  });

  it("keyboard navigation works with ArrowRight", () => {
    const handleChange = vi.fn();
    render(<SortToggle value="trust" onChange={handleChange} />);

    const radiogroup = screen.getByRole("radiogroup");
    fireEvent.keyDown(radiogroup, { key: "ArrowRight" });
    expect(handleChange).toHaveBeenCalledWith("match");
  });

  it("keyboard navigation works with ArrowLeft", () => {
    const handleChange = vi.fn();
    render(<SortToggle value="match" onChange={handleChange} />);

    const radiogroup = screen.getByRole("radiogroup");
    fireEvent.keyDown(radiogroup, { key: "ArrowLeft" });
    expect(handleChange).toHaveBeenCalledWith("trust");
  });

  it("keyboard navigation wraps around with ArrowRight at last item", () => {
    const handleChange = vi.fn();
    render(<SortToggle value="match" onChange={handleChange} />);

    const radiogroup = screen.getByRole("radiogroup");
    fireEvent.keyDown(radiogroup, { key: "ArrowRight" });
    expect(handleChange).toHaveBeenCalledWith("trust");
  });

  it("keyboard navigation wraps around with ArrowUp at first item", () => {
    const handleChange = vi.fn();
    render(<SortToggle value="trust" onChange={handleChange} />);

    const radiogroup = screen.getByRole("radiogroup");
    fireEvent.keyDown(radiogroup, { key: "ArrowUp" });
    expect(handleChange).toHaveBeenCalledWith("match");
  });
});
