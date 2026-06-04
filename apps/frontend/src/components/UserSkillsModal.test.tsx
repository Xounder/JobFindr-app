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

  // ─── Save / Discard Behavior ──────────────────────────────────────

  it("discards changes on Close (X) — does NOT sync to store", () => {
    const onUserSkillsChange = vi.fn();
    const onUserSeniorityChange = vi.fn();
    const onClose = vi.fn();
    render(
      <UserSkillsModal
        {...defaultProps}
        userSkills={["TypeScript"]}
        userSeniority="senior"
        onUserSkillsChange={onUserSkillsChange}
        onUserSeniorityChange={onUserSeniorityChange}
        onClose={onClose}
      />,
    );

    fireEvent.click(screen.getByLabelText("Close modal"));
    expect(onUserSkillsChange).not.toHaveBeenCalled();
    expect(onUserSeniorityChange).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("discards changes on overlay click (does not sync)", () => {
    const onUserSkillsChange = vi.fn();
    const onClose = vi.fn();
    render(
      <UserSkillsModal
        {...defaultProps}
        onUserSkillsChange={onUserSkillsChange}
        onClose={onClose}
      />,
    );

    const overlay = screen.getByRole("dialog");
    fireEvent.click(overlay);
    expect(onUserSkillsChange).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("discards changes on Escape key (does not sync)", () => {
    const onUserSkillsChange = vi.fn();
    const onClose = vi.fn();
    render(
      <UserSkillsModal
        {...defaultProps}
        onUserSkillsChange={onUserSkillsChange}
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onUserSkillsChange).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("Save button syncs all local state to store and closes", () => {
    const onUserSkillsChange = vi.fn();
    const onUserSeniorityChange = vi.fn();
    const onMoveToRequired = vi.fn();
    const onClose = vi.fn();
    render(
      <UserSkillsModal
        {...defaultProps}
        userSkills={["TypeScript", "React"]}
        userSeniority="senior"
        onUserSkillsChange={onUserSkillsChange}
        onUserSeniorityChange={onUserSeniorityChange}
        onMoveToRequired={onMoveToRequired}
        onClose={onClose}
      />,
    );

    // Check TypeScript to be moved to required
    fireEvent.click(screen.getByLabelText("TypeScript"));

    // Click Save
    fireEvent.click(screen.getByText("Save"));

    expect(onUserSkillsChange).toHaveBeenCalledWith(["TypeScript", "React"]);
    expect(onUserSeniorityChange).toHaveBeenCalledWith("senior");
    expect(onMoveToRequired).toHaveBeenCalledWith(["TypeScript"]);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("Save button does NOT call onMoveToRequired when no skills checked", () => {
    const onMoveToRequired = vi.fn();
    const onClose = vi.fn();
    render(
      <UserSkillsModal
        {...defaultProps}
        userSkills={["TypeScript", "React"]}
        onMoveToRequired={onMoveToRequired}
        onClose={onClose}
      />,
    );

    // Click Save without checking any skills
    fireEvent.click(screen.getByText("Save"));

    expect(onMoveToRequired).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("renders skills as tags (local state)", () => {
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

  it("updates local seniority on change (does not sync until Save)", () => {
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

    // Should NOT call the store callback yet
    expect(onUserSeniorityChange).not.toHaveBeenCalled();
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

  // ─── Bug fix: skills remain in "Add your skills" after being moved ──

  it("does NOT have a 'Move Selected to Required' button", () => {
    render(
      <UserSkillsModal
        {...defaultProps}
        userSkills={["TypeScript", "React"]}
      />,
    );

    expect(screen.queryByText(/Move Selected to Required/)).toBeNull();
  });

  // ─── Remove all skills no longer exists ────────────────────────────

  it("does NOT have 'Remove all skills' action", () => {
    render(
      <UserSkillsModal
        {...defaultProps}
        userSkills={["TypeScript", "React"]}
      />,
    );

    expect(screen.queryByText("Remove all skills")).toBeNull();
  });

  it("does NOT show remove all confirmation", () => {
    render(
      <UserSkillsModal
        {...defaultProps}
        userSkills={["TypeScript"]}
      />,
    );

    expect(screen.queryByText(/Are you sure you want to remove all/)).toBeNull();
  });

  it("adds a skill to local state via Enter key", () => {
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
    fireEvent.keyDown(input, { key: "Enter" });

    // Should NOT call onUserSkillsChange yet (waiting for Save)
    expect(onUserSkillsChange).not.toHaveBeenCalled();
  });

  it("renders autocomplete input", () => {
    render(<UserSkillsModal {...defaultProps} />);
    const input = screen.getByPlaceholderText("e.g. TypeScript, React, Node.js");
    expect(input).toBeDefined();
  });
});
