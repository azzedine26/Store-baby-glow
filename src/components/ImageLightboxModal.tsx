import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronRight, ChevronLeft, Download } from 'lucide-react';

interface ImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex?: number;
  title?: string;
}

export const ImageLightboxModal: React.FC<ImageLightboxModalProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  title
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [scale, setScale] = useState<number>(1);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setScale(1);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, images.length, currentIndex]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  const handleNext = () => {
    setScale(1);
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setScale(1);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.min(prev + 0.35, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((prev) => Math.max(prev - 0.35, 0.75));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0B1520]/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 animate-in fade-in duration-200 select-none"
      onClick={onClose}
    >
      {/* Top Bar Controls */}
      <div
        className="flex items-center justify-between gap-3 text-white z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="إغلاق (Esc)"
          >
            <X className="w-6 h-6" />
          </button>

          {title && (
            <div className="hidden sm:block">
              <h4 className="text-sm font-bold text-white max-w-sm truncate">{title}</h4>
              <p className="text-[11px] text-gray-300">
                الصورة {currentIndex + 1} من أصل {images.length}
              </p>
            </div>
          )}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2 py-1 rounded-2xl border border-white/10">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="تكبير الصورة (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-xl hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="تصغير الصورة (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          {scale !== 1 && (
            <button
              onClick={handleResetZoom}
              className="p-2 rounded-xl hover:bg-white/20 text-[#93C5FD] transition-colors flex items-center gap-1 text-xs cursor-pointer font-bold"
              title="إعادة الحجم الافتراضي"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>100%</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="relative flex-1 flex items-center justify-center overflow-hidden my-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation Arrow Previous */}
        {images.length > 1 && (
          <button
            onClick={handlePrev}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white shadow-xl flex items-center justify-center transition-all backdrop-blur-xs cursor-pointer z-20 border border-white/20"
            title="الصورة السابقة"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* The Zoomable Image */}
        <div
          className="max-w-full max-h-full flex items-center justify-center p-2 transition-transform duration-200 cursor-zoom-in"
          style={{ transform: `scale(${scale})` }}
          onClick={() => setScale((prev) => (prev === 1 ? 1.75 : 1))}
        >
          <img
            src={currentImage}
            alt={title || 'صورة المنتج بحجم كبير'}
            className="max-h-[75vh] sm:max-h-[82vh] max-w-full object-contain rounded-2xl shadow-2xl drop-shadow-2xl select-none"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Navigation Arrow Next */}
        {images.length > 1 && (
          <button
            onClick={handleNext}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-white shadow-xl flex items-center justify-center transition-all backdrop-blur-xs cursor-pointer z-20 border border-white/20"
            title="الصورة التالية"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      <div
        className="flex items-center justify-center gap-2 overflow-x-auto py-2 z-20"
        onClick={(e) => e.stopPropagation()}
      >
        {images.length > 1 && (
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/15 max-w-full overflow-x-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setScale(1);
                  setCurrentIndex(idx);
                }}
                className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  currentIndex === idx
                    ? 'border-[#93C5FD] ring-2 ring-[#3B82F6] scale-105 shadow-md'
                    : 'border-white/20 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={img}
                  alt={`مصغرة ${idx + 1}`}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
