import { Order } from '../types';

export const DEFAULT_OWNER_WHATSAPP = '0550000000';

/**
 * Normalizes phone numbers to standard WhatsApp format (international digits only).
 * Handles Algerian numbers (05, 06, 07 -> 2135, 2136, 2137), +213, and international formats.
 */
export function formatWhatsAppPhone(phone: string): string {
  if (!phone) return '213550000000';
  const cleaned = phone.replace(/[^0-9]/g, '');
  
  if (cleaned.startsWith('0') && (cleaned.startsWith('05') || cleaned.startsWith('06') || cleaned.startsWith('07') || cleaned.length === 10)) {
    return '213' + cleaned.substring(1);
  }
  if (cleaned.startsWith('213')) {
    return cleaned;
  }
  if (cleaned.length === 9 && (cleaned.startsWith('5') || cleaned.startsWith('6') || cleaned.startsWith('7'))) {
    return '213' + cleaned;
  }
  return cleaned || '213550000000';
}

/**
 * Gets the current store owner's WhatsApp number from localStorage
 */
export function getStoredOwnerWhatsApp(): string {
  try {
    const saved = localStorage.getItem('babyglow_owner_whatsapp');
    if (saved && saved.trim()) {
      return saved.trim();
    }
  } catch {
    // ignore
  }
  return DEFAULT_OWNER_WHATSAPP;
}

/**
 * Saves the store owner's WhatsApp number to localStorage
 */
export function setStoredOwnerWhatsApp(phone: string): void {
  try {
    localStorage.setItem('babyglow_owner_whatsapp', phone.trim());
  } catch {
    // ignore
  }
}

/**
 * Formats a clean, high-conversion WhatsApp message for confirmed orders
 */
export function generateOrderWhatsAppMessage(order: Order): string {
  const deliveryText = order.deliveryType === 'مكتب' 
    ? `🏢 مكتب توصيل (${order.location})` 
    : `🏠 توصيل للمنزل (${order.location})`;

  return `🛍️ *طلب جديد مؤكد من متجر BABY glow* 👶\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔖 *رقم الطلب:* ${order.orderId}\n` +
    `📅 *التوقيت:* ${order.timestamp}\n\n` +
    `📦 *تفاصيل المنتج:* \n` +
    `• *الاسم:* ${order.productName}\n` +
    `• *المقاس واللون:* ${order.size}\n` +
    `• *سعر القطعة:* ${order.productPrice.toLocaleString('ar-DZ')} د.ج\n\n` +
    `👤 *معلومات الزبون:* \n` +
    `• *الاسم الكامل:* ${order.fullName}\n` +
    `• *الهاتف:* ${order.phone}\n` +
    `• *الولاية:* ${order.wilaya}\n` +
    `• *مكان التوصيل:* ${deliveryText}\n` +
    (order.notes ? `• *ملاحظات:* ${order.notes}\n` : '') +
    `\n💵 *المبلغ الإجمالي عند الاستلام:* \n` +
    `• سعر المنتج: ${order.productPrice.toLocaleString('ar-DZ')} د.ج\n` +
    `• مصاريف الشحن: ${order.shippingCost.toLocaleString('ar-DZ')} د.ج\n` +
    `• *المجموع الكلي: ${order.totalAmount.toLocaleString('ar-DZ')} د.ج*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `✅ *طلب مؤكد - يرجى تجهيز الطرد للإرسال*`;
}

/**
 * Generates confirmation message for customer from owner
 */
export function generateCustomerConfirmationMessage(order: Order): string {
  return `مرحباً ${order.fullName} 🌸\n` +
    `نشكرك على ثقتك بمتجر *BABY glow* لملابس المواليد 👶.\n` +
    `تم *تأكيد طلبك رقم (${order.orderId})* بنجاح:\n` +
    `• المنتج: ${order.productName} (${order.size})\n` +
    `• الوجهة: ${order.wilaya} - ${order.deliveryType} (${order.location})\n` +
    `• المبلغ الإجمالي عند الاستلام: ${order.totalAmount.toLocaleString('ar-DZ')} د.ج\n\n` +
    `سيتم تسليم الطرد لشركة التوصيل في أقرب وقت. سنتصل بك عند وصول المندوب. يومك سعيد! 🍼`;
}

/**
 * Directly opens WhatsApp with the confirmed order message
 */
export function sendOrderToWhatsApp(order: Order, targetPhone?: string): void {
  const phone = targetPhone ? formatWhatsAppPhone(targetPhone) : formatWhatsAppPhone(getStoredOwnerWhatsApp());
  const message = generateOrderWhatsAppMessage(order);
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}
