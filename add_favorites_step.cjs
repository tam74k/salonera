const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

// 1. Add step 'favorites'
// Let's insert it before `if (step === 'profile')`
const targetProfile = "  if (step === 'profile') {";
const favoritesStep = `  if (step === 'favorites') {
    const favoriteSalons = salons.filter(s => favorites.includes(s.id));
    
    return (
      <>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <button onClick={() => setStep('salons')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-medium">
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {isAr ? 'العودة للرئيسية' : 'Back to Home'}
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
          <h2 className="text-3xl font-bold text-zinc-900">{isAr ? 'الصالونات المفضلة' : 'Favorite Salons'}</h2>
        </div>

        {favoriteSalons.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[24px] border border-zinc-100 shadow-sm">
            <Heart className="w-16 h-16 text-zinc-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-zinc-900 mb-2">{isAr ? 'لا توجد صالونات مفضلة' : 'No favorite salons'}</h3>
            <p className="text-zinc-500">{isAr ? 'قم بإضافة صالوناتك المفضلة للوصول إليها بسهولة هنا.' : 'Add your favorite salons to access them easily here.'}</p>
            <button onClick={() => setStep('salons')} className="mt-6 bg-zinc-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors hover:bg-zinc-800">
              {isAr ? 'تصفح الصالونات' : 'Browse Salons'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteSalons.map(salon => (
              <motion.div 
                key={salon.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[24px] overflow-hidden border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-zinc-900/5 hover:border-zinc-200 hover:-translate-y-1 transition-all group flex flex-col relative"
              >
                <div className="h-48 relative bg-slate-100 cursor-pointer" onClick={() => { setSelectedSalon(salon); setCurrentImageIndex(0); setStep('salon-details'); fetchSalonDetails(salon.id); }}>
                  {(salon.images?.[0] || salon.image_url) ? (
                    <img src={salon.images?.[0] || salon.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-50 text-zinc-300">
                      <GridIcon className="w-8 h-8" />
                    </div>
                  )}
                  
                  {/* Heart Button */}
                  <button onClick={(e) => toggleFavorite(salon.id, e)} className="absolute top-4 left-4 p-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-full shadow-sm text-rose-500 transition-colors z-10" title={isAr ? 'إزالة من المفضلة' : 'Remove from Favorites'}>
                    <Heart className="w-5 h-5 fill-rose-500" />
                  </button>

                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 text-sm font-bold text-slate-800 z-10 shadow-sm">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    {salon.avgRating ? salon.avgRating.toFixed(1) : (salon.rating || 'New')}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-bold text-zinc-900 text-lg leading-tight cursor-pointer" onClick={() => { setSelectedSalon(salon); setCurrentImageIndex(0); setStep('salon-details'); fetchSalonDetails(salon.id); }}>
                      {isAr ? salon.name_ar : salon.name_en}
                    </h3>
                  </div>
                  
                  <p className="text-sm text-zinc-500 mb-4 flex-1">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {isAr ? salon.address_ar || 'العنوان غير متوفر' : salon.address_en || 'Address not available'}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-zinc-50 flex gap-3">
                    <button onClick={() => { setSelectedSalon(salon); setCurrentImageIndex(0); setStep('salon-details'); fetchSalonDetails(salon.id); }} className="flex-1 py-2.5 text-sm font-bold text-white bg-zinc-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm">
                      {isAr ? 'حجز الآن' : 'Book Now'}
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

content = content.replace(targetProfile, favoritesStep);

// 2. Update the buttons in the hero section
const targetButtons = `<div className="flex gap-3">
            <button onClick={() => { fetchMyBookings(); setStep('my-bookings'); }} className="mt-4 bg-white/20 hover:bg-white/30 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors">
              {isAr ? 'عرض حجوزاتي' : 'View My Bookings'}
            </button>
            <button onClick={() => { fetchUserProfile(); setStep('profile'); }} className="mt-4 bg-white/20 hover:bg-white/30 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors">
              {isAr ? 'حسابي' : 'My Profile'}
            </button>
          </div>`;

const newButtons = `<div className="flex flex-wrap gap-3">
            <button onClick={() => { fetchMyBookings(); setStep('my-bookings'); }} className="mt-4 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-colors">
              {isAr ? 'حجوزاتي' : 'Bookings'}
            </button>
            <button onClick={() => setStep('favorites')} className="mt-4 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-colors">
              {isAr ? 'المفضلة' : 'Favorites'}
            </button>
            <button onClick={() => { fetchUserProfile(); setStep('profile'); }} className="mt-4 bg-white/20 hover:bg-white/30 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-colors">
              {isAr ? 'حسابي' : 'Profile'}
            </button>
          </div>`;

if(content.includes(targetButtons)) {
  content = content.replace(targetButtons, newButtons);
} else {
  // Let's use a regex just in case formatting is slightly off
  console.log("Could not find EXACT buttons target, skipping button replacement");
}

fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log('Added favorites step');
