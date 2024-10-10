import React from "react";
import { User, useGetProjectQuery } from "@/state/api";
import Image from "next/image";
import { formSelectStyles } from "@/lib/utils";

type UserAssignmentDropdownViewableProps = {
  author?: User;
  selectedAuthorUserId?: number;
  setSelectedAuthorUserId: (selectedAuthorUserId?: number) => void;
  assignee?: User;
  selectedAssignedUserId?: number;
  setSelectedAssignedUserId: (selectedAssignedUserId?: number) => void;
  selectedProjectId: number;
  isEditable: boolean;
};

const UserAssignmentDropdownViewable = ({
  author,
  selectedAuthorUserId,
  setSelectedAuthorUserId,
  assignee,
  selectedAssignedUserId,
  setSelectedAssignedUserId,
  selectedProjectId,
  isEditable,
}: UserAssignmentDropdownViewableProps) => {
  // TODO: Not a big fan of this name
  const {
    data: project,
    isLoading: isLoadingProject,
    isError: isErrorProject,
  } = useGetProjectQuery({ projectId: selectedProjectId });

  // TODO: Can viewUser be removed and just use taskAssignedUserId - or just use the taskAssignedUser or something
  function userAssignmentDropdownViewable(
    viewUser,
    taskAssignedUserId,
    setTaskAssignedUserId,
    userLabel
  ) {
    return (
      <div className="flex items-center gap-x-3">
        <strong>{userLabel}:</strong>
        {!isEditable ? (
          !viewUser ? (
            "~ No author provided ~"
          ) : (
            <>
              <Image
                key={viewUser.userId}
                // Ensure profile picture exists
                // TODO: Maybe have some extra validation here and have placeholder image
                src={`/${viewUser.profilePictureUrl!}`}
                alt={viewUser.username}
                width={30}
                height={30}
                className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
              />
              {viewUser.username}
            </>
          )
        ) : (
          <select
            className={formSelectStyles}
            // TODO: Figure out better solution of null for value
            value={taskAssignedUserId || null}
            onChange={(event) =>
              setTaskAssignedUserId(Number(event.target.value))
            }
          >
            <option value={null}>~ No {userLabel} Choosen ~</option>
            {project?.orgs?.map((org) =>
              org.users?.map((user) => (
                // Display user's name and display org when move than one org for the project
                <option value={user.userId}>
                  {user.username}{" "}
                  {project?.orgs?.length > 1 &&
                    "(" + org.orgName + ")"}
                </option>
              ))
            )}
            {/* TODO: When going through users ensure they don't exist in the
              orgs above - otherwise value will not be unique */}
            {project?.users?.map((user) => (
              <option value={user.userId}>{user.username}</option>
            ))}
          </select>
        )}
      </div>
    );
  }

  return (
    <div>
      {userAssignmentDropdownViewable(
        author,
        selectedAuthorUserId,
        setSelectedAuthorUserId,
        "Author"
      )}
      {userAssignmentDropdownViewable(
        assignee,
        selectedAssignedUserId,
        setSelectedAssignedUserId,
        "Assignee"
      )}
    </div>
  );
};

export default UserAssignmentDropdownViewable;
