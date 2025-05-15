"use client";

import {
  QueryCache,
  QueryClient,
  QueryClientProvider as ReactQueryClientProvider,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PropsWithChildren, useState } from "react";
import { toast } from "sonner";

export function QueryClientProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Set default stale time to 5 minutes
            staleTime: 5 * 60 * 1000,
            // Disable retries on 401 errors
            retry: (failureCount, error: any) => {
              if (error?.status === 401) return false;
              return failureCount < 3;
            },
          },
        },
        queryCache: new QueryCache({
          onError: (err: any) => {
            let errorMessage: string;
            if (err?.message) {
              errorMessage = err.message;
            } else {
              errorMessage = "An unknown error occurred";
            }

            // Avoid showing auth errors (they are handled separately)
            if (
              errorMessage.includes("Unauthorized") ||
              errorMessage.includes("log in again") ||
              errorMessage.includes("401")
            ) {
              return;
            }

            // Show error toast for other errors
            toast.error("Error", {
              description: errorMessage,
              position: "top-right",
            });
          },
        }),
      })
  );

  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
    </ReactQueryClientProvider>
  );
}
