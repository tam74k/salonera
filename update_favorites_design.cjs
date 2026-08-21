const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

const targetRegex = /if \(step === 'favorites'\) \{[\s\S]*?if \(step === 'profile'\) \{/m;

const newFavoritesBlock = `if (step === 'favorites') {
    const favoriteSalons = salons.filter(s => favorites.includes(s.id));
    
    return (
      <>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-24">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-6">
          <button onClick={() => setStep('salons')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-medium w-fit">
            {isAr ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            {isAr ? 'العودة' : 'Back'}
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
                {isAr ? 'مفضلاتي' : 'My Favorites'}
                <span className="text-sm font-medium bg-rose-50 text-rose-500 px-3 py-1 rounded-full">{favoriteSalons.length}</span>
              </h2>
              <p className="text-zinc-500 mt-2">{isAr ? 'الأماكن التي أحببتها، محفوظة لك.' : 'The places you loved, saved for you.'}</p>
            </div>
            <div className="hidden md:flex p-4 bg-rose-50 rounded-full">
              <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
            </div>
          </div>
        </div>

        {favoriteSalons.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-32 bg-white rounded-[32px] border border-zinc-100 shadow-sm">
            <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-zinc-300" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 mb-3">{isAr ? 'لا توجد صالونات مفضلة بعد' : 'No favorite salons yet'}</h3>
            <p className="text-zinc-500 max-w-sm mb-8">{isAr ? 'تصفح الصالونات واضغط على رمز القلب لحفظ الأماكن التي تعجبك هنا.' : 'Browse salons and tap the heart icon to save the places you like here.'}</p>
            <button onClick={() => setStep('salons')} className="bg-zinc-900 text-white px-8 py-3.5 rounded-2xl text-sm font-bold transition-all hover:bg-slate-800 hover:shadow-lg hover:-translate-y-0.5">
              {isAr ? 'اكتشف الصالونات' : 'Discover Salons'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {favoriteSalons.map((salon, idx) => (
              <motion.div 
                key={salon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-white rounded-[28px] p-3 border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-900/5 hover:border-zinc-200 transition-all flex flex-col md:flex-row gap-5 items-center relative group cursor-pointer"
                onClick={() => { setSelectedSalon(salon); setCurrentImageIndex(0); setStep('salon-details'); fetchSalonDetails(salon.id); }}
              >
                {/* Image Section */}
                <div className="w-full md:w-56 h-48 md:h-40 relative rounded-[20px] overflow-hidden bg-zinc-50 shrink-0">
                  {(salon.images?.[0] || salon.image_url) ? (
                    <img src={salon.images?.[0] || salon.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <GridIcon className="w-10 h-10" />
                    </div>
                  )}
                  
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-xs font-bold text-slate-800 z-10 shadow-sm">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    {salon.avgRating ? salon.avgRating.toFixed(1) : (salon.rating || 'New')}
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 w-full px-2 md:px-0 py-2 md:py-4 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h3 className="font-bold text-zinc-900 text-xl leading-tight">
                      {isAr ? salon.name_ar : salon.name_en}
                    </h3>
                    <p className="text-sm text-zinc-500 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span className="line-clamp-1">{isAr ? salon.address_ar || 'العنوان غير متوفر' : salon.address_en || 'Address not available'}</span>
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
                    <button 
                      onClick={(e) => toggleFavorite(salon.id, e)} 
                      className="p-4 rounded-2xl bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-colors shrink-0"
                      title={isAr ? 'إزالة' : 'Remove'}
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedSalon(salon); setCurrentImageIndex(0); setStep('services'); fetchSalonDetails(salon.id); }} 
                      className="flex-1 md:flex-none px-8 py-4 text-sm font-bold text-white bg-zinc-900 hover:bg-slate-800 rounded-2xl transition-all shadow-sm hover:shadow-md whitespace-nowrap"
                    >
                      {isAr ? 'حجز الموعد' : 'Book Now'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {overlays}
      </>
    );
  }

  if (step === 'profile') {`;

if (content.match(targetRegex)) {
  content = content.replace(targetRegex, newFavoritesBlock);
  fs.writeFileSync('src/screens/ClientApp.tsx', content);
  console.log('Successfully updated favorites design');
} else {
  console.log('Regex did not match!');
}
