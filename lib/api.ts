import { userStorage } from "@/lib/storage-service";

// JWT token key in localStorage
export const AUTH_TOKEN_KEY = "auth_token";

// API configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "http://0.0.0.0:8000/api",
  ENDPOINTS: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    USER: '/auth/me'
  },
  AUTH_COOKIE_NAME: "auth_token",
  USE_CREDENTIALS: false
};

// Standard API response interface
export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data: T;
}

interface FetchOptions extends RequestInit {
  params?: Record<string, string>;
}

/**
 * Get JWT token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Set JWT token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Remove JWT token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Handle unauthorized errors
 */
function handleUnauthorized() {
  // Clear token and user state
  removeAuthToken();
  userStorage.clearUser();
  
  // Redirect to login page
  if (typeof window !== "undefined") {
    const currentPath = window.location.pathname;
    if (!currentPath.startsWith('/auth')) {
      window.location.href = `/auth?from=${encodeURIComponent(currentPath)}`;
    }
  }
}

/**
 * Check if a URL is on a different origin from the current window
 */
function isExternalOrigin(urlString: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const url = new URL(urlString);
    const current = window.location.origin;
    return url.origin !== current;
  } catch (e) {
    return false;
  }
}

/**
 * Core API client with interceptor functionality
 */
const api = async (
  endpoint: string,
  options: FetchOptions = {}
): Promise<any> => {
  const { params, ...requestOptions } = options;
  
  // Build URL with query parameters
  const url = new URL(`${API_CONFIG.BASE_URL}${endpoint}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  
  // Configure request headers
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.append("Content-Type", "application/json");
  }
  
  // Get auth token from localStorage
  const token = getAuthToken();
  
  // Add token to Authorization header if available
  if (token) {
    // Format: Use "Bearer" prefix (most common for JWT)
    headers.append("Authorization", `Bearer ${token}`);
  }
  
  // Determine if the API is on a different origin
  const isExternal = typeof window !== 'undefined' && isExternalOrigin(url.toString());
  
  try {
    const response = await fetch(url.toString(), {
      ...requestOptions,
      headers,
      // Set credentials mode based on configuration
      // - If USE_CREDENTIALS is false, don't send credentials (token-based auth only)
      // - If external origin and USE_CREDENTIALS is true, use 'include' for CORS with credentials
      // - Otherwise use 'same-origin' for same-origin requests
      credentials: !API_CONFIG.USE_CREDENTIALS 
        ? 'omit' 
        : (isExternal ? 'include' : 'same-origin')
    });
    
    const data = await response.json();
    console.log("API Response:", {
      status: response.status,
      url: response.url,
      data: data
    });
    
    // Handle API response
    if (typeof data === 'object' && data !== null) {
      // Check if our response follows the standard API response format with status field
      if ('status' in data) {
        // Use the status from the response body
        // Check if status is not a success code (not 2xx)
        if (data.status < 200 || data.status >= 300) {
          const errorMessage = data.message || `API error: ${data.status}`;
          
          // Handle 401 unauthorized
          if (response.status === 401 || data.status === 401) {
            handleUnauthorized();
            throw new Error("Unauthorized: Please log in again");
          }
          
          throw new Error(errorMessage);
        }
      } else if (!response.ok) {
        // Fallback to HTTP status if no status field in the response
        if (response.status === 401) {
          handleUnauthorized();
          throw new Error("Unauthorized: Please log in again");
        }
        
        throw new Error(`API error: ${response.status}`);
      }
    } else if (!response.ok) {
      if (response.status === 401) {
        handleUnauthorized();
        throw new Error("Unauthorized: Please log in again");
      }
      
      throw new Error(`API error: ${response.status}`);
    }
    
    // If response HTTP status is successful (2xx) but we didn't return yet,
    // assume it's valid even if it doesn't match our expected format
    if (response.ok) {
      return data;
    }
    
    throw new Error(`Unexpected API response: ${response.status}`);
  } catch (error) {
    throw error;
  }
};

/**
 * HTTP method shortcuts
 */
export const apiGet = (endpoint: string, options?: FetchOptions) => 
  api(endpoint, { method: "GET", ...options });

export const apiPost = (endpoint: string, data?: any, options?: FetchOptions) => 
  api(endpoint, { 
    method: "POST", 
    body: data ? JSON.stringify(data) : undefined,
    ...options 
  });

export const apiPut = (endpoint: string, data?: any, options?: FetchOptions) => 
  api(endpoint, { 
    method: "PUT", 
    body: data ? JSON.stringify(data) : undefined, 
    ...options 
  });

export const apiPatch = (endpoint: string, data?: any, options?: FetchOptions) => 
  api(endpoint, { 
    method: "PATCH", 
    body: data ? JSON.stringify(data) : undefined, 
    ...options 
  });

export const apiDelete = (endpoint: string, options?: FetchOptions) => 
  api(endpoint, { method: "DELETE", ...options });

export default api; 