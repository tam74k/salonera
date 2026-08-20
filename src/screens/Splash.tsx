import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../store';
import { translations } from '../i18n';

export function Splash({ onComplete }: { onComplete: () => void }) {
  const { lang, isAr } = useAppContext();
  const t = translations[lang];

  useEffect(() => {
    const timer = setTimeout(onComplete, 2500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-50 overflow-hidden"
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Decorative background element */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="text-center relative z-10"
      >
        <h1 className={`text-6xl md:text-7xl font-bold text-white tracking-widest mb-4 ${isAr ? 'font-arabic' : ''}`}>
          SALONERA
        </h1>
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: "easeInOut" }}
          className="h-px bg-gradient-to-r from-transparent via-amber-200/50 to-transparent w-full mb-4"
        />
        <p className={`text-amber-100/70 text-lg md:text-xl tracking-widest uppercase ${isAr ? 'font-arabic' : ''}`}>
          {t.slogan}
        </p>
      </motion.div>
    </motion.div>
  );
}
