import { 
  Application, 
  Interview, 
  Company, 
  Activity, 
  ApplicationStatistics,
  TimelineStatistics,
  UserProfile 
} from '../types';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers = {
        ...config.headers,
        'Authorization': `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Applications API
  async getApplications(userId: string): Promise<Application[]> {
    return this.request<Application[]>(`/applications?userId=${userId}`);
  }

  async getApplication(id: string): Promise<Application> {
    return this.request<Application>(`/applications/${id}`);
  }

  async createApplication(application: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>): Promise<Application> {
    return this.request<Application>('/applications', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  }

  async updateApplication(id: string, updates: Partial<Application>): Promise<Application> {
    return this.request<Application>(`/applications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteApplication(id: string): Promise<void> {
    return this.request<void>(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  // Interviews API
  async getInterviews(userId: string): Promise<Interview[]> {
    return this.request<Interview[]>(`/interviews?userId=${userId}`);
  }

  async getInterview(id: string): Promise<Interview> {
    return this.request<Interview>(`/interviews/${id}`);
  }

  async createInterview(interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>): Promise<Interview> {
    return this.request<Interview>('/interviews', {
      method: 'POST',
      body: JSON.stringify(interview),
    });
  }

  async updateInterview(id: string, updates: Partial<Interview>): Promise<Interview> {
    return this.request<Interview>(`/interviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteInterview(id: string): Promise<void> {
    return this.request<void>(`/interviews/${id}`, {
      method: 'DELETE',
    });
  }

  // Companies API
  async getCompanies(userId: string): Promise<Company[]> {
    return this.request<Company[]>(`/companies?userId=${userId}`);
  }

  async getCompany(id: string): Promise<Company> {
    return this.request<Company>(`/companies/${id}`);
  }

  async createCompany(company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    return this.request<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(company),
    });
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
    return this.request<Company>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteCompany(id: string): Promise<void> {
    return this.request<void>(`/companies/${id}`, {
      method: 'DELETE',
    });
  }

  // Activities API
  async getActivities(userId: string): Promise<Activity[]> {
    return this.request<Activity[]>(`/activities?userId=${userId}`);
  }

  async createActivity(activity: Omit<Activity, 'id' | 'createdAt'>): Promise<Activity> {
    return this.request<Activity>('/activities', {
      method: 'POST',
      body: JSON.stringify(activity),
    });
  }

  // Analytics API
  async getApplicationStatistics(userId: string): Promise<ApplicationStatistics> {
    return this.request<ApplicationStatistics>(`/analytics/applications?userId=${userId}`);
  }

  async getTimelineStatistics(userId: string): Promise<TimelineStatistics> {
    return this.request<TimelineStatistics>(`/analytics/timeline?userId=${userId}`);
  }

  // User Profile API
  async getUserProfile(userId: string): Promise<UserProfile> {
    return this.request<UserProfile>(`/users/${userId}`);
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // File Upload API
  async uploadFile(file: File, type: 'resume' | 'cover-letter' | 'portfolio' | 'other'): Promise<{ url: string; name: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const token = localStorage.getItem('authToken');
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Search API
  async searchApplications(userId: string, query: string): Promise<Application[]> {
    return this.request<Application[]>(`/search/applications?userId=${userId}&q=${encodeURIComponent(query)}`);
  }

  async searchCompanies(userId: string, query: string): Promise<Company[]> {
    return this.request<Company[]>(`/search/companies?userId=${userId}&q=${encodeURIComponent(query)}`);
  }

  // Bulk Operations API
  async bulkUpdateApplications(updates: { id: string; updates: Partial<Application> }[]): Promise<Application[]> {
    return this.request<Application[]>('/applications/bulk', {
      method: 'PUT',
      body: JSON.stringify({ updates }),
    });
  }

  async exportData(userId: string, format: 'json' | 'csv'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/export?userId=${userId}&format=${format}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Export failed: ${response.status} ${response.statusText}`);
    }

    return await response.blob();
  }
}

export const apiService = new ApiService();
export default apiService;

