import React from 'react';
import { Heart, MessageCircle, Phone, MapPin, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gradient-to-b from-[#F3F8FD] to-[#EBF4FC] border-t-2 border-dashed border-[#D3E3F0] pt-12 pb-8 text-[#55697D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 text-right">
          {/* Brand Col */}
          <div>
            <div className="mb-3">
              <Logo size="md" />
            </div>
            <p className="text-xs sm:text-sm text-[#617487] leading-relaxed mb-4">
              متجر BABY glow علامة متخصصة في توفير أرقى ملابس ومستلزمات حديثي الولادة والمواليد الجدد من القطن الطبيعي 100% لضمان راحة وسلامة طفلك في أيامه الأولى.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-[#235D86]">
              <ShieldCheck className="w-4 h-4 text-[#2E6F9E]" />
              <span>أقمشة آمنة وخالية من المسببات التحسسية</span>
            </div>
          </div>

          {/* Delivery & Guarantees */}
          <div className="space-y-3">
            <h4 className="font-['El_Messiri',serif] font-bold text-base text-[#1C4263]">
              الشحن والدفع
            </h4>
            <ul className="text-xs text-[#617487] space-y-2">
              <li className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#2E6F9E]" />
                <span>توصيل سريع لجميع ولايات الوطن (58 ولاية).</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E6F9E]" />
                <span>الدفع يداً بيد عند استلام الطرد ومعاينته.</span>
              </li>
              <li className="flex items-center gap-2">
                <Heart className="w-3.5 h-3.5 text-[#D86688]" />
                <span>إمكانية الاستبدال أو الإرجاع في حال وجود أي عيب مصنعي.</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="font-['El_Messiri',serif] font-bold text-base text-[#1C4263]">
              تواصلوا معنا
            </h4>
            <p className="text-xs text-[#617487]">
              فريقنا متواجد للإجابة على استفساراتكم ومرافقتكم في اختيار القياسات المناسبة لمولودكم:
            </p>
            <div className="space-y-2 text-xs">
              <a
                href="https://wa.me/213550000000"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-[#2E6F9E] hover:underline font-bold"
              >
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                <span>واتساب: 0550 00 00 00</span>
              </a>
              <div className="flex items-center gap-2 text-[#617487]">
                <Phone className="w-4 h-4 text-[#2E6F9E]" />
                <span>خدمة الزبائن: متوفر طيلة أيام الأسبوع</span>
              </div>
              <div className="flex items-center gap-2 text-[#617487]">
                <MapPin className="w-4 h-4 text-[#2E6F9E]" />
                <span>الجزائر العاصمة، الجزائر</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-[#D3E3F0] text-center text-xs text-[#7E96AC] flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            BABY glow — ملابس حديثي الولادة · صُنع بحب لأصغر أفراد العائلة © {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-[#617487]">
            <span>بكل دقة ودفء</span>
            <Heart className="w-3 h-3 text-[#D86688] fill-[#D86688]" />
            <span>للأمهات والآباء في الجزائر</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
