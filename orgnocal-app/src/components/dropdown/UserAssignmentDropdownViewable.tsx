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
  const { data: project } = useGetProjectQuery({
    projectId: selectedProjectId,
  });

  // TODO: Can viewUser be removed and just use taskAssignedUserId - or just use the taskAssignedUser or something
  function userAssignmentDropdownViewable(
    setTaskAssignedUserId: (taskAssignedUserId: number) => void,
    userLabel: string,
    viewUser?: User,
    taskAssignedUserId?: number
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
            // TODO: Ensure value of 0 works occordingly
            value={taskAssignedUserId || 0}
            onChange={(event) =>
              setTaskAssignedUserId(Number(event.target.value))
            }
          >
            <option value={0}>~ No {userLabel} Choosen ~</option>
            {project?.orgs?.map((org) =>
              org.users?.map((user) => (
                // Display user's name and display org when move than one org for the project
                <option key={"org-user_" + user.userId} value={user.userId}>
                  {user.username}{" "}
                  {project.orgs &&
                    project.orgs.length > 1 &&
                    "(" + org.orgName + ")"}
                </option>
              ))
            )}
            {/* TODO: When going through users ensure they don't exist in the
              orgs above - otherwise value will not be unique */}
            {project?.users?.map((user) => (
              <option key={"project-user_" + user.userId} value={user.userId}>
                {user.username}
              </option>
            ))}
          </select>
        )}
      </div>
    );
  }

  return (
    <div>
      {userAssignmentDropdownViewable(
        setSelectedAuthorUserId,
        "Author",
        author,
        selectedAuthorUserId
      )}
      {userAssignmentDropdownViewable(
        setSelectedAssignedUserId,
        "Assignee",
        assignee,
        selectedAssignedUserId
      )}
    </div>
  );
};

export default UserAssignmentDropdownViewable;
