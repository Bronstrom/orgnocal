import React, { useEffect, useState } from "react";
import { useCreateTaskMutation, Status, Priority } from "@/state/api";
import { formatISO } from "date-fns";
import Modal from "@/components/modal/Modal";
import UserAssignmentDropdownViewable from "../dropdown/UserAssignmentDropdownViewable";
import { formInputStyles, formSelectStyles } from "@/lib/utils";

type ModalNewTaskProps = {
  isOpen: boolean;
  onClose: () => void;
  startAndEndDates?: string[];
  newTaskStatus: string;
  projectId?: number | null;
};

const ModalNewTask = ({
  isOpen,
  onClose,
  startAndEndDates,
  newTaskStatus,
  projectId = null,
}: ModalNewTaskProps) => {
  const [createTask, { isLoading }] = useCreateTaskMutation();
  // TODO: If getting to a lot validation use library
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Status>(Status.ToDo);
  const [priority, setPriority] = useState<Priority>(Priority.Lowest);
  const [tags, setTags] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [authorUserId, setAuthorUserId] = useState<number | undefined>(undefined);
  const [assignedUserId, setAssignedUserId] = useState<number | undefined>(undefined);
  const [userInputProjectId, setUserInputProjectId] = useState("");

  useEffect(() => {
    if (isOpen) {
      resetFields();
    }
  }, [isOpen]);

  function resetFields() {
    setTitle("");
    setDescription("");
    setStatus(Status.ToDo);
    setPriority(Priority.Lowest);
    setTags("");
    setStartDate("");
    setEndDate("");
    setAuthorUserId(0);
    setAssignedUserId(0);
    setUserInputProjectId("");
  }

  const handleSubmit = async () => {
    if (!isCreateNewFormValid) return;

    const formattedStartDate = !startDate
      ? undefined
      : formatISO(new Date(startDate), {
          representation: "complete",
        });
    const formattedEndDate = !endDate
      ? undefined
      : formatISO(new Date(endDate), {
          representation: "complete",
        });
    const formattedPostedDate = formatISO(new Date(), {
      representation: "complete",
    });
    // TODO: Authentification - Assign this user to createdByUserId
    await createTask({
      title,
      description,
      status,
      priority,
      tags,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      postedDate: formattedPostedDate,
      size: undefined,
      projectId: projectId !== null ? projectId : Number(userInputProjectId),
      authorUserId: authorUserId,
      assignedUserId: assignedUserId,
      createdByUserId: Number(authorUserId), // TODO: AUTHENTIFICATION - make this the authentificated user
    });
    onClose();
  };

  const isCreateNewFormValid = () => {
    // TODO: Remove requirement for startDate and endDate
    return (
      title &&
      authorUserId &&
      assignedUserId &&
      startDate &&
      endDate &&
      (projectId !== null || userInputProjectId)
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} name="Create New Task">
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
          placeholder="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <textarea
          className={formInputStyles}
          placeholder="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          {/* TODO: Reuse between edit task and this as well as use enums better */}
          <select
            className={formSelectStyles}
            value={newTaskStatus || status}
            onChange={(event) => {
              setStatus(Status[event.target.value as keyof typeof Status]);
            }}
          >
            <option value={Status.ToDo}>To-Do</option>
            <option value={Status.InProgress}>In Progress</option>
            <option value={Status.InReview}>In Review</option>
            <option value={Status.Completed}>Completed</option>
          </select>
          {/* TODO: Reuse between edit task and this as well as use enums better */}
          <select
            className={formSelectStyles}
            value={priority}
            onChange={(event) =>
              setPriority(Priority[event.target.value as keyof typeof Priority])
            }
          >
            <option value={Priority.Lowest}>Lowest</option>
            <option value={Priority.Low}>Low</option>
            <option value={Priority.Medium}>Medium</option>
            <option value={Priority.High}>High</option>
            <option value={Priority.Critical}>Critical</option>
          </select>
        </div>
        <input
          type="text"
          className={formInputStyles}
          placeholder="Tags - please seperate by commas (',')"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <input
            type="date"
            className={formInputStyles}
            value={startAndEndDates?.[0] || startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <input
            type="date"
            className={formInputStyles}
            value={startAndEndDates?.[1] || endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
        {/* TODO: This isn't the perfect implementation - isEditable is always true and passing view data that is never viewed to try to reuse functionality */}
        <UserAssignmentDropdownViewable
          author={undefined}
          selectedAuthorUserId={authorUserId}
          setSelectedAuthorUserId={setAuthorUserId}
          assignee={undefined}
          selectedAssignedUserId={assignedUserId}
          setSelectedAssignedUserId={setAssignedUserId}
          selectedProjectId={projectId}
          isEditable={true}
        />
        {projectId === null && (
          <input
            type="text"
            className={formInputStyles}
            placeholder="ProjectID"
            value={userInputProjectId}
            onChange={(event) => setUserInputProjectId(event.target.value)}
          />
        )}
        <button
          type="submit"
          className={`mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus-offset-2 ${!isCreateNewFormValid() || isLoading ? "cursor-not-allowed opacity-50" : ""} `}
          disabled={!isCreateNewFormValid() || isLoading}
        >
          {/* TODO: Add spinner */}
          {isLoading ? "Creating Task . . ." : "Create Task"}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNewTask;
