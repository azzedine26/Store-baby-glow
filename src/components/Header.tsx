import React from 'react';
import { ClipboardList, MessageCircleHeart, PlusCircle } from 'lucide-react';
import { Logo } from './Logo';

interface HeaderProps {
  ordersCount: number;
  onOpenOwnerPanel: () => void;
  onOpenAddProduct: () => void;
}

export const Header: React.FC<HeaderProps> = ({ ordersCount, onOpenOwnerPanel, onOpenAddProduct }) => {
  return (
    <header className="w-full border-b border-[#D6E4F0] bg-white/90 backdrop-blur-md sticky top-0 z-30 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Logo size="md" />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add / Upload Product Button */}
          <button
            id="add-product-header-btn"
            onClick={onOpenAddProduct}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#2E6F9E] to-[#235D86] hover:from-[#235D86] hover:to-[#1C4B6E] active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-[#FDE8F1]" />
            <span>تحميل منتج مع صورة</span>
          </button>

          <a
            href="https://wa.me/213550000000?text=%D8%B3%D9%84%D8%A7%D9%85%20%D8%B9%D9%84%D9%8A%D9%83%D9%85%D8%8C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%85%D9%84%D8%A7%D8%A8%D8%B3%20BABY%20glow"
            target="_blank"
            rel="noreferrer"
            className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#2E6F9E] bg-[#F2F7FC] border border-[#D3E3F0] hover:bg-[#E2EFFB] transition-colors"
          >
            <MessageCircleHeart className="w-3.5 h-3.5 text-[#E27D9A]" />
            <span>خدمة الزبائن</span>
          </a>

          <button
            id="owner-panel-trigger"
            onClick={onOpenOwnerPanel}
            className="relative inline-flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#235D86] bg-white border border-[#D3E3F0] hover:bg-[#F2F7FC] active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <ClipboardList className="w-4 h-4 text-[#2E6F9E]" />
            <span className="hidden sm:inline">الطلبات والمخزن</span>
            {ordersCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-black text-white bg-gradient-to-r from-[#E27D9A] to-[#D86688] rounded-full shadow-2xs">
                {ordersCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
