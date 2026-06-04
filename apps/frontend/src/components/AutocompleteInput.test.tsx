import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { AutocompleteInput } from "./AutocompleteInput";

describe("AutocompleteInput", () => {
  afterEach(() => {
    cleanup();
  });

  const defaultProps = {
    id: "test-input",
    label: "Test Label",
    placeholder: "Type here...",
    suggestions: ["Apple", "Banana", "Cherry"],
    selectedItems: [] as string[],
    onAdd: vi.fn(),
    onRemove: vi.fn(),
    renderTag: (item: string, onRemove: (item: string) => void) => (
      <span key={item}>
        {item}
        <button type="button" onClick={() => onRemove(item)}>
          &times;
        </button>
      </span>
    ),
  };

  it("renders label and input", () => {
    render(<AutocompleteInput {...defaultProps} />);
    expect(screen.getByLabelText("Test Label")).toBeDefined();
  });

  it("shows 'Add' button when onClear is not provided", () => {
    render(<AutocompleteInput {...defaultProps} />);
    expect(screen.getByText("Add")).toBeDefined();
  });

  it("shows 'Clean' button when onClear is provided", () => {
    render(<AutocompleteInput {...defaultProps} onClear={vi.fn()} />);
    expect(screen.getByText("Clean")).toBeDefined();
  });

  it("shows custom clearLabel when provided", () => {
    render(<AutocompleteInput {...defaultProps} onClear={vi.fn()} clearLabel="Clear All" />);
    expect(screen.getByText("Clear All")).toBeDefined();
  });

  it("disables Clean button when no items are selected", () => {
    render(<AutocompleteInput {...defaultProps} onClear={vi.fn()} selectedItems={[]} />);
    const cleanButton = screen.getByText("Clean") as HTMLButtonElement;
    expect(cleanButton.disabled).toBe(true);
  });

  it("enables Clean button when items are selected", () => {
    render(<AutocompleteInput {...defaultProps} onClear={vi.fn()} selectedItems={["Apple"]} />);
    const cleanButton = screen.getByText("Clean") as HTMLButtonElement;
    expect(cleanButton.disabled).toBe(false);
  });

  it("calls onClear when Clean button is clicked", () => {
    const onClear = vi.fn();
    render(<AutocompleteInput {...defaultProps} onClear={onClear} selectedItems={["Apple"]} />);
    fireEvent.click(screen.getByText("Clean"));
    expect(onClear).toHaveBeenCalledOnce();
  });

  it("calls onAdd when Add button is clicked", () => {
    const onAdd = vi.fn();
    render(<AutocompleteInput {...defaultProps} onAdd={onAdd} />);
    const input = screen.getByPlaceholderText("Type here...");
    fireEvent.change(input, { target: { value: "Apple" } });
    fireEvent.click(screen.getByText("Add"));
    expect(onAdd).toHaveBeenCalledWith("Apple");
  });

  it("renders custom buttonLabel when provided", () => {
    render(<AutocompleteInput {...defaultProps} buttonLabel="+ Add Skill" />);
    expect(screen.getByText("+ Add Skill")).toBeDefined();
  });

  it("renders selected items as tags", () => {
    render(<AutocompleteInput {...defaultProps} selectedItems={["Apple", "Banana"]} />);
    expect(screen.getByText("Apple")).toBeDefined();
    expect(screen.getByText("Banana")).toBeDefined();
  });

  // ─── Mutual Exclusion (excludeItems) ──────────────────────────────

  it("filters out excludeItems from suggestions dropdown", () => {
    render(
      <AutocompleteInput {...defaultProps} excludeItems={["Banana"]} />,
    );

    const input = screen.getByPlaceholderText("Type here...");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "" } });

    // Should show dropdown with all suggestions except Banana
    const dropdown = screen.getByRole("list");
    const items = within(dropdown).getAllByRole("listitem");
    const itemTexts = items.map((item) => item.textContent);
    expect(itemTexts).toContain("Apple");
    expect(itemTexts).toContain("Cherry");
    expect(itemTexts).not.toContain("Banana");
  });

  it("silently rejects adding an item present in excludeItems", () => {
    const onAdd = vi.fn();
    render(
      <AutocompleteInput
        {...defaultProps}
        excludeItems={["Banana"]}
        onAdd={onAdd}
      />,
    );

    const input = screen.getByPlaceholderText("Type here...");
    fireEvent.change(input, { target: { value: "Banana" } });
    fireEvent.click(screen.getByText("Add"));

    expect(onAdd).not.toHaveBeenCalled();
  });

  it("still allows adding items NOT in excludeItems", () => {
    const onAdd = vi.fn();
    render(
      <AutocompleteInput
        {...defaultProps}
        excludeItems={["Banana"]}
        onAdd={onAdd}
      />,
    );

    const input = screen.getByPlaceholderText("Type here...");
    fireEvent.change(input, { target: { value: "Cherry" } });
    fireEvent.click(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledWith("Cherry");
  });

  it("works correctly without excludeItems (backward compatible)", () => {
    const onAdd = vi.fn();
    render(<AutocompleteInput {...defaultProps} onAdd={onAdd} />);

    const input = screen.getByPlaceholderText("Type here...");
    fireEvent.change(input, { target: { value: "Banana" } });
    fireEvent.click(screen.getByText("Add"));

    expect(onAdd).toHaveBeenCalledWith("Banana");
  });
});
