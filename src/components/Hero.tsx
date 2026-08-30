import React from 'react';
import { ShieldCheck, Truck, Sparkles, HeartHandshake, Baby, Image as ImageIcon, UserCheck } from 'lucide-react';
import logoImage from '../assets/images/baby_glow_logo_1787930092615.jpg';
import { GenderCategory } from '../types';

interface HeroProps {
  selectedGender: GenderCategory;
  onSelectGender: (gender: GenderCategory) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: string[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  customCount?: number;
  boysCount?: number;
  girlsCount?: number;
  unisexCount?: number;
}

export const Hero: React.FC<HeroProps> = ({
  selectedGender,
  onSelectGender,
  selectedCategory,
  onSelectCategory,
  categories,
  searchQuery,
  onSearchChange,
  customCount = 0,
  boysCount = 0,
  girlsCount = 0,
  unisexCount = 0
}) => {
  return (
    <section className="relative pt-6 sm:pt-10 pb-16 sm:pb-24 text-center overflow-hidden bg-gradient-to-b from-[#EBF4FC] via-[#FDF2F6] to-[#F2F7FC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Brand Logo Avatar in Hero */}
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-white/90 border-2 border-[#F7D2DF] shadow-lg flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
            <img
              src={logoImage}
              alt="BABY glow Logo"
              className="w-full h-full object-cover rounded-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Eyebrow badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#F7D2DF] text-[#235D86] font-bold text-xs sm:text-sm tracking-wide mb-4 shadow-xs">
          <Baby className="w-4 h-4 text-[#E27D9A]" />
          <span>متجر BABY glow — ملابس مولودك الأولى في الجزائر</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E27D9A]" />
          <span className="text-[#D86688]">قطن 100% فائق النعومة</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-['El_Messiri',serif] text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-bold text-[#1C4263] leading-[1.25] max-w-3xl mx-auto mb-4 tracking-tight">
          لَفَّةٌ دَافِئَةٌ مِنَ القُطْنِ، صُمِّمَتْ لِأَوَّلِ أَيَّامِهِ
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-[#55697D] text-base sm:text-lg leading-relaxed mb-6 font-medium">
          تشكيلة مختارة بعناية لحماية بشرة حديثي الولادة الحساسة — اختاري القطعة المناسبة لمولودك، سجّلي بياناتك، ونتولى التوصيل حتى باب منزلك أو أقرب مكتب في ولايتك مع الدفع عند الاستلام.
        </p>

        {/* PROMINENT GENDER SELECTION TABS (ذكور 👦 / إناث 👧) */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="bg-white/95 p-1.5 sm:p-2 rounded-3xl border-2 border-[#D3E3F0] shadow-md flex items-center justify-between gap-1.5">
            {/* All */}
            <button
              onClick={() => onSelectGender('الكل')}
              className={`flex-1 py-2.5 sm:py-3 px-2 rounded-2xl text-xs sm:text-sm font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
                selectedGender === 'الكل'
                  ? 'bg-gradient-to-r from-[#2E6F9E] to-[#235D86] text-white shadow-md scale-[1.02]'
                  : 'text-[#55738E] hover:bg-[#F2F7FC] hover:text-[#1C2D3D]'
              }`}
            >
              <span>🌟 الكل</span>
            </button>

            {/* Boys (ذكور) */}
            <button
              onClick={() => onSelectGender('ذكور')}
              className={`flex-1 py-2.5 sm:py-3 px-2 rounded-2xl text-xs sm:text-sm font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
                selectedGender === 'ذكور'
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] text-white shadow-md ring-2 ring-[#93C5FD] scale-[1.02]'
                  : 'text-[#1E40AF] bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE]'
              }`}
            >
              <span className="text-base sm:text-lg">👦</span>
              <span>خانة الذكور</span>
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${selectedGender === 'ذكور' ? 'bg-white/30 text-white' : 'bg-[#DBEAFE] text-[#1E40AF]'}`}>
                {boysCount}
              </span>
            </button>

            {/* Girls (إناث) */}
            <button
              onClick={() => onSelectGender('إناث')}
              className={`flex-1 py-2.5 sm:py-3 px-2 rounded-2xl text-xs sm:text-sm font-black transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
                selectedGender === 'إناث'
                  ? 'bg-gradient-to-r from-[#D86688] to-[#BE185D] text-white shadow-md ring-2 ring-[#FBCFE8] scale-[1.02]'
                  : 'text-[#BE185D] bg-[#FDF2F8] hover:bg-[#FCE7F3] border border-[#FBCFE8]'
              }`}
            >
              <span className="text-base sm:text-lg">👧</span>
              <span>خانة الإناث</span>
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${selectedGender === 'إناث' ? 'bg-white/30 text-white' : 'bg-[#FCE7F3] text-[#BE185D]'}`}>
                {girlsCount}
              </span>
            </button>

            {/* Unisex */}
            <button
              onClick={() => onSelectGender('للجنسين')}
              className={`flex-1 py-2.5 sm:py-3 px-2 rounded-2xl text-xs sm:text-sm font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
                selectedGender === 'للجنسين'
                  ? 'bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white shadow-md scale-[1.02]'
                  : 'text-[#6D28D9] bg-[#F5F3FF] hover:bg-[#EDE9FE] border border-[#DDD6FE]'
              }`}
            >
              <span>👶 للجنسين</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${selectedGender === 'للجنسين' ? 'bg-white/30 text-white' : 'bg-[#EDE9FE] text-[#6D28D9]'}`}>
                {unisexCount}
              </span>
            </button>
          </div>
        </div>

        {/* Highlights badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mb-8 text-right sm:text-center">
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/95 border border-[#D3E3F0] shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-[#E2F0FC] flex items-center justify-center text-[#2E6F9E] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C2D3D]">100% قطن طبيعي</p>
              <p className="text-[11px] text-[#617487]">ناعم ومضاد للتحسس</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/95 border border-[#D3E3F0] shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-[#FCE7EF] flex items-center justify-center text-[#D86688] shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C2D3D]">توصيل لـ 58 ولاية</p>
              <p className="text-[11px] text-[#617487]">للمنزل أو مكتب يالدين</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/95 border border-[#D3E3F0] shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-[#E2F0FC] flex items-center justify-center text-[#2E6F9E] shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C2D3D]">دفع عند الاستلام</p>
              <p className="text-[11px] text-[#617487]">تفقّد طلبك قبل الدفع</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/95 border border-[#D3E3F0] shadow-xs">
            <div className="w-8 h-8 rounded-xl bg-[#FCE7EF] flex items-center justify-center text-[#D86688] shrink-0">
              <HeartHandshake className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C2D3D]">تغليف هدية راقي</p>
              <p className="text-[11px] text-[#617487]">جاهز لتهنئة المولود</p>
            </div>
          </div>
        </div>

        {/* Search & Category Filter pills */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-3xl mx-auto">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن قطعة (طقم، رومبير، قفازات...)"
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-[#D3E3F0] rounded-xl text-[#1C2D3D] placeholder-[#8A9EB1] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E] transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8A9EB1] hover:text-[#1C2D3D]"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <button
              onClick={() => onSelectCategory('الكل')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === 'الكل'
                  ? 'bg-gradient-to-r from-[#2E6F9E] to-[#235D86] text-white shadow-xs'
                  : 'bg-white text-[#55738E] border border-[#D3E3F0] hover:bg-[#F2F7FC]'
              }`}
            >
              كافة الأقسام
            </button>

            {customCount > 0 && (
              <button
                onClick={() => onSelectCategory('منتجاتي المحمّلة')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  selectedCategory === 'منتجاتي المحمّلة'
                    ? 'bg-gradient-to-r from-[#D86688] to-[#C24F73] text-white shadow-xs'
                    : 'bg-white text-[#D86688] border border-[#F7D2DF] hover:bg-[#FDF2F6]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>منتجاتي المحمّلة ({customCount})</span>
              </button>
            )}

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-[#2E6F9E] to-[#235D86] text-white shadow-xs'
                    : 'bg-white text-[#55738E] border border-[#D3E3F0] hover:bg-[#F2F7FC]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Handcrafted Stitch wave divider */}
      <div className="absolute bottom-0 left-0 w-full leading-none pointer-events-none opacity-80">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="w-full h-10 sm:h-14">
          <path d="M0,30 Q60,50 120,30 T240,30 T360,30 T480,30 T600,30 T720,30 T840,30 T960,30 T1080,30 T1200,30 T1320,30 T1440,30 V60 H0 Z" fill="#F2F7FC"/>
          <path d="M0,30 Q60,50 120,30 T240,30 T360,30 T480,30 T600,30 T720,30 T840,30 T960,30 T1080,30 T1200,30 T1320,30 T1440,30" fill="none" stroke="#D3E3F0" strokeWidth="2.5" strokeDasharray="6 8"/>
        </svg>
      </div>
    </section>
  );
};

