export interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    address?: string;
    phone_number?: string;
  };
}

export interface SignUpResponse {
  message: string;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
    address?: string;
    phone_number?: string;
  };
}

export interface Artwork {
  id: number;
  title: string;
  artist: string;
  imageUrl: string;
  description?: string;
  price?: number;
  createdAt?: string;
}

export interface Artist {
  id: number;
  name: string;
  bio?: string;
  imageUrl?: string;
  email: string;
} 