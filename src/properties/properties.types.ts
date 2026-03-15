export interface AddPropertyRequest {
  name: string;
  address: string;
  typeProperties: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  totalFloors?: string;
  totalUnits?: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface EditPropertyRequest {
  name?: string;
  address?: string;
  typeProperties?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  totalFloors?: string;
  totalUnits?: string;
  description?: string;
  thumbnailUrl?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export interface Property {
  id: string;
  ownerId: string;
  name: string;
  address: string;
  typeProperties: string;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
  totalFloors?: string | null;
  totalUnits?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt?: Date | null;
}
