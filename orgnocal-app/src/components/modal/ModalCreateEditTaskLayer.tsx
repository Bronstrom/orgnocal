import React, { useEffect, useState } from "react";
import {
  useCreateLayerMutation,
  Status,
  Priority,
  TaskLayer,
  useUpdateTaskLayerNameMutation,
} from "@/state/api";
import Modal from "@/components/modal/Modal";
import { formInputStyles } from "@/lib/utils";

type ModalCreateEditTaskLayerProps = {
  isOpen: boolean;
  onClose: () => void;
  editingModalLayerId: number | null;
  taskLayers: TaskLayer[] | null;
  projectId: number;
};

const ModalCreateEditTaskLayer = ({
  isOpen,
  onClose,
  editingModalLayerId,
  taskLayers,
  projectId,
}: ModalCreateEditTaskLayerProps) => {
  const [createLayer, { isLoading: isLoadingCreating }] =
    useCreateLayerMutation();
  const [editLayer, { isLoading: isLoadingEditing }] =
    useUpdateTaskLayerNameMutation();
  // TODO: If getting to a lot validation use library
  const [name, setName] = useState("");
  const currentLayer = taskLayers?.find(
    (layer) => layer.id === editingModalLayerId
  );

  useEffect(() => {
    setName(currentLayer ? currentLayer.name : "");
  }, [isOpen, currentLayer]);

  const handleSubmit = async () => {
    if (!name) return;

    if (!editingModalLayerId) {
      await createLayer({
        name,
        projectId,
      });
    } else {
      await editLayer({
        layerId: editingModalLayerId,
        name,
      });
    }
    onClose()
  };

  const isCreateNewFormValid = () => {
    return name;
  };

  const invalidateSubmit = () => {
    return isLoadingCreating || isLoadingEditing;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      name={`${editingModalLayerId ? "Edit" : "Create New"} Task Layer`}
    >
      <form
        className="mt-4 space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <input
          type="text"
          className={formInputStyles}
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button
          type="submit"
          className={`mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${!isCreateNewFormValid() || invalidateSubmit() ? "cursor-not-allowed opacity-50" : ""} `}
          disabled={!isCreateNewFormValid() || invalidateSubmit()}
        >
          {/* TODO: Add spinner */}
          {invalidateSubmit()
            ? `${editingModalLayerId ? "Editing" : "Creating"} Layer . . .`
            : `${editingModalLayerId ? "Edit" : "Create"} Layer`}
        </button>
      </form>
    </Modal>
  );
};

export default ModalCreateEditTaskLayer;
