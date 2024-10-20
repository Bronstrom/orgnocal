import React from "react";
import { useGetTasksQuery, useUpdateTaskStatusMutation } from "@/state/api";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Task as TaskType } from "@/state/api";
import {
  IconDoorEnter,
  IconDotsVertical,
  IconDots,
  IconMessage,
  IconPlus,
} from "@tabler/icons-react";
import { format } from "date-fns";
import Image from "next/image";
import Header from "@/components/Header";
import Link from "next/link";
import {
  SubMenuButton,
  SubMenuDropdown,
} from "@/components/dropdown/SubMenuDropdown";
import { CircularProgress } from "@mui/material";
import MoreInfo from "@/components/MoreInfo";

// TODO: Props can be reused from the different views
type BoardViewProps = {
  id: string;
  isArchivedSelected: boolean;
  taskSearchQuery: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  setNewTaskStatus: (newTaskStatus: string) => void;
};

// TODO: Figure out if there is a method to aquire Status from api instead
const taskStatus = ["ToDo", "InProgress", "InReview", "Completed"];

// TODO: Put this in a utils files
export const PriorityTag = ({
  priority,
}: {
  priority: TaskType["priority"] | string;
}) => (
  // TODO: Clean this chained ternary operator up
  <div
    className={`front-semibold rounded-full px-2 py-1 text-xs ${
      priority === "Critical"
        ? "bg-red-200 text-red-700"
        : priority === "High"
          ? "bg-yellow-200 text-yellow-700"
          : priority === "Medium"
            ? "bg-green-200 text-green-700"
            : priority === "Low"
              ? "bg-blue-200 text-blue-700"
              : "bg-gray-200 text-gray-700"
    }`}
  >
    {priority}
  </div>
);

const BoardView = ({
  id,
  isArchivedSelected,
  taskSearchQuery,
  setIsModalNewTaskOpen,
  setNewTaskStatus,
}: BoardViewProps) => {
  const {
    data: tasks,
    isLoading,
    error,
  } = useGetTasksQuery({
    projectId: Number(id),
    isArchived: isArchivedSelected,
    query: taskSearchQuery,
  });
  const [updateTaskStatus] = useUpdateTaskStatusMutation();

  const moveTask = (taskId: number, toStatus: string) => {
    updateTaskStatus({ taskId, status: toStatus });
  };

  // TODO: Create reusable component for this
  if (isLoading)
    return (
      <div>
        <CircularProgress sx={{ margin: "20px" }} />
      </div>
    );
  if (error) return <div>An error occurred while retrieving tasks</div>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-5 xl:px-6">
        <Header
          title="Board"
          rightAlignedComponent={
            <MoreInfo
              title={
                <div className="grid gap-2">
                  <div className="text-center">
                    <b>Board View Info:</b>
                  </div>
                  <div>
                    Board View supports drag-and-drop to arrange task status in
                    a project. Move items between the columns to change the
                    status. A new task can be created with a certain status when
                    clicking on the &quot;+&quot; dropdown item in the ellipsis menu on a status column.
                  </div>
                </div>
              }
            />
          }
          isSmallText
        />
      </div>
      <DndProvider backend={HTML5Backend}>
        <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
          {taskStatus.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={tasks || []}
              moveTask={moveTask}
              setIsModalNewTaskOpen={setIsModalNewTaskOpen}
              setNewTaskStatus={setNewTaskStatus}
            />
          ))}
        </div>
      </DndProvider>
    </div>
  );
};

// TODO: Type or Interface? for props
type TaskColumnProps = {
  status: string;
  tasks: TaskType[];
  moveTask: (taskId: number, toStatus: string) => void;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  setNewTaskStatus: (newtaskStatus: string) => void;
};

const TaskColumn = ({
  status,
  tasks,
  moveTask,
  setIsModalNewTaskOpen,
  setNewTaskStatus,
}: TaskColumnProps) => {
  // DragNDrop hook for dropzone
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "task",
    drop: (item: { id: number }) => moveTask(item.id, status),
    collect: (monitor: any) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  const tasksCount = tasks.filter((task) => task.status === status).length;
  // TODO: Maybe put these in the tailwind.config.ts or have these as default colors for template in db
  const statusColor: any = {
    ToDo: "#2f7eed",
    InProgress: "#0cb053",
    InReview: "#f0a80c",
    Completed: "#8f4ae8",
  };

  return (
    <div
      ref={(instance) => {
        drop(instance);
      }}
      className={`sl:py-4 rounded-lg py-2 xl:px-2 ${isOver ? "bg-blue-100 dark:bg-neutral-950" : ""}`}
    >
      {/* Column headings */}
      <div className="mb-3 flex w-full">
        {/* TODO: Needing to override colors here, see if there is a better approach; And avoid 'style' */}
        <div
          className={`w-2 !bg-[${statusColor[status]}] rounded-s-lg`}
          style={{ backgroundColor: statusColor[status] }}
        />
        <div className="flex w-full items-center justify-between rounded-e-lg bg-white px-5 py-4 dark:bg-dark-secondary">
          <h3 className="flex items-center text-lg font-semibold dark:text-white">
            {status} {/* TODO: Avoid 'style' */}
            <span
              className="ml-2 inline-block rounded-full bg-gray-200 p-1 text-center text-sm leading-none dark:bg-dark-tertiary"
              style={{ width: "1.5rem", height: "1.5rem" }}
            >
              {tasksCount}
            </span>
          </h3>
          <div className="flex items-center gap-1">
            <SubMenuDropdown
              icon={<IconDotsVertical size={26} />}
              direction={status === "Completed" ? "right" : "left"}
            >
              <SubMenuButton
                onClick={() => {
                  setIsModalNewTaskOpen(true);
                  setNewTaskStatus(status);
                }}
                icon={<IconPlus size={20} className="mr-2 h-5 w-5" />}
                label={`Add Task to column: '${status}'`}
                disabled={false}
              />
            </SubMenuDropdown>
          </div>
        </div>
      </div>
      {/* Ensure tasks are in the correct status column */}
      {tasks
        .filter((task) => task.status === status)
        .map((task) => (
          <Task key={task.id} task={task} />
        ))}
    </div>
  );
};

// TODO: Type or Interface? for props
type TaskProps = {
  task: TaskType;
};

const Task = ({ task }: TaskProps) => {
  // DragNDrop hook for draggable task
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "task",
    item: { id: task.id },
    collect: (monitor: any) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Clean up tags
  const taskTagsSplit = task.tags ? task.tags.split(",") : [];
  // Format date strings
  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  const formattedEndDate = task.endDate
    ? format(new Date(task.endDate), "P")
    : "";
  // Display number of comments
  const numberOfComments = (task.comments && task.comments.length) || 0;

  return (
    <div
      ref={(instance) => {
        drag(instance);
      }}
      className={`mb-4 rounded-md bg-white shadow dark:bg-dark-secondary ${
        isDragging ? "opacity-50" : "opacity-100"
      }`}
    >
      <div className="p-4 md:p-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            {task.priority && <PriorityTag priority={task.priority} />}
            <div className="flex gap-2">
              {taskTagsSplit.map((tag) => (
                <div
                  key={tag}
                  className="rounded-full bg-blue-100 px-2 py-1 text-xs"
                >
                  {tag}
                </div>
              ))}
            </div>
          </div>
          <button className="flex h-6 w-4 flex-shrink-0 items-center justify-center dark:text-neutral-500">
            <SubMenuDropdown icon={<IconDots size={18} />} direction="left">
              <Link href={`/tasks/${task.id}`}>
                <SubMenuButton
                  onClick={() => {}}
                  icon={<IconDoorEnter size={20} />}
                  label={"Open Task"}
                  disabled={false}
                />
              </Link>
            </SubMenuDropdown>
          </button>
        </div>
        <div className="my-3 flex justify-between">
          {/* Title */}
          <h4 className="text-md font-bold dark:text-white">{task.title}</h4>
        </div>
        {/* Dates */}
        <div className="text-xs text-gray-500 dark:text-neutral-500">
          {formattedStartDate && <span>{formattedStartDate} - </span>}
          {formattedEndDate && <span>{formattedEndDate}</span>}
        </div>
        <p>{typeof task.size === "string" && <p>Size: {task.size}</p>}</p>
        <p className="text-sm text-gray-600 dark:text-neutral-500">
          {task.description}
        </p>
        {/* horizontal rule */}
        <div className="mt-4 border-t border-gray-200 dark:border-stroke-dark" />
        <div className="mt-3 flex items-center justify-between">
          {/* Users */}
          {/* TODO: Negative space value here? (-space-x-[6px]) */}
          <div className="flex -space-x-[6px] overflow-hidden">
            {/* Assignee */}
            {task.assignee && (
              <Image
                key={task.assignee.userId}
                // Ensure profile picture exists
                // TODO: Maybe have some extra validation here and have placeholder image
                src={`/${task.assignee.profilePictureUrl!}`}
                alt={task.assignee.username}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
              />
            )}
            {/* Author */}
            {task.author && (
              <Image
                key={task.author.userId}
                // Ensure profile picture exists
                // TODO: Maybe have some extra validation here and have placeholder image
                src={`/${task.author.profilePictureUrl!}`}
                alt={task.author.username}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
              />
            )}
          </div>
          {/* Comments */}
          <div className="flex items-center text-gray-500 dark:text-neutral-500">
            <IconMessage size={20} />
            <span className="ml-1 text-sm dark:text-neutral-400">
              {numberOfComments}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardView;
