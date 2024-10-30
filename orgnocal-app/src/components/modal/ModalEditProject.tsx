import React, { useEffect, useState } from "react";
import {
  Project,
  useCreateProjectMutation,
  useDeleteProjectMutation,
  useGetAuthUserQuery,
  useUpdateProjectMutation,
} from "@/state/api";
import { format, formatISO } from "date-fns";
import Modal from "@/components/modal/Modal";
import ModalDelete from "@/components/modal/ModalDelete";
import { useRouter } from "next/navigation";
import { formInputStyles } from "@/lib/utils";

type ModalEditProjectProps = {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
};

const ModalEditProject = ({
  project,
  isOpen,
  onClose,
}: ModalEditProjectProps) => {
  const router = useRouter();

  const { data: user } = useGetAuthUserQuery({})
  const userId = user?.userDetails?.userId;

  const [createProject, { isLoading: isLoadingCreateProject }] =
    useCreateProjectMutation();
  const [updateProject, { isLoading: isLoadingUpdateProject }] =
    useUpdateProjectMutation();
  const [deleteProject, { isLoading: isLoadingDeleteProject }] =
    useDeleteProjectMutation();
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  // TODO: If getting to a lot validation use library
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [views, setViews] = useState<string[]>([]);

  useEffect(() => {
    if (project) {
      setProjectName(project.name || "");
      setDescription(project.description || "");
      // TODO: Need to convert these to show up in date formatter
      setStartDate(
        project?.startDate
          ? format(new Date(project.startDate), "yyyy-MM-dd")
          : ""
      );
      setEndDate(
        project?.endDate ? format(new Date(project.endDate), "yyyy-MM-dd") : ""
      );
      // TODO: Remove - not used
      setViews(
        project.projectViews.map((projectView) => projectView.viewType) || []
      );
    } else {
      resetEditProjectFields();
    }
  }, [isOpen]);

  function resetEditProjectFields() {
    setProjectName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setViews([]);
  }

  function onViewCheck(
    event: React.ChangeEvent<HTMLInputElement>,
    viewType: string
  ) {
    const checked = event.target.checked;
    if (checked) {
      setViews([...views, viewType]);
    } else {
      setViews(views.filter((view) => view !== viewType));
    }
  }

  const handleSubmit = async () => {
    if (!projectName || !startDate || !endDate) return;

    const formattedStartDate = formatISO(new Date(startDate), {
      representation: "complete",
    });
    const formattedEndDate = formatISO(new Date(endDate), {
      representation: "complete",
    });
    // Handle create new project
    if (!project) {
      await createProject({
        project: {
          name: projectName,
          description,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          createdByUserId: userId,
        },
        views: views,
      });
    }
    // Handle edit project
    else {
      await updateProject({
        projectId: project.id,
        projectPartial: {
          name: projectName,
          description,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      });
    }
    onClose();
  };

  const handleDeleteProject = async () => {
    try {
      const rerouteLink = `/`;
      await deleteProject({
        projectId: project?.id || 0,
      });
      router.push(rerouteLink);
    } catch (err) {
      console.error(err);
    }
  };

  function invalidateSubmit() {
    return (
      isLoadingCreateProject || isLoadingUpdateProject || isLoadingDeleteProject
    );
  }

  const isEditNewFormValid = () => {
    return projectName && description && startDate && endDate;
  };

  function checkboxItemView(viewType: string) {
    return (
      <li className="w-full border-b border-gray-200 dark:border-gray-600 sm:border-b-0 sm:border-r">
        <div className="flex items-center ps-3">
          <input
            id={`${viewType}-checkbox-item`}
            type="checkbox"
            checked={views?.includes(viewType)}
            onChange={(event) => onViewCheck(event, viewType)}
            className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
          />
          <label
            htmlFor={`${viewType}-checkbox-item`}
            className="ms-2 w-full py-3 text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            {viewType}
          </label>
        </div>
      </li>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      name={project ? "Edit Project" : "Create New Project"}
    >
      {project && (
        <ModalDelete
          type={"Project"}
          name={project.name}
          message={
            "All tasks linked to this Project will be deleted when confirmed."
          }
          isOpen={isModalDeleteOpen}
          // TODO: Add delete action
          confirmAction={handleDeleteProject}
          onClose={() => setIsModalDeleteOpen(false)}
          isLoading={isLoadingDeleteProject}
        />
      )}
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
          placeholder="Project Name"
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
        />
        <textarea
          className={formInputStyles}
          placeholder="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
          <input
            type="date"
            className={formInputStyles}
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <input
            type="date"
            className={formInputStyles}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
        {!project && (
          <>
            <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
              View Selection
            </h3>
            <ul className="w-full items-center rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:flex">
              {checkboxItemView("board")}
              {checkboxItemView("calendar")}
              {checkboxItemView("dashboard")}
              {checkboxItemView("gantt")}
              {checkboxItemView("hierarchy")}
              {checkboxItemView("table")}
              {checkboxItemView("tile")}
            </ul>
          </>
        )}
        {project && (
          <button
            className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${invalidateSubmit() ? "cursor-not-allowed opacity-50" : ""} `}
            disabled={invalidateSubmit()}
            onClick={(event) => {
              event.preventDefault();
              setIsModalDeleteOpen(true);
            }}
          >
            Delete Project
          </button>
        )}
        <button
          type="submit"
          className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${!isEditNewFormValid() || invalidateSubmit() ? "cursor-not-allowed opacity-50" : ""} `}
          disabled={!isEditNewFormValid() || invalidateSubmit()}
        >
          {/* TODO: Add spinner */}
          {invalidateSubmit()
            ? project
              ? "Modifying Project . . ."
              : "Creating Project . . ."
            : project
              ? "Edit Project"
              : "Create Project"}
        </button>
      </form>
    </Modal>
  );
};

export default ModalEditProject;
