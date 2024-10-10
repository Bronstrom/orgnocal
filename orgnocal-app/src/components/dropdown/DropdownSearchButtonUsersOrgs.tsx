import React, { useState } from "react";
import Image from "next/image";
import { IconChevronDown, IconChevronUp, IconSearch } from "@tabler/icons-react";
import { Org, User } from "@/state/api";

type DropdownSearchButtonUsersOrgsProps = {
  isShowingSearchDropdown: boolean;
  setIsShowingSearchDropdown: (selectedItems: boolean) => void;
  selectedUsers: string[];
  setSelectedUsers: (selectedUsers: string[]) => void;
  selectedOrgs: string[];
  setSelectedOrgs: (selectedOrgs: string[]) => void;
  users: User[];
  orgs: Org[];
  buttonLabel: string;
  itemType: string;
  restrictedSelectedUsers?: string[];
};

const MAX_COUNT_RESULTS = 10;

const DropdownSearchButtonUsersOrgs = ({
  isShowingSearchDropdown,
  setIsShowingSearchDropdown,
  selectedUsers,
  setSelectedUsers,
  selectedOrgs,
  setSelectedOrgs,
  users,
  orgs,
  buttonLabel,
  itemType,
  restrictedSelectedUsers,
}: DropdownSearchButtonUsersOrgsProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  function onItemCheck(
    event: React.ChangeEvent<HTMLInputElement>,
    item: string,
    selectedItems: string[],
    setSelectedItems: (selectedItems: string[]) => void
  ) {
    let checked = event.target.checked;
    // TODO: Ensure manager can't remove themselves
    if (checked) {
      setSelectedItems([...selectedItems, item]);
    } else {
      setSelectedItems(selectedItems.filter((_item) => _item !== item));
    }
  }

  function checkboxItem(
    id: string,
    name: string,
    selectedItems: string[],
    setSelectedItems: (selectedItems: string[]) => void,
    profilePictureUrl?: string,
    isUsers?: boolean
  ) {
    return (
      <li>
        <div className="flex items-center rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
          <input
            id={`${itemType}-${id}-checkbox-item`}
            type="checkbox"
            checked={selectedItems?.includes(id)}
            onChange={(event) =>
              onItemCheck(event, id, selectedItems, setSelectedItems)
            }
            className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:ring-offset-gray-700 dark:focus:ring-blue-600 dark:focus:ring-offset-gray-700"
            disabled={isUsers && restrictedSelectedUsers?.includes(id)}
          />
          <label
            for={`${itemType}-${id}-checkbox-item`}
            className="ms-2 w-full rounded text-sm font-medium text-gray-900 dark:text-gray-300"
          >
            <div className="flex">
              {profilePictureUrl && (
                <Image
                  key={id}
                  // Ensure profile picture exists
                  // TODO: Maybe have some extra validation here and have placeholder image
                  src={`/${profilePictureUrl!}`}
                  alt={name}
                  width={30}
                  height={30}
                  className="h-8 w-8 rounded-full border-2 border-white object-cover dark:border-dark-secondary"
                />
              )}
              {name} {isUsers && restrictedSelectedUsers?.includes(id) && "(In a selected org)"}
            </div>
          </label>
        </div>
      </li>
    );
  }

  return (
    <>
      <button
        id={`${itemType}-search-dropdown-button`}
        onClick={() => {
          setIsShowingSearchDropdown(!isShowingSearchDropdown);
          setSearchQuery("");
        }}
        className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        {buttonLabel}
        {!isShowingSearchDropdown ? (
          <IconChevronDown className="ml-2 h-5 w-5" />
        ) : (
          <IconChevronUp className="ml-2 h-5 w-5" />
        )}
      </button>
      {isShowingSearchDropdown && (
        <div
          id={`${itemType}-search-dropdown`}
          className="absolute z-10 w-60 rounded-lg bg-white shadow dark:bg-gray-700"
        >
          <div className="p-3">
            {/* TODO: Search requirement should be similar to search page - with 2/3 chars minimum */}
            <label for="input-dropdown-search" className="sr-only">
              Search {itemType}
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3 pb-5">
                <IconSearch className="h-4 w-4 text-gray-300 dark:text-gray-400" />
              </div>
              <input
                type="text"
                id="input-dropdown-search"
                className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 ps-10 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-500 dark:bg-gray-600 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                placeholder={`Search ${itemType}`}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <div className={"text-gray-500 dark:text-gray-700"}>
                Showing top {MAX_COUNT_RESULTS} search results for users and
                orgs each
              </div>
            </div>
          </div>
          <ul
            className="h-48 overflow-y-auto px-3 pb-3 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownSearchButtonUsersOrgs"
          >
            <div>Users</div>
            {users
              .filter((user: User) =>
                user.username?.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .slice(0, MAX_COUNT_RESULTS)
              .map((user: User) =>
                checkboxItem(
                  user.userId,
                  user.username,
                  selectedUsers,
                  setSelectedUsers,
                  user.profilePictureUrl || undefined,
                  true
                )
              )}
            <div>Orgs</div>
            {orgs
              .filter((org: Org) =>
                org.orgName
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase())
              )
              .slice(0, MAX_COUNT_RESULTS)
              .map((org: Org) =>
                checkboxItem(
                  org.id,
                  org.orgName,
                  selectedOrgs,
                  setSelectedOrgs,
                  undefined,
                  false
                )
              )}
          </ul>
        </div>
      )}
    </>
  );
};

export default DropdownSearchButtonUsersOrgs;
