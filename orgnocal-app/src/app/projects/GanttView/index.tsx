import React, { useMemo, useState } from "react";
import { Status, useGetTasksQuery } from "@/state/api";
import { useAppSelector } from "@/app/redux";
import { DisplayOption, Gantt, ViewMode } from "gantt-task-react";
// Fix gantt alignment issue
import "gantt-task-react/dist/index.css";
import Header from "@/components/Header";
import { IconSquarePlus } from "@tabler/icons-react";
import { CircularProgress } from "@mui/material";
import MoreInfo from "@/components/MoreInfo";

// TODO: Props can be reused from the different views
type GanttViewProps = {
  id: string;
  isArchivedSelected: boolean;
  taskSearchQuery: string;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
};

// TODO: Put in utils file for reuse
type TaskTypeDivisions = "task" | "milestone" | "project";

const GanttView = ({
  id,
  isArchivedSelected,
  taskSearchQuery,
  setIsModalNewTaskOpen,
}: GanttViewProps) => {
  const {
    data: tasks,
    isLoading,
    error,
  } = useGetTasksQuery({
    projectId: Number(id),
    isArchived: isArchivedSelected,
    query: taskSearchQuery,
  });

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);
  const [displayOptions, setDisplayoptions] = useState<DisplayOption>({
    viewMode: ViewMode.Month,
    locale: "en-US",
  });

  // Format tasks for gantt tasks and update only when necessary
  const ganttTasks = useMemo(() => {
    return (
      tasks?.map((task) => ({
        id: `Task-${task.id}`,
        type: "task" as TaskTypeDivisions,
        name: task.title,
        start: new Date(task?.startDate as string) || new Date(),
        end: new Date(task?.endDate as string) || new Date(),
        isDisabled: false,
        // TODO: Determine if better way to determine status
        progress: task.status === Status.Completed ? 100 : 0,
      })) || []
    );
  }, [tasks]);

  // Event handler that changes based on month, day, or week
  const handleViewModeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setDisplayoptions((prev) => ({
      ...prev,
      viewMode: event.target.value as ViewMode,
    }));
  };

  // TODO: Create reusable component for this
  if (isLoading)
    return (
      <div>
        <CircularProgress sx={{ margin: "20px" }} />
      </div>
    );
  if (error) return <div>An error occurred while retrieving tasks</div>;

  // TODO: A lot of this is reused between /timeline and GanttView - consider making reusable component
  return (
    <div className="mb-10 px-4 xl:px-6">
      <div className="flex flex-wrap items-center justify-between gap-2 py-5">
        <Header
          title="Gantt"
          rightAlignedComponent={
            <div className="flex flex-wrap items-center gap-5">
              <MoreInfo
                title={
                  <div className="grid gap-2">
                    <div className="text-center">
                      <b>Gantt View Info:</b>
                    </div>
                    <div>
                      Gantt View displays tasks in a list according to
                      their start and end dates. Use the timeframe dropdown to
                      select from: "Day", "Week", "Month", and "Year" to see how
                      tasks lineup for different time periods.
                    </div>
                  </div>
                }
              />
              <div className="relative inline-block w-64">
                <select
                  className="focus:shadow-outline block w-full appearance-none rounded border border-gray-400 bg-white px-4 py-2 pr-8 leading-tight shadow hover:border-gray-500 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary dark:text-white"
                  value={displayOptions.viewMode}
                  onChange={handleViewModeChange}
                >
                  <option value={ViewMode.Day}>Day</option>
                  <option value={ViewMode.Week}>Week</option>
                  <option value={ViewMode.Month}>Month</option>
                  <option value={ViewMode.Year}>Year</option>
                </select>
              </div>
            </div>
          }
          isSmallText
        />
      </div>
      {/* TODO: Remove extra space here */}
      <div className="overflow-hidden rounded-md bg-white shadow dark:bg-dark-secondary dark:text-white">
        <div className="gantt">
          {ganttTasks.length < 1 ? (
            "No Tasks to display"
          ) : (
            <Gantt
              tasks={ganttTasks}
              {...displayOptions}
              columnWidth={
                displayOptions.viewMode === ViewMode.Month || ViewMode.Year
                  ? 150
                  : 100
              }
              listCellWidth="6rem"
              // TODO: Place in tailwind.config.ts?
              // TODO: gray-900 and gray-200
              barBackgroundColor={isDarkMode ? "#111011" : "#bcb9bb"}
              // TODO: dark-bg and gray-300
              barBackgroundSelectedColor={isDarkMode ? "#0e0e0e" : "#9b9698"}
            />
          )}
        </div>
        {/* TODO: Make common component for this & have Priority be initial dropdown status for priority? */}
        <div className="px-4 pb-5 pt-1">
          <button
            className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
            onClick={() => setIsModalNewTaskOpen(true)}
          >
            <IconSquarePlus className="mr-2 h-5 w-5" />
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default GanttView;
