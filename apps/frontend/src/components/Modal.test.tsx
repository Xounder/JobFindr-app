import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { Modal } from "./Modal";

describe("Modal", () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: "Test Modal",
    children: <p>Modal content</p>,
  };

  it("does not render when closed", () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Test Modal")).toBeNull();
    expect(screen.queryByText("Modal content")).toBeNull();
  });

  it("renders title and content when open", () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText("Test Modal")).toBeDefined();
    expect(screen.getByText("Modal content")).toBeDefined();
  });

  it("has accessible dialog role and aria attributes", () => {
    render(<Modal {...defaultProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-label", "Test Modal");
  });

  it("closes when close button is clicked", () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText("Close modal"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes when overlay is clicked", () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);

    const overlay = screen.getByRole("dialog");
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes on Escape key", () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("does not close on Escape when closed", () => {
    const onClose = vi.fn();
    render(<Modal {...defaultProps} isOpen={false} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders children content", () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Modal">
        <span data-testid="child">Child element</span>
      </Modal>,
    );

    expect(screen.getByTestId("child")).toBeDefined();
    expect(screen.getByText("Child element")).toBeDefined();
  });
});
