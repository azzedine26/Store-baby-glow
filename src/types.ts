export type GenderCategory = 'الكل' | 'ذكور' | 'إناث' | 'للجنسين';

export interface Product {
  id: number;
  name: string;
  desc: string;
  price: number;
  icon: 'onesie' | 'swaddle' | 'hat' | 'socks' | 'romper' | 'pajama' | 'blanket' | 'bib';
  category: string;
  gender?: 'ذكور' | 'إناث' | 'للجنسين';
  image?: string; // Base64 data URL or external URL for uploaded photo (primary cover)
  images?: string[]; // Multiple photos for the product gallery
  tag?: string;
  piecesCount?: number;
  fabric: string;
  colors: string[];
  sizes: string[];
  stock: number; // الكمية المتوفرة في المخزن
  initialStock?: number;
  isCustom?: boolean; // Custom added product flag
}

export type DeliveryType = 'مكتب' | 'منزل';

export type OrderStatus = 'جديد' | 'مؤكد' | 'مرفوض' | 'في الطريق' | 'تم التسليم' | 'ملغى';

export interface Order {
  orderId: string;
  productId: number;
  productName: string;
  productPrice: number;
  size: string;
  fullName: string;
  phone: string;
  deliveryType: DeliveryType;
  wilaya: string;
  location: string;
  notes?: string;
  timestamp: string;
  totalAmount: number;
  shippingCost: number;
  status: OrderStatus;
  rejectionReason?: string; // سبب الرفض إن وجد
}

export interface Wilaya {
  code: string;
  name: string;
  deskShipping: number;
  homeShipping: number;
}
