const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

const salonDetailsStep = `  if (step === 'salon-details' && selectedSalon) {
    return (
      <>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-24">
        {/* Header Carousel */}
        <div className="relative h-64 md:h-96 bg-zinc-900 rounded-[24px] overflow-hidden shadow-sm group">
          {selectedSalon.images && selectedSalon.images.length > 0 ? (
            <>
              <img 
                src={selectedSalon.images[currentImageIndex]} 
                alt={isAr ? selectedSalon.name_ar : selectedSalon.name_en} 
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
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
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          <button onClick={() => setStep('salons')} className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors">
            {isAr ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          </button>
          
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{isAr ? selectedSalon.name_ar : selectedSalon.name_en}</h1>
            <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {isAr ? selectedSalon.address_ar || 'العنوان غير متوفر' : selectedSalon.address_en || 'Address not available'}
              </span>
              {selectedSalon.computedDistance && selectedSalon.computedDistance !== Infinity && (
                <span className="bg-white/20 px-2 py-1 rounded-md">{selectedSalon.computedDistance.toFixed(1)} km</span>
              )}
              {selectedSalon.avgRating > 0 && (
                <span className="flex items-center gap-1 text-amber-400 bg-black/40 px-2 py-1 rounded-md">
                  <Star className="w-4 h-4 fill-current" />
                  {selectedSalon.avgRating.toFixed(1)} ({selectedSalon.reviewsCount})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h3 className="text-xl font-bold text-zinc-900 mb-4">{isAr ? 'عن الصالون' : 'About'}</h3>
              <p className="text-zinc-600 leading-relaxed">
                {isAr ? selectedSalon.description_ar || 'لا يوجد وصف.' : selectedSalon.description_en || 'No description available.'}
              </p>
            </section>
            
            <section>
              <h3 className="text-xl font-bold text-zinc-900 mb-4">{isAr ? 'الخدمات المتوفرة' : 'Available Services'}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {services.map(srv => (
                  <div key={srv.id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-zinc-900">{isAr ? srv.name_ar : srv.name_en}</h4>
                      <p className="text-xs text-zinc-500 mt-1">{srv.duration_minutes} {isAr ? 'دقيقة' : 'min'}</p>
                    </div>
                    <div className="text-right">
                      {srv.discount_price ? (
                        <>
                          <div className="text-xs text-zinc-400 line-through">{currSymbol} {srv.original_price}</div>
                          <div className="font-bold text-zinc-900">{currSymbol} {srv.discount_price}</div>
                        </>
                      ) : (
                        <div className="font-bold text-zinc-900">{currSymbol} {srv.original_price}</div>
                      )}
                    </div>
                  </div>
                ))}
                {services.length === 0 && <p className="text-zinc-500 text-sm">{isAr ? 'لا توجد خدمات مضافة.' : 'No services added.'}</p>}
              </div>
            </section>
            
            <section>
              <h3 className="text-xl font-bold text-zinc-900 mb-4">{isAr ? 'فريق العمل' : 'Our Team'}</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {staff.map(member => (
                  <div key={member.id} className="snap-start shrink-0 w-32 text-center">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-zinc-100 mb-3 border-2 border-white shadow-sm">
                      {member.profile?.avatar_url ? (
                         <img src={member.profile.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-zinc-400"><UserIcon className="w-8 h-8" /></div>
                      )}
                    </div>
                    <h4 className="font-bold text-zinc-900 text-sm">{isAr ? member.profile?.first_name_ar : member.profile?.first_name_en}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{isAr ? 'فني تجميل' : 'Artist'}</p>
                  </div>
                ))}
                {staff.length === 0 && <p className="text-zinc-500 text-sm">{isAr ? 'لا يوجد فنيين حالياً.' : 'No artists currently.'}</p>}
              </div>
            </section>
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-6 bg-white border border-zinc-100 p-6 rounded-[24px] shadow-sm">
              <h3 className="font-bold text-zinc-900 text-lg mb-4">{isAr ? 'حجز موعد' : 'Book Appointment'}</h3>
              <p className="text-sm text-zinc-500 mb-6">{isAr ? 'احجز موعدك الآن واستمتع بخدماتنا.' : 'Book your appointment now and enjoy our services.'}</p>
              <button onClick={() => setStep('services')} className="w-full py-4 text-white bg-zinc-900 hover:bg-slate-800 font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {t.book_now}
              </button>
            </div>
          </div>
        </div>
      </div>
      {overlays}
      </>
    );
  }

  if (step === 'services' && selectedSalon) {`;

content = content.replace("  if (step === 'services' && selectedSalon) {", salonDetailsStep);
fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log("Added salon details view.");
