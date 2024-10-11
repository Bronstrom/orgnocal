"use client";

import { useAppSelector } from "@/app/redux";
import { useGetOrgsQuery, useGetProjectsQuery } from "@/state/api";
import {
  IconBriefcase,
  IconChevronDown,
  IconChevronUp,
  IconClipboardList,
  IconHome,
  TablerIcon,
  IconSearch,
  IconSettings,
  IconUser,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import ModalEditOrg from "./modal/ModalEditOrg";
import ModalEditProject from "./modal/ModalEditProject";

const Sidebar = () => {
  const [showOrgs, setShowOrgs] = useState(true);
  const [showProjects, setShowProjects] = useState(true);

  const [isModalEditOrgOpen, setIsModalEditOrgOpen] = useState(false);
  const [isModalEditProjectOpen, setIsModalEditProjectOpen] = useState(false);

  // TODO: AUTHENTIFICATION - Swap this out for actual IconUser
  const isAdminIconUser = false;

  // Grab project data from api
  const { data: projects } = useGetProjectsQuery();
  const { data: orgs } = useGetOrgsQuery();

  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  // TODO: Error out?

  const sidebarClassNames = `fixed flex flex-col h-[100%] justify-between shadow-xl pt-[56px]
    transition-all ease-in-out duration-250 h-full z-30 dark:bg-black overflow-y-auto bg-white ${isSidebarCollapsed ? "w-0 opacity-0" : "w-64 opacity-100"}`;

  return (
    <div className={sidebarClassNames}>
      <div className="flex h-full w-full flex-col justify-start">
        {/* Modal for new project */}
        <ModalEditProject
          project={null}
          isOpen={isModalEditProjectOpen}
          onClose={() => setIsModalEditProjectOpen(false)}
        />
        {/* Modal for new project */}
        <ModalEditOrg
          org={null}
          isOpen={isModalEditOrgOpen}
          onClose={() => setIsModalEditOrgOpen(false)}
        />
        {/* Navbar links */}
        <nav className="z-10 w-full">
          <div className="mt-10">
            <SidebarLink icon={IconHome} label="Home" href="/" />
            <SidebarLink
              icon={IconClipboardList}
              label="My Tasks"
              href="/my-tasks"
            />
            <SidebarLink icon={IconSearch} label="Search" href="/search" />
            {/* TODO: Detemine better route */}
            <SidebarLink
              icon={IconSettings}
              label="Settings"
              href="/settings"
            />
            {/* TODO: Make these admin screen that only can be accessed by the admin IconUser */}
          </div>
          <div className="my-10 border-y-[0.1rem] border-gray-200 dark:border-gray-700">
            {/* TODO: AUTHENTIFICATION - Swap this out for IconUser is admin */}
            {isAdminIconUser && (
              <>
                <SidebarLink
                  icon={IconUser}
                  label="IconUsers"
                  href="/IconUsers"
                />
                <SidebarLink icon={IconUsers} label="Orgs" href="/orgs" />
              </>
            )}
          </div>
        </nav>
        {/* Org/Org links */}
        <button
          onClick={() => setShowOrgs((prev) => !prev)}
          className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
        >
          <span>Orgs</span>
          {!showOrgs ? (
            <IconChevronDown className="h-5 w-5" />
          ) : (
            <IconChevronUp className="h-5 w-5" />
          )}
        </button>
        {/* TODO: Make these specific to logged in IconUser */}
        {showOrgs && (
          <>
            {orgs?.map((org) => (
              <SidebarLink
                key={org.id}
                icon={IconUsers}
                label={org.orgName}
                href={`/orgs/${org.id}`}
              />
            ))}
            <div
              className="text-center text-blue-primary font-bold cursor-pointer pb-5"
              onClick={() => {
                setIsModalEditOrgOpen(true);
              }}
            >
              New Org +
            </div>
          </>
        )}
        <div className="pb-10">
          {/* Projects links */}
          <button
            onClick={() => setShowProjects((prev) => !prev)}
            className="flex w-full items-center justify-between px-8 py-3 text-gray-500"
          >
            <span>Projects</span>
            {!showProjects ? (
              <IconChevronDown className="h-5 w-5" />
            ) : (
              <IconChevronUp className="h-5 w-5" />
            )}
          </button>
          {showProjects && (
            <>
              {projects?.map((project) => (
                <SidebarLink
                  key={project.id}
                  icon={IconBriefcase}
                  label={project.name}
                  href={`/projects/${project.id}`}
                />
              ))}
              <div
                className="text-center text-blue-primary font-bold cursor-pointer pb-5"
                onClick={() => {
                  setIsModalEditProjectOpen(true);
                }}
              >
                New Project +
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

interface SidebarLinkProps {
  href: string;
  icon: TablerIcon;
  label: string;
  //isCollapsed: boolean
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  //isCollapsed
}: SidebarLinkProps) => {
  const pathname = usePathname();
  const isActive =
    pathname === href || (pathname === "/" && href === "/dashboard");

  return (
    <Link href={href} className="w-full">
      <div
        className={`dark:bg-black relative flex cursor-pointer items-center gap-3 transition-colors hover:bg-gray-100 dark:bg-black dark:hover:bg-gray-700 ${
          isActive ? "bg-gray-100 text-white dark:bg-gray-600" : ""
        } justify-start px-8 py-3`}
      >
        {isActive && (
          <div className="absolute left-0 top-0 h-[100%] w-[5px] bg-blue-200"></div>
        )}
        <Icon className="h-6 w-6 text-gray-800 dark:text-gray-100" />
        <span className="font-medium text-gray-800 dark:text-gray-100">
          {label}
        </span>
      </div>
    </Link>
  );
};

export default Sidebar;
