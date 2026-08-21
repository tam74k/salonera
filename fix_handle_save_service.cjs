const fs = require('fs');
let content = fs.readFileSync('src/screens/Dashboards.tsx', 'utf8');

const targetSave = `  const handleSaveService = async () => {
    if (!srvNameAr || !srvPrice || !salonData) return;
    setIsSavingSrv(true);
    const { error } = await supabase.from('services').insert({
      salon_id: salonData.id,
      name_ar: srvNameAr,
      name_en: srvNameEn || srvNameAr,
      original_price: parseFloat(srvPrice),
      discount_price: srvDiscountPrice ? parseFloat(srvDiscountPrice) : null,
      duration_minutes: parseInt(srvDuration) || 30
    });
    setIsSavingSrv(false);
    if (!error) {
      setShowAddService(false);
      setSrvNameAr(''); setSrvNameEn(''); setSrvPrice(''); setSrvDiscountPrice('');
      fetchSalonAndBookings();
    } else {
      alert('Error saving service');
    }
  };`;

const replacementSave = `  const handleSaveService = async () => {
    if (!srvNameAr || !srvPrice || !salonData) return;
    setIsSavingSrv(true);
    
    const serviceData = {
      salon_id: salonData.id,
      name_ar: srvNameAr,
      name_en: srvNameEn || srvNameAr,
      original_price: parseFloat(srvPrice),
      discount_price: srvDiscountPrice ? parseFloat(srvDiscountPrice) : null,
      duration_minutes: parseInt(srvDuration) || 30
    };

    let error;
    if (editingServiceId) {
      const { error: updateError } = await supabase.from('services').update(serviceData).eq('id', editingServiceId);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('services').insert(serviceData);
      error = insertError;
    }
    
    setIsSavingSrv(false);
    if (!error) {
      setShowAddService(false);
      setEditingServiceId(null);
      setSrvNameAr(''); setSrvNameEn(''); setSrvPrice(''); setSrvDiscountPrice(''); setSrvDuration('30');
      fetchSalonAndBookings();
    } else {
      alert('Error saving service');
    }
  };
  
  const handleEditService = (service: any) => {
    setEditingServiceId(service.id);
    setSrvNameAr(service.name_ar || '');
    setSrvNameEn(service.name_en || '');
    setSrvPrice(service.original_price?.toString() || '');
    setSrvDiscountPrice(service.discount_price?.toString() || '');
    setSrvDuration(service.duration_minutes?.toString() || '30');
    setShowAddService(true);
  };`;

content = content.replace(targetSave, replacementSave);
fs.writeFileSync('src/screens/Dashboards.tsx', content);
console.log('Fixed handle save');
