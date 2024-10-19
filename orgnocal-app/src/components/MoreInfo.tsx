import { Tooltip } from "@mui/material";
import { IconInfoCircle } from "@tabler/icons-react";
import React, { ReactNode } from "react";

type MoreInfoProps = {
  title: ReactNode;
};

const MoreInfo = ({ title }: MoreInfoProps) => {
  return (
    <Tooltip title={title}>
      <button
        className={`flex items-center justify-center gap-2 rounded p-2 hover:bg-gray-100 dark:text-neutral-500 dark:hover:bg-gray-700`}
      >
        <IconInfoCircle size={26} />
      </button>
    </Tooltip>
  );
};

export default MoreInfo;
