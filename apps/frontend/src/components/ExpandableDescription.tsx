import { useState, useCallback } from "react";
import { Modal } from "./Modal";

interface ExpandableDescriptionProps {
  description: string;
  maxLength?: number;
  jobTitle?: string;
}

const MODAL_DIALOG_CLASS = "w-[min(70vw,100%)] max-w-[min(70vw,100%)] max-h-[70vh] overflow-y-auto";

export function ExpandableDescription({ description, maxLength = 250, jobTitle }: ExpandableDescriptionProps) {
  const [showModal, setShowModal] = useState(false);
  const isLong = description.length > maxLength;
  const displayText = !isLong ? description : `${description.slice(0, maxLength).trimEnd()}…`;

  const handleOpen = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleClose = useCallback(() => {
    setShowModal(false);
  }, []);

  return (
    <div className="mb-3">
      <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">{displayText}</p>
      {isLong && (
        <button
          type="button"
          onClick={handleOpen}
          className="mt-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
        >
          Show more
        </button>
      )}

      <Modal isOpen={showModal} onClose={handleClose} title={jobTitle ?? "Job Description"} dialogClassName={MODAL_DIALOG_CLASS}>
        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">{description}</p>
      </Modal>
    </div>
  );
}
