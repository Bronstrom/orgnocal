import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { IconChevronDown, IconChevronUp, IconSearch } from "@tabler/icons-react";

type DropdownSearchSingleSelectProps = {
  selectedItem: string;
  setSelectedItem: (selectedItem: string) => void;
  items: any;
  buttonLabel: string;
  itemType: string;
  restrictedSelectedItems?: string[];
};

const MAX_COUNT_RESULTS = 10;

const DropdownSearchSingleSelect = ({
  selectedItem,
  setSelectedItem,
  items,
  buttonLabel,
  itemType,
  restrictedSelectedItems,
}: DropdownSearchSingleSelectProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const selectionDropdownRef = useRef<any>(null);
  const [isOpenSelectionDropdown, setIsOpenSelectionDropdown] = useState(false);

  // Get username array to display near user selection
  const selectedItemObject = !selectedItem
    ? null
    : items?.find(
        (item: any) => selectedItem === item.id || selectedItem === item.userId
      );

  useEffect(() => {
    const handleSelectionOutsideSingleSelect = (event: { target: any }) => {
      if (
        selectionDropdownRef.current !== null &&
        event.target !== null &&
        !selectionDropdownRef.current.contains(event.target)
      ) {
        setIsOpenSelectionDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleSelectionOutsideSingleSelect);
  }, [selectionDropdownRef]);

  function selectionItem(id: string, name: string, profilePictureUrl: string) {
    return (
      <li>
        <div className="flex items-center rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
          <button
            id={`${itemType}-${id}-selection-item`}
            className={`flex w-full cursor-pointer items-center rounded-md p-3 text-sm transition-all ${restrictedSelectedItems?.includes(id) ? "text-slate-400" : "text-slate-800 hover:bg-slate-100 focus:bg-slate-100 active:bg-slate-100"}`}
            onClick={() => setSelectedItem(id)}
            disabled={restrictedSelectedItems?.includes(id)}
          >
            <label
              htmlFor={`${itemType}-${id}-selection-item`}
              className={`ms-2 w-full rounded text-sm font-medium ${selectedItem === id ? "text-blue-600" : "text-gray-900 dark:text-gray-300"}`}
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
                {name}
              </div>
            </label>
          </button>
        </div>
      </li>
    );
  }

  return (
    <section ref={selectionDropdownRef}>
      <button
        id={`${itemType}-search-dropdown-button`}
        onClick={() => { setIsOpenSelectionDropdown(!isOpenSelectionDropdown); setSearchQuery("") }}
        className="inline-flex items-center rounded-lg bg-blue-700 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        {buttonLabel +
          ": " +
          (selectedItemObject?.name ||
            selectedItemObject?.username ||
            `~ No ${itemType} defined ~`)}
        {!isOpenSelectionDropdown ? (
          <IconChevronDown className="ml-2 h-5 w-5" />
        ) : (
          <IconChevronUp className="ml-2 h-5 w-5" />
        )}
      </button>
      {isOpenSelectionDropdown && (
        <div
          id={`${itemType}-search-dropdown`}
          className="absolute z-10 w-60 rounded-lg bg-white shadow dark:bg-gray-700"
        >
          <div className="p-3">
            {/* TODO: Search requirement should be similar to search page - with 2/3 chars minimum */}
            <label htmlFor="input-dropdown-search" className="sr-only">
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
                Showing top {MAX_COUNT_RESULTS} search results
              </div>
            </div>
          </div>
          <ul
            className="h-48 overflow-y-auto px-3 pb-3 text-sm text-gray-700 dark:text-gray-200"
            aria-labelledby="dropdownSearchSingleSelect"
            onClick={() => setIsOpenSelectionDropdown(false)}
          >
            {items
              .filter(
                (item: any) =>
                  item.name
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                  item.username
                    ?.toLowerCase()
                    .includes(searchQuery.toLowerCase())
              )
              .slice(0, MAX_COUNT_RESULTS)
              .map((item: any) =>
                selectionItem(
                  item.id || item.userId,
                  item.name || item.username,
                  item.profilePictureUrl || undefined
                )
              )}
          </ul>
        </div>
      )}
    </section>
  );
};

export default DropdownSearchSingleSelect;
