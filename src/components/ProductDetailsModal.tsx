import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { BabyIcon } from './BabyIcons';
import { ImageLightboxModal } from './ImageLightboxModal';
import { X, CheckCircle2, Sparkles, ShoppingBag, AlertTriangle, PackageX, PackageCheck, Edit3, ChevronRight, ChevronLeft, Image as ImageIcon, ZoomIn } from 'lucide-react';

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOrder: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
  onOrder,
  onEditProduct
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setIsLightboxOpen(false);
  }, [product?.id]);

  if (!isOpen || !product) return null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;

  // Determine all available images
  const allImages: string[] = product.images && product.images.length > 0 
    ? product.images 
    : (product.image ? [product.image] : []);

  const currentDisplayImage = allImages[activeImageIndex] || product.image;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#0E1E2E]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
        <div 
          className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-7 border border-[#D3E3F0] shadow-2xl relative max-h-[92vh] overflow-y-auto my-auto text-right"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-[#F2F7FC] hover:bg-[#E2EFFB] text-[#55738E] hover:text-[#1C2D3D] flex items-center justify-center transition-colors text-lg font-bold z-20 border border-[#D3E3F0] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Product Visual Header / Gallery */}
          <div className="mb-5">
            <div 
              onClick={() => {
                if (allImages.length > 0) {
                  setIsLightboxOpen(true);
                }
              }}
              className={`w-full h-56 sm:h-64 rounded-2xl bg-gradient-to-br from-[#EEF6FC] via-[#FAF3F6] to-[#FCEEF4] border border-[#DCE8F2] flex items-center justify-center text-[#2E6F9E] relative overflow-hidden group ${
                allImages.length > 0 ? 'cursor-zoom-in' : ''
              }`}
            >
              {currentDisplayImage ? (
                <img
                  src={currentDisplayImage}
                  alt={`${product.name} - صورة ${activeImageIndex + 1}`}
                  className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <BabyIcon name={product.icon} className="w-24 h-24 drop-shadow-sm" />
              )}

              {/* Zoom hint overlay */}
              {allImages.length > 0 && (
                <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 shadow-xs">
                    <ZoomIn className="w-3.5 h-3.5 text-blue-300" />
                    <span>اضغط لتكبير الصورة 🔍</span>
                  </span>
                </div>
              )}

              {/* Badges Overlay */}
              <div className="absolute top-3 right-3 flex flex-col gap-1 items-end z-10 pointer-events-none">
                {product.gender && (
                  <span
                    className={`text-xs font-black px-3 py-1 rounded-full border shadow-xs flex items-center gap-1 ${
                      product.gender === 'ذكور'
                        ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                        : product.gender === 'إناث'
                        ? 'bg-[#FDF2F8] text-[#BE185D] border-[#FBCFE8]'
                        : 'bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]'
                    }`}
                  >
                    {product.gender === 'ذكور' ? '👦 مخصص للذكور' : product.gender === 'إناث' ? '👧 مخصص للإناث' : '👶 مناسب للجنسين'}
                  </span>
                )}
                {product.tag && (
                  <span className="bg-[#FCE7EF] text-[#D86688] text-xs font-bold px-3 py-1 rounded-full border border-[#F7D2DF]">
                    {product.tag}
                  </span>
                )}
                {isOutOfStock ? (
                  <span className="bg-rose-100 text-rose-800 text-xs font-bold px-3 py-1 rounded-full border border-rose-300 flex items-center gap-1">
                    <PackageX className="w-3.5 h-3.5" /> نفدت الكمية
                  </span>
                ) : isLowStock ? (
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-300 flex items-center gap-1 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" /> متبقي {product.stock} فقط
                  </span>
                ) : (
                  <span className="bg-[#EAF3FA] text-[#2E6F9E] text-xs font-bold px-3 py-1 rounded-full border border-[#D3E3F0] flex items-center gap-1">
                    <PackageCheck className="w-3.5 h-3.5" /> متوفر ({product.stock} قطعة)
                  </span>
                )}
              </div>

              {/* Navigation Arrows for Multiple Images */}
              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1C2D3D] shadow-md border border-[#D3E3F0] flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer z-10"
                    title="الصورة التالية"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1C2D3D] shadow-md border border-[#D3E3F0] flex items-center justify-center transition-all opacity-80 hover:opacity-100 cursor-pointer z-10"
                    title="الصورة السابقة"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  {/* Counter Pill */}
                  <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xs z-10 pointer-events-none">
                    <ImageIcon className="w-3 h-3 text-[#FCE7EF]" />
                    <span>{activeImageIndex + 1} / {allImages.length}</span>
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Gallery Row */}
            {allImages.length > 1 && (
              <div className="flex items-center gap-2 mt-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#2E6F9E] ring-2 ring-[#93C5FD] scale-105 shadow-sm'
                        : 'border-[#D3E3F0] opacity-70 hover:opacity-100 hover:border-[#8EBFDE]'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`مصغرة ${idx + 1}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {idx === 0 && (
                      <span className="absolute top-0 right-0 bg-[#2E6F9E] text-white text-[8px] font-black px-1 rounded-bl">
                        رئيسية
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

        {/* Title and Category */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#D86688] uppercase tracking-wider block mb-1">
              {product.category}
            </span>
            {onEditProduct && (
              <button
                onClick={() => {
                  onClose();
                  onEditProduct(product);
                }}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#2E6F9E] bg-[#EEF6FC] hover:bg-[#E2EFFB] px-2.5 py-1 rounded-lg border border-[#D3E3F0] transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#D86688]" />
                <span>تعديل هذا المنتج</span>
              </button>
            )}
          </div>
          <h2 className="font-['El_Messiri',serif] font-bold text-2xl text-[#1C2D3D] mb-2">
            {product.name}
          </h2>
          <div className="font-['El_Messiri',serif] font-bold text-2xl text-[#235D86]">
            {product.price.toLocaleString('ar-DZ')}{' '}
            <span className="text-sm font-['Tajawal'] font-medium text-[#7E96AC]">د.ج</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[#617487] leading-relaxed mb-5 pb-4 border-b border-[#D3E3F0]">
          {product.desc}
        </p>

        {/* Key Features & Fabric Specifications */}
        <div className="space-y-3 mb-6 bg-[#F2F7FC] rounded-2xl p-4 border border-[#D3E3F0]">
          <h4 className="text-xs font-bold text-[#235D86] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E27D9A]" />
            <span>مواصفات القطعة والعناية بها:</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#55697D]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E6F9E] shrink-0" />
              <span><b>الفئة / الجنس:</b> {product.gender === 'ذكور' ? '👦 ذكور (أولاد)' : product.gender === 'إناث' ? '👧 إناث (بنات)' : '👶 مناسب للجنسين'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E6F9E] shrink-0" />
              <span><b>نوع القماش:</b> {product.fabric}</span>
            </div>
            {product.piecesCount && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2E6F9E] shrink-0" />
                <span><b>عدد القطع:</b> {product.piecesCount} قطع متناسقة</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E6F9E] shrink-0" />
              <span><b>الكمية المتاحة:</b> <b className={isOutOfStock ? 'text-rose-600' : 'text-[#235D86]'}>{product.stock} قطعة</b></span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E6F9E] shrink-0" />
              <span><b>المقاسات:</b> {product.sizes.join(' · ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E6F9E] shrink-0" />
              <span><b>الألوان المتوفرة:</b> {product.colors.join(' · ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E6F9E] shrink-0" />
              <span><b>الغسيل:</b> غسيل لطيف 30° مئوية</span>
            </div>
          </div>
        </div>

        {/* Direct Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (!isOutOfStock) {
                onClose();
                onOrder(product);
              }
            }}
            disabled={isOutOfStock}
            className={`flex-1 font-bold py-3 px-5 rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md transition-all ${
              isOutOfStock
                ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed border border-[#CBD5E1]'
                : 'bg-gradient-to-r from-[#2E6F9E] to-[#235D86] hover:from-[#235D86] hover:to-[#1C4B6E] text-white cursor-pointer hover:shadow-lg'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#FDE8F1]" />
            <span>{isOutOfStock ? 'غير متوفر حالياً في المخزن' : 'طلب هذه القطعة الآن'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-3 rounded-2xl border border-[#D3E3F0] text-xs font-bold text-[#55738E] hover:bg-[#F2F7FC] transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

        {/* If custom product, show quick edit button */}
        {product.isCustom && onEditProduct && (
          <div className="mt-3 pt-3 border-t border-[#EEF2F6]">
            <button
              onClick={() => {
                onClose();
                onEditProduct(product);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#EEF6FC] hover:bg-[#E2EFFB] border border-[#D3E3F0] text-[#2E6F9E] text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-[#D86688]" />
              <span>تعديل بيانات وصور هذا المنتج</span>
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Lightbox / Zoom modal */}
    {allImages.length > 0 && (
      <ImageLightboxModal
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        images={allImages}
        initialIndex={activeImageIndex}
        title={product.name}
      />
    )}
  </>
  );
};
