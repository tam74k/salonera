const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// Add new states
const statesToAdd = `
  const [salonSettingsData, setSalonSettingsData] = useState<any>({
    name_ar: '', name_en: '', description_ar: '', description_en: '',
    address_ar: '', address_en: '', mobile: '', email: '', whatsapp: '',
    working_hours_start: '09:00', working_hours_end: '22:00', images: [],
    instagram: '', facebook: '', tiktok: '', x: ''
  });
  const [srvDiscountPrice, setSrvDiscountPrice] = useState('');
  
  // New artist creation state
  const [newArtistData, setNewArtistData] = useState({
    email: '', mobile: '', first_name_ar: '', first_name_en: '', password: '123456', avatar_url: ''
  });
`;

content = content.replace("const [isSavingSettings, setIsSavingSettings] = useState(false);", "const [isSavingSettings, setIsSavingSettings] = useState(false);\n" + statesToAdd);

// Update fetchSalonAndBookings
const fetchUpdate = `
        setSalonData(salon);
        setEvoInstance(salon.evolution_instance || '');
        setEvoApiKey(salon.evolution_api_key || '');
        setSalonCountry(salon.country || '');
        setSalonCity(salon.city || '');
        setSalonLat(salon.lat || null);
        setSalonLng(salon.lng || null);
        
        setSalonSettingsData({
          name_ar: salon.name_ar || '',
          name_en: salon.name_en || '',
          description_ar: salon.description_ar || '',
          description_en: salon.description_en || '',
          address_ar: salon.address_ar || '',
          address_en: salon.address_en || '',
          mobile: salon.mobile || '',
          email: salon.email || '',
          whatsapp: salon.whatsapp || '',
          working_hours_start: salon.working_hours_start || '09:00',
          working_hours_end: salon.working_hours_end || '22:00',
          images: salon.images || [],
          instagram: salon.social_media?.instagram || '',
          facebook: salon.social_media?.facebook || '',
          tiktok: salon.social_media?.tiktok || '',
          x: salon.social_media?.x || ''
        });
`;

content = content.replace(/setSalonData\(salon\);\s*setEvoInstance\(salon\.evolution_instance \|\| ''\);\s*setEvoApiKey\(salon\.evolution_api_key \|\| ''\);\s*setSalonCountry\(salon\.country \|\| ''\);\s*setSalonCity\(salon\.city \|\| ''\);\s*setSalonLat\(salon\.lat \|\| null\);\s*setSalonLng\(salon\.lng \|\| null\);/, fetchUpdate);

// Update handleSaveService
const saveSrvOld = `
    const { error } = await supabase.from('services').insert({
      salon_id: salonData.id,
      name_ar: srvNameAr,
      name_en: srvNameEn || srvNameAr,
      original_price: parseFloat(srvPrice),
      duration_minutes: parseInt(srvDuration) || 30
    });
`;

const saveSrvNew = `
    const { error } = await supabase.from('services').insert({
      salon_id: salonData.id,
      name_ar: srvNameAr,
      name_en: srvNameEn || srvNameAr,
      original_price: parseFloat(srvPrice),
      discount_price: srvDiscountPrice ? parseFloat(srvDiscountPrice) : null,
      duration_minutes: parseInt(srvDuration) || 30
    });
`;
content = content.replace(saveSrvOld, saveSrvNew);

// Update handleSaveService reset
content = content.replace("setSrvNameAr(''); setSrvNameEn(''); setSrvPrice('');", "setSrvNameAr(''); setSrvNameEn(''); setSrvPrice(''); setSrvDiscountPrice('');");

// Update handleSaveSettings
const saveSettingsOld = `
  const handleSaveSettings = async () => {
    if (!salonData) return;
    setIsSavingSettings(true);
    const { error } = await supabase.from('salons').update({
      evolution_instance: evoInstance,
      evolution_api_key: evoApiKey,
      country: salonCountry,
      city: salonCity,
      lat: salonLat,
      lng: salonLng
    }).eq('id', salonData.id);
`;

const saveSettingsNew = `
  const handleSaveSettings = async () => {
    if (!salonData) return;
    setIsSavingSettings(true);
    const { error } = await supabase.from('salons').update({
      evolution_instance: evoInstance,
      evolution_api_key: evoApiKey,
      country: salonCountry,
      city: salonCity,
      lat: salonLat,
      lng: salonLng,
      name_ar: salonSettingsData.name_ar,
      name_en: salonSettingsData.name_en,
      description_ar: salonSettingsData.description_ar,
      description_en: salonSettingsData.description_en,
      address_ar: salonSettingsData.address_ar,
      address_en: salonSettingsData.address_en,
      mobile: salonSettingsData.mobile,
      email: salonSettingsData.email,
      whatsapp: salonSettingsData.whatsapp,
      working_hours_start: salonSettingsData.working_hours_start,
      working_hours_end: salonSettingsData.working_hours_end,
      images: salonSettingsData.images,
      social_media: {
        instagram: salonSettingsData.instagram,
        facebook: salonSettingsData.facebook,
        tiktok: salonSettingsData.tiktok,
        x: salonSettingsData.x
      }
    }).eq('id', salonData.id);
`;

content = content.replace(saveSettingsOld, saveSettingsNew);

// Create save new artist function
const addStaffRPC = `
  const handleSaveNewArtist = async () => {
    if (!newArtistData.email || !salonData) return;
    setIsSavingStaff(true);
    try {
      const { data, error } = await supabase.rpc('create_artist_user', {
        p_email: newArtistData.email,
        p_password: newArtistData.password,
        p_first_name_ar: newArtistData.first_name_ar,
        p_first_name_en: newArtistData.first_name_en,
        p_mobile: newArtistData.mobile,
        p_salon_id: salonData.id,
        p_avatar_url: newArtistData.avatar_url
      });
      if (error) {
        alert(error.message);
      } else {
        setShowAddStaff(false);
        setNewArtistData({ email: '', mobile: '', first_name_ar: '', first_name_en: '', password: '123456', avatar_url: '' });
        fetchSalonAndBookings();
      }
    } catch(e) {
      console.error(e);
    }
    setIsSavingStaff(false);
  };
`;

content = content.replace("const handleSaveSettings = async () => {", addStaffRPC + "\n  const handleSaveSettings = async () => {");

fs.writeFileSync('src/screens/Dashboards.tsx', content);
