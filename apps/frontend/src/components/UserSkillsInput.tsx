import { useCallback } from "react";
import { AutocompleteInput } from "./AutocompleteInput";
import { useSuggestions } from "@/hooks";

const USER_SENIORITY_LEVELS = [
  { value: "", label: "Not specified" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "principal", label: "Principal" },
];

interface UserSkillsInputProps {
  userSkills: string[];
  userSeniority: string;
  onUserSkillsChange: (skills: string[]) => void;
  onUserSeniorityChange: (seniority: string) => void;
  onMoveToRequired: () => void;
}

export function UserSkillsInput({
  userSkills,
  userSeniority,
  onUserSkillsChange,
  onUserSeniorityChange,
  onMoveToRequired,
}: UserSkillsInputProps) {
  const { data: suggestions } = useSuggestions();

  const handleSeniorityChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onUserSeniorityChange(e.target.value);
    },
    [onUserSeniorityChange],
  );

  return (
    <div className="space-y-4 rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-indigo-900">Your Skills</h3>
        {userSkills.length > 0 && (
          <button
            type="button"
            onClick={onMoveToRequired}
            className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-200"
          >
            Move all to Required Skills
          </button>
        )}
      </div>

      <AutocompleteInput
        id="user-skills-input"
        label=""
        placeholder="e.g. TypeScript, React, Node.js"
        suggestions={suggestions?.skills ?? []}
        selectedItems={userSkills}
        onAdd={(skill) => onUserSkillsChange([...userSkills, skill])}
        onRemove={(skill) => onUserSkillsChange(userSkills.filter((s) => s !== skill))}
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

      <div>
        <label htmlFor="user-seniority" className="block text-sm font-medium text-gray-700">
          Your Seniority
        </label>
        <select
          id="user-seniority"
          value={userSeniority}
          onChange={handleSeniorityChange}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          {USER_SENIORITY_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
