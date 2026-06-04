import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { AutocompleteInput } from "./AutocompleteInput";
import { useSuggestions } from "@/hooks";

interface UserSkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userSkills: string[];
  userSeniority: string;
  onUserSkillsChange: (skills: string[]) => void;
  onUserSeniorityChange: (seniority: string) => void;
  skills: string[];
  onMoveToRequired: (skillsToMove: string[]) => void;
}

const USER_SENIORITY_LEVELS = [
  { value: "", label: "Not specified" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-Level" },
  { value: "senior", label: "Senior" },
  { value: "lead", label: "Lead" },
  { value: "principal", label: "Principal" },
];

export function UserSkillsModal({
  isOpen,
  onClose,
  userSkills,
  userSeniority,
  onUserSkillsChange,
  onUserSeniorityChange,
  onMoveToRequired,
}: UserSkillsModalProps) {
  const { data: suggestions } = useSuggestions();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Local state for skills, seniority, and checked skills — initialized from props on open
  const [localSkills, setLocalSkills] = useState<string[]>(userSkills);
  const [localSeniority, setLocalSeniority] = useState<string>(userSeniority);
  const [checkedSkills, setCheckedSkills] = useState<Set<string>>(new Set());

  // Sync local state from props when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSkills(userSkills);
      setLocalSeniority(userSeniority);
      setCheckedSkills(new Set());
    }
  }, [isOpen, userSkills, userSeniority]);

  // Close on Escape — discard local changes
  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === overlayRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  // Close (X) — discard local changes, do NOT sync to store
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Save — sync all local state to store, then close
  const handleSave = useCallback(() => {
    onUserSkillsChange(localSkills);
    onUserSeniorityChange(localSeniority);
    if (checkedSkills.size > 0) {
      onMoveToRequired(Array.from(checkedSkills));
    }
    onClose();
  }, [localSkills, localSeniority, checkedSkills, onUserSkillsChange, onUserSeniorityChange, onMoveToRequired, onClose]);

  const handleSeniorityChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setLocalSeniority(e.target.value);
    },
    [],
  );

  const handleAddSkill = useCallback(
    (skill: string) => {
      setLocalSkills((prev) => (prev.includes(skill) ? prev : [...prev, skill]));
    },
    [],
  );

  const handleRemoveSkill = useCallback(
    (skill: string) => {
      setLocalSkills((prev) => prev.filter((s) => s !== skill));
    },
    [],
  );

  const toggleCheckSkill = useCallback((skill: string) => {
    setCheckedSkills((prev) => {
      const next = new Set(prev);
      if (next.has(skill)) {
        next.delete(skill);
      } else {
        next.add(skill);
      }
      return next;
    });
  }, []);

  const allChecked = localSkills.length > 0 && checkedSkills.size === localSkills.length;

  const handleSelectAll = useCallback(() => {
    if (allChecked) {
      setCheckedSkills(new Set());
    } else {
      setCheckedSkills(new Set(localSkills));
    }
  }, [allChecked, localSkills]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label="Manage your skills"
    >
      <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Skills</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-4">
          {/* Autocomplete / Tags */}
          <AutocompleteInput
            id="modal-user-skills-input"
            label="Add your skills"
            placeholder="e.g. TypeScript, React, Node.js"
            suggestions={suggestions?.skills ?? []}
            selectedItems={localSkills}
            onAdd={handleAddSkill}
            onRemove={handleRemoveSkill}
            onClear={() => setLocalSkills([])}
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

          {/* Seniority Selector */}
          <div>
            <label htmlFor="modal-user-seniority" className="block text-sm font-medium text-gray-700">
              Your Seniority
            </label>
            <select
              id="modal-user-seniority"
              value={localSeniority}
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

          {/* Selective Move Section — checkbox labels only, no move button */}
          {localSkills.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">Move skills to Required Skills</h3>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  {allChecked ? "Deselect all" : "Select all"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {localSkills.map((skill) => {
                  const isChecked = checkedSkills.has(skill);
                  return (
                    <label
                      key={skill}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        isChecked
                          ? "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-400"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheckSkill(skill)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      {skill}
                    </label>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Save button */}
        <div className="flex items-center justify-end border-t border-gray-200 px-6 py-3">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
