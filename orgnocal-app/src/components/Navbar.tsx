import React, { useState } from "react";
import {
  IconUserSquareRounded,
  IconLogout,
  IconMoon,
  IconSearch,
  IconSettings,
  IconSun,
} from "@tabler/icons-react";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { useAppSelector } from "@/app/redux";
import { setIsDarkMode, setIsSidebarCollapsed } from "@/state";
import ModalEditProject from "./modal/ModalEditProject";
import ModalEditOrg from "./modal/ModalEditOrg";
import { useRouter } from "next/navigation";
import { SubMenuButton, SubMenuDropdown } from "./dropdown/SubMenuDropdown";
import Image from "next/image";
import { IconGridDots } from "@tabler/icons-react";

const Navbar = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const [isModalEditOrgOpen, setIsModalEditOrgOpen] = useState(false);
  const [isModalEditProjectOpen, setIsModalEditProjectOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  function handleSearchEnter(event: { key: string }) {
    if (event.key === "Enter") {
      router.push(`/search?search=${searchTerm}`);
    }
  }

  return (
    <div className="sticky top-0 flex z-40 h-[56px] shadow-md items-center justify-between bg-white px-4 py-3 dark:bg-black dark:px-4 dark:py-3">
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
      {/* Searchbar */}
      <div className="flex items-center">
        <button
          onClick={() => dispatch(setIsSidebarCollapsed(!isSidebarCollapsed))}
        >
          <IconGridDots
            className={`h-8 w-8 dark:text-white transition-all ease-in-out duration-300 ${!isSidebarCollapsed ? "rotate-0" : "rotate-90"}`}
          />
        </button>
        <div className="pt-2 ml-5 mr-7">
          <Image
            src={
              isDarkMode
                ? "/orgnocal_logo_dark.png"
                : "/orgnocal_logo_light.png"
            }
            alt="Orgnocal Logo"
            width={115}
            height={115}
          />
        </div>
        <div className="relative flex h-min w-[25rem] ml-7">
          <IconSearch className="absolute left-[0.5rem] top-1/2 mr-2 h-5 w-5 -translate-y-1/2 transform cursor-pointer dark:text-white" />
          <input
            className="lg:w-full md:min-w-4 rounded border-none bg-gray-100 p-2 pl-8 placeholder-gray-500 focus:border-transparent focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-white"
            type="search"
            placeholder="Search application . . ."
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={handleSearchEnter}
          />
        </div>
      </div>
      {/* Right icons */}
      <div className="flex items-center">
        <div className="flex flex-wrap gap-2">
          <button
            className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
            onClick={() => {
              setIsModalEditOrgOpen(true);
            }}
          >
            New Org +
          </button>
          <button
            className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
            onClick={() => {
              setIsModalEditProjectOpen(true);
            }}
          >
            New Project +
          </button>
        </div>
        <button
          onClick={() => dispatch(setIsDarkMode(!isDarkMode))}
          className="rounded ml-2 p-2 gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {isDarkMode ? (
            <IconSun className="h-6 w-6 cursor-pointer dark:text-white" />
          ) : (
            <IconMoon className="h-6 w-6 cursor-pointer dark:text-white" />
          )}
        </button>
        {/* Vertical Rule */}
        <div className="ml-2 mr-5 hidden min-h-[2em] w-[0.1rem] bg-gray-200 md:inline-block"></div>
        {/* TODO: Replace this with user menu - maybe settings go here? */}
        <SubMenuDropdown
          icon={
            <IconUserSquareRounded className="h-6 w-6 cursor-pointer dark:text-white" />
          }
          direction="right"
        >
          <Link href="/settings">
            <SubMenuButton
              onClick={() => {}}
              icon={<IconSettings size={20} />}
              label={"Settings"}
              disabled={false}
            />
          </Link>
          <hr className="my-2 border-slate-200" />
          <SubMenuButton
            onClick={() => {}}
            icon={<IconLogout size={20} />}
            label={"Sign Out"}
            disabled={false}
          />
        </SubMenuDropdown>
      </div>
    </div>
  );
};

export default Navbar;