"use client";

import Header from "@/components/Header";
import { Priority, Task, useGetTasksByUserQuery } from "@/state/api";
import { useAppSelector } from "@/app/redux";
import React, { useState } from "react";
import ModalNewTask from "@/components/modal/ModalNewTask";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles, formSelectStyles } from "@/lib/utils";
import TaskCard from "@/components/card/TaskCard";
import { IconFilter, IconTable, IconLayoutGrid } from "@tabler/icons-react";
import DropdownSearchButton from "@/components/dropdown/DropdownSearchButton";
import { PriorityTag } from "../projects/BoardView";
import Link from "next/link";
import { CircularProgress } from "@mui/material";

type PrioritySelectionProps = {
  priority?: Priority;
  setPriority: (priority?: Priority) => void;
};

// TODO: Reuse between edit task and this as well as use enums better
const PrioritySelection = ({
  priority,
  setPriority,
}: PrioritySelectionProps) => {
  return (
    <select
      className={formSelectStyles}
      value={priority}
      onChange={(e) =>
        setPriority(Priority[e.target.value as keyof typeof Priority])
      }
    >
      <option value={undefined}>~ No status selected ~</option>
      <option value={Priority.Lowest}>Lowest</option>
      <option value={Priority.Low}>Low</option>
      <option value={Priority.Medium}>Medium</option>
      <option value={Priority.High}>High</option>
      <option value={Priority.Critical}>Critical</option>
    </select>
  );
};

// TODO: Utils - maybe reused?
const userRoles = [
  {
    id: "author",
    name: "Author",
  },
  {
    id: "created-by",
    name: "Created By",
  },
  {
    id: "assignee",
    name: "Assignee",
  },
];

// TODO: Make reusable in utils file
const columns: GridColDef[] = [
  {
    field: "title",
    headerName: "Title",
    width: 200,
    renderCell: (params) => (
      <Link
        href={`/tasks/${params.row.id}`}
        className="cursor-pointer text-blue-primary"
      >
        {params.row.title}
      </Link>
    ),
  },
  {
    field: "description",
    headerName: "Description",
    width: 200,
  },
  {
    field: "status",
    headerName: "Status",
    width: 130,
    renderCell: (params) => (
      <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
        {params.value}
      </span>
    ),
  },
  {
    field: "priority",
    headerName: "Priority",
    width: 75,
  },
  {
    field: "tags",
    headerName: "tags",
    width: 130,
  },
  {
    field: "startDate",
    headerName: "Start Date",
    width: 130,
  },
  {
    field: "endDate",
    headerName: "Due Date",
    width: 130,
  },
  {
    field: "author",
    headerName: "Author",
    width: 150,
    renderCell: (params) => params.value?.author || "~ Author not provided ~",
  },
  {
    field: "assignee",
    headerName: "Assignee",
    width: 150,
    renderCell: (params) => params.value?.assignee || "~ Unassigned ~",
  },
];

const TaskDashboard = () => {
  const [activeTab, setActiveTab] = useState("Table");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);
  const [priority, setPriority] = useState<Priority | undefined>(undefined);
  const [taskSearchQuery, setTaskSearchQuery] = useState("");

  const [isShowingSearchDropdown, setIsShowingSearchDropdown] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([
    "author",
    "created-by",
    "assignee",
  ]);

  // TODO: AUTHENTIFICATION - Replace with actual user when authentification is finished
  const userId = 1;
  const {
    data: tasks,
    isLoading,
    isError,
  } = useGetTasksByUserQuery(
    {
      userId: userId || 0,
    },
    // 'skip' param used when userId is not caught soon enough during authentification process
    {
      skip: userId === null,
    },
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const filteredTasks = tasks?.filter(
    (task: Task) =>
      // TODO: Without there being a ton of items being grabbed from the server,
      // querying and filtering should be good to do on client side
      (task.title.toLowerCase()?.includes(taskSearchQuery.toLowerCase()) ||
        task.description
          ?.toLowerCase()
          ?.includes(taskSearchQuery.toLowerCase())) &&
      ((selectedRoles.includes("author") && task.authorUserId) ||
        (selectedRoles.includes("created-by") && task.createdByUserId) ||
        (selectedRoles.includes("assignee") && task.assignedUserId)) &&
      (task.priority === priority || priority === undefined),
  );

  // TODO: Create reusable component for this
  if (isLoading) return <div><CircularProgress sx={{ margin: "20px" }} /></div>;
  if (isError || !tasks)
    return <div>An error occured when retrieving tasks</div>;

  return (
    <div className="m-5 p-4">
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        newTaskStatus={""}
      />
      <Header title={"My Tasks"} />
      {/* Tabs section */}
      <div className="flex flex-wrap-reverse gap-2 border-y border-gray-200 pb-[8px] pt-2 dark:border-stroke-dark md:items-center">
        <div className="flex flex-1 items-center gap-2 md:gap-4">
          <TabButton
            name="Table"
            icon={<IconTable className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
          <TabButton
            name="Tile"
            icon={<IconLayoutGrid className="h-5 w-5" />}
            setActiveTab={setActiveTab}
            activeTab={activeTab}
          />
        </div>
      </div>
      <div className="flex gap-5 pt-5">
        <div>
          <DropdownSearchButton
            isShowingSearchDropdown={isShowingSearchDropdown}
            setIsShowingSearchDropdown={setIsShowingSearchDropdown}
            selectedItems={selectedRoles}
            setSelectedItems={setSelectedRoles}
            items={userRoles}
            buttonLabel={"Filter User Roles"}
            itemType={"User Roles"}
          />
        </div>
        <div className="w-100">
          <PrioritySelection priority={priority} setPriority={setPriority} />
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search My Tasks"
            className="rounded-md border py-1 pl-10 pr-4 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white"
            onChange={(event) => setTaskSearchQuery(event.target.value)}
          />
          <IconFilter className="absolute left-3 top-2 h-4 w-4 text-gray-400 dark:text-neutral-500" />
        </div>
      </div>
      {/* TODO: Potentially call priority tag something different to fit this case? */}
      <div className="flex gap-2 py-2 dark:text-white">
        {(selectedRoles.includes("author") ||
          selectedRoles.includes("assignee") ||
          selectedRoles.includes("created-by")) &&
          "Roles: "}
        {selectedRoles.includes("author") && (
          <PriorityTag priority="Author Selected" />
        )}
        {selectedRoles.includes("assignee") && (
          <PriorityTag priority="Assignee Selected" />
        )}
        {selectedRoles.includes("created-by") && (
          <PriorityTag priority="Created By Selected" />
        )}
        {priority !== undefined && (
          <>
            Status: <PriorityTag priority={priority} />
          </>
        )}
      </div>
      {/* Display in tile or table view */}
      {isLoading ? (
        <div className="dark:text-white">Loading tasks . . .</div>
      ) : filteredTasks && filteredTasks.length < 1 ? (
        <div className="dark:text-white">No tasks to display with the above filters</div>
      ) : activeTab === "Tile" ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredTasks?.map((task: Task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        activeTab === "Table" &&
        filteredTasks && (
          <div className="w-full">
            <DataGrid
              disableRowSelectionOnClick
              rows={filteredTasks}
              columns={columns}
              // TODO: Probably don't need this
              getRowId={(row) => row.id}
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
            />
          </div>
        )
      )}
    </div>
  );
};

// TODO: Reuse with ProjectHeader
type TabButtonProps = {
  name: string;
  icon: React.ReactNode;
  setActiveTab: (tabName: string) => void;
  activeTab: string;
};

// TODO: Reuse with ProjectHeader
const TabButton = ({ name, icon, setActiveTab, activeTab }: TabButtonProps) => {
  const isActive = activeTab === name;

  return (
    <button
      className={`relative flex items-center gap-2 px-1 py-2 text-gray-500 after:absolute after:-bottom-[9px] after:left-0 after:h-[1px] after:w-full hover:text-blue-600 dark:text-neutral-500 dark:hover:text-white sm:px-2 lg:px-4 ${
        isActive ? "text-blue-600 after:bg-blue-600 dark:text-white" : ""
      }`}
      onClick={() => setActiveTab(name)}
    >
      {icon}
      {name}
    </button>
  );
};

export default TaskDashboard;
