import { PriorityTag } from "@/app/projects/BoardView";
import { Task } from "@/state/api";
import { format } from "date-fns";
import { IconDoor, IconDotsVertical } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { SubMenuButton, SubMenuDropdown } from "../dropdown/SubMenuDropdown";

type TaskCardProps = {
  task: Task;
};

// TODO: Some of BoardView and TaskCard could share similar components
const TaskCard = ({ task }: TaskCardProps) => {
  // Clean up tags
  const taskTagsSplit = task.tags ? task.tags.split(",") : [];
  // Format date strings
  const formattedStartDate = task.startDate
    ? format(new Date(task.startDate), "P")
    : "";
  const formattedEndDate = task.endDate
    ? format(new Date(task.endDate), "P")
    : "";

  return (
    // TODO: Make common styling Card component
    <div className="mb-3 rounded bg-white p-4 shadow dark:bg-dark-secondary dark:text-white">
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
        <button className="dark:text-neutral-500 flex h-6 w-4 flex-shrink-0 items-center justify-center">
          <SubMenuDropdown
            icon={<IconDotsVertical size={18} />}
            direction="left"
          >
            <Link href={`/tasks/${task.id}`}>
              <SubMenuButton
                onClick={() => {}}
                icon={<IconDoor size={20} />}
                label={"Open Task"}
                disabled={false}
              />
            </Link>
          </SubMenuDropdown>
        </button>
      </div>
      <div className="my-3 flex justify-between">
        {/* Title */}
        <h4 className="text-md font-bold dark:text-white">
          {task.title} (ID: {task.id})
        </h4>
      </div>
      {/* Dates */}
      <div className="text-xs text-gray-500 dark:text-neutral-500">
        {formattedStartDate && <span>{formattedStartDate} - </span>}
        {formattedEndDate && <span>{formattedEndDate}</span>}
      </div>
      <div className="text-sm text-gray-600 dark:text-neutral-500 pt-3">
        {typeof task.size === "string" && <p>Size: {task.size}</p>}
        <p>
          <strong>Description:</strong> {task.description}
        </p>
        <p>
          <strong>Status:</strong> {task.status}
        </p>
        <p>
          <strong>Priority:</strong> {task.priority}
        </p>
      </div>
      {/* horizontal rule */}
      <div className="mt-4 border-t border-gray-200 dark:border-stroke-dark" />
      <div className="mt-3 grid items-center justify-between">
        {/* Users */}
        {/* TODO: Negative space value here? (-space-x-[6px]) */}
        <div className="flex gap-2 items-center">
          {/* Assignee */}
          Assignee:{" "}
          {task.assignee && (
            <Image
              key={task.assignee.userId}
              // Ensure profile picture exists
              // TODO: Maybe have some extra validation here and have placeholder image
              src={`/${task.assignee.profilePictureUrl!}`}
              alt={task.assignee.username}
              width={30}
              height={30}
              className="h-8 w-8 rounded-full border-2 border-white dark:border-dark-secondary"
            />
          )}{" "}
          {task?.assignee?.username || "~ No assignee provided ~"}
          {/* Author */}
        </div>
        <div className="flex gap-2 items-center">
          Author:{" "}
          {task.author && (
            <Image
              key={task.author.userId}
              // Ensure profile picture exists
              // TODO: Maybe have some extra validation here and have placeholder image
              src={`/${task.author.profilePictureUrl!}`}
              alt={task.author.username}
              width={30}
              height={30}
              className="h-8 w-8 rounded-full border-2 border-white dark:border-dark-secondary"
            />
          )}{" "}
          {task?.author?.username || "~ No author provided ~"}{" "}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
