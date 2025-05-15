"use client";

import { ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuthToken } from "@/lib/api";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const token = getAuthToken();

  useEffect(() => {
    router.push(token ? pathname : "/auth");
  }, [token, router, pathname]);

  return <>{children}</>;
}
