"use client";

import Link from "next/link";
import { MaxWidthWrapper } from "./max-width-wrapper";
import { Button } from "./ui/button";
import UserAvatar from "./user-avatar";
import { useEffect, useState } from "react";
import { userStorage } from "@/lib/storage-service";
import { useLogoutMutation } from "@/lib/api-services/auth-api";

export const Navbar = () => {
  const [user, setUser] = useState<ReturnType<
    typeof userStorage.getUser
  > | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);

  const { mutate: logout } = useLogoutMutation();

  useEffect(() => {
    setUser(userStorage.getUser());
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    const checkUser = () => {
      const currentUser = userStorage.getUser();
      if (JSON.stringify(currentUser) !== JSON.stringify(user)) {
        setUser(currentUser);
      }
    };

    const interval = setInterval(checkUser, 2000);

    return () => clearInterval(interval);
  }, [user, hasHydrated]);

  return (
    <nav className="sticky z-[100] h-16 inset-x-0 top-0 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex z-40 font-semibold">
            Emotion<span className="text-brand-700">Sense</span>
          </Link>

          <div className="h-full flex items-center space-x-4">
            {!hasHydrated || !user ? (
              <div className="h-8 w-px bg-gray-200" />
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => logout()}>
                  Logout
                </Button>
                <div className="h-8 w-px bg-gray-200" />
                {user.id && <UserAvatar id={user.id} name={user.name} />}
              </>
            )}
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};
