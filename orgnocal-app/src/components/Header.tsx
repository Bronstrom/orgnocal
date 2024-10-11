import React from "react";

type HeaderProps = {
  title: string;
  subtitle?: string;
  // TODO: Try to lock this down to a different type
  rightAlignedComponent?: any;
  isSmallText?: boolean;
};

const Header = ({
  title,
  subtitle,
  rightAlignedComponent,
  isSmallText = false,
}: HeaderProps) => {
  return (
    <div className="mb-5 flex w-full items-center justify-between">
      {/* Modal new project */}
      <div className="font-semibold dark:text-white">
        <h1 className={isSmallText ? "text-lg" : "text-2xl"}>{title}</h1>
        <h2 className={isSmallText ? "text-md" : "text-xl"}>{subtitle}</h2>
      </div>
      {rightAlignedComponent}
    </div>
  );
};

export default Header;
