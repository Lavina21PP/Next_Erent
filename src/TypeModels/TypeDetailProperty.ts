interface TypeDetailProperty {
  address: string;
  coverImage: string;
  uuid: string;
  created_at: string;
  description: string;
  id: string;
  landlord_id: number;
  latitude: string;
  longitude: string;
  name: string;
  favorite: [
    {
      id: number;
      property_id: number;
    }
  ];
  price: string;
  rating: [
    {
      id: number;
      score: number;
      comment: string;
      created_at: string;
      property: { name: string };
      user: {
        email_phone: string;
        first_name: string;
        last_name: string;
      };
    }
  ];
  user: {
    id: number;
    email_phone: string;
    first_name: string;
    last_name: string;
  };
  property_image: [{ image: string; alt: string; property_id: number }];
  property_type: { name: string };
  property_type_id: number;
  status: string;
  updated_at: string;
}
