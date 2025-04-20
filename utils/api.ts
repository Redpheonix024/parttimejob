/**
 * Utility functions for interacting with API endpoints from the frontend
 */

type ApiOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  includeAuth?: boolean;
  userId?: string;
};

/**
 * Generic API call function
 */
export async function apiCall<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {}, includeAuth = false, userId } = options;
  
  const requestOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    credentials: 'include',
  };

  // Add authorization header if includeAuth is true and userId is provided
  if (includeAuth && userId) {
    requestOptions.headers = {
      ...requestOptions.headers,
      'Authorization': `Bearer ${userId}`
    };
  }
  
  if (body) {
    requestOptions.body = JSON.stringify(body);
  }
  
  const response = await fetch(`/api/${endpoint}`, requestOptions);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Upload file to the server
 */
export async function uploadFile(endpoint: string, file: File, additionalData: Record<string, string> = {}): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  
  // Add any additional data
  Object.entries(additionalData).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  const response = await fetch(`/api/${endpoint}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Jobs API
 */
export const jobsApi = {
  getJobs: () => apiCall<{ jobs: any[] }>('jobs'),
  createJob: (jobData: any) => apiCall<{ job: any }>('jobs', { 
    method: 'POST', 
    body: jobData 
  }),
  getUserJobStatus: (userId?: string) => apiCall<{ jobs: any[] }>('user/job-status', {
    includeAuth: true,
    userId
  })
};

/**
 * Users API
 */
export const usersApi = {
  getUser: (id: string) => apiCall<{ user: any }>(`users?id=${id}`),
  getUsers: () => apiCall<{ users: any[] }>('users'),
  updateUser: (userData: any) => apiCall<{ user: any }>('users', { 
    method: 'PUT', 
    body: userData 
  }),
  uploadProfilePicture: (file: File, userId: string) => 
    uploadFile('users/upload-image', file, { userId })
};

/**
 * Auth API
 */
export const authApi = {
  logout: () => apiCall<{ success: boolean }>('auth', { 
    method: 'POST', 
    body: { action: 'logout' } 
  })
}; 