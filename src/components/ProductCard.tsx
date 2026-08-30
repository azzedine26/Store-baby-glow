import React, { useState } from 'react';
import { Product } from '../types';
import { BabyIcon } from './BabyIcons';
import { ImageLightboxModal } from './ImageLightboxModal';
import { ShoppingBag, Eye, CheckCircle2, AlertTriangle, PackageX, PackageCheck, Edit3, Image as ImageIcon, ZoomIn } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onOrder: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  onEdit?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onOrder, 
  onViewDetails, 
  onEdit 
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 3;
  const images = product.images && product.images.length > 0 ? product.images : (product.image ? [product.image] : []);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const displayImage = images[activeImgIndex] || product.image;

  return (
    <>
      <div className={`group bg-white rounded-3xl p-5 sm:p-6 border ${isOutOfStock ? 'border-rose-200/80 opacity-90' : 'border-[#D3E3F0]'} shadow-sm hover:shadow-xl hover:border-[#8EBFDE] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between relative overflow-hidden`}>
        {/* Top Badges */}
        <div className="absolute top-3.5 right-3.5 flex flex-col gap-1 items-end z-10">
          {product.gender && (
            <div
              className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs flex items-center gap-1 ${
                product.gender === 'ذكور'
                  ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
                  : product.gender === 'إناث'
                  ? 'bg-[#FDF2F8] text-[#BE185D] border-[#FBCFE8]'
                  : 'bg-[#F5F3FF] text-[#6D28D9] border-[#DDD6FE]'
              }`}
            >
              <span>{product.gender === 'ذكور' ? '👦 ذكور' : product.gender === 'إناث' ? '👧 إناث' : '👶 للجنسين'}</span>
            </div>
          )}

          {product.tag && (
            <div className="bg-[#FCE7EF] text-[#D86688] text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-[#F7D2DF]">
              {product.tag}
            </div>
          )}

          {images.length > 1 && (
            <div className="bg-[#2E6F9E] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1">
              <ImageIcon className="w-2.5 h-2.5" />
              <span>{images.length} صور</span>
            </div>
          )}

          {product.isCustom && onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              title="تعديل هذا المنتج المضاف"
              className="bg-[#2E6F9E] hover:bg-[#235D86] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Edit3 className="w-2.5 h-2.5 text-[#FDE8F1]" />
              <span>تعديل المنتج</span>
            </button>
          )}
          
          {isOutOfStock ? (
            <div className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
              <PackageX className="w-3 h-3" />
              <span>نفدت الكمية</span>
            </div>
          ) : isLowStock ? (
            <div className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300 flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" />
              <span>متبقي {product.stock} فقط!</span>
            </div>
          ) : (
            <div className="bg-[#EAF3FA] text-[#2E6F9E] text-[10px] font-bold px-2 py-0.5 rounded-md border border-[#D3E3F0] flex items-center gap-1">
              <PackageCheck className="w-3 h-3 text-[#2E6F9E]" />
              <span>متوفر: {product.stock}</span>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div>
          {/* Icon / Image Frame */}
          <div 
            onClick={() => {
              if (images.length > 0) {
                setIsLightboxOpen(true);
              } else {
                onViewDetails(product);
              }
            }}
            className={`w-full h-44 rounded-2xl bg-gradient-to-br ${isOutOfStock ? 'from-[#F0F4F8] to-[#E2E8F0]' : 'from-[#EEF6FC] via-[#FAF3F6] to-[#FCEEF4]'} border border-[#DCE8F2] flex items-center justify-center mb-4 text-[#2E6F9E] group-hover:text-[#D86688] group-hover:scale-[1.02] transition-all cursor-zoom-in relative overflow-hidden`}
          >
            {displayImage ? (
              <img 
                src={displayImage} 
                alt={product.name} 
                className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'grayscale-40 opacity-70' : ''}`}
                referrerPolicy="no-referrer"
              />
            ) : (
              <BabyIcon name={product.icon} className={`w-20 h-20 drop-shadow-xs transition-colors ${isOutOfStock ? 'grayscale-40 opacity-70' : ''}`} />
            )}

            {/* Quick thumbnail dots if multiple images */}
            {images.length > 1 && (
              <div 
                className="absolute bottom-2 right-2.5 flex items-center gap-1 z-10 bg-black/40 backdrop-blur-xs px-2 py-1 rounded-full"
                onClick={(e) => e.stopPropagation()}
              >
                {images.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setActiveImgIndex(dotIdx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                      activeImgIndex === dotIdx ? 'bg-white w-3' : 'bg-white/60 hover:bg-white'
                    }`}
                    title={`صورة ${dotIdx + 1}`}
                  />
                ))}
              </div>
            )}
            
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails(product);
                }}
                className="text-[11px] font-semibold text-[#55738E] bg-white/95 hover:bg-white px-2 py-0.5 rounded-lg border border-[#D3E3F0] flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Eye className="w-3 h-3 text-[#E27D9A]" /> معاينة
              </button>

              {images.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLightboxOpen(true);
                  }}
                  title="تكبير الصورة"
                  className="text-[11px] font-bold text-[#2E6F9E] bg-white/95 hover:bg-[#EEF6FC] px-2 py-0.5 rounded-lg border border-[#D3E3F0] flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <ZoomIn className="w-3 h-3 text-[#2E6F9E]" /> تكبير
                </button>
              )}

              {product.isCustom && onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(product);
                  }}
                  title="تعديل هذا المنتج"
                  className="text-[11px] font-bold text-[#2E6F9E] bg-white/95 hover:bg-[#EEF6FC] px-2 py-0.5 rounded-lg border border-[#D3E3F0] flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  <Edit3 className="w-3 h-3 text-[#D86688]" /> تعديل
                </button>
              )}
            </div>
          </div>

          {/* Category & Title */}
          <div className="mb-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#D86688] uppercase tracking-wider block mb-1">
                {product.category}
              </span>
              {product.isCustom && onEdit && (
                <button
                  onClick={() => onEdit(product)}
                  className="text-[10px] font-bold text-[#2E6F9E] hover:text-[#D86688] flex items-center gap-0.5 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" /> تعديل
                </button>
              )}
            </div>
            <h3 
              onClick={() => onViewDetails(product)}
              className="font-['El_Messiri',serif] font-bold text-lg sm:text-xl text-[#1C2D3D] hover:text-[#2E6F9E] cursor-pointer transition-colors"
            >
              {product.name}
            </h3>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-[13.5px] text-[#617487] leading-relaxed mb-4 line-clamp-2">
            {product.desc}
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className="inline-flex items-center gap-1 text-[11px] text-[#48637B] bg-[#F2F7FC] px-2 py-0.5 rounded-md border border-[#E1ECF4]">
              <CheckCircle2 className="w-3 h-3 text-[#2E6F9E]" />
              {product.fabric.split(' ')[0]} {product.fabric.split(' ')[1] || ''}
            </span>
            <span className="text-[11px] text-[#48637B] bg-[#FDF2F6] px-2 py-0.5 rounded-md border border-[#F9DFE9]">
              {product.sizes[0]}
            </span>
          </div>
        </div>

        {/* Footer / Price & Order */}
        <div className="pt-3.5 border-t-2 border-dashed border-[#D3E3F0] mt-auto">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-xs text-[#617487] font-medium">السعر:</span>
            <div className="font-['El_Messiri',serif] font-bold text-xl sm:text-2xl text-[#235D86]">
              {product.price.toLocaleString('ar-DZ')}{' '}
              <span className="text-xs font-['Tajawal'] font-medium text-[#7E96AC]">د.ج</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={() => onViewDetails(product)}
              title="معاينة التفاصيل والمقاسات"
              className="col-span-1 p-2.5 rounded-xl border border-[#D3E3F0] bg-[#F2F7FC] hover:bg-[#E2EFFB] text-[#2E6F9E] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => !isOutOfStock && onOrder(product)}
              disabled={isOutOfStock}
              className={`col-span-3 font-['Tajawal'] font-bold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xs ${
                isOutOfStock
                  ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed border border-[#CBD5E1]'
                  : 'bg-gradient-to-r from-[#2E6F9E] to-[#235D86] hover:from-[#235D86] hover:to-[#1C4B6E] active:scale-[0.98] text-white hover:shadow-md cursor-pointer'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-[#FDE8F1]" />
              <span>{isOutOfStock ? 'نفد من المخزن' : 'اطلب الآن'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom Modal */}
      {images.length > 0 && (
        <ImageLightboxModal
          isOpen={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
          images={images}
          initialIndex={activeImgIndex}
          title={product.name}
        />
      )}
    </>
  );
};
