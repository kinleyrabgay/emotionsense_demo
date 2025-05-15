"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api";
import { userStorage } from "@/lib/storage-service";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const token = getAuthToken();

  // Get the user from the local storage
  const user = userStorage.getUser();
  console.log(user);

  useEffect(() => {
    router.push(token ? pathname : "/auth");
  }, [token, router, pathname]);

  return <>{children}</>;
}
