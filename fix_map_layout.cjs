const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

// 1. We need to extract processedSalons logic so it can be used for both grid and map.
const oldGridBlock = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salons.filter(s => {
            // Allow salons with no country assigned yet to appear as a fallback so they aren't hidden from their owners
            if (filterCountry && s.country_id && s.country_id?.toString() !== filterCountry.toString()) return false;
            if (filterGov && s.governorate_id && s.governorate_id?.toString() !== filterGov.toString()) return false;
            if (filterCity && s.city_id && s.city_id?.toString() !== filterCity.toString()) return false;
            if (s.type && s.type !== 'both' && s.type !== filterSalonType) return false;
            return true;
          })
          .sort((a, b) => {
             if (sortBy === 'distance') {
                return (a.computedDistance ?? Infinity) - (b.computedDistance ?? Infinity);
             } else {
                return (b.avgRating ?? 0) - (a.avgRating ?? 0);
             }
          })
          .map((salon, i) => (
            <motion.div `;

const newGridBlockPlaceholder = `
        {/* processedSalons are calculated right before rendering */}
        {(() => {
          const processedSalons = salons.filter(s => {
            if (filterCountry && s.country_id && s.country_id?.toString() !== filterCountry.toString()) return false;
            if (filterGov && s.governorate_id && s.governorate_id?.toString() !== filterGov.toString()) return false;
            if (filterCity && s.city_id && s.city_id?.toString() !== filterCity.toString()) return false;
            if (s.type && s.type !== 'both' && s.type !== filterSalonType) return false;
            return true;
          }).sort((a, b) => {
             if (sortBy === 'distance') {
                return (a.computedDistance ?? Infinity) - (b.computedDistance ?? Infinity);
             } else {
                return (b.avgRating ?? 0) - (a.avgRating ?? 0);
             }
          });
          
          if (viewMode === 'map') {
             const validMapSalons = processedSalons.filter(s => s.lat && s.lng);
             let minLat = userLocation?.lat || (validMapSalons.length ? Math.min(...validMapSalons.map(s => s.lat)) : 0);
             let maxLat = userLocation?.lat || (validMapSalons.length ? Math.max(...validMapSalons.map(s => s.lat)) : 0);
             let minLng = userLocation?.lng || (validMapSalons.length ? Math.min(...validMapSalons.map(s => s.lng)) : 0);
             let maxLng = userLocation?.lng || (validMapSalons.length ? Math.max(...validMapSalons.map(s => s.lng)) : 0);

             // Padding bounds
             const latRange = maxLat - minLat || 0.02;
             const lngRange = maxLng - minLng || 0.02;
             minLat -= latRange * 0.15; maxLat += latRange * 0.15;
             minLng -= lngRange * 0.15; maxLng += lngRange * 0.15;

             const getTop = (lat) => \`\${100 - ((lat - minLat) / (maxLat - minLat)) * 100}%\`;
             const getLeft = (lng) => \`\${((lng - minLng) / (maxLng - minLng)) * 100}%\`;
             
             return (
                <div className="relative w-full h-[600px] bg-sky-50/50 border border-zinc-200 rounded-[24px] overflow-hidden shadow-sm">
                   <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                   
                   {userLocation && (
                      <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center" style={{ top: getTop(userLocation.lat), left: getLeft(userLocation.lng) }}>
                        <div className="w-5 h-5 bg-blue-500 rounded-full border-[3px] border-white shadow-md animate-pulse" />
                        <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full mt-1 shadow-sm text-zinc-700">{isAr ? 'موقعك' : 'You'}</span>
                      </div>
                   )}

                   {validMapSalons.map(salon => (
                      <div key={salon.id} onClick={() => { setSelectedSalon(salon); setCurrentImageIndex(0); setStep('salon-details'); fetchSalonDetails(salon.id); }} className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20 flex flex-col items-center" style={{ top: getTop(salon.lat), left: getLeft(salon.lng) }}>
                        <MapPin className="w-8 h-8 text-zinc-900 fill-white transition-transform group-hover:scale-125 group-hover:text-amber-500 drop-shadow-md" />
                        <div className="absolute top-full mt-1 bg-white px-3 py-1.5 rounded-xl shadow-lg border border-zinc-100 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col items-center z-30">
                           {isAr ? salon.name_ar : salon.name_en}
                           <div className="text-[10px] text-zinc-500 font-medium mt-0.5 flex justify-center items-center gap-1">
                              <Star className="w-3 h-3 text-amber-500 fill-current" /> {salon.avgRating ? salon.avgRating.toFixed(1) : (salon.rating || 'New')}
                           </div>
                        </div>
                      </div>
                   ))}
                   
                   {validMapSalons.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-medium">
                         {isAr ? 'لا تتوفر إحداثيات للصالونات لعرضها على الخريطة' : 'No salon coordinates available to display on map'}
                      </div>
                   )}
                </div>
             );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedSalons.map((salon, i) => (
                <motion.div `;

content = content.replace(oldGridBlock, newGridBlockPlaceholder);

const oldEmptyGrid = `{salons.length === 0 && !isLoadingData && (
            <div className="col-span-full text-center py-12 text-zinc-500">
              {isAr ? 'لا يوجد صالونات متاحة حالياً.' : 'No salons available right now.'}
            </div>
          )}
        </div>`;
const newEmptyGrid = `{processedSalons.length === 0 && !isLoadingData && (
                <div className="col-span-full text-center py-12 text-zinc-500">
                  {isAr ? 'لا يوجد صالونات متاحة حالياً.' : 'No salons available right now.'}
                </div>
              )}
            </div>
          );
        })()}
        `;
content = content.replace(oldEmptyGrid, newEmptyGrid);

fs.writeFileSync('src/screens/ClientApp.tsx', content);
