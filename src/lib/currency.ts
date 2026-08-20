export const CURRENCIES: Record<string, { en: string, ar: string }> = {
  'SAR': { en: 'SAR', ar: 'ر.س' },
  'EGP': { en: 'EGP', ar: 'ج.م' },
  'AED': { en: 'AED', ar: 'د.إ' },
  'KWD': { en: 'KWD', ar: 'د.ك' },
  'QAR': { en: 'QAR', ar: 'ر.ق' },
  'BHD': { en: 'BHD', ar: 'د.ب' },
  'OMR': { en: 'OMR', ar: 'ر.ع' },
  'JOD': { en: 'JOD', ar: 'د.ا' },
};

export function getCurrencySymbol(currencyCode: string | null | undefined, isAr: boolean): string {
  if (!currencyCode) return isAr ? 'ر.س' : 'SAR';
  
  const curr = CURRENCIES[currencyCode.toUpperCase()];
  if (curr) {
    return isAr ? curr.ar : curr.en;
  }
  
  return currencyCode;
}
