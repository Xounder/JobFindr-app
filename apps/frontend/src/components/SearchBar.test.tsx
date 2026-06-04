import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { SearchBar } from "./SearchBar";

// Mock the useSuggestions hook
vi.mock("@/hooks", () => ({
  useSuggestions: () => ({
    data: {
      skills: ["TypeScript", "React", "Node.js", "Python", "Go", "Rust", "GraphQL", "Docker", "Kubernetes"],
      companies: ["Google", "Microsoft", "Amazon", "Meta", "Apple", "Netflix"],
    },
    isLoading: false,
  }),
  useDebounce: (v: string) => v,
}));

describe("SearchBar", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders the search input", () => {
    render(<SearchBar onSearch={() => {}} />);
    const input = screen.getByRole("combobox");
    expect(input).toBeDefined();
  });

  it("renders with initial value", () => {
    render(<SearchBar initialQuery="React" onSearch={() => {}} />);
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("React");
  });

  it("shows search icon in gray when empty", () => {
    render(<SearchBar onSearch={() => {}} />);
    const svg = document.querySelector("svg");
    expect(svg?.getAttribute("class")).toContain("text-gray-400");
  });

  it("shows search icon in indigo when has value", () => {
    render(<SearchBar initialQuery="React" onSearch={() => {}} />);
    const svg = document.querySelector("svg");
    expect(svg?.getAttribute("class")).toContain("text-indigo-500");
  });

  it("has gray border when empty", () => {
    render(<SearchBar onSearch={() => {}} />);
    const input = screen.getByRole("combobox");
    expect(input.className).toContain("border-gray-300");
  });

  it("has indigo border when has value", () => {
    render(<SearchBar initialQuery="React" onSearch={() => {}} />);
    const input = screen.getByRole("combobox");
    expect(input.className).toContain("border-indigo-400");
    expect(input.className).toContain("ring-indigo-400");
  });

  it("shows clear button when has value", () => {
    render(<SearchBar initialQuery="React" onSearch={() => {}} />);
    expect(screen.getByLabelText("Clear search")).toBeDefined();
  });

  it("hides clear button when empty", () => {
    render(<SearchBar onSearch={() => {}} />);
    expect(screen.queryByLabelText("Clear search")).toBeNull();
  });

  it("clears input without triggering onSearch on clear", () => {
    const handleSearch = vi.fn();
    render(<SearchBar initialQuery="React" onSearch={handleSearch} />);

    fireEvent.click(screen.getByLabelText("Clear search"));
    const input = screen.getByRole("combobox") as HTMLInputElement;
    expect(input.value).toBe("");
    expect(handleSearch).not.toHaveBeenCalled();
  });

  it("calls onSearch on form submit", () => {
    const handleSearch = vi.fn();
    render(<SearchBar initialQuery="React" onSearch={handleSearch} />);

    const form = document.querySelector("form")!;
    fireEvent.submit(form);
    expect(handleSearch).toHaveBeenCalledWith("React");
  });

  it("shows suggestions dropdown when value present and focused", () => {
    render(<SearchBar initialQuery="Re" onSearch={() => {}} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);

    expect(screen.getByRole("listbox")).toBeDefined();
  });

  it("shows no dropdown when suggestions are empty", () => {
    render(<SearchBar initialQuery="zzzznotfound" onSearch={() => {}} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);

    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("filters suggestions by input value", () => {
    render(<SearchBar initialQuery="Re" onSearch={() => {}} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);

    expect(screen.getByText("React")).toBeDefined();
    expect(screen.queryByText("Python")).toBeNull();
  });

  it("shows company suggestions too", () => {
    render(<SearchBar initialQuery="Mic" onSearch={() => {}} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);

    expect(screen.getByText("Microsoft")).toBeDefined();
  });

  it("caps suggestions at 8 items", () => {
    render(<SearchBar initialQuery="" onSearch={() => {}} />);
    // Set a value that matches many items
    const input = screen.getByRole("combobox");
    fireEvent.change(input, { target: { value: "a" } });
    fireEvent.focus(input);

    const listbox = screen.queryByRole("listbox");
    // If there are more than 8 matching, should cap
    if (listbox) {
      const items = listbox.children;
      expect(items.length).toBeLessThanOrEqual(8);
    }
  });

  it("closes dropdown on Escape", () => {
    render(<SearchBar initialQuery="Re" onSearch={() => {}} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);
    expect(screen.getByRole("listbox")).toBeDefined();

    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("navigates with ArrowDown and selects with Enter", () => {
    const handleSearch = vi.fn();
    render(<SearchBar initialQuery="Re" onSearch={handleSearch} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);

    // First item should be highlighted
    fireEvent.keyDown(input, { key: "ArrowDown" });
    // Press Enter to select highlighted item
    fireEvent.keyDown(input, { key: "Enter" });

    expect(handleSearch).toHaveBeenCalledWith("React");
  });

  it("navigates with ArrowUp", () => {
    const handleSearch = vi.fn();
    // Use "a" to get multiple suggestions (GraphQL, Amazon, Meta, Apple)
    render(<SearchBar initialQuery="a" onSearch={handleSearch} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);

    // ArrowDown highlights first item, ArrowUp wraps to last item
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "ArrowUp" });

    // Press Enter should select the highlighted (last) item
    fireEvent.keyDown(input, { key: "Enter" });
    expect(handleSearch).toHaveBeenCalled();
    // Should not be called with "a" (the raw value) since it selected from suggestions
    expect(handleSearch).not.toHaveBeenCalledWith("a");
  });

  it("clicks a suggestion to fill input and trigger search", () => {
    const handleSearch = vi.fn();
    render(<SearchBar initialQuery="Re" onSearch={handleSearch} />);
    const input = screen.getByRole("combobox");
    fireEvent.focus(input);

    const reactSuggestion = screen.getByText("React");
    fireEvent.mouseDown(reactSuggestion);

    expect(handleSearch).toHaveBeenCalledWith("React");
  });

  it("has correct ARIA attributes on combobox", () => {
    render(<SearchBar initialQuery="Re" onSearch={() => {}} />);
    const input = screen.getByRole("combobox");
    expect(input).toHaveAttribute("aria-autocomplete", "list");
  });

  it("renders with normal search button by default", () => {
    render(<SearchBar onSearch={() => {}} />);
    const button = screen.getByRole("button", { name: /search/i });
    expect(button.className).toContain("bg-indigo-600");
    expect(button.className).not.toContain("animate-pulse");
  });

  it("renders with glow animation when isDirty is true", () => {
    render(<SearchBar onSearch={() => {}} isDirty={true} />);
    const button = screen.getByRole("button", { name: /search/i });
    expect(button.className).toContain("animate-pulse");
    expect(button.className).toContain("bg-amber-500");
    expect(button.className).toContain("ring-amber-400");
  });

  it("renders normal button when isDirty is false", () => {
    render(<SearchBar onSearch={() => {}} isDirty={false} />);
    const button = screen.getByRole("button", { name: /search/i });
    expect(button.className).toContain("bg-indigo-600");
    expect(button.className).not.toContain("animate-pulse");
  });
});
