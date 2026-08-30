import React, { useState, useEffect } from 'react';
import { Plus, Minus } from 'lucide-react';

interface StockControlProps {
  productId: number;
  stock: number;
  onUpdateStock: (productId: number, newStock: number) => void;
  label?: string;
}

export const StockControl: React.FC<StockControlProps> = ({
  productId,
  stock,
  onUpdateStock,
  label = 'المخزون الحالي:'
}) => {
  const [inputValue, setInputValue] = useState<string>(String(stock));
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    if (!isFocused) {
      setInputValue(String(stock));
    }
  }, [stock, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    if (raw.trim() !== '') {
      const parsed = parseInt(raw, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        onUpdateStock(productId, parsed);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (inputValue.trim() === '' || isNaN(parseInt(inputValue, 10)) || parseInt(inputValue, 10) < 0) {
      setInputValue(String(stock));
    } else {
      const parsed = Math.max(0, parseInt(inputValue, 10));
      setInputValue(String(parsed));
      onUpdateStock(productId, parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      onUpdateStock(productId, stock + 1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onUpdateStock(productId, Math.max(0, stock - 1));
    }
  };

  return (
    <div className="bg-[#F4F9FD] rounded-xl p-2.5 flex items-center justify-between gap-2 border border-[#D3E3F0]">
      <span className="text-xs font-bold text-[#55697D]">
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        {/* Decrease 1 */}
        <button
          type="button"
          onClick={() => onUpdateStock(productId, Math.max(0, stock - 1))}
          disabled={stock <= 0}
          title="إنقاص قطعة واحدة"
          className="w-8 h-8 rounded-lg bg-white border border-[#D3E3F0] hover:bg-rose-50 text-rose-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center font-bold text-xs cursor-pointer shadow-2xs transition-colors active:scale-95"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        {/* Direct Input */}
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          dir="ltr"
          value={inputValue}
          onFocus={(e) => {
            setIsFocused(true);
            e.target.select();
          }}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          title="انقر لتعديل الكمية مباشرة"
          className="w-14 h-8 text-center bg-white border border-[#D3E3F0] rounded-lg font-mono font-bold text-xs sm:text-sm text-[#1C2D3D] focus:outline-hidden focus:ring-2 focus:ring-[#2E6F9E] focus:border-[#2E6F9E] shadow-2xs transition-all"
        />

        {/* Increase 1 */}
        <button
          type="button"
          onClick={() => onUpdateStock(productId, stock + 1)}
          title="زيادة قطعة واحدة"
          className="w-8 h-8 rounded-lg bg-white border border-[#D3E3F0] hover:bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs cursor-pointer shadow-2xs transition-colors active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        {/* Quick +5 */}
        <button
          type="button"
          onClick={() => onUpdateStock(productId, stock + 5)}
          title="إضافة 5 قطع"
          className="px-2.5 h-8 rounded-lg bg-white border border-[#D3E3F0] hover:bg-[#EAF3FA] text-[#2E6F9E] text-xs font-bold cursor-pointer shadow-2xs transition-colors active:scale-95"
        >
          +5
        </button>

        {/* Quick +10 */}
        <button
          type="button"
          onClick={() => onUpdateStock(productId, stock + 10)}
          title="إضافة 10 قطع"
          className="px-2.5 h-8 rounded-lg bg-white border border-[#D3E3F0] hover:bg-[#EAF3FA] text-[#2E6F9E] text-xs font-bold cursor-pointer shadow-2xs transition-colors active:scale-95"
        >
          +10
        </button>
      </div>
    </div>
  );
};
