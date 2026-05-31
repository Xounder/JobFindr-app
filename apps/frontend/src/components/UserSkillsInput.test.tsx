import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { UserSkillsInput } from "./UserSkillsInput";

// Mock the useSuggestions hook
vi.mock("@/hooks", () => ({
  useSuggestions: () => ({
    data: { skills: ["TypeScript", "React", "Node.js", "Python", "Go"] },
    isLoading: false,
  }),
}));

describe("UserSkillsInput", () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    userSkills: [],
    userSeniority: "",
    onUserSkillsChange: vi.fn(),
    onUserSeniorityChange: vi.fn(),
    onMoveToRequired: vi.fn(),
  };

  it("renders the section heading", () => {
    render(<UserSkillsInput {...defaultProps} />);
    expect(screen.getByText("Your Skills")).toBeDefined();
  });

  it("renders the seniority selector", () => {
    render(<UserSkillsInput {...defaultProps} />);
    expect(screen.getByLabelText("Your Seniority")).toBeDefined();
  });

  it("renders seniority levels including default option", () => {
    render(<UserSkillsInput {...defaultProps} />);
    const select = screen.getByLabelText("Your Seniority") as HTMLSelectElement;
    expect(select.value).toBe("");
    expect(screen.getByText("Not specified")).toBeDefined();
    expect(screen.getByText("Junior")).toBeDefined();
    expect(screen.getByText("Mid-Level")).toBeDefined();
    expect(screen.getByText("Senior")).toBeDefined();
    expect(screen.getByText("Lead")).toBeDefined();
    expect(screen.getByText("Principal")).toBeDefined();
  });

  it("does not show move button when userSkills is empty", () => {
    render(<UserSkillsInput {...defaultProps} />);
    expect(screen.queryByText("Move all to Required Skills")).toBeNull();
  });

  it("shows move button when userSkills is not empty", () => {
    render(<UserSkillsInput {...defaultProps} userSkills={["TypeScript"]} />);
    expect(screen.getByText("Move all to Required Skills")).toBeDefined();
  });

  it("calls onMoveToRequired when move button is clicked", () => {
    const onMoveToRequired = vi.fn();
    render(
      <UserSkillsInput
        {...defaultProps}
        userSkills={["TypeScript"]}
        onMoveToRequired={onMoveToRequired}
      />,
    );
    fireEvent.click(screen.getByText("Move all to Required Skills"));
    expect(onMoveToRequired).toHaveBeenCalledOnce();
  });

  it("calls onUserSeniorityChange when seniority is changed", () => {
    const onUserSeniorityChange = vi.fn();
    render(
      <UserSkillsInput
        {...defaultProps}
        onUserSeniorityChange={onUserSeniorityChange}
      />,
    );
    const select = screen.getByLabelText("Your Seniority");
    fireEvent.change(select, { target: { value: "senior" } });
    expect(onUserSeniorityChange).toHaveBeenCalledWith("senior");
  });

  it("renders the autocomplete input", () => {
    render(<UserSkillsInput {...defaultProps} />);
    const input = screen.getByPlaceholderText("e.g. TypeScript, React, Node.js");
    expect(input).toBeDefined();
  });

  it("calls onUserSkillsChange when adding a skill via button", () => {
    const onUserSkillsChange = vi.fn();
    render(
      <UserSkillsInput
        {...defaultProps}
        onUserSkillsChange={onUserSkillsChange}
      />,
    );
    const input = screen.getByPlaceholderText("e.g. TypeScript, React, Node.js");
    fireEvent.change(input, { target: { value: "Rust" } });
    fireEvent.click(screen.getByText("Add"));
    expect(onUserSkillsChange).toHaveBeenCalledWith(["Rust"]);
  });

  it("displays existing user skills as tags", () => {
    render(
      <UserSkillsInput
        {...defaultProps}
        userSkills={["TypeScript", "React"]}
      />,
    );
    expect(screen.getByText("TypeScript")).toBeDefined();
    expect(screen.getByText("React")).toBeDefined();
  });

  it("removes a skill tag when clicking the remove button", () => {
    const onUserSkillsChange = vi.fn();
    render(
      <UserSkillsInput
        {...defaultProps}
        userSkills={["TypeScript", "React"]}
        onUserSkillsChange={onUserSkillsChange}
      />,
    );

    fireEvent.click(screen.getByLabelText("Remove skill TypeScript"));

    expect(onUserSkillsChange).toHaveBeenCalledWith(["React"]);
  });
});
