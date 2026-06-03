import { useState, useCallback } from "react";
import { Modal } from "./Modal";

interface ExpandableDescriptionProps {
  description: string;
  maxLength?: number;
}

export function ExpandableDescription({ description, maxLength = 250 }: ExpandableDescriptionProps) {
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

      <Modal isOpen={showModal} onClose={handleClose} title="Job Description">
        <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">{description}</p>
      </Modal>
    </div>
  );
}
