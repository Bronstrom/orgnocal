import React, { useEffect, useState } from "react";
import {
  Project,
  useGetOrgsQuery,
  useGetUsersQuery,
  useUpdateProjectUsersMutation,
} from "@/state/api";
import DropdownSearchButtonUsersOrgs from "@/components/dropdown/DropdownSearchButtonUsersOrgs";
import Modal from "@/components/modal/Modal";
import { IconUserCog } from "@tabler/icons-react";
import { CircularProgress } from "@mui/material";

type ModalAddRemoveUsersProps = {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
};

const ModalAddRemoveUsers = ({
  project,
  isOpen,
  onClose,
}: ModalAddRemoveUsersProps) => {
  const [updateProjectUsers] =
    useUpdateProjectUsersMutation();
  const {
    data: users,
    isLoading: isLoadingUsers,
    isError: isErrorUsers,
  } = useGetUsersQuery();
  const {
    data: orgs,
    isLoading: isLoadingOrgs,
    isError: isErrorOrgs,
  } = useGetOrgsQuery();

  const [isShowingSearchDropdown, setIsShowingSearchDropdown] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);

  const fullSelectedOrgs = orgs?.filter((org) =>
    selectedOrgs.includes(String(org.id))
  );
  const restrictedUsers = fullSelectedOrgs?.map((orgs) =>
    orgs.users?.map((orgUser) => String(orgUser.userId))
  );

  useEffect(() => {
    if (project) {
      setSelectedOrgs(
        project.orgs?.map((org) => String(org.id)) || []
      );
      setSelectedUsers(project.users?.map((user) => String(user.userId)) || []);
    } else {
      resetAddRemoveUserOrgFields();
    }
    setIsShowingSearchDropdown(false);
  }, [isOpen]);

  function resetAddRemoveUserOrgFields() {
    setSelectedUsers([]);
    setSelectedOrgs([]);
  }

  // TODO: Util function and remove duplicates
  function combineArrays(arrays?: string[][]) {
    let tempArray: string[] = [];
    arrays?.forEach((array: any) => (tempArray = [...tempArray, ...array]));
    return tempArray;
  }

  const handleSubmit = async () => {
    if ((!selectedUsers && !selectedOrgs) || !project) return;

    // TODO: Send notification to user of org or themselves being added to project
    updateProjectUsers({
      projectId: project.id,
      users: selectedUsers,
      orgs: selectedOrgs,
    });
    onClose()
  };

  const isEditNewFormValid = () => {
    return selectedUsers;
  };

  // TODO: Create reusable component for this
  if (isLoadingUsers || isLoadingOrgs) return <div><CircularProgress sx={{ margin: "20px" }} /></div>;
  if (isErrorUsers || !users)
    return <div>An error occurred while retrieving users</div>;
  if (isErrorOrgs || !orgs)
    return <div>An error occurred while retrieving orgs</div>;

  return (
    <Modal isOpen={isOpen} onClose={onClose} name={"Edit Users"}>
      <form
        className="mt-4 space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <DropdownSearchButtonUsersOrgs
          isShowingSearchDropdown={isShowingSearchDropdown}
          setIsShowingSearchDropdown={setIsShowingSearchDropdown}
          selectedUsers={selectedUsers}
          setSelectedUsers={setSelectedUsers}
          selectedOrgs={selectedOrgs}
          setSelectedOrgs={setSelectedOrgs}
          users={users}
          orgs={orgs}
          buttonLabel={"Add / Remove Users & Orgs"}
          itemType={"Users & Orgs"}
          // TODO: Likely should make a users-orgs join table to prevent something like this
          // Find users that are in orgs that are selected
          restrictedSelectedUsers={combineArrays(restrictedUsers)}
        />
        <button
          type="submit"
          className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${!isEditNewFormValid() || isLoadingUsers || isLoadingOrgs ? "cursor-not-allowed opacity-50" : ""} `}
          disabled={!isEditNewFormValid() || isLoadingUsers || isLoadingOrgs}
        >
          {/* TODO: Add spinner */}
          <IconUserCog />
          {isLoadingUsers || isLoadingOrgs
            ? "Inviting / Removing Users & Orgs . . ."
            : "Invite / Remove Users & Orgs"}
        </button>
      </form>
    </Modal>
  );
};

export default ModalAddRemoveUsers;
