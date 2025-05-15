import Image from "next/image";
import React from "react";

import { Avatar, AvatarFallback } from "./ui/avatar";

interface Props {
  id: string;
  name: string;
  imageUrl?: string | null;
  className?: string;
}

const UserAvatar = ({ id, name, imageUrl, className = "h-10 w-10" }: Props) => {
  const initials = name
    .split(" ")
    .map((word: string) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Avatar className={className}>
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={name}
          className="object-cover"
          width={36}
          height={36}
          quality={100}
        />
      ) : (
        <AvatarFallback className="bg-brand-700 font-space-grotesk font-bold tracking-wider text-white">
          {initials}
        </AvatarFallback>
      )}
    </Avatar>
  );
};

export default UserAvatar;
