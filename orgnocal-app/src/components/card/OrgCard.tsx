import { Org } from "@/state/api";
import React from "react";

type OrgCardProps = {
  org: Org;
};

const OrgCard = ({ org }: OrgCardProps) => {
  return (
    // TODO: Make common styling Card component
    <div className="mb-3 rounded bg-white p-4 shadow dark:bg-dark-secondary dark:text-white">
      <h4 className="text-md font-bold dark:text-white">{org.orgName}</h4>
      <p>{org.description}</p>
    </div>
  );
};

export default OrgCard;
