"use client";

import { BackgroundPattern } from "@/components/background";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex w-full flex-1 items-center justify-center px-4">
      <BackgroundPattern className="absolute inset-0 left-1/2 z-0 -translate-x-1/2 opacity-75" />
      {children}
    </div>
  );
};

export default AuthLayout;
