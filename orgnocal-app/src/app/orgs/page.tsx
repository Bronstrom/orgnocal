"use client";

import Header from "@/components/Header";
import { useGetOrgsQuery } from "@/state/api";
import { useAppSelector } from "@/app/redux";
import React from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { CircularProgress } from "@mui/material";

// TODO: Reused between orgs and users
const CustomToolbar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const columns: GridColDef[] = [
  { field: "id", headerName: "Org ID", width: 100 },
  { field: "orgName", headerName: "Org Name", width: 200 },
  {
    field: "productOwnerUsername",
    headerName: "Product Owner (PO)",
    width: 200,
  },
  {
    field: "projectManagerUsername",
    headerName: "Project Manager (PM)",
    width: 200,
  },
];

const Orgs = () => {
  const { data: orgs, isLoading, isError } = useGetOrgsQuery();

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // TODO: Create reusable component for this
  if (isLoading)
    return (
      <div>
        <CircularProgress sx={{ margin: "20px" }} />
      </div>
    );
  if (isError || !orgs)
    return <div>An error occurred while retrieving orgs</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header title="Orgs" />
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          checkboxSelection
          rows={orgs || []}
          columns={columns}
          slots={{ toolbar: CustomToolbar }}
          pagination
          className={dataGridClassNames}
          sx={dataGridSxStyles(isDarkMode)}
        />
      </div>
    </div>
  );
};

export default Orgs;
