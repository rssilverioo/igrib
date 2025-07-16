export interface Product {
  id: number;
  name: string;
  producer: string;
  location: string;
  rating: number;
  reviews: number;
  image: string;
  price: string;
  available: string;
  description: string;
  specifications: {
    [key: string]: string;
  };
  type: string;
}

export interface DeliveryOptionProps {
  icon: any;
  title: string;
  description: string;
  price?: string;
  selected: boolean;
  onSelect: () => void;
}