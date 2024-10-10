import React, { useEffect, useState } from "react";
import Modal from "@/components/modal/Modal";
import { formInputStyles } from "@/lib/utils";

type ModalDeleteProps = {
  type: string;
  name: string;
  message: string;
  isOpen: boolean;
  confirmAction: () => void;
  onClose: () => void;
  isLoading: boolean;
  requiredField?: string;
};

const ModalDelete = ({
  type,
  name,
  message,
  isOpen,
  confirmAction,
  onClose,
  isLoading,
  requiredField = "",
}: ModalDeleteProps) => {
  const [requiredText, setRequiredText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setRequiredText("");
    }
  }, [isOpen]);

  function invalidateSubmit() {
    return (requiredField && requiredField !== requiredText) || isLoading;
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} name={"Delete " + type}>
      <div>
        Are you sure you want to delete {type}: "{name}"? {message}
      </div>
      {requiredField && (
        <div className="p-8">
          <input
            type="text"
            className={formInputStyles}
            placeholder={requiredField}
            value={requiredText}
            onChange={(event) => setRequiredText(event.target.value)}
          />
        </div>
      )}
      <button
        type="submit"
        className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-red-500 hover:bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-red-600 ${invalidateSubmit() ? "cursor-not-allowed opacity-50" : ""} `}
        disabled={invalidateSubmit()}
        onClick={confirmAction}
      >
        {/* TODO: Handle delete option and add onClick for delete toggle */}
        {"Delete " + type}
      </button>
    </Modal>
  );
};

export default ModalDelete;
