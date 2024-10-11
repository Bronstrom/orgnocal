import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import {
  IconArchive,
  IconCalendarMonth,
  IconClock,
  IconDotsVertical,
  IconFilter,
  IconColumns3,
  IconSitemap,
  IconFilePencil,
  IconSquarePlus,
  IconTable,
  IconUserCog,
  IconLayoutGrid,
  IconGauge,
} from "@tabler/icons-react";
import ModalEditProject from "@/components/modal/ModalEditProject";
import ModalAddRemoveUsers from "@/components/modal/ModalAddRemoveUsers";
import ModalEditViews from "@/components/modal/ModalEditViews";
import { ProjectView, useGetProjectQuery } from "@/state/api";
import { format } from "date-fns";
import {
  SubMenuButton,
  SubMenuDropdown,
} from "@/components/dropdown/SubMenuDropdown";
import { CircularProgress, Tooltip } from "@mui/material";

type ProjectHeaderProps = {
  projectId: string;
  activeTab: string;
  setActiveTab: (tabName: string) => void;
  isArchivedSelected: boolean;
  setIsArchivedSelected: (isArchivedSelected: boolean) => void;
  setIsModalNewTaskOpen: (isOpen: boolean) => void;
  taskSearchQuery: string;
  setTaskSearchQuery: (taskSearchQuery: string) => void;
};

const ProjectHeader = ({
  projectId,
  activeTab,
  setActiveTab,
  isArchivedSelected,
  setIsArchivedSelected,
  setIsModalNewTaskOpen,
  taskSearchQuery,
  setTaskSearchQuery,
}: ProjectHeaderProps) => {
  // TODO: Get specific project by new "project" endpoing
  const {
    data: project,
    isLoading,
    isError,
  } = useGetProjectQuery({ projectId: Number(projectId) });

  const [isModalEditProjectOpen, setIsModalEditProjectOpen] = useState(false);
  const [isModalEditUsersOpen, setIsModalEditUsersOpen] = useState(false);
  const [isModalEditViewsOpen, setIsModalEditViewsOpen] = useState(false);
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    // Initial active tab state
    if (activeTab === "" && project && project.projectViews) {
      setActiveTab(project.projectViews[0]?.name);
    }
  }, [project]);

  // TODO: Error out here?
  if (isLoading)
    return (
      <div>
        <CircularProgress sx={{ margin: "20px" }} />
      </div>
    );
  if (isError || !project)
    return <div>An error occurred while retrieving the project</div>;

  return (
    <div className="px-4 xl:px-6">
      {/* Modal for edit/new project */}
      <ModalEditProject
        project={isEditable ? project : null}
        isOpen={isModalEditProjectOpen}
        onClose={() => setIsModalEditProjectOpen(false)}
      />
      <ModalAddRemoveUsers
        project={project}
        isOpen={isModalEditUsersOpen}
        onClose={() => setIsModalEditUsersOpen(false)}
      />
      <ModalEditViews
        project={project}
        isOpen={isModalEditViewsOpen}
        onClose={() => setIsModalEditViewsOpen(false)}
      />
      <div className="pb-6 pt-6 lg:pb-4 lg:pt-8">
        <Header
          title={project.name}
          subtitle={
            project.startDate &&
            project.endDate &&
            "(" +
              format(new Date(project.startDate), "P") +
              " - " +
              format(new Date(project.endDate), "P") +
              ") " +
              project.description
          }
          rightAlignedComponent={
            <SubMenuDropdown
              icon={<IconDotsVertical size={36} />}
              direction="right"
            >
              <SubMenuButton
                onClick={() => {
                  setIsEditable(true);
                  setIsModalEditProjectOpen(true);
                }}
                icon={<IconFilePencil size={20} className="mr-2 h-5 w-5" />}
                label={"Edit Project Details"}
                disabled={false}
              />
              <hr className="my-2 border-slate-200" />
              <SubMenuButton
                onClick={() => {
                  setIsEditable(true);
                  setIsModalEditUsersOpen(true);
                }}
                icon={<IconUserCog size={20} className="mr-2 h-5 w-5" />}
                label={"Add / Remove Users & Orgs"}
                disabled={false}
              />
            </SubMenuDropdown>
          }
        />
      </div>
      {/* Tabs section */}
      <div className="flex flex-wrap gap-2 border-y border-gray-200 pb-[8px] pt-2 dark:border-stroke-dark md:items-center">
        <div className="flex flex-1 items-center gap-2 md:gap-4">
          {project.projectViews.map((view: ProjectView) => (
            <TabButton
              key={view.id}
              name={view.name}
              icon={determineIconFromViewType(view.viewType)}
              setActiveTab={setActiveTab}
              activeTab={activeTab}
            />
          ))}
          {/* TODO: Could reuse styles between TabButton */}
          <Tooltip title="Modify Views">
            <button
              className="relative flex items-center gap-2 px-1 py-2 text-gray-500 after:absolute after:-top-[8px] after:left-0 after:h-[1px] after:w-full hover:text-blue-600 dark:text-neutral-500 dark:hover:text-white sm:px-2 lg:px-4"
              onClick={() => setIsModalEditViewsOpen(true)}
            >
              <IconSquarePlus className="h-5 w-5" />
            </button>
          </Tooltip>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip title="Create Task">
            <button
              className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
              onClick={() => setIsModalNewTaskOpen(true)}
            >
              <IconSquarePlus className="h-5 w-5" />
            </button>
          </Tooltip>
          {activeTab !== "Dashboard" && (
            <>
              <Tooltip
                title={`${!isArchivedSelected ? "Show" : "Hide"} Archived Tasks`}
              >
                <button
                  className={`flex items-center rounded px-3 py-2 text-white ${isArchivedSelected ? "bg-royal-secondary hover:bg-purple-600" : "bg-gray-400 hover:bg-gray-600 dark:bg-gray-800"}`}
                  onClick={() => setIsArchivedSelected(!isArchivedSelected)}
                >
                  <IconArchive className="h-5 w-5" />
                </button>
              </Tooltip>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Tasks"
                  className={`rounded-md border py-1 pl-10 pr-4 focus:outline-none dark:border-dark-secondary dark:bg-dark-secondary ${taskSearchQuery ? "dark:text-white" : "text-gray-400 dark:text-gray-500"}`}
                  onChange={(event) => setTaskSearchQuery(event.target.value)}
                />
                <IconFilter
                  className={`absolute left-3 top-2 h-4 w-4 ${taskSearchQuery ? "text-royal-secondary" : "text-gray-400 dark:text-neutral-500"}`}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function determineIconFromViewType(type: string) {
  switch (type) {
    case "board":
      return <IconColumns3 className="h-5 w-5" />;
    case "calendar":
      return <IconCalendarMonth className="h-5 w-5" />;
    case "dashboard":
      return <IconGauge className="h-5 w-5" />;
    case "gantt":
      return <IconClock className="h-5 w-5" />;
    case "hierarchy":
      return <IconSitemap className="h-5 w-5" />;
    case "table":
      return <IconTable className="h-5 w-5" />;
    case "tile":
      return <IconLayoutGrid className="h-5 w-5" />;
  }
}

type TabButtonProps = {
  name: string;
  icon: React.ReactNode;
  setActiveTab: (tabName: string) => void;
  activeTab: string;
};

const TabButton = ({ name, icon, setActiveTab, activeTab }: TabButtonProps) => {
  const isActive = activeTab === name;

  return (
    <Tooltip title={name + " View"}>
      <button
        className={`relative flex items-center gap-2 px-1 py-2 text-gray-500 after:absolute after:-top-[8px] after:left-0 after:h-[1px] after:w-full hover:text-blue-600 dark:text-neutral-500 dark:hover:text-white sm:px-2 lg:px-4 ${
          isActive ? "text-blue-600 after:bg-blue-600 dark:text-white" : ""
        }`}
        onClick={() => setActiveTab(name)}
      >
        {icon}
        {name}
      </button>
    </Tooltip>
  );
};

export default ProjectHeader;
