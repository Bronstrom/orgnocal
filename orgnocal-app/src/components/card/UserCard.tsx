import { User } from "@/state/api";
import React from "react";
import Image from "next/image";

type UserCardProps = {
  user: User
};

const UserCard = ({ user }: UserCardProps) => {
  return (
    // TODO: Make common styling Card component
    <div className="mb-3 rounded bg-white p-4 shadow dark:bg-dark-secondary dark:text-white">
      {user.profilePictureUrl && (
        <Image
          src={`/${user.profilePictureUrl}`}
          alt={"profile picture"}
          width={32}
          height={32}
          className="rounded-full pr-2"
        />
      )}
      <div>
      <h4 className="text-md font-bold dark:text-white">{user.username}</h4>
        {/* TODO: Is email in data model */}
        <p>{user.email}</p>
      </div>
    </div>
  );
};

export default UserCard;
