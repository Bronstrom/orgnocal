"use client";

import Header from "@/components/Header";
import { Project, useGetOrgQuery } from "@/state/api";
import { useAppSelector } from "@/app/redux";
import React, { useState } from "react";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import Image from "next/image";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";
import { format } from "date-fns";
import Link from "next/link";
import ModalEditOrg from "@/components/modal/ModalEditOrg";
import { CircularProgress } from "@mui/material";

// TODO: Reused between orgs and users
const CustomToolbar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

type OrgProps = {
  params: { id: string };
};

const Org = ({ params }: OrgProps) => {
  const {
    data: org,
    isLoading,
    isError,
  } = useGetOrgQuery({ orgId: Number(params.id) });

  const [isModalEditOrgOpen, setIsModalEditOrgOpen] = useState(false);

  const columns: GridColDef[] = [
    {
      field: "profilePictureUrl",
      headerName: "Profile Picture",
      width: 100,
      renderCell: (params) => (
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-9 w-9">
            <Image
              src={`/${params.row.profilePictureUrl}`}
              alt={params.row.username}
              width={100}
              height={100}
              className="h-full rounded-full object-cover"
            />
          </div>
        </div>
      ),
    },
    { field: "username", headerName: "Name", width: 100 },
    { field: "roles", headerName: "Role(s)", width: 200 },
    { field: "email", headerName: "Contact Email", width: 200 },
    {
      field: "management",
      headerName: "Management",
      width: 200,
      renderCell: (params) => (
        <div>
          {params.id === params.row.productOwnerUserId && "Project Owner (PO)"}
          {params.id === params.row.productOwnerUserId &&
            params.id === params.row.projectManagerUserId &&
            ", "}
          {params.id === params.row.projectManagerUserId &&
            "Project Manager (PM)"}
        </div>
      ),
    },
  ];

  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  // TODO: Create reusable component for this
  if (isLoading)
    return (
      <div>
        <CircularProgress sx={{ margin: "20px" }} />
      </div>
    );
  if (isError || !org)
    return <div>An error occurred while retrieving orgs</div>;

  // TODO: This could be in utils and remove any types
  function selectObjectListProps(...props: any) {
    return function (object: any) {
      const condensedObject: any = {};
      props.forEach((name: any) => {
        condensedObject[name] = object[name];
      });

      return condensedObject;
    };
  }

  const condensedUsersList = org.users.map(
    selectObjectListProps("userId", "username", "roles", "email"),
  );
  const unSortedProjects = [...org.projects];

  return (
    <div className="flex w-full flex-col p-8">
      <ModalEditOrg
        org={org}
        isOpen={isModalEditOrgOpen}
        onClose={() => setIsModalEditOrgOpen(false)}
      />
      <Header
        title={org.orgName}
        subtitle={org.description}
        rightAlignedComponent={
          <button
            className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
            onClick={() => {
              setIsModalEditOrgOpen(true);
            }}
          >
            Edit Org
          </button>
        }
      />
      {/* TODO: Common H3 Header that can be reused*/}
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        Projects
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {unSortedProjects.length < 1
          ? "No projects under this Org"
          : unSortedProjects
              .sort((projectA, projectB) =>
                projectA.endDate &&
                projectB.endDate &&
                projectA.endDate > projectB.endDate
                  ? 1
                  : -1,
              )
              .map((project, index) => (
                <ProjectOrgCard key={project.id} project={project} index={index} />
              ))}
      </div>
      {/* TODO: Common H3 Header that can be reused*/}
      <h3 className="mb-2 mt-4 font-semibold text-gray-900 dark:text-white">
        Users
      </h3>
      <div style={{ height: 650, width: "100%" }}>
        <DataGrid
          checkboxSelection
          getRowId={(row) => row.userId}
          rows={condensedUsersList || []}
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

type ProjectOrgCardProps = {
  project: Project;
  index: number;
};

const ProjectOrgCard = ({ project, index }: ProjectOrgCardProps) => {
  return (
    // TODO: Alternate coloring of these items
    <Link href={`/projects/${project.id}`}>
      <div
        className={`relative mb-3 h-full rounded-lg bg-white bg-gradient-to-tr shadow-2xl ${index % 3 === 0 ? "from-blue-primary to-turquoise-tertiary" : index % 3 === 1 ? "from-red-300 to-yellow-300" : "from-purple-300 to-purple-200"} overflow-hidden p-4 shadow dark:bg-dark-secondary dark:text-white`}
      >
         {/* TODO: Replace image */}
        <Image
          className="absolute inset-0 h-full w-full object-cover mix-blend-overlay"
          src="/profile2.jpg"
          alt="Profile"
        />
        {/* TODO: Create reusable component for these */}
        <p>
          <strong>{project.name}</strong>
        </p>
        <p>
          <strong>Description:</strong>{" "}
          {project.description || "~ No description provided ~"}
        </p>
        <p>
          <strong>Start Date:</strong>{" "}
          {project.startDate
            ? format(new Date(project.startDate), "P")
            : "~ Date not set ~"}
        </p>
        <p>
          <strong>Due Date:</strong>{" "}
          {project.endDate
            ? format(new Date(project.endDate), "P")
            : "~ Date not set ~"}
        </p>
      </div>
    </Link>
  );
};
export default Org;
