interface TypeProperty {
  id: string;
  name: string;
  location: string;
  price: number;
  type: "apartment" | "house" | "land";
  createdAt: Date;
  updatedAt: Date;
}
