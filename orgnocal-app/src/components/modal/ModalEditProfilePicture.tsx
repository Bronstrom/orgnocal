import React, { useEffect, useState } from "react";
import Modal from "@/components/modal/Modal";
import Image from "next/image";

type ModalEditProfilePictureUrlProps = {
  profilePictureUrl: string;
  setProfilePictureUrl: (profilePictureUrl: string) => void;
  isOpen: boolean;
  onClose: () => void;
};

const ModalEditProfilePictureUrl = ({
  profilePictureUrl,
  setProfilePictureUrl,
  isOpen,
  onClose,
}: ModalEditProfilePictureUrlProps) => {
  const [selectedProfilePictureUrl, setSelectedProfilePictureUrl] =
    useState(profilePictureUrl);
  const imageFileNames = [
    "profile1.jpg",
    "profile2.jpg",
    "profile3.jpg",
    "profile4.jpg",
    "profile5.jpg",
    "profile6.jpg",
  ];

  useEffect(() => {
    setSelectedProfilePictureUrl(profilePictureUrl);
  }, [isOpen]);
  return (
    <Modal isOpen={isOpen} onClose={onClose} name={"Edit Profile Picture"}>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-4">
        {imageFileNames.map((imageFileName) => (
          <Image
            key={imageFileName}
            src={`/${imageFileName}`}
            alt={imageFileName}
            width={100}
            height={100}
            className={`h-20 w-20 rounded-full border-4 ${selectedProfilePictureUrl === imageFileName ? "border-gray-700" : "border-white"} object-cover dark:border-dark-secondary`}
            onClick={() => setSelectedProfilePictureUrl(imageFileName)}
          />
        ))}
      </div>
      <button
        type="submit"
        className={`focus-offset-2 mt-4 flex w-full justify-center rounded-md border border-transparent bg-blue-primary px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600`}
        onClick={() => {
          setProfilePictureUrl(selectedProfilePictureUrl);
          onClose();
        }}
      >
        Choose image
      </button>
    </Modal>
  );
};

export default ModalEditProfilePictureUrl;
