import { useState, useCallback } from "react";

interface ExpandableDescriptionProps {
  description: string;
  maxLength?: number;
}

export function ExpandableDescription({ description, maxLength = 250 }: ExpandableDescriptionProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > maxLength;
  const displayText = expanded || !isLong ? description : `${description.slice(0, maxLength).trimEnd()}…`;

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  return (
    <div className="mb-3">
      <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{displayText}</p>
      {isLong && (
        <button
          type="button"
          onClick={toggle}
          className="mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
