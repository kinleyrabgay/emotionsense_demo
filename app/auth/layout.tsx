"use client";

import { BackgroundPattern } from "@/components/background";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-900">
      <BackgroundPattern className="absolute inset-0 left-1/2 -translate-x-1/2 z-0 opacity-75 pointer-events-none" />
      <div className="relative z-10 w-full max-w-lg px-4">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
