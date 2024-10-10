"use client";

import Header from "@/components/Header";
import React, { useEffect, useState } from "react";
import { useSearchQuery } from "@/state/api";
import ProjectCard from "@/components/card/ProjectCard";
import TaskCard from "@/components/card/TaskCard";
import UserCard from "@/components/card/UserCard";
import { debounce } from "lodash";
import { useSearchParams } from "next/navigation";
import OrgCard from "@/components/card/OrgCard";
import Link from "next/link";

const Search = () => {
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState("");
  // TODO: May need to increase/decrease this number, likely this should be put in a utils file that sets minimums for
  //       any title/name/username length types (when required), ex: MINUMUM_INPUT_LENGTH = 2
  const {
    data: searchResults,
    isLoading,
    isError,
  } = useSearchQuery(searchTerm, {
    skip: searchTerm.length < 2,
  });

  // Delay searching by 500ms - avoid bogged down performance on this page
  const handleSearch = debounce((value) => {
    setSearchTerm(value);
  }, 500);

  useEffect(() => {
    return handleSearch.cancel;
  }, [handleSearch.cancel]);

  useEffect(() => {
    handleSearch(searchParams.get("search") || "");
  }, [searchParams]);

  return (
    <div className="p-8">
      <Header title="Search" />
      <div>
        <input
          type="text"
          placeholder="Search application . . ."
          className="w-1/2 rounded border p-3 shadow"
          defaultValue={searchTerm}
          onChange={(event) => handleSearch(event.target.value)}
        />
      </div>
      <div className="p-5">
        {isLoading && <p>Loading search . . .</p>}
        {isError && <p>An error occurred when retrieving search results.</p>}
        {!isLoading && !isError && searchResults && (
          <div>
            Results for keyword term: "{searchTerm}"
            {searchResults.tasks && searchResults.tasks?.length > 0 && (
              <h4 className="text-md py-5 font-bold dark:text-white">Tasks</h4>
            )}
            {searchResults.tasks?.map((task) => (
              <Link href={`/tasks/${task.id}`}>
                <TaskCard key={task.id} task={task} />
              </Link>
            ))}
            {searchResults.projects && searchResults.projects?.length > 0 && (
              <h4 className="text-md py-5 font-bold dark:text-white">
                Projects
              </h4>
            )}
            {searchResults.projects?.map((project) => (
              <Link href={`/projects/${project.id}`}>
                <ProjectCard key={project.id} project={project} />
              </Link>
            ))}
            {searchResults.orgs && searchResults.orgs?.length > 0 && (
              <h4 className="text-md py-5 font-bold dark:text-white">Orgs</h4>
            )}
            {searchResults.orgs?.map((org) => (
              <Link href={`/orgs/${org.id}`}>
                <OrgCard key={org.id} org={org} />
              </Link>
            ))}
            {searchResults.users && searchResults.users?.length > 0 && (
              <h4 className="text-md py-5 font-bold dark:text-white">Users</h4>
            )}
            {searchResults.users?.map((user) => (
              <UserCard key={user.userId} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
