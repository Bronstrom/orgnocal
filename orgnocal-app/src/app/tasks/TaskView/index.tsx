import { PriorityTag } from "@/app/projects/BoardView";
import Header from "@/components/Header";
import ModalDelete from "@/components/modal/ModalDelete";
import UserAssignmentDropdownViewable from "@/components/dropdown/UserAssignmentDropdownViewable";
import {
  Priority,
  Status,
  Project,
  Task,
  useGetProjectsQuery,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "@/state/api";
import { format, formatISO } from "date-fns";
import {
  IconArchive,
  IconArrowLeft,
  IconSquareRoundedXFilled,
  IconExternalLink,
  IconLinkPlus,
  IconPaperclip,
  IconPencil,
  IconPencilOff,
  IconAlignJustified,
  IconTrash,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import {
  formInputStyles,
  formLabelStyles,
  formSelectStyles,
} from "@/lib/utils";
import TaskHeader from "./TaskHeader";

type TaskViewProps = {
  task: Task;
};

const TaskView = ({ task }: TaskViewProps) => {
  const router = useRouter();
  const {
    data: projects,
    isLoading: isLoadingProjects,
    isError: isErrorProjects,
  } = useGetProjectsQuery();
  const [updateTask, { isLoading: isCreateTaskLoading }] =
    useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleteTaskLoading }] =
    useDeleteTaskMutation();
  // TODO: Placeholder for actual edits
  const isLoading = false;

  const [isEditable, setIsEditable] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  // Required fields
  const [title, setTitle] = useState(task.title);
  const [taskAuthorUserId, setTaskAuthorUserId] = useState(task.authorUserId);
  // Optional fields
  const [description, setDescription] = useState(task.description || "");
  const [addUrl, setAddUrl] = useState("");
  const [urls, setUrls] = useState<string[]>(task.urls || []);
  const [status, setStatus] = useState(task.status);
  const [startDate, setStartDate] = useState(task.startDate);
  // TODO: May need to adjust if I change to endDate
  const [endDate, setEndDate] = useState(task.endDate);
  const [priority, setPriority] = useState(task.priority);
  const [tags, setTags] = useState(task.tags || "");
  const [taskAssignedUserId, setTaskAssignedUserId] = useState(
    task.assignedUserId,
  );

  const [taskProject, setTaskProject] = useState<Project | null>(
    projects?.find((project) => project.id === task.projectId) || null,
  );

  function resetTextFields() {
    setTitle(task.title);
    setTaskAuthorUserId(task.authorUserId);

    setDescription(task.description || "");
    setUrls(task.urls || []);
    setStatus(task.status);
    setStartDate(task.startDate);
    setEndDate(task.endDate);
    setPriority(task.priority);
    setTags(task.tags || "");
    setTaskAssignedUserId(task.assignedUserId);

    setTaskProject(
      projects?.find((project) => project.id === task.projectId) || null,
    );
  }

  function handleEditTaskToggle() {
    const tempEditable = !isEditable;
    setIsEditable(tempEditable);
    // Handle cancel
    if (!tempEditable) {
      resetTextFields();
    }
  }

  // Validate required fields
  function isValidTaskEdits() {
    return title && taskAuthorUserId;
  }

  function textFieldViewable(
    input: string,
    setInput: (input: string) => void,
    label = "",
    noInputProvided = "",
    subtitle = "",
    disabled = "",
  ) {
    return (
      <div className="space-y-1">
        {label && <label className={formLabelStyles}>{label}</label>}
        {!isEditable ? (
          <>{input?.length < 1 || !input ? noInputProvided : input}</>
        ) : (
          <input
            type="text"
            className={formInputStyles}
            placeholder={label}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={Boolean(disabled)}
          />
        )}
        {isEditable && subtitle && (
          <p className={"text-gray-500"}>{subtitle}</p>
        )}
      </div>
    );
  }

  function textAreaViewable(
    input: string,
    setInput: (input: string) => void,
    label = "",
    noInputProvided = "",
    subtitle = "",
    disabled = "",
  ) {
    return (
      <div className="w-full space-y-1">
        {label && <label className={formLabelStyles}>{label}</label>}
        {!isEditable ? (
          <>{input?.length < 1 || !input ? noInputProvided : input}</>
        ) : (
          <textarea
            className={formInputStyles}
            placeholder={label}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={Boolean(disabled)}
          />
        )}
        {isEditable && subtitle && (
          <p className={"text-gray-500"}>{subtitle}</p>
        )}
      </div>
    );
  }

  function displayViewableDates(startDate?: string, endDate?: string) {
    if (!startDate && !endDate) {
      return <>~ No dates set ~</>;
    } else {
      return (
        <>
          {!startDate ? "~ No start date ~" : format(new Date(startDate), "P")}
          {" - "}
          {!endDate ? "~ No end date ~" : format(new Date(endDate), "P")}
        </>
      );
    }
  }

  function inputDateViewable(
    setStartDate: (startDate?: string) => void,
    setEndDate: (endDate?: string) => void,
    startDate?: string,
    endDate?: string,
  ) {
    return (
      <div>
        <strong>Start & End Date:</strong>{" "}
        {!isEditable ? (
          displayViewableDates(startDate, endDate)
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-2">
            {/* TODO: Fix off by a time with date picker*/}
            <input
              type="date"
              className={formInputStyles}
              value={format(new Date(startDate || ""), "yyyy-MM-dd")}
              onChange={(event) => setStartDate(event.target.value)}
            />
            <input
              type="date"
              className={formInputStyles}
              value={format(new Date(endDate || ""), "yyyy-MM-dd")}
              onChange={(event) => setEndDate(event.target.value)}
            />
          </div>
        )}
      </div>
    );
  }

  const handleSaveEdits = async (isArchived?: boolean) => {
    // TODO: Add in save query - including recent edit
    // TODO: Ensure that project changes work correctly - author/assignee should be removed and nested tasks move with it, but not parent task
    const formattedLatestEditDate = formatISO(new Date(), {
      representation: "complete",
    });
    let formattedStartDate;
    let formattedEndDate;
    if (startDate) {
      formattedStartDate = formatISO(new Date(startDate), {
        representation: "complete",
      });
    }
    if (endDate) {
      formattedEndDate = formatISO(new Date(endDate), {
        representation: "complete",
      });
    }
    await updateTask({
      taskId: task.id,
      partialTask: {
        title,
        description: description,
        status: status,
        priority: priority,
        tags: tags,
        latestEditDate: formattedLatestEditDate,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        urls: urls,
        archived: isArchived,
        authorUserId: taskAuthorUserId,
        assignedUserId: taskAssignedUserId,
        latestEditedByUserId: 1, // TODO: AUTHENTIFICATION - make this the authentificated user
      },
    });
    setIsEditable(false);
  };

  const handleDeleteTask = async () => {
    try {
      const rerouteLink = `/projects/${task.projectId}`;
      await deleteTask({
        taskId: task.id,
      });
      router.push(rerouteLink);
    } catch (err) {
      console.error(err);
    }
  };

  function invalidateSubmit() {
    return isLoading || isCreateTaskLoading || isDeleteTaskLoading;
  }

  return (
    <>
      <div className="flex justify-between">
        {/* Return to previous page */}
        <Link href={`/projects/${task.projectId}`}>
          <button className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600">
            <IconArrowLeft className="mr-2 h-5 w-5" />
            Project Dashboard
          </button>
        </Link>
        <div className="flex flex-wrap gap-5">
          {/* TODO: Add delete functionality for tasks and ensure only the user that created this task or project owner/project manager can delete it */}
          {/* IconSquareRoundedXFilled Task */}
          {isEditable && (
            <button
              className={`flex items-center rounded bg-red-500 px-3 py-2 text-white hover:bg-red-600 ${invalidateSubmit() ? "cursor-not-allowed opacity-50" : ""}`}
              onClick={() => setIsModalDeleteOpen(true)}
              disabled={invalidateSubmit()}
            >
              <IconTrash className="mr-2 h-5 w-5" />
              Delete Task
            </button>
          )}
          {isEditable && (
            <button
              className={`flex items-center rounded bg-royal-secondary px-3 py-2 text-white hover:bg-purple-600 ${!isValidTaskEdits() || invalidateSubmit() ? "cursor-not-allowed opacity-50" : ""}`}
              onClick={() => handleSaveEdits(!task.archived)}
              disabled={!isValidTaskEdits() || invalidateSubmit()}
            >
              <IconArchive className="mr-2 h-5 w-5" />
              {task.archived ? <>Unarchive (& Save)</> : <>Archive (& Save)</>}
            </button>
          )}
          {/* Save Edits */}
          {isEditable && (
            <button
              type="submit"
              className={`flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600 ${!isValidTaskEdits() || invalidateSubmit() ? "cursor-not-allowed opacity-50" : ""} `}
              disabled={!isValidTaskEdits() || invalidateSubmit()}
              onClick={() => handleSaveEdits()}
            >
              <IconPencilOff className="mr-2 h-5 w-5" />
              Save Edits
            </button>
          )}
          {/* Edit task*/}
          {/* TODO: Ensure this option is only available for project manager, po or created user - delete and save should only be allowed by these people should be validated on the back-end too */}
          <button
            className={`flex items-center rounded bg-gray-600 px-3 py-2 text-white hover:bg-gray-700 ${invalidateSubmit() ? "cursor-not-allowed opacity-50" : ""}`}
            onClick={handleEditTaskToggle}
            disabled={invalidateSubmit()}
          >
            {!isEditable ? (
              <>
                <IconPencil className="mr-2 h-5 w-5" />
                Edit Task
              </>
            ) : (
              <>
                <IconPencilOff className="mr-2 h-5 w-5" />
                Cancel Edit
              </>
            )}
          </button>
        </div>
      </div>
      <div
        className={`my-5 grid grid-cols-3 gap-4 rounded shadow ${task.archived ? "bg-purple-200 dark:bg-purple-800" : "bg-white dark:bg-dark-secondary"} dark:text-white`}
      >
        <ModalDelete
          type={"Task"}
          name={task.title}
          message={"Any child/nested tasks will be deleted when confirmed."}
          isOpen={isModalDeleteOpen}
          // TODO: Add delete action
          confirmAction={handleDeleteTask}
          onClose={() => setIsModalDeleteOpen(false)}
          isLoading={invalidateSubmit()}
        />
        {/* Left column */}
        <div className="col-span-2 p-10">
          {/* TODO: Make custom header for this component and project title? */}
          <TaskHeader
            title={textFieldViewable(title, setTitle)}
            // TODO: Make this a dropdown sepecific to "my projects", otherwise display project name, maybe seperate component
            subtitle={
              <div className="flex items-center gap-2">
                <div>Project:</div>
                {/* TODO: Make this a dropdown sepecific to "my projects" */}
                {!isEditable ? (
                  // TODO: Make sure link refreshed correctly
                  <a
                    href={`/projects/${task.projectId}`}
                    className="cursor-pointer text-blue-primary"
                  >
                    {taskProject ? taskProject.name : "~ No project assigned"}
                  </a>
                ) : (
                  <>
                    <select
                      className={formSelectStyles}
                      // TODO: Ensure null for project and 0 for value works well here
                      value={taskProject ? taskProject.id : 0}
                      onChange={(event) => {
                        let tempFindProject = projects
                          ? projects.find(
                              (project) =>
                                project.id === Number(event.target.value),
                            )
                          : null;
                        setTaskProject(tempFindProject || null);
                      }}
                      disabled={
                        (task.nestedTasks && task.nestedTasks.length > 0) ||
                        Boolean(task.parentTaskId)
                      }
                    >
                      <option value={0}>No Project Assigned</option>
                      {projects?.map((project) => (
                        <option value={project.id}>{project.name}</option>
                      ))}
                    </select>
                    {((task.nestedTasks && task.nestedTasks.length > 0) ||
                      Boolean(task.parentTaskId)) &&
                      "Can't move with parent/child relationship reliance"}
                  </>
                )}
              </div>
            }
          />
          <p>
            <strong>Task ID:</strong> {task.id}
          </p>
          {/* TODO: Fix createdBy */}
          {task.postedDate && task.createdBy && (
            <div className="flex gap-2">
              <strong>Posted:</strong>
              {format(new Date(task.postedDate), "P")}
              <strong>By:</strong>
              <Image
                key={task.createdByUserId}
                // Ensure profile picture exists
                // TODO: Maybe have some extra validation here and have placeholder image
                src={`/${task.createdBy.profilePictureUrl!}`}
                alt={task.createdBy.username}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
              />
            </div>
          )}
          {/* TODO: Fix latestEditBy */}
          {task.latestEditDate && task.latestEditedBy && (
            <div className="flex gap-2">
              <em>{"(Posted: "}</em>
              {format(new Date(task.latestEditDate), "P")}
              <em>By:</em>
              <Image
                key={task.latestEditedByUserId}
                // Ensure profile picture exists
                // TODO: Maybe have some extra validation here and have placeholder image
                src={`/${task.latestEditedBy.profilePictureUrl!}`}
                alt={task.latestEditedBy.username}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
              />
              <em>{")"}</em>
            </div>
          )}
          <div className="grid gap-1 py-5">
            {task.parentTaskId && (
              <div className="flex gap-2">
                <strong>Parent Task:</strong>{" "}
                <a
                  href={`/tasks/${task.parentTaskId}`}
                  className="cursor-pointer text-blue-primary"
                >
                  ID: {task.parentTaskId}
                </a>
              </div>
            )}
            {/*TODO: Add Child tasks in
          <strong>Child Tasks:</strong> {task.parentTaskId}*/}
            {task.taskLayer && (
              <div className="flex gap-2">
                <strong>Layer:</strong>
                {task.taskLayer.name}
              </div>
            )}
          </div>
          {/* TODO: Not relavant to display this - maybe have an optional secondary identifier here (like a code) */}
          <div className="grid gap-5">
            {/* TODO: Create reusable component for these */}
            <div className="flex gap-2">
              <IconAlignJustified size={"1rem"} />
              {textAreaViewable(
                description,
                setDescription,
                "Description",
                "~ No description provided ~",
              )}
            </div>
            <div className="mt-4 border-t border-gray-200 dark:border-stroke-dark" />
            <div>
              <h3 className="flex items-center gap-2 text-lg font-semibold dark:text-white">
                <IconPaperclip size={"1rem"} />
                Attachments:
              </h3>
              {urls.length < 1 ? (
                <div>~No Attachments to display ~</div>
              ) : (
                urls.map((url) => (
                  <div className="flex items-center pl-5">
                    {isEditable && (
                      <button
                        className={`mr-4 text-red-500 hover:text-red-600`}
                        onClick={() => {
                          setUrls(
                            urls.filter((urlElement) => urlElement !== url),
                          );
                        }}
                      >
                        <IconSquareRoundedXFilled className="mr-2 h-7 w-7" />
                      </button>
                    )}
                    {/* TODO: This method may not work for all links and should probably do some validation */}
                    <Link
                      href={"https://" + url || "http://" + url}
                      target="_blank"
                      className="flex items-center text-blue-primary hover:text-blue-600"
                    >
                      {url}
                      <IconExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </div>
                ))
              )}
              {isEditable && (
                <div className="flex items-end">
                  {textFieldViewable(addUrl, setAddUrl, "New Link", "")}
                  <button
                    className={`mx-5 flex h-10 items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600 ${addUrl === "" ? "cursor-not-allowed opacity-50" : ""}`}
                    onClick={() => {
                      setUrls((previousUrls) => [...previousUrls, addUrl]);
                      setAddUrl("");
                    }}
                    disabled={addUrl === ""}
                  >
                    <IconLinkPlus className="mr-2 h-5 w-5" />
                    Add Url
                  </button>
                </div>
              )}
              {/* TODO: Add attachments later
            {task.attachments && task.attachments.length > 0 && (
              <div>
                <strong>Attachments:</strong>
                <div className="flex flex-wrap">
                  {/* TODO: Add attachments later
                  {task.attachments && task.attachments.length > 0 && (
                    <Image
                      src={`/${task.attachments[0].fileURL}`}
                      alt={task.attachments[0].fileName}
                      width={400}
                      height={200}
                      className="rounded-md"
                    />
                  )}
                </div>
              </div>
            )}
            */}
            </div>
          </div>
        </div>
        {/* Right column */}
        <div
          className={`p-10 ${task.archived ? "bg-purple-400 dark:bg-purple-900" : "bg-gray-200 dark:bg-gray-800"}`}
        >
          <div className="grid gap-5">
            <UserAssignmentDropdownViewable
              author={task.author}
              selectedAuthorUserId={taskAuthorUserId}
              setSelectedAuthorUserId={setTaskAuthorUserId}
              assignee={task.assignee}
              selectedAssignedUserId={taskAssignedUserId}
              setSelectedAssignedUserId={setTaskAssignedUserId}
              // TODO: Handle 0 case here correctly
              selectedProjectId={taskProject?.id || 0}
              isEditable={isEditable}
            />
            <div className="flex items-center gap-3">
              <strong>Status:</strong>{" "}
              {!isEditable ? (
                status
              ) : (
                <>
                  {/* TODO: Reuse between edit task and this as well as use enums better */}
                  <select
                    className={formSelectStyles}
                    value={status}
                    onChange={(event) => {
                      setStatus(
                        Status[event.target.value as keyof typeof Status],
                      );
                    }}
                  >
                    <option value={Status.ToDo}>To-Do</option>
                    <option value={Status.InProgress}>In Progress</option>
                    <option value={Status.InReview}>In Review</option>
                    <option value={Status.Completed}>Completed</option>
                  </select>
                </>
              )}
            </div>
            <div className="flex items-center gap-3">
              <strong>Priority:</strong>{" "}
              {!isEditable ? (
                <PriorityTag priority={priority} />
              ) : (
                <>
                  {/* TODO: Reuse between edit task and this as well as use enums better */}
                  <select
                    className={formSelectStyles}
                    value={priority}
                    onChange={(event) =>
                      setPriority(
                        Priority[event.target.value as keyof typeof Priority],
                      )
                    }
                  >
                    <option value={Priority.Lowest}>Lowest</option>
                    <option value={Priority.Low}>Low</option>
                    <option value={Priority.Medium}>Medium</option>
                    <option value={Priority.High}>High</option>
                    <option value={Priority.Critical}>Critical</option>
                  </select>
                </>
              )}
            </div>
            {inputDateViewable(setStartDate, setEndDate, startDate, endDate)}
            {textFieldViewable(
              tags,
              setTags,
              "Tags",
              "~ No tags provided ~",
              "Please type as a comma (',') seperated list",
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskView;
