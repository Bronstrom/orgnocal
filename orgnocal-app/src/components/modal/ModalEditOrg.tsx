import React, { useEffect, useState } from "react";
import {
  Org,
  useCreateOrgMutation,
  useDeleteOrgMutation,
  useGetUsersQuery,
  useUpdateOrgMutation,
} from "@/state/api";
import Modal from "@/components/modal/Modal";
import ModalDelete from "@/components/modal/ModalDelete";
import DropdownSearchButton from "@/components/dropdown/DropdownSearchButton";
import { useRouter } from "next/navigation";
import OwnerManagerAssignmentDropdown from "@/components/dropdown/OwnerManagerAssignmentDropdown";
import { formInputStyles } from "@/lib/utils";

type ModalEditOrgProps = {
  org: Org | null;
  isOpen: boolean;
  onClose: () => void;
};

const ModalEditOrg = ({ org, isOpen, onClose }: ModalEditOrgProps) => {
  const router = useRouter();
  const {
    data: users,
    isLoading: isLoadingUsersQuery,
    isError,
  } = useGetUsersQuery();
  const [createOrg, { isLoading: isLoadingCreateOrg }] =
    useCreateOrgMutation();
  const [updateOrg, { isLoading: isLoadingUpdateOrg }] =
    useUpdateOrgMutation();
  const [deleteOrg, { isLoading: isLoadingDeleteOrg }] =
    useDeleteOrgMutation();
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  // TODO: If getting to a lot validation use library
  const [orgName, setOrgName] = useState("");
  const [description, setDescription] = useState("");
  const [productOwner, setProductOwner] = useState(undefined);
  const [projectManager, setProjectManager] = useState(undefined);
  const createdByUserId = 1; // TODO: AUTHENTIFICATION: Replace after authentification
  // These items are always selected
  const restrictedSelectedItems = [createdByUserId];

  const [isShowingSearchDropdown, setIsShowingSearchDropdown] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Get username array to display near user selection
  const selectedUsernames = users
    ?.filter((user) => selectedUsers.includes(user.userId))
    .map((user) => user.username);

  useEffect(() => {
    if (org) {
      setOrgName(org.orgName || "");
      setDescription(org.description || "");
      setProductOwner(org.productOwnerUserId || undefined);
      setProjectManager(org.projectManagerUserId || undefined);
      setSelectedUsers(org.users.map((user) => user.userId) || []);
    } else {
      resetEditOrgFields();
    }
  }, [isOpen]);

  function resetEditOrgFields() {
    setOrgName("");
    setDescription("");
    setProductOwner(undefined);
    setProjectManager(undefined);
    setSelectedUsers([]);
  }

  // Used to add important users to arrays
  function mergeArrays(array1: string[], array2: string[]) {
    return array1.concat(array2);
  }

  const handleSubmit = async () => {
    if (!orgName || !productOwner || !projectManager) return;

    // TODO: Add yourself to org, add owner and pm and a selection of members from the start - send them invites to join

    // Handle create new org
    if (!org) {
      await createOrg({
        partialOrg: {
          orgName,
          description,
          productOwnerUserId: Number(productOwner),
          projectManagerUserId: Number(projectManager),
          createdByUserId: createdByUserId,
        },
        users: mergeArrays(selectedUsers, [
          productOwner,
          projectManager,
          createdByUserId,
        ]),
      });
    }
    // Handle edit org
    else {
      await updateOrg({
        orgId: org.id,
        partialOrg: {
          orgName,
          description,
          productOwnerUserId: productOwner,
          projectManagerUserId: projectManager,
        },
        users: mergeArrays(selectedUsers, [
          productOwner,
          projectManager,
          createdByUserId,
        ]),
      });
    }
    onClose();
  };

  const handleDeleteOrg = async () => {
    try {
      const rerouteLink = `/`;
      await deleteOrg({
        orgId: org?.id || 0,
      });
      router.push(rerouteLink);
    } catch (err) {
      console.error(err);
    }
  };

  function invalidateSubmit() {
    return (
      isLoadingUsersQuery ||
      isLoadingCreateOrg ||
      isLoadingUpdateOrg ||
      isLoadingDeleteOrg
    );
  }

  const isEditNewFormValid = () => {
    return orgName && productOwner;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      name={org ? "Edit Org" : "Create New Org"}
    >
      {org && (
        <ModalDelete
          type={"Org"}
          name={org.orgName}
          message={
            `Org data will be lost once deleted. Projects will remain intact. You must enter the org name: "${org.orgName}" to delete the org.`
          }
          isOpen={isModalDeleteOpen}
          confirmAction={() => handleDeleteOrg()}
          onClose={() => setIsModalDeleteOpen(false)}
          requiredField={org.orgName}
          isLoading={isLoadingDeleteOrg}
        />
      )}
      <form
        className="mt-4 space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <input
          type="text"
          className={formInputStyles}
          placeholder="Org Name"
          value={orgName}
          onChange={(event) => setOrgName(event.target.value)}
        />
        <textarea
          className={formInputStyles}
          placeholder="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
        <OwnerManagerAssignmentDropdown
          users={users}
          selectedProductOwnerUserId={productOwner}
          setSelectedProductOwnerUserId={setProductOwner}
          selectedProjectManagerUserId={projectManager}
          setSelectedProjectManagerUserId={setProjectManager}
        />
        <div>
          {"Selected User(s): " +
            selectedUsernames?.join(", ") +
            " | PO, PM and yourself will be added to this list as well"}
        </div>
        <DropdownSearchButton
          isShowingSearchDropdown={isShowingSearchDropdown}
          setIsShowingSearchDropdown={setIsShowingSearchDropdown}
          selectedItems={selectedUsers}
          setSelectedItems={setSelectedUsers}
          items={users}
          buttonLabel={`Add ${org ? "/ Remove " : ""}Users`}
          itemType={"Users"}
          restrictedSelectedItems={[...restrictedSelectedItems, productOwner, projectManager]}
        />
        {org && (
          <button
            className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${!isEditNewFormValid() || invalidateSubmit() ? "cursor-not-allowed opacity-50" : ""} `}
            disabled={invalidateSubmit()}
            onClick={(event) => {
              event.preventDefault();
              setIsModalDeleteOpen(true);
            }}
          >
            Delete Org
          </button>
        )}
        <button
          type="submit"
          className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600 ${!isEditNewFormValid() || invalidateSubmit() ? "cursor-not-allowed opacity-50" : ""} `}
          disabled={!isEditNewFormValid() || invalidateSubmit()}
        >
          {/* TODO: Add spinner */}
          {invalidateSubmit()
            ? org
              ? "Modifying Org . . ."
              : "Creating Org . . ."
            : org
              ? "Edit Org"
              : "Create Org"}
        </button>
      </form>
    </Modal>
  );
};

export default ModalEditOrg;
