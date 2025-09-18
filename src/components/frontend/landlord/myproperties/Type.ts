interface PropertyImage {
  id: number;
  image: string;
}
interface SelectedImage {
  id: string; // unique id
  fileOrName: File | string;
  preview: string;
  isExisting?: boolean;
}

export interface PropertyTypeResponse {
  id: number;
  user: {
    id: number;
  }
  uuid: string;
  landlord_id: number;
  name: string;
  description: string;
  address: string;
  price: string;
  property_status_id: number;
  property_type_id: number;
  created_at: string;
  favorite: [];
  updated_at: string;
  latitude: string;
  longitude: string;
  images: (string | File)[];
  coverImage?: File | null | string;
  property_image: PropertyImage[];
  property_status: {
    id: number;
    name: string;
  };
  property_type: {
    id: number;
    name: string;
  };
}

export type PropertyTypeCreate = Omit<
  PropertyTypeResponse,
  "landlord_id" | "created_at" | "updated_at"
>;
