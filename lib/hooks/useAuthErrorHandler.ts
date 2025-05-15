import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { removeAuthToken } from '@/lib/api';
import { userStorage } from '@/lib/storage-service';

/**
 * Custom hook to handle authentication errors and cleanup
 * @param error The error object from a query or mutation
 * @param redirectTo Optional path to redirect to after error handling
 */
export function useAuthErrorHandler(error: unknown, redirectTo?: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    if (!error) return;

    // Show error toast
    toast.error('Authentication Failed', {
      description: error instanceof Error ? error.message : String(error),
    });

    // Handle authentication errors
    const isAuthError = 
      (error instanceof Error && error.message.toLowerCase().includes('unauthorized')) ||
      (error instanceof Response && error.status === 401);

    if (isAuthError) {
      // Clear user from sessionStorage
      userStorage.clearUser();
      
      // Remove token from localStorage
      removeAuthToken();
      
      // Invalidate user query
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      // Redirect if specified
      if (redirectTo) {
        router.push(redirectTo);
      }
    }
  }, [error, queryClient, router, redirectTo]);
} 