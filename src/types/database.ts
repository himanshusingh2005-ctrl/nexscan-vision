export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  bank_preferences: string[];
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string | null;
  image_url: string | null;
  upc_code: string | null;
  category: string | null;
  created_at: string;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  price: number;
  retailer_name: string;
  source_url: string | null;
  recorded_at: string;
}

export interface Sniper {
  id: string;
  user_id: string;
  product_id: string;
  target_price: number;
  notification_sent: boolean;
  created_at: string;
}
