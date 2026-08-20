const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

// Load user's saved location when fetching locations
const hooksEnd = "fetchLocs();\n  }, []);";
const hookUpdate = `fetchLocs();
    // Load user's saved location preferences if any
    const fetchUserProfile = async () => {
      if (user) {
        const { data } = await supabase.from('profiles').select('country_id, governorate_id, city_id').eq('id', user.id).single();
        if (data) {
          if (data.country_id) setFilterCountry(data.country_id.toString());
          if (data.governorate_id) setFilterGov(data.governorate_id.toString());
          if (data.city_id) setFilterCity(data.city_id.toString());
        }
      }
    };
    fetchUserProfile();
  }, [user]);

  // Save profile location automatically
  const updateProfileLocation = async (country: string | number, gov: string | number, city: string | number) => {
    if (user) {
      await supabase.from('profiles').update({
        country_id: country ? parseInt(country.toString()) : null,
        governorate_id: gov ? parseInt(gov.toString()) : null,
        city_id: city ? parseInt(city.toString()) : null
      }).eq('id', user.id);
    }
  };
`;

content = content.replace(hooksEnd, hookUpdate);

const oldSelectCountry = `onChange={e => { setFilterCountry(e.target.value); setFilterGov(''); setFilterCity(''); }}`;
const newSelectCountry = `onChange={e => { const val = e.target.value; setFilterCountry(val); setFilterGov(''); setFilterCity(''); updateProfileLocation(val, '', ''); }}`;

const oldSelectGov = `onChange={e => { setFilterGov(e.target.value); setFilterCity(''); }}`;
const newSelectGov = `onChange={e => { const val = e.target.value; setFilterGov(val); setFilterCity(''); updateProfileLocation(filterCountry, val, ''); }}`;

const oldSelectCity = `onChange={e => setFilterCity(e.target.value)}`;
const newSelectCity = `onChange={e => { const val = e.target.value; setFilterCity(val); updateProfileLocation(filterCountry, filterGov, val); }}`;

content = content.replace(oldSelectCountry, newSelectCountry);
content = content.replace(oldSelectGov, newSelectGov);
content = content.replace(oldSelectCity, newSelectCity);

fs.writeFileSync('src/screens/ClientApp.tsx', content);
