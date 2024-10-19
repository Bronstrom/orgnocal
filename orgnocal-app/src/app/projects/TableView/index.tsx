import Header from "@/components/Header";
import { useGetTasksQuery } from "@/state/api";
import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { useAppSelector } from "@/app/redux";
import { CircularProgress } from "@mui/material";
import MoreInfo from "@/components/MoreInfo";

// TODO: Props can be reused from the different views
type TableViewProps = {
  id: string;
  isArchivedSelected: boolean;
  taskSearchQuery: string;
};

// TODO: Make reusable in utils file
const columns: GridColDef[] = [
  {
    field: "title",
    headerName: "Title",
    width: 100,
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

const TableView = ({
  id,
  isArchivedSelected,
  taskSearchQuery,
}: TableViewProps) => {
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
  // TODO: Create reusable component for this
  if (isLoading)
    return (
      <div>
        <CircularProgress sx={{ margin: "20px" }} />
      </div>
    );
  if (error) return <div>An error occurred while retrieving tasks</div>;

  return (
    <div className="h-[34rem]w-full px-4 pb-8 xl:px-6">
      <div className="pt-5">
        <Header
          title="Table"
          rightAlignedComponent={
            <MoreInfo
              title={
                <div className="grid gap-2">
                  <div className="text-center">
                    <b>Table View Info:</b>
                  </div>
                  <div>
                    Table View displays tasks in a list structure. Each table
                    item task displays title, date, status, user infomation, and
                    other details. Columns can be ordered and filtered by
                    selecting the ellipsis icon on the column.
                  </div>
                </div>
              }
            />
          }
          isSmallText
        />
      </div>
      <DataGrid
        disableRowSelectionOnClick
        rows={tasks || []}
        columns={columns}
        className={dataGridClassNames}
        sx={dataGridSxStyles(isDarkMode)}
      />
    </div>
  );
};

export default TableView;
