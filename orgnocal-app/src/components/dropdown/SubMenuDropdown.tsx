import { IconDotsVertical } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

type SubMenuButtonProps = {
  onClick: () => void;
  icon: any;
  label: string;
  disabled: boolean;
};

export const SubMenuButton = ({
  onClick,
  icon,
  label,
  disabled = false,
}: SubMenuButtonProps) => {
  return (
    <button
      className={`flex w-full cursor-pointer items-center rounded-md p-3 text-sm transition-all dark:text-white ${disabled ? "text-slate-400" : "text-slate-800 hover:bg-slate-100 dark:hover:bg-gray-600 focus:bg-slate-100 active:bg-slate-100"}`}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      <p className="ml-2 font-medium text-slate-800 dark:text-white">{label}</p>
    </button>
  );
};

type SubMenuDropdownProps = {
  children: any;
  icon: any;
  direction: string;
};

export const SubMenuDropdown = ({
  children,
  icon = undefined,
  direction = "left",
}: SubMenuDropdownProps) => {
  const subMenuRef = useRef<any>(null);
  const [isOpenSubMenu, setIsOpenSubMenu] = useState(false);

  useEffect(() => {
    const handleSelectionOutsideSubMenu = (event: { target: any }) => {
      if (
        subMenuRef.current !== null &&
        event.target !== null &&
        !subMenuRef.current.contains(event.target)
      ) {
        setIsOpenSubMenu(false);
      }
    };
    document.addEventListener("mousedown", handleSelectionOutsideSubMenu);
  }, [subMenuRef]);

  return (
    <div className="flex items-center gap-1">
      <section ref={subMenuRef}>
        <button
          className={`flex items-center justify-center dark:text-neutral-500 rounded p-2 gap-2 hover:bg-gray-100 dark:hover:bg-gray-700`}
          onClick={() => setIsOpenSubMenu(!isOpenSubMenu)}
        >
          {icon || <IconDotsVertical size={26} />}
        </button>
        {isOpenSubMenu && (
          <ul
            role="sub-menu"
            className={`absolute z-10 min-w-[180px] ${direction === "right" && "right-0 mt-2 mr-4 origin-top-right"}overflow-auto rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg shadow-sm focus:outline-none dark:bg-dark-secondary`}
            onClick={() => setIsOpenSubMenu(false)}
          >
            {children}
          </ul>
        )}
      </section>
    </div>
  );
};
