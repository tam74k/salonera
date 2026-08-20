const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

// Fix handleSaveNewArtist
const handleSaveNewArtistRegex = /const handleSaveNewArtist = async \(\) => \{[\s\S]*?\}\s*catch\s*\(e\)\s*\{\s*console\.error\(e\);\s*\}/;

const newHandleSaveNewArtist = `const handleSaveNewArtist = async () => {
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
        p_avatar_url: newArtistData.avatar_url,
        p_bio_ar: newArtistData.bio_ar,
        p_bio_en: newArtistData.bio_en
      });
      if (error) {
        alert(error.message);
      } else {
        setShowAddStaff(false);
        setNewArtistData({ email: '', mobile: '', first_name_ar: '', first_name_en: '', password: '123456', avatar_url: '', bio_ar: '', bio_en: '' });
        fetchSalonAndBookings();
      }
    } catch(e:any) {
      console.error(e);
      alert(e.message || 'Error saving artist');
    } finally {
      setIsSavingStaff(false);
    }`;

content = content.replace(handleSaveNewArtistRegex, newHandleSaveNewArtist);

// Fix handleSaveService
const handleSaveServiceRegex = /const handleSaveService = async \(\) => \{[\s\S]*?setIsSavingSrv\(false\);\s*if \(!error\) \{[\s\S]*?else \{\s*alert\('Error saving service'\);\s*\}/;

const newHandleSaveService = `const handleSaveService = async () => {
    if (!srvNameAr || !srvPrice || !salonData) {
      alert("Please fill required fields (Name and Price)");
      return;
    }
    setIsSavingSrv(true);
    try {
      const { error } = await supabase.from('services').insert({
        salon_id: salonData.id,
        name_ar: srvNameAr,
        name_en: srvNameEn || srvNameAr,
        original_price: parseFloat(srvPrice),
        discount_price: srvDiscountPrice ? parseFloat(srvDiscountPrice) : null,
        duration_minutes: parseInt(srvDuration) || 30
      });
      if (!error) {
        setShowAddService(false);
        setSrvNameAr(''); setSrvNameEn(''); setSrvPrice(''); setSrvDiscountPrice('');
        fetchSalonAndBookings();
      } else {
        alert('Error saving service: ' + error.message);
      }
    } catch(e:any) {
      console.error(e);
      alert(e.message || 'Error saving service');
    } finally {
      setIsSavingSrv(false);
    }`;

content = content.replace(handleSaveServiceRegex, newHandleSaveService);

fs.writeFileSync('src/screens/Dashboards.tsx', content);
