"use client";

import Header from "@/components/Header";
import { useGetUsersQuery } from "@/state/api";
import { useAppSelector } from "@/app/redux";
import React from "react";
import Image from "next/image";
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
  { field: "userId", headerName: "ID", width: 100 },
  { field: "username", headerName: "Username", width: 150 },
  {
    field: "profilePictureUrl",
    headerName: "Profile Picture",
    width: 100,
    renderCell: (params) => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-9 w-9">
          <Image
            src={`/${params.value}`}
            alt={params.row.username}
            width={100}
            height={50}
            className="h-full rounded-full object-cover"
          />
        </div>
      </div>
    ),
  },
];

const Users = () => {
  const { data: users, isLoading, isError } = useGetUsersQuery();

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // TODO: Create reusable component for this
  if (isLoading)
    return (
      <div>
        <CircularProgress sx={{ margin: "20px" }} />
      </div>
    );
  if (isError || !users)
    return <div>An error occurred while retrieving users</div>;

  return (
    <div className="flex w-full flex-col p-8">
      <Header title="Users" />
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          checkboxSelection
          // user.id is not used for identification rather user.userId, instead map row id to userId
          getRowId={(row) => row.userId}
          rows={users || []}
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

export default Users;
