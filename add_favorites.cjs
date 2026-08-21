const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

// 1. Add Heart to lucide-react imports
if (!content.includes('Heart,')) {
    content = content.replace("import { MapPin, Star, ArrowRight, ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft, Calendar as CalendarIcon, Clock, User as UserIcon, Loader2, Lock, Save, Eye, X, Map as MapIcon, Grid as GridIcon } from 'lucide-react';", 
    "import { MapPin, Star, ArrowRight, ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft, Calendar as CalendarIcon, Clock, User as UserIcon, Loader2, Lock, Save, Eye, X, Map as MapIcon, Grid as GridIcon, Heart } from 'lucide-react';");
}

// 2. Add state and effect
const stateToAdd = `
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    if (user) {
      const savedFavs = localStorage.getItem(\`favorites_\${user.id}\`);
      if (savedFavs) {
        try { setFavorites(JSON.parse(savedFavs)); } catch(e) {}
      }
    }
  }, [user]);

  const toggleFavorite = (salonId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites(prev => {
      const newFavs = prev.includes(salonId) ? prev.filter(id => id !== salonId) : [...prev, salonId];
      if (user) {
        localStorage.setItem(\`favorites_\${user.id}\`, JSON.stringify(newFavs));
      }
      return newFavs;
    });
  };
`;
if (!content.includes('const [favorites, setFavorites] = useState')) {
    content = content.replace("const [salons, setSalons] = useState<any[]>([]);", stateToAdd + "\n  const [salons, setSalons] = useState<any[]>([]);");
}

// 3. Add Favorite Salons section before Filters
const favSection = `
        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-bold text-zinc-900 mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500 drop-shadow-sm" />
              {isAr ? 'الصالونات المفضلة' : 'Favorite Salons'}
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x custom-scrollbar">
              {salons.filter(s => favorites.includes(s.id)).map(salon => (
                <motion.div 
                  key={\`fav-\${salon.id}\`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => { setSelectedSalon(salon); setCurrentImageIndex(0); setStep('salon-details'); fetchSalonDetails(salon.id); }}
                  className="snap-start shrink-0 w-[280px] bg-white rounded-[20px] overflow-hidden border border-zinc-100 shadow-sm cursor-pointer hover:shadow-md transition-all group relative"
                >
                  <div className="h-36 relative bg-slate-100">
                    {(salon.images?.[0] || salon.image_url) && <img src={salon.images?.[0] || salon.image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                    <button onClick={(e) => toggleFavorite(salon.id, e)} className="absolute top-3 left-3 p-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-full shadow-sm text-rose-500 transition-colors z-10">
                      <Heart className="w-4 h-4 fill-rose-500" />
                    </button>
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-slate-800 z-10 shadow-sm">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      {salon.avgRating ? salon.avgRating.toFixed(1) : (salon.rating || 'New')}
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-zinc-900 text-[15px] truncate mb-1">{isAr ? salon.name_ar : salon.name_en}</h4>
                    <p className="text-xs text-zinc-500 truncate flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{isAr ? salon.address_ar || 'العنوان غير متوفر' : salon.address_en || 'Address not available'}</span>
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}`;

content = content.replace("{/* Filters */}", favSection);

// 4. Add Heart to main cards
const mainCardHeart = `
                <button onClick={(e) => toggleFavorite(salon.id, e)} className="absolute top-3 left-3 p-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-full transition-colors z-10 shadow-sm">
                  <Heart className={\`w-4 h-4 \${favorites.includes(salon.id) ? 'text-rose-500 fill-rose-500' : 'text-zinc-400'}\`} />
                </button>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm`;
content = content.replace('<div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm', mainCardHeart);

// 5. Add Heart to salon details
const detailsBackBtn = `          <button onClick={() => setStep('salons')} className={\`absolute top-4 md:top-6 \${isAr ? 'right-4 md:right-6' : 'left-4 md:left-6'} px-4 py-2.5 bg-zinc-900/60 hover:bg-zinc-900/80 backdrop-blur-md rounded-xl text-white transition-all flex items-center gap-2 font-bold text-sm shadow-xl z-[60] border border-white/20\`}>
            {isAr ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            {isAr ? 'عودة للرئيسية' : 'Back to Home'}
          </button>
          
          <button onClick={() => toggleFavorite(selectedSalon.id)} className={\`absolute top-4 md:top-6 \${isAr ? 'left-4 md:left-6' : 'right-4 md:right-6'} p-2.5 bg-zinc-900/60 hover:bg-zinc-900/80 backdrop-blur-md rounded-xl transition-all shadow-xl z-[60] border border-white/20\`}>
            <Heart className={\`w-6 h-6 \${favorites.includes(selectedSalon.id) ? 'text-rose-500 fill-rose-500' : 'text-white'}\`} />
          </button>
`;
const oldDetailsBackBtn = /<button onClick=\{\(\) => setStep\('salons'\)\} className=\{`absolute top-4 md:top-6 \$\{isAr \? 'right-4 md:right-6' : 'left-4 md:left-6'\} px-4 py-2\.5 bg-zinc-900\/60 hover:bg-zinc-900\/80 backdrop-blur-md rounded-xl text-white transition-all flex items-center gap-2 font-bold text-sm shadow-xl z-\[60\] border border-white\/20`\}>\s*\{isAr \? <ArrowRight className="w-5 h-5" \/> : <ArrowLeft className="w-5 h-5" \/>\}\s*\{isAr \? 'عودة للرئيسية' : 'Back to Home'\}\s*<\/button>/m;
content = content.replace(oldDetailsBackBtn, detailsBackBtn);

fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log("Favorites added.");
