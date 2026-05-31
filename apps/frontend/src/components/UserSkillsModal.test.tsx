import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { UserSkillsModal } from "./UserSkillsModal";

// Mock useSuggestions
vi.mock("@/hooks", () => ({
  useSuggestions: () => ({
    data: { skills: ["TypeScript", "React", "Node.js", "Python", "Go"] },
    isLoading: false,
  }),
}));

describe("UserSkillsModal", () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    userSkills: [],
    userSeniority: "",
    onUserSkillsChange: vi.fn(),
    onUserSeniorityChange: vi.fn(),
    skills: [],
    onMoveToRequired: vi.fn(),
  };

  it("does not render when closed", () => {
    render(<UserSkillsModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText("Your Skills")).toBeNull();
  });

  it("renders when open", () => {
    render(<UserSkillsModal {...defaultProps} />);
    expect(screen.getByText("Your Skills")).toBeDefined();
  });

  it("has accessible dialog role", () => {
    render(<UserSkillsModal {...defaultProps} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeDefined();
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("closes when close button is clicked", () => {
    const onClose = vi.fn();
    render(<UserSkillsModal {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByLabelText("Close modal"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes when overlay is clicked", () => {
    const onClose = vi.fn();
    render(<UserSkillsModal {...defaultProps} onClose={onClose} />);

    const overlay = screen.getByRole("dialog");
    fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("closes on Escape key", () => {
    const onClose = vi.fn();
    render(<UserSkillsModal {...defaultProps} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders skills as tags", () => {
    render(
      <UserSkillsModal
        {...defaultProps}
        userSkills={["TypeScript", "React"]}
      />,
    );

    // Skills appear both as tags and checkbox labels
    const typeScriptElements = screen.getAllByText("TypeScript");
    expect(typeScriptElements.length).toBeGreaterThanOrEqual(1);
    const reactElements = screen.getAllByText("React");
    expect(reactElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders seniority selector", () => {
    render(<UserSkillsModal {...defaultProps} />);
    expect(screen.getByLabelText("Your Seniority")).toBeDefined();
  });

  it("calls onUserSeniorityChange when seniority changes", () => {
    const onUserSeniorityChange = vi.fn();
    render(
      <UserSkillsModal
        {...defaultProps}
        onUserSeniorityChange={onUserSeniorityChange}
      />,
    );

    fireEvent.change(screen.getByLabelText("Your Seniority"), {
      target: { value: "senior" },
    });
    expect(onUserSeniorityChange).toHaveBeenCalledWith("senior");
  });

  it("shows selective move section when skills exist", () => {
    render(
      <UserSkillsModal
        {...defaultProps}
        userSkills={["TypeScript", "React"]}
      />,
    );

    expect(screen.getByText("Move skills to Required Skills")).toBeDefined();
  });

  it("hides selective move section when no skills", () => {
    render(<UserSkillsModal {...defaultProps} />);
    expect(screen.queryByText("Move skills to Required Skills")).toBeNull();
  });

  it("checkboxes skills for selective move", () => {
    render(
      <UserSkillsModal
        {...defaultProps}
        userSkills={["TypeScript", "React"]}
      />,
    );

    const checkbox = screen.getByLabelText("TypeScript") as HTMLInputElement;
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it("selects all and deselects all", () => {
    render(
      <UserSkillsModal
        {...defaultProps}
        userSkills={["TypeScript", "React", "Node.js"]}
      />,
    );

    const selectAllButton = screen.getByText("Select all");
    fireEvent.click(selectAllButton);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.every((cb) => (cb as HTMLInputElement).checked)).toBe(true);

    // Deselect all
    fireEvent.click(screen.getByText("Deselect all"));
    expect(checkboxes.every((cb) => (cb as HTMLInputElement).checked)).toBe(false);
  });

  it("calls onMoveToRequired with checked skills", () => {
    const onMoveToRequired = vi.fn();
    render(
      <UserSkillsModal
        {...defaultProps}
        userSkills={["TypeScript", "React"]}
        onMoveToRequired={onMoveToRequired}
      />,
    );

    // Check TypeScript
    fireEvent.click(screen.getByLabelText("TypeScript"));

    // Click Move Selected
    fireEvent.click(screen.getByText("Move Selected to Required (1)"));

    expect(onMoveToRequired).toHaveBeenCalledWith(["TypeScript"]);
  });

  it("disables move button when no skills checked", () => {
    render(
      <UserSkillsModal
        {...defaultProps}
        userSkills={["TypeScript", "React"]}
      />,
    );

    const moveButton = screen.getByText("Move Selected to Required (0)");
    expect(moveButton).toBeDisabled();
  });

  it("shows remove all confirmation", () => {
    render(
      <UserSkillsModal
        {...defaultProps}
        userSkills={["TypeScript", "React"]}
      />,
    );

    fireEvent.click(screen.getByText("Remove all skills"));
    expect(screen.getByText(/Are you sure you want to remove all/)).toBeDefined();
    expect(screen.getByText("Confirm Remove All")).toBeDefined();
    expect(screen.getByText("Cancel")).toBeDefined();
  });

  it("calls onUserSkillsChange with empty array on remove all confirm", () => {
    const onUserSkillsChange = vi.fn();
    render(
      <UserSkillsModal
        {...defaultProps}
        userSkills={["TypeScript", "React"]}
        onUserSkillsChange={onUserSkillsChange}
      />,
    );

    fireEvent.click(screen.getByText("Remove all skills"));
    fireEvent.click(screen.getByText("Confirm Remove All"));

    expect(onUserSkillsChange).toHaveBeenCalledWith([]);
  });

  it("cancels remove all", () => {
    render(
      <UserSkillsModal
        {...defaultProps}
        userSkills={["TypeScript", "React"]}
      />,
    );

    fireEvent.click(screen.getByText("Remove all skills"));
    fireEvent.click(screen.getByText("Cancel"));

    expect(screen.queryByText("Confirm Remove All")).toBeNull();
  });

  it("adds a skill via autocomplete input", () => {
    const onUserSkillsChange = vi.fn();
    render(
      <UserSkillsModal
        {...defaultProps}
        userSkills={[]}
        onUserSkillsChange={onUserSkillsChange}
      />,
    );

    const input = screen.getByPlaceholderText("e.g. TypeScript, React, Node.js");
    fireEvent.change(input, { target: { value: "Rust" } });
    fireEvent.click(screen.getByText("Add"));

    expect(onUserSkillsChange).toHaveBeenCalledWith(["Rust"]);
  });

  it("renders autocomplete input", () => {
    render(<UserSkillsModal {...defaultProps} />);
    const input = screen.getByPlaceholderText("e.g. TypeScript, React, Node.js");
    expect(input).toBeDefined();
  });
});
