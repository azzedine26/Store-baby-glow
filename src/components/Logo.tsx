import React from 'react';
import logoImage from '../assets/images/baby_glow_logo_1787930092615.jpg';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 rounded-xl',
    md: 'w-11 h-11 rounded-2xl',
    lg: 'w-16 h-16 rounded-2xl',
    xl: 'w-24 h-24 sm:w-28 sm:h-28 rounded-3xl'
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Visual Logo Badge */}
      <div
        className={`${sizeClasses[size]} overflow-hidden bg-[#FAF6F0] border border-[#F2DEE7] shadow-xs flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}
      >
        <img
          src={logoImage}
          alt="شعار BABY glow - متجر ملابس حديثي الولادة"
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="text-right">
          <div className="flex items-center gap-2">
            <span className="font-['El_Messiri',serif] font-bold text-2xl sm:text-3xl text-[#235D86] tracking-tight flex items-center">
              BABY <span className="text-[#D86688] mr-1">glow</span>
            </span>
            <span className="text-[10px] font-extrabold bg-[#FCE7EF] text-[#D86688] px-2 py-0.5 rounded-full border border-[#F7D2DF] hidden sm:inline-block">
              BABY CLOTHING SHOP
            </span>
          </div>
          <p className="text-[11px] text-[#7E96AC] font-medium hidden sm:block -mt-0.5">
            ملابس ولوازم حديثي الولادة فائقة النعومة 👶🇩🇿
          </p>
        </div>
      )}
    </div>
  );
};
