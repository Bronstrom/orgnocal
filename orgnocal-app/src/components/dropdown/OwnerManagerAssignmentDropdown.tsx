import React from "react";
import { User } from "@/state/api";
import DropdownSearchSingleSelect from "./DropdownSearchSingleSelect";

type OwnerManagerAssignmentDropdownProps = {
  users?: User[];
  selectedProductOwnerUserId?: string;
  setSelectedProductOwnerUserId: (selectedProductOwnerUserId?: string) => void;
  selectedProjectManagerUserId?: string;
  setSelectedProjectManagerUserId: (
    selectedProjectManagerUserId?: string
  ) => void;
};

const OwnerManagerAssignmentDropdown = ({
  users,
  selectedProductOwnerUserId,
  setSelectedProductOwnerUserId,
  selectedProjectManagerUserId,
  setSelectedProjectManagerUserId,
}: OwnerManagerAssignmentDropdownProps) => {
  return (
    <div className={"col"}>
      <div className={"p-2"}>
        {/* TODO: Ensure selectedItem empty string works occordingly */}
        <DropdownSearchSingleSelect
          selectedItem={selectedProductOwnerUserId || ""}
          setSelectedItem={setSelectedProductOwnerUserId}
          items={users}
          buttonLabel={"Select Product Owner (PO)"}
          itemType={"PO"}
        />
      </div>
      <div className={"p-2"}>
        {/* TODO: Ensure selectedItem empty string works occordingly */}
        <DropdownSearchSingleSelect
          selectedItem={selectedProjectManagerUserId || ""}
          setSelectedItem={setSelectedProjectManagerUserId}
          items={users}
          buttonLabel={"Select Project Manager (PM)"}
          itemType={"PM"}
        />
      </div>
    </div>
  );
};

export default OwnerManagerAssignmentDropdown;
