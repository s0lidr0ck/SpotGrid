// API Client for SpotGrid backend
const API_BASE_URL = 'http://localhost:3001/api';

interface ApiResponse<T> {
  data: T;
  error: null | { message: string };
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        return {
          data: null as T,
          error: { message: data.error || `HTTP ${response.status}` }
        };
      }

      // Check if server response is already in {data, error} format
      if (data && typeof data === 'object' && 'data' in data && 'error' in data) {
        return data;
      }
      
      // Otherwise, wrap the response in our expected format
      return {
        data: data as T,
        error: null
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        data: null as T,
        error: { message: 'Network error' }
      };
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  async logout() {
    const result = await this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
    this.setToken(null);
    return result;
  }

  // Estimates
  async getEstimates(params?: { status?: string; exclude_status?: string[] }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.exclude_status) {
      params.exclude_status.forEach(status => 
        searchParams.append('exclude_status', status)
      );
    }
    
    const query = searchParams.toString();
    const endpoint = query ? `/estimates?${query}` : '/estimates';
    
    return this.request<any[]>(endpoint);
  }

  async getEstimate(id: string) {
    return this.request<any>(`/estimates/${id}`);
  }

  async createEstimate(data: any) {
    return this.request<any>('/estimates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEstimate(id: string, data: any) {
    return this.request<any>(`/estimates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEstimate(id: string) {
    return this.request<{ id: string }>(`/estimates/${id}`, {
      method: 'DELETE',
    });
  }

  async getDashboardStats() {
    return this.request<any>('/estimates/stats/dashboard');
  }

  // Brands
  async getBrands() {
    return this.request<any[]>('/brands');
  }

  async getBrand(id: string) {
    return this.request<any>(`/brands/${id}`);
  }

  async createBrand(data: any) {
    return this.request<any>('/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBrand(id: string, data: any) {
    return this.request<any>(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBrand(id: string) {
    return this.request<{ id: string }>(`/brands/${id}`, {
      method: 'DELETE',
    });
  }

  // Dayparts
  async getDayparts() {
    return this.request<any[]>('/dayparts');
  }

  async getDaypart(id: string) {
    return this.request<any>(`/dayparts/${id}`);
  }

  // Estimate Items (slot selections)
  async getEstimateItems(estimateId: string) {
    return this.request<any[]>(`/estimate-items/${estimateId}`);
  }

  async createEstimateItem(estimateId: string, data: any) {
    return this.request<any>(`/estimate-items/${estimateId}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateEstimateItem(estimateId: string, itemId: string, data: any) {
    return this.request<any>(`/estimate-items/${estimateId}/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteEstimateItem(estimateId: string, itemId: string) {
    return this.request<{ id: string }>(`/estimate-items/${estimateId}/${itemId}`, {
      method: 'DELETE'
    });
  }

  // Media Assets
  async getMediaAssets(params?: { brand_id?: string; status?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.brand_id) searchParams.set('brand_id', params.brand_id);
    if (params?.status) searchParams.set('status', params.status);
    
    const query = searchParams.toString();
    const endpoint = query ? `/media?${query}` : '/media';
    
    return this.request<any[]>(endpoint);
  }

  async getMediaAsset(id: string) {
    return this.request<any>(`/media/${id}`);
  }

  async createMediaAsset(data: any) {
    return this.request<any>('/media', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMediaAsset(id: string, data: any) {
    return this.request<any>(`/media/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMediaAsset(id: string) {
    return this.request<{ id: string }>(`/media/${id}`, {
      method: 'DELETE',
    });
  }

  async getMediaAssetUrl(id: string) {
    return this.request<{ url: string; expires_in: number }>(`/media/${id}/url`);
  }

  async getMediaAssetPreviewUrl(id: string, type: 'preview' | 'thumbnail' = 'preview') {
    return this.request<{ url: string; expires_in: number; type: string }>(`/media/${id}/preview-url?type=${type}`);
  }

  async uploadMediaAsset(file: File, brandId: string, estimateId?: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('brand_id', brandId);
    if (estimateId) {
      formData.append('estimate_id', estimateId);
    }

    return this.request<any>('/media/upload', {
      method: 'POST',
      headers: {
        // Remove Content-Type to let browser set it with boundary for FormData
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    });
  }

  // Payment Methods
  async getPaymentMethods(params?: { brand_id?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.brand_id) searchParams.set('brand_id', params.brand_id);
    
    const query = searchParams.toString();
    const endpoint = query ? `/payment-methods?${query}` : '/payment-methods';
    
    return this.request<any[]>(endpoint);
  }

  async getPaymentMethod(id: string) {
    return this.request<any>(`/payment-methods/${id}`);
  }

  async createPaymentMethod(data: any) {
    return this.request<any>('/payment-methods', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePaymentMethod(id: string, data: any) {
    return this.request<any>(`/payment-methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePaymentMethod(id: string) {
    return this.request<{ id: string }>(`/payment-methods/${id}`, {
      method: 'DELETE',
    });
  }

  async validateCoupon(couponCode: string) {
    return this.request<any>('/payment-methods/validate-coupon', {
      method: 'POST',
      body: JSON.stringify({ coupon_code: couponCode }),
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient; 