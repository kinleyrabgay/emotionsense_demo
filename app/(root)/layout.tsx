"use client";

import { Navbar } from "@/components/navbar";
import { userStorage } from "@/lib/storage-service";
import { PropsWithChildren, useEffect, useState } from "react";

const RootLayout = ({ children }: PropsWithChildren) => {
  const [user, setUser] = useState<ReturnType<typeof userStorage.getUser> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use a separate useEffect to handle the initial hydration
  useEffect(() => {
    setUser(userStorage.getUser());
    setIsLoading(false);
  }, []);

  // Sync with sessionStorage after initial hydration is complete
  useEffect(() => {
    // Only set up sync after initial hydration
    if (isLoading) return;

    const checkUserInStorage = () => {
      const storedUser = userStorage.getUser();
      if (JSON.stringify(storedUser) !== JSON.stringify(user)) {
        setUser(storedUser);
      }
    };

    const handleStorageChange = () => {
      checkUserInStorage();
    };

    window.addEventListener("storage", handleStorageChange);

    // Check periodically in case of changes from other tabs
    const interval = setInterval(checkUserInStorage, 5000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [user, isLoading]);

  // During server rendering or initial client hydration, show a minimal layout
  // to ensure we match server/client
  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-gray-500 mt-4">Loading...</p>
        </div>
      </>
    );
  }

  // Once we're client-side and we know the auth state, show appropriate content
  if (!user) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-gray-500 mt-4">Fetching data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default RootLayout;
