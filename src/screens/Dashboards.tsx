import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../store';
import { translations } from '../i18n';
import { CheckCircle2, Clock, PlusCircle, Settings, Users, Calendar, LayoutDashboard, MessageSquare, Scissors, XCircle, Loader2 } from 'lucide-react';
import { AdminInput } from '../components/AdminInput';
import { Scanner } from '@yudiel/react-qr-scanner';
import { sendWhatsAppMessage } from '../lib/whatsapp';
import { supabase } from '../lib/supabase';
import { COUNTRIES } from '../lib/locations';

export function Dashboards() {
  const { lang, isAr, role, user } = useAppContext();
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState('dashboard');
  const [salonData, setSalonData] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals / forms state
  const [showAddService, setShowAddService] = useState(false);
  const [showAddStaff, setShowAddStaff] = useState(false);

  // Service form
  const [srvNameAr, setSrvNameAr] = useState('');
  const [srvNameEn, setSrvNameEn] = useState('');
  const [srvPrice, setSrvPrice] = useState('');
  const [srvDuration, setSrvDuration] = useState('30');
  const [isSavingSrv, setIsSavingSrv] = useState(false);

  // Staff form
  const [staffIdentifier, setStaffIdentifier] = useState('');
  const [staffRole, setStaffRole] = useState('artist');
  const [isSavingStaff, setIsSavingStaff] = useState(false);

  // Settings form
  const [evoInstance, setEvoInstance] = useState('');
  const [evoApiKey, setEvoApiKey] = useState('');
  const [salonCountry, setSalonCountry] = useState('');
  const [salonCity, setSalonCity] = useState('');
  const [salonLat, setSalonLat] = useState<number | null>(null);
  const [salonLng, setSalonLng] = useState<number | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [salonSettingsData, setSalonSettingsData] = useState<any>({
    name_ar: '', name_en: '', description_ar: '', description_en: '',
    address_ar: '', address_en: '', mobile: '', email: '', whatsapp: '',
    working_hours_start: '09:00', working_hours_end: '22:00', images: [],
    instagram: '', facebook: '', tiktok: '', x: ''
  });
  const [srvDiscountPrice, setSrvDiscountPrice] = useState('');
  
  // New artist creation state
  const [newArtistData, setNewArtistData] = useState({
    email: '', mobile: '', first_name_ar: '', first_name_en: '', password: '123456', avatar_url: '', bio_ar: '', bio_en: ''
  });


  // Artist Dashboard Data
  const [artistBookings, setArtistBookings] = useState<any[]>([]);

  // QR & Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  
  useEffect(() => {
    if (user) {
      if (role === 'artist') {
        fetchArtistBookings();
      } else {
        fetchSalonAndBookings();
      }
    }
  }, [user, role]);

  const fetchArtistBookings = async () => {
    setLoading(true);
    try {
      const { data: stf } = await supabase.from('staff').select('id, salon_id').eq('profile_id', user?.id).single();
      if (stf) {
        const { data: bData } = await supabase
          .from('bookings')
          .select(`
            *,
            client:profiles!client_id(first_name_ar, first_name_en, last_name_ar, mobile),
            details:booking_details(price, services(name_ar, name_en))
          `)
          .eq('staff_id', stf.id)
          .order('booking_date', { ascending: false })
          .order('booking_time', { ascending: true });
        setArtistBookings(bData || []);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchSalonAndBookings = async () => {
    setLoading(true);
    try {
      const { data: salon } = await supabase
        .from('salons')
        .select('*')
        .eq('owner_id', user?.id)
        .single();
      
      if (salon) {
        
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

        
        const [bData, sData, stfData] = await Promise.all([
          supabase
            .from('bookings')
            .select(`
              *,
              client:profiles!client_id(first_name_ar, first_name_en, last_name_ar, mobile),
              staff:staff!staff_id(profile_id, profiles!profile_id(first_name_ar, first_name_en)),
              details:booking_details(price, services(name_ar, name_en))
            `)
            .eq('salon_id', salon.id)
            .order('booking_date', { ascending: false })
            .order('booking_time', { ascending: true }),
          supabase.from('services').select('*').eq('salon_id', salon.id),
          supabase.from('staff').select('*, profile:profiles!profile_id(*)').eq('salon_id', salon.id)
        ]);
        
        setBookings(bData.data || []);
        setServices(sData.data || []);
        setStaffList(stfData.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveService = async () => {
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
  };

  const handleSaveStaff = async () => {
    if (!staffIdentifier || !salonData) return;
    setIsSavingStaff(true);
    
    // Search profile by email or mobile
    const { data: profile } = await supabase.from('profiles')
      .select('*')
      .or(`email.eq.${staffIdentifier},mobile.eq.${staffIdentifier}`)
      .single();

    if (!profile) {
      alert(isAr ? 'لم يتم العثور على مستخدم بهذا البريد/الجوال. يجب عليه التسجيل أولاً.' : 'User not found. They must sign up first.');
      setIsSavingStaff(false);
      return;
    }

    const { error: updateErr } = await supabase.from('profiles').update({ role: staffRole }).eq('id', profile.id);
    if (!updateErr) {
      await supabase.from('staff').insert({
        salon_id: salonData.id,
        profile_id: profile.id,
        is_available: true
      });
      setShowAddStaff(false);
      setStaffIdentifier('');
      fetchSalonAndBookings();
    }
    setIsSavingStaff(false);
  };

  
  
  const handleFileUpload = async (file: File, bucket: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file);
      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return publicUrl;
    } catch (e) {
      console.error('Upload Error:', e);
      alert('Error uploading file');
      return null;
    }
  };

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
        p_avatar_url: newArtistData.avatar_url,
        p_bio_ar: newArtistData.bio_ar,
        p_bio_en: newArtistData.bio_en
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
    setIsSavingSettings(false);
    if (!error) {
      alert(isAr ? 'تم الحفظ بنجاح' : 'Saved successfully');
    }
  };

  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      alert(isAr ? 'الخدمة غير مدعومة في متصفحك' : 'Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition((position) => {
      setSalonLat(position.coords.latitude);
      setSalonLng(position.coords.longitude);
      alert(isAr ? 'تم التقاط الموقع بنجاح' : 'Location captured successfully');
    }, () => {
      alert(isAr ? 'تعذر الوصول للموقع. يرجى تفعيل الـ GPS.' : 'Unable to retrieve your location. Please enable GPS.');
    });
  };

  const updateBookingStatus = async (bookingId: string, status: string, isArtistView = false) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);
      
      if (error) throw error;
      
      let targetBooking = isArtistView 
        ? artistBookings.find(b => b.id === bookingId)
        : bookings.find(b => b.id === bookingId);

      if (isArtistView) {
        setArtistBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      } else {
        setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
      }

      // Send WhatsApp Notification
      if (targetBooking && targetBooking.client?.mobile && salonData) {
        let message = '';
        const clientName = isAr ? targetBooking.client.first_name_ar : targetBooking.client.first_name_en;
        
        if (status === 'confirmed') {
          message = isAr 
            ? `مرحباً ${clientName}،\nتم تأكيد حجزك رقم ${bookingId} بنجاح.\nننتظرك في الموعد!` 
            : `Hello ${clientName},\nYour booking #${bookingId} has been confirmed.\nSee you soon!`;
        } else if (status === 'canceled') {
          message = isAr 
            ? `مرحباً ${clientName}،\nنعتذر منك، تم إلغاء حجزك رقم ${bookingId}.`
            : `Hello ${clientName},\nWe're sorry, your booking #${bookingId} has been canceled.`;
        }

        if (message) {
          // Fetch global settings fallback
          const { data: globalSettings } = await supabase.from('app_settings').select('*').eq('id', 'global').single();
          const apiUrl = globalSettings?.evolution_api_url || 'https://evo.101488.xyz';
          const instance = salonData.evolution_instance || globalSettings?.evolution_instance || 'TamerMostafa';
          const apiKey = salonData.evolution_api_key || globalSettings?.evolution_api_key || '78518239685A-4904-A7C3-827767FA2EEE';

          if (instance && apiKey) {
            await sendWhatsAppMessage(apiUrl, instance, apiKey, targetBooking.client.mobile, message);
          }
        }
      }
    } catch (err) {
      alert('Error updating status');
      console.error(err);
    }
  };

  if (role === 'artist') {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24">
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 text-white p-8 md:p-12 rounded-[2rem] relative overflow-hidden shadow-2xl shadow-indigo-900/20">
          <div className="absolute right-0 top-0 opacity-10">
            <Scissors className="w-64 h-64 -mr-12 -mt-12 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold relative z-10 mb-2">{t.welcome_artist}</h2>
          <p className="text-indigo-200 relative z-10 font-medium">
            {isAr ? `لديك ${artistBookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length} مواعيد قادمة اليوم` : `You have ${artistBookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length} upcoming appointments today`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="grid gap-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              {t.today_bookings}
            </h3>
            {artistBookings.length === 0 ? (
              <div className="p-12 text-center text-slate-500 bg-white rounded-3xl border border-slate-100">
                {isAr ? 'لا يوجد لديك مواعيد حتى الآن.' : 'You have no appointments yet.'}
              </div>
            ) : artistBookings.map((b, i) => (
              <motion.div 
                key={b.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-5 md:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-lg">{b.booking_time}</span>
                    <span className="text-sm font-medium text-slate-400">{b.booking_date}</span>
                    <StatusBadge status={b.status} isAr={isAr} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    {b.client?.first_name_ar || 'Client'}
                  </h4>
                  <p className="text-slate-500 text-sm mt-1">
                    {b.details?.map((d: any) => isAr ? d.services?.name_ar : d.services?.name_en).join(' + ')}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 mt-2 md:mt-0">
                  {b.status === 'confirmed' && (
                    <button onClick={() => updateBookingStatus(b.id, 'completed', true)} className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20">
                      <CheckCircle2 className="w-4 h-4" />
                      {t.mark_completed}
                    </button>
                  )}
                  {b.status === 'pending' && (
                    <span className="text-sm font-medium text-slate-500 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
                      {isAr ? 'بانتظار تأكيد الإدارة' : 'Awaiting Admin Confirmation'}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Admin / Cashier Dashboard View
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 pb-24">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-2">
        <div className="p-4 bg-slate-900 text-white rounded-2xl mb-6">
          <h3 className="font-bold">{isAr ? 'الإدارة' : 'Admin'}</h3>
          <p className="text-xs text-slate-400">{salonData ? (isAr ? salonData.name_ar : salonData.name_en) : '...'}</p>
        </div>
        
        <NavButton icon={LayoutDashboard} label={t.dashboard} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        
        <NavButton icon={Users} label={t.staff_management} active={activeTab === 'staff'} onClick={() => setActiveTab('staff')} />
        <NavButton icon={Scissors} label={t.services_management} active={activeTab === 'services'} onClick={() => setActiveTab('services')} />
        <NavButton icon={MessageSquare} label={t.whatsapp_api_settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 space-y-8">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard title={t.today_bookings} value={bookings.filter(b => b.booking_date === new Date().toISOString().split('T')[0]).length.toString()} />
                  <StatCard title={isAr ? 'إجمالي الحجوزات' : 'Total Bookings'} value={bookings.length.toString()} />
                  <StatCard title={isAr ? 'الحجوزات المكتملة' : 'Completed'} value={bookings.filter(b => b.status === 'completed').length.toString()} />
                </section>
                
                <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                    {isAr ? 'قائمة الحجوزات' : 'Bookings List'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <input 
                      type="text" 
                      placeholder={isAr ? 'بحث بالاسم، الجوال، كود החجز' : 'Search by name, mobile, code'}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input 
                      type="date" 
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors" onClick={() => {
                        const code = prompt(isAr ? 'أدخل كود الحجز من الـ QR' : 'Enter QR Booking Code');
                        if(code) setSearchQuery(code);
                    }}>
                      <XCircle className="w-4 h-4 hidden" /> 
                      {isAr ? 'مسح QR / كود' : 'Scan QR / Code'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    {bookings.length === 0 ? (
                      <p className="text-slate-500 text-center py-8">{t.no_bookings}</p>
                    ) : bookings.filter(b => 
                        (b.client.first_name_en?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         b.client.first_name_ar?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         b.client.mobile?.includes(searchQuery) ||
                         b.id.includes(searchQuery) ||
                         b.booking_date.includes(searchQuery))
                    ).map((b, i) => (
                      <div key={b.id} className="p-4 md:p-6 border border-slate-100 rounded-2xl bg-slate-50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-100 text-indigo-700 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                            #{bookings.length - i}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900">{isAr ? b.client.first_name_ar : b.client.first_name_en}</h4>
                            <p className="text-sm text-slate-500">{b.booking_date} • {b.booking_time}</p>
                            <p className="text-sm font-medium text-slate-600 mt-1">{isAr ? 'الموظف' : 'Staff'}: {isAr ? b.artist.first_name_ar : b.artist.first_name_en}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto">
                          <select 
                            value={b.status} 
                            onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value)}
                            className={`px-4 py-2.5 rounded-xl font-bold text-sm border-0 outline-none w-full md:w-auto ${
                              b.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                              b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                              b.status === 'completed' ? 'bg-indigo-100 text-indigo-700' : 
                              'bg-rose-100 text-rose-700'
                            }`}
                          >
                            <option value="pending">{t.pending}</option>
                            <option value="confirmed">{t.confirmed}</option>
                            <option value="completed">{t.completed}</option>
                            <option value="cancelled">{t.cancelled}</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'services' && (

              <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-indigo-500" />
                    {t.services_management}
                  </h3>
                  <button 
                    onClick={() => setShowAddService(!showAddService)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-semibold text-sm hover:bg-indigo-100 transition-colors"
                  >
                    {showAddService ? <XCircle className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                    {isAr ? 'إضافة خدمة' : 'Add Service'}
                  </button>
                </div>

                {showAddService && (
                  <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-[2rem]">
                    <AdminInput 
                      labelAr="اسم الخدمة (عربي)"
                      labelEn="Service Name (English)"
                      valueAr={srvNameAr}
                      valueEn={srvNameEn}
                      onChangeAr={setSrvNameAr}
                      onChangeEn={setSrvNameEn}
                    />
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.original_price}</label>
                        <input type="number" value={srvPrice} onChange={(e) => setSrvPrice(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">{t.duration} (Minutes)</label>
                        <input type="number" value={srvDuration} onChange={(e) => setSrvDuration(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                      </div>
                    </div>
                    <button 
                      onClick={handleSaveService}
                      disabled={isSavingSrv}
                      className="mt-6 bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors w-full md:w-auto disabled:bg-indigo-400"
                    >
                      {isSavingSrv ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ الخدمة' : 'Save Service')}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.length === 0 ? (
                    <p className="text-slate-500 col-span-full text-center py-8">{isAr ? 'لا يوجد خدمات مضافة' : 'No services added'}</p>
                  ) : services.map(s => (
                    <div key={s.id} className="p-6 border border-slate-100 rounded-3xl bg-white flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 hover:border-indigo-100 hover:-translate-y-1 transition-all">
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{isAr ? s.name_ar : s.name_en}</h4>
                        { (s.description_ar || s.description_en) && 
                          <p className="text-sm text-slate-500 mt-2 line-clamp-2 leading-relaxed">{isAr ? s.description_ar : s.description_en}</p>
                        }
                      </div>
                      <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                        
                          <div className="flex flex-col">
                            {s.discount_price ? (
                              <>
                                <span className="text-xs text-slate-400 line-through">SAR {s.original_price}</span>
                                <span className="font-black text-emerald-600 text-lg">SAR {s.discount_price}</span>
                              </>
                            ) : (
                              <span className="font-black text-indigo-700 text-lg">SAR {s.original_price}</span>
                            )}
                          </div>

                        <span className="text-xs font-bold bg-slate-50 px-3 py-1.5 rounded-lg text-slate-600">{s.duration_minutes} {isAr ? 'دقيقة' : 'min'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'staff' && (
              <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-indigo-500" />
                    {t.staff_management}
                  </h3>
                  <button 
                    onClick={() => setShowAddStaff(!showAddStaff)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl font-semibold text-sm hover:bg-indigo-100 transition-colors"
                  >
                    {showAddStaff ? <XCircle className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                    {isAr ? 'إضافة موظف' : 'Add Staff'}
                  </button>
                </div>

                {showAddStaff && (
                  <div className="mb-8 p-6 bg-slate-50 border border-slate-200 rounded-[2rem]">
                    <p className="text-sm text-slate-600 mb-4 leading-relaxed font-medium">
                      {isAr ? 'لإضافة فني أو موظف، يجب عليه أولاً التسجيل في التطبيق كعميل باستخدام البريد الإلكتروني أو رقم الجوال. بعد ذلك أدخل بريده أو رقمه هنا لتعيينه في صالونك.' : 'To add a staff member, they must first sign up as a client using their email or mobile number. Then, enter it here to assign them to your salon.'}
                    </p>
                    <div className="flex flex-col md:flex-row gap-3">
                      <input 
                        type="text" 
                        value={staffIdentifier}
                        onChange={(e) => setStaffIdentifier(e.target.value)}
                        placeholder={isAr ? 'البريد الإلكتروني أو رقم الجوال' : 'Email or Mobile number'} 
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" 
                        dir="ltr" 
                      />
                      <select 
                        value={staffRole}
                        onChange={(e) => setStaffRole(e.target.value)}
                        className="bg-white border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                      >
                        <option value="artist">{isAr ? 'فني تجميل (Artist)' : 'Artist'}</option>
                        <option value="cashier">{isAr ? 'كاشير (Cashier)' : 'Cashier'}</option>
                      </select>
                      <button 
                        onClick={handleSaveStaff}
                        disabled={isSavingStaff}
                        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:bg-indigo-400"
                      >
                        {isSavingStaff ? (isAr ? 'جاري...' : 'Loading...') : (isAr ? 'بحث وإضافة' : 'Search & Add')}
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staffList.length === 0 ? (
                    <p className="text-slate-500 col-span-full text-center py-8">{isAr ? 'لا يوجد موظفين مضافين' : 'No staff added'}</p>
                  ) : staffList.map(st => (
                    <div key={st.id} className="p-6 border border-slate-100 rounded-3xl bg-white flex items-center gap-4 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 hover:border-indigo-100 hover:-translate-y-1 transition-all">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-50 text-indigo-700 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 shadow-inner">
                        {st.profile?.first_name_en?.[0] || st.profile?.first_name_ar?.[0] || <Users className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 truncate text-lg">
                          {isAr ? st.profile?.first_name_ar : st.profile?.first_name_en} {isAr ? st.profile?.last_name_ar : st.profile?.last_name_en}
                        </h4>
                        <p className="text-sm text-slate-500 truncate mt-0.5">{st.profile?.mobile}</p>
                      </div>
                      <div className="shrink-0 text-xs font-bold bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-100">
                        {st.profile?.role === 'artist' ? (isAr ? 'فني' : 'Artist') : (isAr ? 'كاشير' : 'Cashier')}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-100 text-slate-700'}`}>
      <Icon className={`w-5 h-5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
      {label}
    </button>
  );
}

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <h4 className="text-sm font-medium text-slate-500">{title}</h4>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function StatusBadge({ status, isAr }: { status: string, isAr: boolean }) {
  switch(status) {
    case 'pending': return <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-md">{isAr ? 'قيد الانتظار' : 'Pending'}</span>;
    case 'confirmed': return <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-md">{isAr ? 'مؤكد' : 'Confirmed'}</span>;
    case 'completed': return <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md">{isAr ? 'مكتمل' : 'Completed'}</span>;
    case 'canceled': return <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-1 rounded-md">{isAr ? 'ملغي' : 'Canceled'}</span>;
    default: return null;
  }
}
