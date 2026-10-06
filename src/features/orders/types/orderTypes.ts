export interface OrderItem {
  id?: string;
  order_id: string;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  created_at: string;
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  payment_status: string;
  order_status: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  items: OrderItem[];
}
