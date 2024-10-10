"use client";

import Header from "@/components/Header";
import {
  Priority,
  Project,
  Status,
  Task,
  useGetProjectsQuery,
  useGetTasksByUserQuery,
  useGetUserQuery,
} from "@/state/api";
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
import { CircularProgress } from "@mui/material";

// These consts won't be rerended
const taskColumns: GridColDef[] = [
  {
    field: "title",
    headerName: "Title",
    width: 450,
    renderCell: (params) => (
      <Link
        href={`/tasks/${params.row.id}`}
        className="cursor-pointer text-blue-primary"
      >
        {params.row.title}
      </Link>
    ),
  },
  { field: "endDate", headerName: "Due Date", width: 350 },
  { field: "status", headerName: "Status", width: 250 },
  { field: "priority", headerName: "Priority", width: 250 },
];

const UserDashboard = () => {
  // TODO: AUTHENTICATE - get user details and replace userId
  const userId = 1;
  const {
    data: user,
    isLoading,
    isError,
  } = useGetUserQuery(
    {
      userId: userId || 0,
    },
    // 'skip' param used when userId is not caught soon enough during authentification process
    {
      skip: userId === null,
    },
  );
  const {
    data: projects,
    isLoading: isProjectsLoading,
    isError: isProjectsError,
  } = useGetProjectsQuery();
  const {
    data: tasks,
    isLoading: isTasksLoading,
    isError: isTasksError,
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

  // TODO: Create reusable component for this
  if (isProjectsLoading || isTasksLoading)
    return (
      <div>
        <CircularProgress sx={{ margin: "20px" }} />
      </div>
    );
  if (isProjectsError || isTasksError || !projects || !tasks)
    return (
      <div>An error occurred while retrieving user dashboard page data</div>
    );

  // Give number of priorities per type with accumulator object
  // TODO: Consider just using for loop?
  const taskPriorityCount = tasks.reduce(
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

  const projectStatusCount = projects.reduce(
    (acc: Record<string, number>, project: Project) => {
      const status = project.endDate ? "Completed" : "Active";
      acc[status as Status] = (acc[status as Status] || 0) + 1;
      return acc;
    },
    {},
  );
  const projectStatusDistribution = Object.keys(projectStatusCount).map(
    (key) => ({
      name: key,
      count: projectStatusCount[key],
    }),
  );

  return (
    <div className="flex w-full flex-col p-8">
      <Header title={`Welcome${!user ? "" : ", " + user.username}!`} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary md:col-span-2">
          <div className="flex dark:text-white">
            <IconAlarm />
            <h3 className="mb-4 pl-2 text-lg font-semibold">
              Jump Back in to Your Tasks
            </h3>
          </div>
          <div style={{ height: 300, width: "100%" }}>
            <DataGrid
              disableRowSelectionOnClick
              rows={tasks}
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
              Project Completion
            </h3>
          </div>
          {projectStatusDistribution.length < 1 ? (
            <div className="grid w-full p-20 text-gray-400">
              <div className="flex items-center justify-center">
                <IconChartPie size={100} />
              </div>
              <div className="inline-block justify-center text-center">
                <p>No project data to display.</p>
                <p>Add some projects to view Project Completion.</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  dataKey="count"
                  data={projectStatusDistribution}
                  fill="82ca9d"
                  label
                >
                  {projectStatusDistribution.map((_entry, index) => (
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
                    isDarkMode
                      ? barChartColorsDark.bar
                      : barChartColorsLight.bar
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="rounded-lg bg-white p-4 shadow dark:bg-dark-secondary">
          <div className="flex dark:text-white">
            <IconChartBar className="rotate-90" />
            <h3 className="mb-4 pl-2 text-lg font-semibold">
              My Task Priority Distribution
            </h3>
          </div>
          {taskPriorityDistribution.length < 1 ? (
            <div className="grid w-full p-20 text-gray-400">
              <div className="flex items-center justify-center">
                <IconChartBar size={100} />
              </div>
              <div className="inline-block justify-center text-center">
                <p>No project data to display.</p>
                <p>Add some projects to view My Task Priority Distribution.</p>
              </div>
            </div>
          ) : (<ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskPriorityDistribution} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={
                  isDarkMode
                    ? barChartColorsDark.barGrid
                    : barChartColorsLight.barGrid
                }
              />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" />
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
          </ResponsiveContainer>)}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
