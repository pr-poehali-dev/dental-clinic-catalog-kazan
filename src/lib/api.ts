const API_URLS = {
  auth: 'https://functions.poehali.dev/f0cdbeae-8ff1-4f35-8c57-2ba527544c72',
  clinics: 'https://functions.poehali.dev/18b3bd5a-c312-417d-9155-32cbe4284aba',
  reviews: 'https://functions.poehali.dev/89d4863e-1b44-4036-aeeb-3d960d40bb04',
  admin: 'https://functions.poehali.dev/a74c7513-a390-40bf-b646-10d49e541e37'
};

export type User = {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export const authAPI = {
  async register(email: string, password: string, full_name: string): Promise<AuthResponse> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', email, password, full_name })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка регистрации');
    }
    
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', email, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка входа');
    }
    
    return data;
  },

  async verify(token: string): Promise<{ user: User }> {
    const response = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'verify', token })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Недействительный токен');
    }
    
    return data;
  }
};

export const clinicsAPI = {
  async getAll(search?: string, service?: string) {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (service) params.append('service', service);
    
    const url = `${API_URLS.clinics}${params.toString() ? '?' + params.toString() : ''}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Ошибка загрузки клиник');
    }
    
    return response.json();
  },

  async getById(clinicId: number) {
    const response = await fetch(`${API_URLS.clinics}?clinic_id=${clinicId}`);
    
    if (!response.ok) {
      throw new Error('Ошибка загрузки клиники');
    }
    
    return response.json();
  }
};

export const reviewsAPI = {
  async add(token: string, clinicId: number, rating: number, reviewText: string) {
    const response = await fetch(API_URLS.reviews, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token
      },
      body: JSON.stringify({ clinic_id: clinicId, rating, review_text: reviewText })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка добавления отзыва');
    }
    
    return data;
  }
};

export const adminAPI = {
  async getClinics(token: string) {
    const response = await fetch(API_URLS.admin, {
      headers: { 'X-Auth-Token': token }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка загрузки');
    }
    
    return data;
  },

  async createClinic(token: string, clinicData: any) {
    const response = await fetch(API_URLS.admin, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token
      },
      body: JSON.stringify(clinicData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка создания клиники');
    }
    
    return data;
  },

  async updateClinic(token: string, clinicData: any) {
    const response = await fetch(API_URLS.admin, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token
      },
      body: JSON.stringify(clinicData)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка обновления клиники');
    }
    
    return data;
  },

  async deleteClinic(token: string, clinicId: number) {
    const response = await fetch(API_URLS.admin, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': token
      },
      body: JSON.stringify({ id: clinicId })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка удаления клиники');
    }
    
    return data;
  }
};
