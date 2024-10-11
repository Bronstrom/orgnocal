import React, { ReactNode, useState } from "react";

type TaskHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  // TODO: Try to lock this down to a different type
  rightAlignedComponent?: any;
  isSmallText?: boolean;
};

const TaskHeader = ({
  title,
  subtitle,
  rightAlignedComponent,
  isSmallText = false,
}: TaskHeaderProps) => {
  return (
    <div className="mb-5 flex w-full items-center justify-between">
      {/* Modal new project */}
      <div
        className="font-semibold dark:text-white"
      >
        <h1 className={isSmallText ? "text-lg" : "text-2xl"}>{title}</h1>
        <h2 className={isSmallText ? "text-md" : "text-xl"}>{subtitle}</h2>
      </div>
      {rightAlignedComponent}
    </div>
  );
};

export default TaskHeader;
