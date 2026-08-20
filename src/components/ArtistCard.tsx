import React from 'react';
import { motion } from 'motion/react';
import { Star, Clock } from 'lucide-react';

interface ArtistProps {
  nameAr: string;
  nameEn: string;
  bioAr: string;
  bioEn: string;
  avatarUrl: string;
  lang: 'ar' | 'en';
}

export function ArtistCard({ nameAr, nameEn, bioAr, bioEn, avatarUrl, lang }: ArtistProps) {
  const isAr = lang === 'ar';
  
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
      className={`bg-white rounded-2xl p-6 border border-slate-100 flex flex-col items-center gap-4 transition-all ${isAr ? 'text-right' : 'text-left'}`}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Avatar with Status Indicator */}
      <div className="relative">
        <img 
          src={avatarUrl} 
          alt={isAr ? nameAr : nameEn} 
          className="w-24 h-24 rounded-full object-cover shadow-sm ring-4 ring-slate-50"
        />
        <div className="absolute bottom-1 right-1 bg-emerald-500 w-4 h-4 rounded-full border-2 border-white shadow-sm"></div>
      </div>
      
      {/* Info */}
      <div className="text-center w-full">
        <h3 className="text-lg font-bold text-slate-900">{isAr ? nameAr : nameEn}</h3>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2 leading-relaxed h-10">
          {isAr ? bioAr : bioEn}
        </p>
      </div>
      
      {/* Metrics */}
      <div className="flex items-center gap-4 text-sm font-medium text-slate-600 mt-2 w-full justify-center">
        <div className="flex items-center gap-1.5">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>4.9</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md">
          <Clock className="w-4 h-4 text-indigo-500" />
          <span className="text-xs">{isAr ? 'متاح اليوم' : 'Available Today'}</span>
        </div>
      </div>
      
      {/* Action */}
      <button className="w-full mt-2 bg-slate-900 hover:bg-indigo-600 text-white py-2.5 rounded-xl font-medium transition-colors duration-200">
        {isAr ? 'حجز موعد' : 'Book Appointment'}
      </button>
    </motion.div>
  );
}
