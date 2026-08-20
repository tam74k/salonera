const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// 1. Remove old COUNTRIES import and add useState/useEffect for new locations
content = content.replace(
  "import { COUNTRIES } from '../lib/locations';",
  ""
);

const hooksStart = "const [activeTab, setActiveTab] = useState('dashboard');";
const newHooks = `const [activeTab, setActiveTab] = useState('dashboard');
  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [governoratesList, setGovernoratesList] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [salonGov, setSalonGov] = useState<number | string>('');

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
  }, []);`;

content = content.replace(hooksStart, newHooks);

// 2. Change salonCountry to number | string
content = content.replace("const [salonCountry, setSalonCountry] = useState('');", "const [salonCountry, setSalonCountry] = useState<number | string>('');");
content = content.replace("const [salonCity, setSalonCity] = useState('');", "const [salonCity, setSalonCity] = useState<number | string>('');");

// 3. Update loading logic for locations
const setCountryLogic = `setSalonCountry(salon.country_id || salon.country || '');
        setSalonGov(salon.governorate_id || '');
        setSalonCity(salon.city_id || salon.city || '');`;
        
content = content.replace(
  "setSalonCountry(salon.country || '');\n        setSalonCity(salon.city || '');",
  setCountryLogic
);

// 4. Update save logic for locations
const saveLogic = `country_id: salonCountry ? parseInt(salonCountry.toString()) : null,
      governorate_id: salonGov ? parseInt(salonGov.toString()) : null,
      city_id: salonCity ? parseInt(salonCity.toString()) : null,`;

content = content.replace(
  "country: salonCountry,\n      city: salonCity,",
  saveLogic
);

// 5. Update the UI for Location (GPS) section
const oldLocationUI = `<div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'الدولة' : 'Country'}</label>
                    <select value={salonCountry} onChange={(e) => { setSalonCountry(e.target.value); setSalonCity(''); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none font-medium">
                      <option value="">{isAr ? 'اختر الدولة' : 'Select Country'}</option>
                      {COUNTRIES.map(c => <option key={c.id} value={c.id}>{isAr ? c.name_ar : c.name_en}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'المدينة / المحافظة' : 'City / Governorate'}</label>
                    <select value={salonCity} onChange={(e) => setSalonCity(e.target.value)} disabled={!salonCountry} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none font-medium disabled:opacity-50">
                      <option value="">{isAr ? 'اختر المدينة' : 'Select City'}</option>
                      {salonCountry && COUNTRIES.find(c => c.id === salonCountry)?.cities.map(city => <option key={city.id} value={city.id}>{isAr ? city.name_ar : city.name_en}</option>)}
                    </select>
                  </div>
                </div>`;

const newLocationUI = `<div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'الدولة' : 'Country'}</label>
                    <select value={salonCountry} onChange={(e) => { setSalonCountry(e.target.value); setSalonGov(''); setSalonCity(''); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none font-medium">
                      <option value="">{isAr ? 'اختر الدولة' : 'Select Country'}</option>
                      {countriesList.map(c => <option key={c.id} value={c.id}>{isAr ? c.name_ar : c.name_en}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'المحافظة / المنطقة' : 'Governorate / Region'}</label>
                    <select value={salonGov} onChange={(e) => { setSalonGov(e.target.value); setSalonCity(''); }} disabled={!salonCountry} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none font-medium disabled:opacity-50">
                      <option value="">{isAr ? 'اختر المحافظة' : 'Select Governorate'}</option>
                      {governoratesList.filter(g => g.country_id.toString() === salonCountry.toString()).map(g => <option key={g.id} value={g.id}>{isAr ? g.name_ar : g.name_en}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">{isAr ? 'المدينة' : 'City'}</label>
                    <select value={salonCity} onChange={(e) => setSalonCity(e.target.value)} disabled={!salonGov} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none font-medium disabled:opacity-50">
                      <option value="">{isAr ? 'اختر المدينة' : 'Select City'}</option>
                      {citiesList.filter(ci => ci.governorate_id.toString() === salonGov.toString()).map(city => <option key={city.id} value={city.id}>{isAr ? city.name_ar : city.name_en}</option>)}
                    </select>
                  </div>
                </div>`;

content = content.replace(oldLocationUI, newLocationUI);

// 6. Fix Staff input width (it was md:grid-cols-2 for First Name)
content = content.replace(
  `<div className="grid md:grid-cols-2 gap-4 mb-4">
                      <AdminInput 
                          labelAr="الاسم الأول (عربي)" labelEn="First Name (English)" 
                          valueAr={newArtistData.first_name_ar} valueEn={newArtistData.first_name_en}`,
  `<div className="grid md:grid-cols-1 gap-4 mb-4">
                      <AdminInput 
                          labelAr="الاسم الأول (عربي)" labelEn="First Name (English)" 
                          valueAr={newArtistData.first_name_ar} valueEn={newArtistData.first_name_en}`
);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
