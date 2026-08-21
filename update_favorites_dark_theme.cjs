const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

const targetRegex = /if \(step === 'favorites'\) \{[\s\S]*?if \(step === 'profile'\) \{/m;

const newFavoritesBlock = `if (step === 'favorites') {
    const favoriteSalons = salons.filter(s => favorites.includes(s.id));
    
    return (
      <div className="min-h-screen bg-stone-950 pb-24 font-sans selection:bg-amber-500/30">
        <div className="max-w-5xl mx-auto px-4 py-8 md:px-8 md:py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <button onClick={() => setStep('salons')} className="flex items-center gap-2 text-stone-400 hover:text-stone-200 transition-colors group">
              {isAr ? <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> : <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />}
              <span className="font-medium tracking-widest text-xs uppercase">{isAr ? 'العودة للرئيسية' : 'Back to Home'}</span>
            </button>
            <div className="flex items-center gap-2 bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/20">
              <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span className="text-amber-500 font-semibold text-xs tracking-widest uppercase">{isAr ? 'مجموعتك الخاصة' : 'Private Collection'}</span>
            </div>
          </div>

          <div className="mb-12 md:mb-16">
            <h2 className="text-4xl md:text-5xl font-light text-stone-50 mb-4 tracking-tight">
              {isAr ? 'صالوناتك المفضلة' : 'Your Favorites'}
            </h2>
            <p className="text-stone-400 text-lg font-light max-w-xl leading-relaxed">
              {isAr ? 'مجموعة مختارة بعناية من أفضل وجهات التجميل التي قمت بحفظها.' : 'A carefully curated selection of your saved beauty destinations.'}
            </p>
          </div>

          {favoriteSalons.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-32 bg-stone-900/30 rounded-[2rem] border border-stone-800/50 backdrop-blur-sm">
              <div className="w-20 h-20 bg-stone-900 rounded-full flex items-center justify-center mb-6 shadow-inner border border-stone-800">
                <Heart className="w-8 h-8 text-stone-700" />
              </div>
              <h3 className="text-2xl font-light text-stone-200 mb-4">{isAr ? 'المجموعة فارغة' : 'Collection is empty'}</h3>
              <p className="text-stone-500 max-w-sm mb-8 font-light leading-relaxed">{isAr ? 'اكتشف صالونات فاخرة وأضفها إلى مجموعتك الخاصة للوصول إليها بسهولة.' : 'Discover luxury salons and add them to your private collection for easy access.'}</p>
              <button onClick={() => setStep('salons')} className="bg-amber-600/10 text-amber-500 border border-amber-600/20 px-8 py-3.5 rounded-full text-sm font-medium tracking-wide hover:bg-amber-500 hover:text-stone-950 transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                {isAr ? 'استكشف الصالونات الآن' : 'Explore Salons Now'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {favoriteSalons.map((salon, idx) => (
                <motion.div
                  key={salon.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1, duration: 0.7, ease: "easeOut" }}
                  className="group relative h-80 md:h-[420px] rounded-[2rem] overflow-hidden cursor-pointer shadow-2xl border border-stone-800/50"
                  onClick={() => { setSelectedSalon(salon); setCurrentImageIndex(0); setStep('salon-details'); fetchSalonDetails(salon.id); }}
                >
                  {/* Background Image */}
                  {(salon.images?.[0] || salon.image_url) ? (
                    <img src={salon.images?.[0] || salon.image_url} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-1000 ease-out" />
                  ) : (
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-stone-900 text-stone-800">
                      <GridIcon className="w-16 h-16" />
                    </div>
                  )}

                  {/* Cinematic Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-stone-950/20 group-hover:bg-transparent transition-colors duration-500" />

                  {/* Top actions */}
                  <div className="absolute top-6 right-6 flex items-center z-10">
                     <div className="bg-stone-950/40 backdrop-blur-md border border-white/10 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold text-stone-200 shadow-xl">
                       <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                       {salon.avgRating ? salon.avgRating.toFixed(1) : (salon.rating || 'New')}
                     </div>
                  </div>

                  <button
                    onClick={(e) => toggleFavorite(salon.id, e)}
                    className="absolute top-6 left-6 p-3 bg-stone-950/40 backdrop-blur-md border border-white/10 rounded-full text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300 z-10 shadow-xl"
                    title={isAr ? 'إزالة' : 'Remove'}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 flex flex-col justify-end z-10 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="font-light text-2xl md:text-3xl text-stone-50 mb-2 leading-tight drop-shadow-md">
                      {isAr ? salon.name_ar : salon.name_en}
                    </h3>
                    <p className="text-sm text-stone-400 flex items-center gap-2 mb-6 font-light drop-shadow-md">
                      <MapPin className="w-4 h-4 shrink-0 text-stone-500" />
                      <span className="line-clamp-1">{isAr ? salon.address_ar || 'العنوان غير متوفر' : salon.address_en || 'Address not available'}</span>
                    </p>

                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedSalon(salon); setCurrentImageIndex(0); setStep('services'); fetchSalonDetails(salon.id); }}
                      className="w-full bg-stone-100 text-stone-950 py-4 rounded-2xl text-sm font-semibold tracking-wide hover:bg-amber-400 transition-colors duration-300 shadow-xl flex items-center justify-center gap-2"
                    >
                      {isAr ? 'حجز الموعد' : 'Reserve Appointment'}
                      {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        {overlays}
      </div>
    );
  }

  if (step === 'profile') {`;

if (content.match(targetRegex)) {
  content = content.replace(targetRegex, newFavoritesBlock);
  fs.writeFileSync('src/screens/ClientApp.tsx', content);
  console.log('Successfully updated favorites to premium dark theme');
} else {
  console.log('Regex did not match!');
}
