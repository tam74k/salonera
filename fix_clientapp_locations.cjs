const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

const hooksStart = "const [step, setStep] = useState<BookingStep>('salons');";
const newHooks = `const [step, setStep] = useState<BookingStep>('salons');
  
  // Location filters
  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [governoratesList, setGovernoratesList] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  
  const [filterCountry, setFilterCountry] = useState<number | string>('');
  const [filterGov, setFilterGov] = useState<number | string>('');
  const [filterCity, setFilterCity] = useState<number | string>('');

  useEffect(() => {
    const fetchLocs = async () => {
      const [cRes, gRes, ciRes] = await Promise.all([
        supabase.from('countries').select('*').order('name_ar'),
        supabase.from('governorates').select('*').order('name_ar'),
        supabase.from('cities').select('*').order('name_ar')
      ]);
      if (cRes.data) setCountriesList(cRes.data);
      if (gRes.data) setGovernoratesList(gRes.data);
      if (ciRes.data) setCitiesList(ciRes.data);
    };
    fetchLocs();
  }, []);
`;

content = content.replace(hooksStart, newHooks);

const listStart = `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`;
const newFiltersUI = `
        {/* Filters */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            {isAr ? 'تصفية الصالونات حسب المنطقة' : 'Filter Salons by Region'}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <select value={filterCountry} onChange={e => { setFilterCountry(e.target.value); setFilterGov(''); setFilterCity(''); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-medium">
                <option value="">{isAr ? 'كل الدول' : 'All Countries'}</option>
                {countriesList.map(c => <option key={c.id} value={c.id}>{isAr ? c.name_ar : c.name_en}</option>)}
              </select>
            </div>
            <div>
              <select value={filterGov} onChange={e => { setFilterGov(e.target.value); setFilterCity(''); }} disabled={!filterCountry} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-medium disabled:opacity-50">
                <option value="">{isAr ? 'كل المحافظات' : 'All Governorates'}</option>
                {governoratesList.filter(g => g.country_id.toString() === filterCountry.toString()).map(g => <option key={g.id} value={g.id}>{isAr ? g.name_ar : g.name_en}</option>)}
              </select>
            </div>
            <div>
              <select value={filterCity} onChange={e => setFilterCity(e.target.value)} disabled={!filterGov} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-medium disabled:opacity-50">
                <option value="">{isAr ? 'كل المدن' : 'All Cities'}</option>
                {citiesList.filter(ci => ci.governorate_id.toString() === filterGov.toString()).map(city => <option key={city.id} value={city.id}>{isAr ? city.name_ar : city.name_en}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
`;

content = content.replace(listStart, newFiltersUI);

// Filter the salons mapping
const mapStart = `{salons.map((salon, i) => (`;
const newMap = `{salons.filter(s => {
            if (filterCountry && s.country_id?.toString() !== filterCountry.toString()) return false;
            if (filterGov && s.governorate_id?.toString() !== filterGov.toString()) return false;
            if (filterCity && s.city_id?.toString() !== filterCity.toString()) return false;
            return true;
          }).map((salon, i) => (`;

content = content.replace(mapStart, newMap);

fs.writeFileSync('src/screens/ClientApp.tsx', content);
