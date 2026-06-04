import { useState, useCallback, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from "react";

interface AutocompleteInputProps {
  id: string;
  label: string;
  placeholder: string;
  suggestions: string[];
  selectedItems: string[];
  onAdd: (item: string) => void;
  onRemove: (item: string) => void;
  renderTag: (item: string, onRemove: (item: string) => void) => React.ReactNode;
  buttonLabel?: string;
  onClear?: () => void;
  clearLabel?: string;
  excludeItems?: string[];
}

export function AutocompleteInput({
  id,
  label,
  placeholder,
  suggestions,
  selectedItems,
  onAdd,
  onRemove,
  renderTag,
  buttonLabel = "Add",
  onClear,
  clearLabel = "Clean",
  excludeItems,
}: AutocompleteInputProps) {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) &&
      !selectedItems.includes(s) &&
      !(excludeItems ?? []).includes(s),
  );
  const showDropdown = isFocused && filtered.length > 0;

  const addItem = useCallback(
    (item: string) => {
      const trimmed = item.trim();
      if (trimmed && !selectedItems.includes(trimmed) && !(excludeItems ?? []).includes(trimmed)) {
        onAdd(trimmed);
      }
      setInput("");
      setHighlightIndex(-1);
    },
    [selectedItems, excludeItems, onAdd],
  );

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setHighlightIndex(-1);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < filtered.length) {
          addItem(filtered[highlightIndex]!);
        } else if (input.trim()) {
          addItem(input);
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : 0,
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev > 0 ? prev - 1 : filtered.length - 1,
        );
      } else if (e.key === "Escape") {
        setIsFocused(false);
      }
    },
    [highlightIndex, filtered, addItem, input],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef}>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="relative mt-1">
        <div className="flex gap-2">
          <input
            id={id}
            type="text"
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            className="block flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          {onClear ? (
            <button
              type="button"
              onClick={onClear}
              disabled={selectedItems.length === 0}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {clearLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => addItem(input)}
              className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
            >
              {buttonLabel}
            </button>
          )}
        </div>
        {showDropdown && (
          <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
            {filtered.map((item, index) => (
              <li
                key={item}
                onClick={() => addItem(item)}
                onMouseEnter={() => setHighlightIndex(index)}
                className={`cursor-pointer px-3 py-2 text-sm ${
                  index === highlightIndex
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
      {selectedItems.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {selectedItems.map((item) => renderTag(item, onRemove))}
        </div>
      )}
    </div>
  );
}
