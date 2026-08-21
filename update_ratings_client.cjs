const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

// 1. Add state for sorting
content = content.replace(
  "const [filterCity, setFilterCity] = useState('');",
  "const [filterCity, setFilterCity] = useState('');\n  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');"
);

// 2. Update fetchSalons
const oldFetchSalons = `  const fetchSalons = async (lat?: number, lng?: number) => {
    setIsLoadingData(true);
    const { data } = await supabase.from('salons').select('*, country:countries(currency_ar, currency_en)');
    let loadedSalons = data || [];
    
    // Calculate distance and sort if lat/lng available
    if (lat && lng) {
      loadedSalons = loadedSalons.map(salon => {
        if (salon.lat && salon.lng) {
          const dist = getDistanceFromLatLonInKm(lat, lng, salon.lat, salon.lng);
          return { ...salon, computedDistance: dist };
        }
        return { ...salon, computedDistance: Infinity }; // No location, put at end
      }).sort((a, b) => a.computedDistance - b.computedDistance);
    }
    setSalons(loadedSalons);
    setIsLoadingData(false);
  };`;

const newFetchSalons = `  const fetchSalons = async (lat?: number, lng?: number) => {
    setIsLoadingData(true);
    const { data: salonsData } = await supabase.from('salons').select('*, country:countries(currency_ar, currency_en)');
    const { data: reviewsData } = await supabase.from('reviews').select('rating, bookings!inner(salon_id)');
    
    // aggregate ratings
    const ratingsMap: Record<string, { total: number, count: number }> = {};
    if (reviewsData) {
      reviewsData.forEach((r: any) => {
        const salonId = r.bookings?.salon_id;
        if (salonId) {
          if (!ratingsMap[salonId]) ratingsMap[salonId] = { total: 0, count: 0 };
          ratingsMap[salonId].total += r.rating;
          ratingsMap[salonId].count += 1;
        }
      });
    }

    let loadedSalons = salonsData || [];
    loadedSalons = loadedSalons.map(salon => {
      const ratingInfo = ratingsMap[salon.id];
      const avgRating = ratingInfo ? (ratingInfo.total / ratingInfo.count) : 0;
      let dist = null;
      if (lat && lng && salon.lat && salon.lng) {
        dist = getDistanceFromLatLonInKm(lat, lng, salon.lat, salon.lng);
      }
      return { 
        ...salon, 
        computedDistance: dist !== null ? dist : Infinity, 
        avgRating, 
        reviewsCount: ratingInfo ? ratingInfo.count : 0 
      };
    });

    setSalons(loadedSalons);
    setIsLoadingData(false);
  };`;

content = content.replace(oldFetchSalons, newFetchSalons);

// 3. Add useMemo for filtered and sorted salons
const filterMapRegex = /\{salons\.filter\(\(s: any\) => \{([^]*?)\}\)\.map\(\(salon, i\) => \(/m;
// Wait, the regex needs to be precise. 
// Let's just find the exact block:
const oldRenderSalons = `{salons.filter(s => {
            // Allow salons with no country assigned yet to appear as a fallback so they aren't hidden from their owners
            if (filterCountry && s.country_id && s.country_id?.toString() !== filterCountry.toString()) return false;
            if (filterGov && s.governorate_id && s.governorate_id?.toString() !== filterGov.toString()) return false;
            if (filterCity && s.city_id && s.city_id?.toString() !== filterCity.toString()) return false;
            if (s.type && s.type !== 'both' && s.type !== filterSalonType) return false;
            return true;
          }).map((salon, i) => (`;

const newRenderSalons = `{salons.filter(s => {
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
          .map((salon, i) => (`;

content = content.replace(oldRenderSalons, newRenderSalons);

// 4. Add sorting UI dropdown inside the filters row
const filtersRow = `<select 
                value={filterCity}`;
const filtersRowReplacement = `<select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'distance' | 'rating')}
                className="bg-white border border-zinc-200 text-sm font-medium rounded-xl px-4 py-2.5 outline-none appearance-none cursor-pointer hover:border-zinc-300 transition-colors"
                style={{ backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: isAr ? 'left 12px center' : 'right 12px center', backgroundSize: '16px', paddingRight: isAr ? '16px' : '40px', paddingLeft: isAr ? '40px' : '16px' }}
              >
                <option value="distance">{isAr ? 'الأقرب مسافة' : 'Nearest'}</option>
                <option value="rating">{isAr ? 'الأعلى تقييماً' : 'Highest Rating'}</option>
              </select>
              <select 
                value={filterCity}`;
                
content = content.replace(filtersRow, filtersRowReplacement);

// 5. Show rating on the salon card
const oldLocationText = `<div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                  <MapPin className="w-4 h-4" />`;
const newLocationText = `<div className="flex items-center gap-3 mb-2">
                  {salon.avgRating > 0 && (
                     <div className="flex items-center gap-1 text-amber-500 text-sm font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{salon.avgRating.toFixed(1)}</span>
                        <span className="text-amber-600/60 font-medium text-xs ml-1">({salon.reviewsCount})</span>
                     </div>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 text-sm">
                  <MapPin className="w-4 h-4" />`;
content = content.replace(oldLocationText, newLocationText);

fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log("Applied ratings fetching, sorting UI, and display to ClientApp.tsx");
