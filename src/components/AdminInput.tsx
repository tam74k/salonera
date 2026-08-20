import React, { useState } from 'react';
import { Languages, Loader2 } from 'lucide-react';
import { autoTranslate } from '../lib/translate';

interface BilingualInputProps {
  labelAr: string;
  labelEn: string;
  valueAr: string;
  valueEn: string;
  onChangeAr: (val: string) => void;
  onChangeEn: (val: string) => void;
}

export function AdminInput({ 
  labelAr, 
  labelEn, 
  valueAr, 
  valueEn, 
  onChangeAr, 
  onChangeEn 
}: BilingualInputProps) {
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!valueAr) return;
    
    setIsTranslating(true);
    try {
      const englishText = await autoTranslate(valueAr);
      onChangeEn(englishText);
    } catch (error) {
      console.error('Translation failed:', error);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 w-full mb-6">
      {/* Arabic Input Side */}
      <div className="flex-1 space-y-2">
        <label className="block text-sm font-medium text-slate-700 text-right">
          {labelAr}
        </label>
        <div className="relative flex">
          <input
            dir="rtl"
            type="text"
            className="w-full pl-12 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            value={valueAr}
            onChange={(e) => onChangeAr(e.target.value)}
            placeholder="أدخل النص هنا..."
          />
          <button
            onClick={handleTranslate}
            disabled={isTranslating || !valueAr}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors disabled:opacity-50 flex items-center justify-center"
            title="Auto Translate to English"
          >
            {isTranslating ? (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            ) : (
              <Languages className="w-5 h-5 text-indigo-600" />
            )}
          </button>
        </div>
      </div>

      {/* English Input Side */}
      <div className="flex-1 space-y-2">
        <label className="block text-sm font-medium text-slate-700 text-left">
          {labelEn}
        </label>
        <input
          dir="ltr"
          type="text"
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          value={valueEn}
          onChange={(e) => onChangeEn(e.target.value)}
          placeholder="English text..."
        />
      </div>
    </div>
  );
}
