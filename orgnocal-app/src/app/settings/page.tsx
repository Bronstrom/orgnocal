"use client";

import Header from "@/components/Header";
import ModalDelete from "@/components/modal/ModalDelete";
import ModalEditProfilePicture from "@/components/modal/ModalEditProfilePicture";
import { formInputStyles, formLabelStyles } from "@/lib/utils";
import {
  useDeleteUserMutation,
  useGetUserQuery,
  useUpdateUserMutation,
} from "@/state/api";
import { CircularProgress } from "@mui/material";
import { IconPencil, IconPencilOff } from "@tabler/icons-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Settings = () => {
  const router = useRouter();
  const [updateUser, { isLoading: isLoadingUpdateUser }] =
    useUpdateUserMutation();
  const [deleteUser, { isLoading: isLoadingDeleteUser }] =
    useDeleteUserMutation();
  // TODO: AUTHENTICATE - get user details and replace userId
  const userId = 1;
  const {
    data: user,
    isLoading,
    isError,
  } = useGetUserQuery(
    {
      userId: userId || 0,
    },
    // 'skip' param used when userId is not caught soon enough during authentification process
    {
      skip: userId === null,
    },
  );

  // Required fields
  const [username, setUsername] = useState("");
  // TODO: Consider option to change email
  // const [email, setEmail] = useState(user.email);

  // Optional fields
  const [roles, setRoles] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  const [isEditable, setIsEditable] = useState(false);
  const [isModalEditProfilePictureUrl, setIsModalEditProfilePictureUrl] =
    useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  // String helper to get org names
  const orgStr = user?.orgs?.map((org, index) =>
    index > 0 ? ", " + org.orgName : org.orgName,
  )

  useEffect(() => {
    if (user) {
      resetTextFields();
    }
  }, [user]);

  function resetTextFields() {
    setUsername(user?.username || "");
    setProfilePictureUrl(user?.profilePictureUrl || "");
    setRoles(user?.roles?.join(", ") || "");
  }

  function handleEditUserToggle() {
    const tempEditable = !isEditable;
    setIsEditable(tempEditable);
    // Handle cancel
    if (!tempEditable) {
      resetTextFields();
    }
  }

  function invalidateSubmit() {
    return isLoading || isLoadingUpdateUser || isLoadingDeleteUser;
  }

  // Validate required fields
  function isValidUserEdits() {
    // TODO: Ensure string is longer than 5 characters and valid characters, do this on the back-end too
    return username;
  }

  function textFieldViewable(
    input: string,
    setInput: (input: string) => void,
    label = "",
    noInputProvided = "",
    subtitle = "",
    disabled = "",
  ) {
    return (
      <div className="space-y-1">
        {label && <label className={formLabelStyles}>{label}</label>}
        {!isEditable ? (
          <>{input?.length < 1 || !input ? noInputProvided : input}</>
        ) : (
          <input
            type="text"
            className={formInputStyles}
            placeholder={label}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={Boolean(disabled)}
          />
        )}
        {isEditable && subtitle && (
          <p className={"text-gray-500"}>{subtitle}</p>
        )}
      </div>
    );
  }

  // TODO: Create reusable component for this
  if (isLoading)
    return (
      <div>
        <CircularProgress sx={{ margin: "20px" }} />
      </div>
    );
  if (isError || !user)
    return <div>An error occurred while retrieving users</div>;

  const handleSaveUserEdits = async () => {
    // TODO: Must be authenticated as the current user to update them - use this on the backend
    await updateUser({
      userId,
      partialUser: {
        username: username.trim(),
        // Split on comma with any extra spaces before or after comma
        roles: roles.trim().split(/ *, */),
        profilePictureUrl,
      },
    });
    setIsEditable(false);
  };

  const handleDeleteUser = async () => {
    try {
      // TODO: Must be authenticated as the current user to delete them - use this on the backend
      const rerouteLink = "/";
      await deleteUser({
        userId: userId,
      });
      router.push(rerouteLink);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <Header
        title={"Settings"}
        rightAlignedComponent={
          <div className="flex gap-5">
            {/* TODO: Add delete functionality for users and ensure only the user that created this user or project owner/project manager can delete it */}
            {/* Delete User */}
            {isEditable && (
              <button
                className={`flex items-center rounded bg-red-500 px-3 py-2 text-white hover:bg-red-600 ${invalidateSubmit() ? "cursor-not-allowed opacity-50" : ""}`}
                disabled={invalidateSubmit()}
                onClick={() => setIsModalDeleteOpen(true)}
              >
                Delete account
              </button>
            )}
            {/* Save Edits */}
            {isEditable && (
              <button
                type="submit"
                className={`flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600 ${!isValidUserEdits() || invalidateSubmit() ? "cursor-not-allowed opacity-50" : ""} `}
                disabled={!isValidUserEdits() || invalidateSubmit()}
                onClick={handleSaveUserEdits}
              >
                <>
                  <IconPencilOff className="mr-2 h-5 w-5" />
                  Save Edits
                </>
              </button>
            )}
            {/* Edit user*/}
            {/* TODO: Ensure this option is only available for project manager, po or created user - delete and save should only be allowed by these people should be validated on the back-end too */}
            <button
              className="flex items-center rounded bg-gray-600 px-3 py-2 text-white hover:bg-gray-700"
              onClick={handleEditUserToggle}
            >
              {!isEditable ? (
                <>
                  <IconPencil className="mr-2 h-5 w-5" />
                  Edit Account
                </>
              ) : (
                <>
                  <IconPencilOff className="mr-2 h-5 w-5" />
                  Cancel Edit
                </>
              )}
            </button>
          </div>
        }
      />
      <div className="mb-5 grid grid-cols-3 gap-4 rounded bg-white shadow dark:bg-dark-secondary dark:text-white">
        <ModalEditProfilePicture
          profilePictureUrl={profilePictureUrl}
          setProfilePictureUrl={setProfilePictureUrl}
          isOpen={isModalEditProfilePictureUrl}
          onClose={() => setIsModalEditProfilePictureUrl(false)}
        />
        <ModalDelete
          type={"Account"}
          name={user.username}
          message={`This action will permanently delete your account and your user data will be lost. You must enter your username: "${user.username}" to delete your account.`}
          isOpen={isModalDeleteOpen}
          // TODO: Add delete action
          confirmAction={handleDeleteUser}
          onClose={() => setIsModalDeleteOpen(false)}
          requiredField={user.username}
          isLoading={invalidateSubmit()}
        />
        {/* Left column */}
        <div className="col-span-2 p-10">
          <div className="pb-8">
            <div className="space-y-4">
              {textFieldViewable(
                username,
                setUsername,
                "Username",
                "~ No username provided ~",
              )}
              {textFieldViewable(
                user.email,
                () => {},
                "Email",
                "~ No email provided ~",
                "Your email cannot be changed.",
                "disabled",
              )}
              {textFieldViewable(
                roles,
                setRoles,
                "Roles",
                "~ No role(s) provided ~",
                "Please type as a comma (',') seperated list",
              )}
              {textFieldViewable(
                // TODO: Convert this better
                String(orgStr),
                () => {},
                "Org(s)",
                "~ No org(s) assigned ~",
                "Orgs can be created by a user or assigned to a user. Orgs can be removed from the Org's main page.",
                "disabled",
              )}
            </div>
          </div>
        </div>
        {/* Right column */}
        <div className="bg-gray-200 p-10 dark:bg-gray-800">
          <label className={formLabelStyles}>Profile Picture</label>
          <Image
            src={`/${profilePictureUrl}`}
            alt={user.username}
            width={200}
            height={200}
            className={`w-full rounded-full border-4 object-cover dark:border-dark-secondary`}
          />
          {isEditable && (
            <button
              className="flex items-center rounded bg-blue-primary px-3 py-2 text-white hover:bg-blue-600"
              onClick={() => {
                setIsModalEditProfilePictureUrl(true);
              }}
            >
              Change Profile Picture
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
