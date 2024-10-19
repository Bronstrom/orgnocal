"use client";

import { Priority, Status, Task, useGetTasksQuery } from "@/state/api";
import { useAppSelector } from "@/app/redux";
import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import {
  barChartColorsDark,
  barChartColorsLight,
  dataGridClassNames,
  dataGridSxStyles,
  pieChartColors,
} from "@/lib/utils";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Link from "next/link";
import { IconAlarm, IconChartBar, IconChartPie } from "@tabler/icons-react";
import { formatISO } from "date-fns";
import { CircularProgress } from "@mui/material";
import Header from "@/components/Header";
import MoreInfo from "@/components/MoreInfo";

// These consts won't be rerended
const taskColumns: GridColDef[] = [
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
  { field: "endDate", headerName: "Due Date", width: 150 },
  { field: "status", headerName: "Status", width: 150 },
  { field: "priority", headerName: "Priority", width: 150 },
];

type DashboardViewProps = {
  id: string;
};

// TODO: This view can be refactored a bit with the top user dashboard
const DashboardView = ({ id }: DashboardViewProps) => {
  const {
    data: tasks,
    isLoading: isTasksLoading,
    isError: isTasksError,
  } = useGetTasksQuery({
    // TODO: Maybe have user choose this or this be the last project they contributed to
    projectId: Number(id),
    query: "",
  });
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // TODO: Create reusable component for this
  if (isTasksLoading)
    return (
      <div>
        <CircularProgress sx={{ margin: "20px" }} />
      </div>
    );
  if (isTasksError || !tasks)
    return <div>An error occurred while retrieving task dashboard data</div>;

  const activeTasks = tasks.filter((task) => task.status !== Status.Completed);
  // Give number of priorities per type with accumulator object
  // TODO: Consider just using for loop?
  const taskPriorityCount = activeTasks.reduce(
    (acc: Record<string, number>, task: Task) => {
      const { priority } = task;
      acc[priority as Priority] = (acc[priority as Priority] || 0) + 1;
      return acc;
    },
    {},
  );
  const taskPriorityDistribution = Object.keys(taskPriorityCount).map(
    (key) => ({
      name: key,
      count: taskPriorityCount[key],
    }),
  );

  const currentDate = formatISO(new Date(), {
    representation: "complete",
  });
  const taskStatusCount = tasks.reduce(
    (acc: Record<string, number>, task: Task) => {
      const status =
        task.status === Status.Completed
          ? "Completed"
          : task?.endDate &&
              task.endDate <
                currentDate /* TODO: Ensure this isn't needed: && task.status !== Status.Completed */
            ? "Overdue"
            : "Active";
      acc[status as Status] = (acc[status as Status] || 0) + 1;
      return acc;
    },
    {},
  );
  const taskStatusDistribution = Object.keys(taskStatusCount).map((key) => ({
    name: key,
    count: taskStatusCount[key],
  }));

  return (
    <div className="flex w-full flex-col p-6">
      <Header
        title="Dashboard"
        rightAlignedComponent={
          <MoreInfo
            title={
              <div className="grid gap-2">
                <div className="text-center">
                  <b>Dashboard View Info:</b>
                </div>
                <div>
                  Dashboard View displays a variety of metrics and data about
                  the project.
                </div>
                <div>
                  <b>Current Tasks:</b> This pane shares info on what tasks are
                  currently not completed, including active and overdue tasks.
                </div>
                <div>
                  <b>Task Status Distribution:</b> This pane displays a pie
                  chart of general statuses of task items, including active,
                  overdue, and completed tasks.
                </div>
                <div>
                  <b>Task Priority Distribution:</b> This pane displays a bar
                  chart chart of the priorities of active and overdue task
                  items.
                </div>
              </div>
            }
          />
        }
        isSmallText
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary md:col-span-2 lg:col-span-1">
          <div className="flex dark:text-white">
            <IconAlarm />
            <h3 className="mb-4 pl-2 text-lg font-semibold">
              Current Tasks (Active & Overdue)
            </h3>
          </div>
          <div style={{ height: 300, width: "100%" }}>
            <DataGrid
              disableRowSelectionOnClick
              rows={activeTasks}
              columns={taskColumns}
              loading={isTasksLoading}
              getRowClassName={() => "data-grid-row"}
              getCellClassName={() => "data-grid-cell"}
              className={dataGridClassNames}
              sx={dataGridSxStyles(isDarkMode)}
            />
          </div>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary">
          <div className="flex dark:text-white">
            <IconChartPie />
            <h3 className="mb-4 pl-2 text-lg font-semibold">
              Task Status Distribution
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                dataKey="count"
                data={taskStatusDistribution}
                fill="82ca9d"
                label
              >
                {taskStatusDistribution.map((_entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={pieChartColors[index % pieChartColors.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
              <Bar
                dataKey="count"
                fill={
                  isDarkMode ? barChartColorsDark.bar : barChartColorsLight.bar
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary">
          <div className="flex dark:text-white">
            <IconChartBar />
            <h3 className="mb-4 pl-2 text-lg font-semibold">
              Task Priority Distribution (Active & Overdue)
            </h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskPriorityDistribution}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={
                  isDarkMode
                    ? barChartColorsDark.barGrid
                    : barChartColorsLight.barGrid
                }
              />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  width: "min-content",
                  height: "min-content",
                }}
              />
              <Legend />
              <Bar
                dataKey="count"
                fill={
                  isDarkMode ? barChartColorsDark.bar : barChartColorsLight.bar
                }
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
