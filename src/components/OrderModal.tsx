import React, { useState, useEffect } from 'react';
import { Product, Order, DeliveryType } from '../types';
import { WILAYAS } from '../data/wilayas';
import { BabyIcon } from './BabyIcons';
import { X, CheckCircle2, Copy, MessageCircle, Phone, MapPin, Building2, Home, Truck, ShieldCheck, Tag, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sendOrderToWhatsApp, generateOrderWhatsAppMessage, formatWhatsAppPhone, getStoredOwnerWhatsApp } from '../utils/whatsapp';

interface OrderModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
  ownerWhatsApp?: string;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  product,
  isOpen,
  onClose,
  onOrderCreated,
  ownerWhatsApp
}) => {
  const [size, setSize] = useState<string>(product?.sizes[0] || '0-3 أشهر');
  const [selectedColor, setSelectedColor] = useState<string>(product?.colors[0] || '');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('مكتب');
  const [selectedWilayaCode, setSelectedWilayaCode] = useState<string>('16'); // Default Alger (16)
  const [location, setLocation] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [submittedOrder, setSubmittedOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);

  const targetWhatsApp = ownerWhatsApp || getStoredOwnerWhatsApp();

  // Sync default size/color when product changes
  useEffect(() => {
    if (product) {
      setSize(product.sizes[0] || '0-3 أشهر');
      setSelectedColor(product.colors[0] || '');
      setSubmittedOrder(null);
      setErrorMessage('');
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const currentWilaya = WILAYAS.find(w => w.code === selectedWilayaCode) || WILAYAS[15];
  const shippingCost = deliveryType === 'مكتب' ? currentWilaya.deskShipping : currentWilaya.homeShipping;
  const totalAmount = product.price + shippingCost;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9\s]/g, '');
    setPhone(val);
  };

  const validatePhone = (num: string) => {
    const cleaned = num.replace(/\s+/g, '');
    return /^(05|06|07)[0-9]{8}$/.test(cleaned);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (product.stock <= 0) {
      setErrorMessage('عذراً، هذه القطعة نفدت من المخزن للتو ولا يمكن إتمام الطلب.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('يرجى إدخال الاسم واللقب الكامل.');
      return;
    }

    if (!validatePhone(phone)) {
      setErrorMessage('يرجى إدخال رقم هاتف جزائري صحيح يبدأ بـ 05 أو 06 أو 07 مكون من 10 أرقام.');
      return;
    }

    if (!location.trim()) {
      setErrorMessage(deliveryType === 'مكتب' ? 'يرجى تحديد اسم أو بلدية مكتب التوصيل.' : 'يرجى كتابة عنوان المنزل بالتفصيل.');
      return;
    }

    const orderId = 'BG-' + Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      orderId,
      productId: product.id,
      productName: product.name,
      productPrice: product.price,
      size: `${size}${selectedColor ? ` (${selectedColor})` : ''}`,
      fullName: fullName.trim(),
      phone: phone.trim(),
      deliveryType,
      wilaya: currentWilaya.name,
      location: location.trim(),
      notes: notes.trim() || undefined,
      timestamp: new Date().toLocaleString('ar-DZ', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }),
      shippingCost,
      totalAmount,
      status: 'جديد'
    };

    // Save order in system
    onOrderCreated(newOrder);
    setSubmittedOrder(newOrder);

    // Direct automated forwarding to WhatsApp
    try {
      sendOrderToWhatsApp(newOrder, targetWhatsApp);
    } catch {
      // ignore
    }

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#2E6F9E', '#E27D9A', '#5B9FD1', '#FCE7EF', '#D86688']
      });
    } catch {
      // ignore
    }
  };

  const copyOrderId = () => {
    if (submittedOrder) {
      navigator.clipboard.writeText(submittedOrder.orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const copyFullMessage = () => {
    if (submittedOrder) {
      const msg = generateOrderWhatsAppMessage(submittedOrder);
      navigator.clipboard.writeText(msg);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    }
  };

  const shareOnWhatsApp = () => {
    if (!submittedOrder) return;
    sendOrderToWhatsApp(submittedOrder, targetWhatsApp);
  };

  return (
    <div className="fixed inset-0 bg-[#0E1E2E]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-7 border border-[#D3E3F0] shadow-2xl relative max-h-[92vh] overflow-y-auto my-auto text-right"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-[#F2F7FC] hover:bg-[#E2EFFB] text-[#55738E] hover:text-[#1C2D3D] flex items-center justify-center transition-colors text-lg font-bold z-10 border border-[#D3E3F0]"
        >
          <X className="w-5 h-5" />
        </button>

        {submittedOrder ? (
          /* SUCCESS VIEW */
          <div className="text-center py-4 sm:py-6">
            <div className="w-16 h-16 rounded-full bg-[#EBF5FD] text-[#2E6F9E] border-2 border-[#8EBFDE] flex items-center justify-center mx-auto mb-4 animate-bounce shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="text-xs font-bold text-[#25D366] bg-[#E9F9EE] px-3.5 py-1 rounded-full border border-[#B9E9C6] inline-flex items-center gap-1.5 mb-2">
              <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
              <span>تم تأكيد الطلب وتحويله إلى واتساب مباشرة! 🎉</span>
            </span>

            <h3 className="font-['El_Messiri',serif] font-bold text-2xl text-[#1C4263] mb-2">
              شكراً لثقتكم بمتجر BABY glow
            </h3>

            <p className="text-xs sm:text-sm text-[#617487] max-w-sm mx-auto mb-4 leading-relaxed">
              تم إرسال تفاصيل طلبيتك إلى واتساب المتجر لتسريع المعالجة، وسيقوم فريقنا بالاتصال بكم هاتفياً على الرقم <b className="text-[#1C2D3D] font-sans" dir="ltr">{submittedOrder.phone}</b> لتأكيد الشحن.
            </p>

            {/* Order Summary Card */}
            <div className="bg-[#F2F7FC] rounded-2xl p-4 border border-[#D3E3F0] text-right mb-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#D3E3F0] mb-3">
                <span className="text-xs text-[#617487]">رمز الطلب الخاص بك:</span>
                <button
                  onClick={copyOrderId}
                  className="flex items-center gap-1.5 font-['El_Messiri',serif] font-bold text-sm text-[#235D86] bg-white px-3 py-1 rounded-xl border border-[#D3E3F0] hover:bg-[#E2EFFB] transition-colors shadow-2xs"
                >
                  <span>{submittedOrder.orderId}</span>
                  <Copy className="w-3.5 h-3.5 text-[#2E6F9E]" />
                  {copied && <span className="text-[10px] text-[#2E6F9E] font-bold">تم النسخ!</span>}
                </button>
              </div>

              <div className="space-y-1.5 text-xs text-[#55697D]">
                <div className="flex justify-between">
                  <span>المنتج:</span>
                  <span className="font-bold text-[#1C2D3D]">{submittedOrder.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span>المقاس واللون:</span>
                  <span className="font-bold text-[#1C2D3D]">{submittedOrder.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>المستلم:</span>
                  <span className="font-bold text-[#1C2D3D]">{submittedOrder.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span>الوجهة:</span>
                  <span className="font-bold text-[#1C2D3D]">{submittedOrder.wilaya} ({submittedOrder.deliveryType})</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#D3E3F0] text-sm font-bold text-[#235D86]">
                  <span>المبلغ الإجمالي عند الاستلام:</span>
                  <span className="font-['El_Messiri',serif] text-base">{submittedOrder.totalAmount.toLocaleString('ar-DZ')} د.ج</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2.5">
              <button
                onClick={shareOnWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>📱 فتح المحادثة على واتساب المتجر وإرسال الطلب</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={copyFullMessage}
                  className="flex-1 bg-white hover:bg-[#F2F7FC] text-[#2E6F9E] border border-[#D3E3F0] font-bold py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 text-xs transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedMessage ? 'تم نسخ نص الطلب!' : 'نسخ نص الفاتورة'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 bg-[#2E6F9E] hover:bg-[#235D86] text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  متابعة التسوق
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ORDER FORM VIEW */
          <div>
            {/* Header: Product Preview */}
            <div className="flex items-center gap-4 pb-4 mb-5 border-b-2 border-dashed border-[#D3E3F0]">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EEF6FC] via-[#FAF3F6] to-[#FCEEF4] border border-[#DCE8F2] flex items-center justify-center text-[#2E6F9E] shrink-0 overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <BabyIcon name={product.icon} className="w-9 h-9" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-[#D86688] block mb-0.5">طلب سريع</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${product.stock <= 3 ? 'bg-amber-100 text-amber-800' : 'bg-[#EAF3FA] text-[#2E6F9E]'}`}>
                    المتبقي بالمخزن: {product.stock} قطعة
                  </span>
                </div>
                <h3 className="font-['El_Messiri',serif] font-bold text-lg text-[#1C2D3D] truncate">
                  {product.name}
                </h3>
                <div className="font-['El_Messiri',serif] font-bold text-base text-[#235D86]">
                  {product.price.toLocaleString('ar-DZ')}{' '}
                  <span className="text-xs font-['Tajawal'] font-medium text-[#7E96AC]">د.ج</span>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-right">
              {/* Size & Color Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#55697D] mb-1.5">
                    اختر المقاس:
                  </label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D3E3F0] bg-white text-xs sm:text-sm font-medium text-[#1C2D3D] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E]"
                  >
                    {product.sizes.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                {product.colors && product.colors.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-[#55697D] mb-1.5">
                      درجة اللون:
                    </label>
                    <select
                      value={selectedColor}
                      onChange={(e) => setSelectedColor(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#D3E3F0] bg-white text-xs sm:text-sm font-medium text-[#1C2D3D] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E]"
                    >
                      {product.colors.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#55697D] mb-1.5">
                  الاسم الكامل واللقب: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أمينة بلقاسم أو محمد بن عيسى"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D3E3F0] bg-white text-xs sm:text-sm text-[#1C2D3D] placeholder-[#8A9EB1] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E]"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-bold text-[#55697D] mb-1.5">
                  رقم الهاتف (لتأكيد الطلب): <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    placeholder="05 / 06 / 07 xx xx xx xx"
                    value={phone}
                    onChange={handlePhoneChange}
                    className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-[#D3E3F0] bg-white text-xs sm:text-sm font-mono text-[#1C2D3D] placeholder-[#8A9EB1] text-right focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E]"
                  />
                  <Phone className="w-4 h-4 text-[#8A9EB1] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[11px] text-[#617487] mt-1">
                  سنرسل لك رسالة أو نتصل بك قبل إرسال الطرد مباشرة.
                </p>
              </div>

              {/* Delivery Type Toggle */}
              <div>
                <label className="block text-xs font-bold text-[#55697D] mb-1.5">
                  طريقة الاستلام والتوصيل:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('مكتب')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                      deliveryType === 'مكتب'
                        ? 'border-[#2E6F9E] bg-[#EAF3FA] text-[#235D86] ring-1 ring-[#2E6F9E]'
                        : 'border-[#D3E3F0] bg-white text-[#617487] hover:bg-[#F2F7FC]'
                    }`}
                  >
                    <Building2 className="w-5 h-5 text-[#2E6F9E]" />
                    <span>🏢 مكتب توصيل (يالدين)</span>
                    <span className="text-[10px] text-[#55738E] font-normal">سعر اقتصادي وسريع</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('منزل')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-bold ${
                      deliveryType === 'منزل'
                        ? 'border-[#2E6F9E] bg-[#EAF3FA] text-[#235D86] ring-1 ring-[#2E6F9E]'
                        : 'border-[#D3E3F0] bg-white text-[#617487] hover:bg-[#F2F7FC]'
                    }`}
                  >
                    <Home className="w-5 h-5 text-[#2E6F9E]" />
                    <span>🏠 التوصيل حتى باب المنزل</span>
                    <span className="text-[10px] text-[#55738E] font-normal">استلام مريح ومباشر</span>
                  </button>
                </div>
              </div>

              {/* Wilaya Selection */}
              <div>
                <label className="block text-xs font-bold text-[#55697D] mb-1.5">
                  الولاية (58 ولاية): <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedWilayaCode}
                  onChange={(e) => setSelectedWilayaCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D3E3F0] bg-white text-xs sm:text-sm font-medium text-[#1C2D3D] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E]"
                >
                  {WILAYAS.map((w) => (
                    <option key={w.code} value={w.code}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location Detail Input */}
              <div>
                <label className="block text-xs font-bold text-[#55697D] mb-1.5">
                  {deliveryType === 'مكتب' ? 'اسم مكتب التوصيل / البلدية:' : 'عنوان المنزل والبلدية بالتفصيل:'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={
                      deliveryType === 'مكتب'
                        ? 'مثال: مكتب يالدين زرالدة أو مكتب باب الزوار'
                        : 'مثال: حي النور، عمارة 4، الشارع الرئيسي، الأبيار'
                    }
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3.5 py-2.5 pl-10 rounded-xl border border-[#D3E3F0] bg-white text-xs sm:text-sm text-[#1C2D3D] placeholder-[#8A9EB1] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E]"
                  />
                  <MapPin className="w-4 h-4 text-[#8A9EB1] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Optional Gift Note */}
              <div>
                <label className="block text-xs font-bold text-[#55697D] mb-1.5">
                  ملاحظة إضافية أو كتابة بطاقة هدية (اختياري):
                </label>
                <input
                  type="text"
                  placeholder="مثال: يرجى التغليف كهدية لمولود جديد مع كتابة تهنئة"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#D3E3F0] bg-white text-xs text-[#1C2D3D] placeholder-[#8A9EB1] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E]"
                />
              </div>

              {/* Order Cost Breakdown Box */}
              <div className="bg-[#F2F7FC] rounded-2xl p-3.5 border border-[#D3E3F0] space-y-1.5 text-xs text-[#55697D]">
                <div className="flex justify-between">
                  <span>سعر المنتج:</span>
                  <span className="font-bold text-[#1C2D3D]">{product.price.toLocaleString('ar-DZ')} د.ج</span>
                </div>
                <div className="flex justify-between">
                  <span>توصيل {deliveryType === 'مكتب' ? 'مكتب' : 'منزل'} ({currentWilaya.name.split(' - ')[1]}):</span>
                  <span className="font-bold text-[#2E6F9E]">{shippingCost.toLocaleString('ar-DZ')} د.ج</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[#D3E3F0] text-sm font-bold text-[#235D86]">
                  <span>المبلغ الإجمالي عند الاستلام:</span>
                  <span className="font-['El_Messiri',serif] text-base text-[#235D86]">
                    {totalAmount.toLocaleString('ar-DZ')} د.ج
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {errorMessage}
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#2E6F9E] to-[#235D86] hover:from-[#235D86] hover:to-[#1C4B6E] active:scale-[0.99] text-white font-bold py-3.5 px-4 rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5 text-[#FDE8F1]" />
                <span>تأكيد الطلب الآن (الدفع عند الاستلام)</span>
              </button>

              <p className="text-[11px] text-[#617487] text-center">
                🔒 بياناتك محمية تماماً وتُستخدم فقط لمعالجة شحن طلبك.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
