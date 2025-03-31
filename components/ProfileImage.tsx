import { useState, useEffect } from "react";
import Image from "next/image";
import { UserProfile } from "../types/user";

interface ProfileImageProps {
  user: UserProfile;
  size?: number;
}

export const ProfileImage = ({ user, size = 150 }: ProfileImageProps) => {
  const [imageError, setImageError] = useState(false);
  const defaultImage = "/default-avatar.png"; // Add a default avatar image to your public folder

  return (
    <div className="relative">
      <Image
        src={user.photoURL || defaultImage}
        alt="Profile picture"
        width={size}
        height={size}
        className="rounded-full object-cover"
        onError={() => setImageError(true)}
      />
      {!user.photoURL && (
        <div className="absolute bottom-0 right-0 bg-gray-200 p-2 rounded-full">
          <span>No photo uploaded</span>
        </div>
      )}
    </div>
  );
};
