const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

// 1. Add salon-details to BookingStep
content = content.replace(
  "type BookingStep = 'salons' | 'services' | 'datetime' | 'confirmed' | 'my-bookings' | 'profile';",
  "type BookingStep = 'salons' | 'services' | 'datetime' | 'confirmed' | 'my-bookings' | 'profile' | 'salon-details';"
);

// 2. Add currentImageIndex state for carousels
content = content.replace(
  "const [showReviewModal, setShowReviewModal] = useState<any>(null);",
  "const [showReviewModal, setShowReviewModal] = useState<any>(null);\n  const [currentImageIndex, setCurrentImageIndex] = useState(0);"
);

// reset image index when selecting salon
content = content.replace(
  "setSelectedSalon(salon);\n    setStep('services');",
  "setSelectedSalon(salon);\n    setCurrentImageIndex(0);\n    setStep('services');"
);

// 3. Render Image Carousel in 'services' step
const oldServicesHeader = `<div className="relative h-64 md:h-80 bg-zinc-900 rounded-[24px] overflow-hidden mb-8 shadow-sm">
          {(selectedSalon.images?.[0] || selectedSalon.image_url) && (
            <img 
              src={selectedSalon.images?.[0] || selectedSalon.image_url} 
              alt={isAr ? selectedSalon.name_ar : selectedSalon.name_en} 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          )}`;
const newServicesHeader = `<div className="relative h-64 md:h-80 bg-zinc-900 rounded-[24px] overflow-hidden mb-8 shadow-sm group">
          {selectedSalon.images && selectedSalon.images.length > 0 ? (
            <>
              <img 
                src={selectedSalon.images[currentImageIndex]} 
                alt={isAr ? selectedSalon.name_ar : selectedSalon.name_en} 
                className="absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-300"
              />
              {selectedSalon.images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? selectedSalon.images.length - 1 : prev - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === selectedSalon.images.length - 1 ? 0 : prev + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {selectedSalon.images.map((_: any, idx: number) => (
                      <div key={idx} className={\`w-2 h-2 rounded-full transition-colors \${idx === currentImageIndex ? 'bg-white' : 'bg-white/40'}\`} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : selectedSalon.image_url && (
            <img 
              src={selectedSalon.image_url} 
              alt={isAr ? selectedSalon.name_ar : selectedSalon.name_en} 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
          )}`;
content = content.replace(oldServicesHeader, newServicesHeader);

// 4. Update the card in the main view
const oldCard = `<motion.div 
              key={salon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleSalonSelect(salon)}
              className="bg-white rounded-[16px] overflow-hidden border border-zinc-100 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:-translate-y-1"
            >
              <div className="h-48 overflow-hidden relative bg-slate-100">
                {(salon.images?.[0] || salon.image_url) && <img src={salon.images?.[0] || salon.image_url} alt={isAr ? salon.name_ar : salon.name_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-slate-800">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {salon.rating || 'New'}
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold text-zinc-900">{isAr ? salon.name_ar : salon.name_en}</h4>
                  {salon.computedDistance && salon.computedDistance !== Infinity ? (
                    <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {salon.computedDistance.toFixed(1)} km
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-zinc-500 bg-slate-100 px-2 py-1 rounded-full">{salon.location_text || (salon.city || 'Nearby')}</span>
                  )}
                </div>
                <div className="flex items-center justify-end mt-4">
                  <span className="flex items-center gap-1 text-sm font-bold text-zinc-900 group-hover:text-zinc-900">
                    {t.book_now}
                    {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </span>
                </div>
              </div>
            </motion.div>`;

const newCard = `<motion.div 
              key={salon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[16px] overflow-hidden border border-zinc-100 shadow-sm hover:shadow-md transition-all group flex flex-col"
            >
              <div className="h-48 overflow-hidden relative bg-slate-100">
                {(salon.images?.[0] || salon.image_url) && <img src={salon.images?.[0] || salon.image_url} alt={isAr ? salon.name_ar : salon.name_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-slate-800">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {salon.avgRating ? salon.avgRating.toFixed(1) : (salon.rating || 'New')}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h4 className="text-lg font-bold text-zinc-900">{isAr ? salon.name_ar : salon.name_en}</h4>
                  {salon.computedDistance && salon.computedDistance !== Infinity ? (
                    <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded-full flex items-center gap-1 shrink-0">
                      <MapPin className="w-3 h-3" />
                      {salon.computedDistance.toFixed(1)} km
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-zinc-500 bg-slate-100 px-2 py-1 rounded-full shrink-0">{salon.location_text || (salon.city || 'Nearby')}</span>
                  )}
                </div>
                
                <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  {isAr ? salon.address_ar || 'العنوان غير متوفر' : salon.address_en || 'Address not available'}
                </p>
                
                <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-zinc-50">
                  <button onClick={() => { setSelectedSalon(salon); setCurrentImageIndex(0); setStep('salon-details'); fetchSalonDetails(salon.id); }} className="w-full py-2.5 text-sm font-bold text-zinc-700 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors">
                    {isAr ? 'عرض' : 'View'}
                  </button>
                  <button onClick={() => { setSelectedSalon(salon); setCurrentImageIndex(0); setStep('services'); fetchSalonDetails(salon.id); }} className="w-full py-2.5 text-sm font-bold text-white bg-zinc-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm">
                    {isAr ? 'حجز' : 'Book'}
                  </button>
                </div>
              </div>
            </motion.div>`;

content = content.replace(oldCard, newCard);

fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log("Salon cards updated.");
