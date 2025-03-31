import axios from 'axios';
import { LoginResponse, SignUpResponse, Artwork, Artist } from '../types/api';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth APIs
export const login = async (credentials: { 
  email: string; 
  password: string;
  role: string;
}): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response.data;
};

export const signup = async (userData: {
  name: string;
  email: string;
  password: string;
  role: string;
}): Promise<SignUpResponse> => {
  console.log('Signup data:', userData);
  const response = await api.post<SignUpResponse>('/auth/signup', userData);
  return response.data;
};

// Artwork APIs
export const fetchArtworks = async (): Promise<Artwork[]> => {
  const response = await api.get<Artwork[]>('/artworks');
  return response.data;
};

export const createArtwork = async (artworkData: {
  title: string;
  description: string;
  price: number;
  image_url: string;
}): Promise<Artwork> => {
  const response = await api.post<Artwork>('/artworks', artworkData);
  return response.data;
};

// Artist APIs
export const fetchArtists = async (): Promise<Artist[]> => {
  const response = await api.get<Artist[]>('/artists');
  return response.data;
};

// Gallery APIs
export const fetchGalleries = async () => {
  const response = await api.get('/galleries');
  return response.data;
};

// Interceptor to handle auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 