import { useSuggestions } from "@/hooks";
import { AutocompleteInput } from "./AutocompleteInput";

interface SkillsTagsInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export function SkillsTagsInput({ skills, onChange }: SkillsTagsInputProps) {
  const { data: suggestions } = useSuggestions();

  return (
    <AutocompleteInput
      id="skills-input"
      label="Required Skills"
      placeholder="e.g. TypeScript, React, Node.js"
      suggestions={suggestions?.skills ?? []}
      selectedItems={skills}
      onAdd={(skill) => onChange([...skills, skill])}
      onRemove={(skill) => onChange(skills.filter((s) => s !== skill))}
      renderTag={(skill, onRemove) => (
        <span
          key={skill}
          className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800"
        >
          {skill}
          <button
            type="button"
            onClick={() => onRemove(skill)}
            className="text-indigo-600 hover:text-indigo-900"
            aria-label={`Remove skill ${skill}`}
          >
            &times;
          </button>
        </span>
      )}
    />
  );
}
