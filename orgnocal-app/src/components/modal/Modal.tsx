import React from "react";
import ReactDOM from "react-dom";
import { IconX } from "@tabler/icons-react";
import Header from "@/components/Header";

type ModalProps = {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  name: string;
};

const Modal = ({ children, isOpen, onClose, name }: ModalProps) => {
  if (!isOpen) return null;

  // Create modal on top of all other components
  return ReactDOM.createPortal(
    <div className="fixed z-50 inset-0 flex h-full w-full items-center justify-center overflow-y-auto bg-gray-600 bg-opacity-50">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-lg bg-white p-8 shadow-lg dark:bg-dark-secondary">
        <Header
          title={name}
          rightAlignedComponent={
            <button
              className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-600 text-white hover:bg-gray-700"
              onClick={onClose}
            >
              <IconX size={18} />
            </button>
          }
          isSmallText
        />
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
