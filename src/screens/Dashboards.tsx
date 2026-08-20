import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../store';
import { translations } from '../i18n';
import { X, CheckCircle2, Image as ImageIcon, Clock, PlusCircle, Settings, Users, Calendar, LayoutDashboard, MessageSquare, Scissors, XCircle, Loader2 } from 'lucide-react';
import { AdminInput } from '../components/AdminInput';
import { Scanner } from '@yudiel/react-qr-scanner';
import { sendWhatsAppMessage } from '../lib/whatsapp';
import { supabase } from '../lib/supabase';


export function Dashboards() {
  const { lang, isAr, role, user } = useAppContext();
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState('dashboard');
  const [artistTab, setArtistTab] = useState('today');
  const [showBookingEditModal, setShowBookingEditModal] = useState(false);
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<any>(null);
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
  }, []);
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
  const [salonCountry, setSalonCountry] = useState<number | string>('');
  const [salonCity, setSalonCity] = useState<number | string>('');
  const [salonLat, setSalonLat] = useState<number | null>(null);
  const [salonLng, setSalonLng] = useState<number | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [salonSettingsData, setSalonSettingsData] = useState<any>({
    name_ar: '', name_en: '', description_ar: '', description_en: '',
    address_ar: '', address_en: '', mobile: '', email: '', whatsapp: '',
    working_hours_start: '09:00', working_hours_end: '22:00', images: [], salon_type: 'both',
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
  const [bookingViewTab, setBookingViewTab] = useState<'active'|'archive'>('active');
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


  // Background task: Auto WhatsApp Reminder (1 Hour before booking)
  useEffect(() => {
    if (role === 'artist' || !bookings || bookings.length === 0 || !salonData) return;

    const checkReminders = async () => {
      const now = new Date();
      
      const remindedIds = JSON.parse(localStorage.getItem('whatsapp_reminders') || '[]');
      let modified = false;
      let apiUrl = '', instance = '', apiKey = '';

      for (const b of bookings) {
        if (b.status === 'confirmed' && !remindedIds.includes(b.id)) {
          const bookingDateTimeStr = `${b.booking_date}T${b.booking_time}`;
          const bookingDate = new Date(bookingDateTimeStr);
          if (isNaN(bookingDate.getTime())) continue;

          const diffMinutes = (bookingDate.getTime() - now.getTime()) / (1000 * 60);

          // If booking is starting in 60 minutes or less (but still in the future)
          if (diffMinutes <= 60 && diffMinutes > 0) {
            if (b.client?.mobile) {
              if (!apiUrl) {
                const { data: globalSettings } = await supabase.from('app_settings').select('*').eq('id', 'global').single();
                apiUrl = globalSettings?.evolution_api_url || 'https://evo.101488.xyz';
                instance = salonData.evolution_instance || globalSettings?.evolution_instance || 'TamerMostafa';
                apiKey = salonData.evolution_api_key || globalSettings?.evolution_api_key || '78518239685A-4904-A7C3-827767FA2EEE';
              }

              const clientName = isAr ? b.client.first_name_ar : b.client.first_name_en;
              const message = isAr 
                ? `تذكير: مرحباً ${clientName}،\nموعدك في الصالون (${b.booking_time}) اقترب ولم يتبق سوى ساعة أو أقل.\nبانتظارك!` 
                : `Reminder: Hello ${clientName},\nYour salon appointment at (${b.booking_time}) is starting in less than an hour.\nSee you soon!`;
              
              await sendWhatsAppMessage(apiUrl, instance, apiKey, b.client.mobile, message);
              remindedIds.push(b.id);
              modified = true;
            }
          }
        }
      }

      if (modified) {
        localStorage.setItem('whatsapp_reminders', JSON.stringify(remindedIds));
      }
    };

    // Check immediately on mount/update, then every 60 seconds
    checkReminders();
    const intervalId = setInterval(checkReminders, 60000);

    return () => clearInterval(intervalId);
  }, [bookings, salonData, role, isAr]);

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
        setSalonCountry(salon.country_id || salon.country || '');
        setSalonGov(salon.governorate_id || '');
        setSalonCity(salon.city_id || salon.city || '');
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
          salon_type: salon.type || 'both',
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
      country_id: salonCountry ? parseInt(salonCountry.toString()) : null,
      governorate_id: salonGov ? parseInt(salonGov.toString()) : null,
      city_id: salonCity ? parseInt(salonCity.toString()) : null,
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
      salon_type: salonSettingsData.salon_type,
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
        } else if (status === 'completed') {
          message = isAr
            ? `مرحباً ${clientName}،\nلقد تم تأكيد وصولك للصالون.\nنتمنى لك تجربة رائعة معنا!`
            : `Hello ${clientName},\nYour arrival has been confirmed.\nWe hope you have a great experience with us!`;
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
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white p-8 md:p-12 rounded-[2rem] relative overflow-hidden shadow-2xl shadow-zinc-900/20">
          <div className="absolute right-0 top-0 opacity-10">
            <Scissors className="w-64 h-64 -mr-12 -mt-12 text-white" />
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold relative z-10 mb-2">{t.welcome_artist}</h2>
          <p className="text-zinc-300 relative z-10 font-medium">
            {isAr ? 'مرحباً بك في لوحة تحكم الفني' : 'Welcome to the Artist Dashboard'}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-[16px] w-fit">
              <button 
                onClick={() => setArtistTab('today')}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${artistTab === 'today' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                {isAr ? 'حجوزات اليوم' : 'Today Bookings'}
              </button>
              <button 
                onClick={() => setArtistTab('upcoming')}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${artistTab === 'upcoming' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                {isAr ? 'حجوزات قادمة' : 'Upcoming Bookings'}
              </button>
              <button 
                onClick={() => setArtistTab('past')}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${artistTab === 'past' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
              >
                {isAr ? 'حجوزات سابقة' : 'Past Bookings'}
              </button>
            </div>

            <div className="grid gap-4">
              {(() => {
                const todayStr = new Date().toISOString().split('T')[0];
                const filtered = artistBookings.filter(b => {
                   if (artistTab === 'today') {
                      return b.booking_date === todayStr && (b.status === 'confirmed' || b.status === 'pending');
                   } else if (artistTab === 'upcoming') {
                      return b.booking_date > todayStr && (b.status === 'confirmed' || b.status === 'pending');
                   } else {
                      return b.booking_date < todayStr || b.status === 'completed' || b.status === 'canceled';
                   }
                }).sort((a, b) => {
                   const dA = new Date(`${a.booking_date}T${a.booking_time}`).getTime();
                   const dB = new Date(`${b.booking_date}T${b.booking_time}`).getTime();
                   return artistTab === 'past' ? dB - dA : dA - dB;
                });

                if (filtered.length === 0) {
                   return (
                      <div className="p-12 text-center text-zinc-500 bg-white rounded-[24px] border border-zinc-100">
                        {isAr ? 'لا يوجد مواعيد في هذا القسم' : 'No bookings in this section'}
                      </div>
                   );
                }

                return filtered.map((b, i) => (
                  <motion.div 
                    key={b.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-5 md:p-6 rounded-[24px] border border-zinc-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group cursor-pointer"
                    onClick={() => { setSelectedBookingForEdit(b); setShowBookingEditModal(true); }}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-bold text-zinc-900 bg-zinc-100 px-3 py-1 rounded-lg">{b.booking_time}</span>
                        <span className="text-sm font-medium text-zinc-400">{b.booking_date}</span>
                        <StatusBadge status={b.status} isAr={isAr} />
                      </div>
                      <h4 className="text-lg font-bold text-zinc-900">
                        {isAr ? (b.client?.first_name_ar || b.client?.first_name_en) : (b.client?.first_name_en || b.client?.first_name_ar) || 'Client'}
                      </h4>
                      <p className="text-zinc-500 text-sm mt-1 flex flex-wrap gap-1">
                        {b.details?.map((d: any, idx: number) => (
                          <span key={idx} className="bg-slate-100 px-2 py-1 rounded-md text-zinc-600 font-medium text-xs">
                             {isAr ? d.services?.name_ar : d.services?.name_en}
                          </span>
                        ))}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2 md:mt-0">
                      {artistTab === 'today' && b.status === 'confirmed' && (
                        <button onClick={(e) => { e.stopPropagation(); updateBookingStatus(b.id, 'completed', true); }} className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/20">
                          <CheckCircle2 className="w-4 h-4" />
                          {isAr ? 'تأكيد وصول العميل (مكتمل)' : 'Mark Arrived (Completed)'}
                        </button>
                      )}
                      {artistTab === 'today' && b.status === 'pending' && (
                        <span className="text-sm font-medium text-zinc-500 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-200">
                          {isAr ? 'بانتظار الإدارة' : 'Awaiting Admin'}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    );
  }


  const currCountry = countriesList.find(c => c.id === (salonData?.country_id || salonData?.country));
  const currSymbol = currCountry ? (isAr ? currCountry.currency_ar : currCountry.currency_en) : (isAr ? 'ر.س' : 'SAR');
  // Admin / Cashier Dashboard View
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col md:flex-row gap-8 pb-24">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-2">
        <div className="p-4 bg-zinc-900 text-white rounded-[16px] mb-6">
          <h3 className="font-bold">{isAr ? 'الإدارة' : 'Admin'}</h3>
          <p className="text-xs text-zinc-400">{salonData ? (isAr ? salonData.name_ar : salonData.name_en) : '...'}</p>
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
            <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
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
                
                <section className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-zinc-100">
                  
{(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Process Active vs Archive
    const processedBookings = bookings.filter(b => {
      if (bookingViewTab === 'active') {
        if (b.status === 'completed' || b.status === 'cancelled') return false;
        if (!searchQuery && b.booking_date !== todayStr) return false;
      } else {
        if (b.status === 'pending' || b.status === 'confirmed') return false;
      }

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          b.client.first_name_en?.toLowerCase().includes(q) || 
          b.client.first_name_ar?.toLowerCase().includes(q) || 
          b.client.mobile?.includes(q) ||
          b.id.includes(q) ||
          b.booking_date.includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      const dateA = new Date(`${a.booking_date}T${a.booking_time}`).getTime();
      const dateB = new Date(`${b.booking_date}T${b.booking_time}`).getTime();
      return bookingViewTab === 'active' ? dateA - dateB : dateB - dateA;
    });

    return (
      <>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-zinc-500" />
            {isAr ? 'قائمة الحجوزات' : 'Bookings List'}
          </h3>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => { setBookingViewTab('active'); setSearchQuery(''); }}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${bookingViewTab === 'active' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              {isAr ? 'النشطة (اليوم)' : 'Active (Today)'}
            </button>
            <button 
              onClick={() => { setBookingViewTab('archive'); setSearchQuery(''); }}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${bookingViewTab === 'archive' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              {isAr ? 'الأرشيف' : 'Archive'}
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <input 
            type="text" 
            placeholder={isAr ? 'بحث بالاسم، الجوال، كود الحجز' : 'Search by name, mobile, code'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:col-span-2 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input 
            type="date" 
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="flex items-center justify-center gap-2 bg-zinc-100 text-zinc-900 px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors" onClick={() => {
              const code = prompt(isAr ? 'أدخل كود الحجز من الـ QR' : 'Enter QR Booking Code');
              if(code) setSearchQuery(code);
          }}>
            <XCircle className="w-4 h-4 hidden" /> 
            {isAr ? 'مسح QR / كود' : 'Scan QR / Code'}
          </button>
        </div>

        <div className="space-y-4">
          {processedBookings.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">{bookingViewTab === 'active' ? (isAr ? 'لا يوجد حجوزات نشطة اليوم' : 'No active bookings today') : (isAr ? 'لا يوجد حجوزات في الأرشيف' : 'No bookings in archive')}</p>
          ) : processedBookings.map((b, i) => (
            <div key={b.id} 
              className="p-4 md:p-6 border border-zinc-100 rounded-[16px] bg-white shadow-sm hover:shadow-md cursor-pointer transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              onClick={() => { setSelectedBookingForEdit(b); setShowBookingEditModal(true); }}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 text-zinc-900 rounded-xl flex items-center justify-center font-bold text-lg shrink-0">
                  #{b.id.substring(0, 4)}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900">{isAr ? b.client?.first_name_ar : b.client?.first_name_en}</h4>
                  <p className="text-sm text-zinc-500">{b.booking_date} • {b.booking_time}</p>
                  <p className="text-sm font-medium text-zinc-600 mt-1">{isAr ? 'الموظف' : 'Staff'}: {isAr ? b.artist?.first_name_ar : b.artist?.first_name_en}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <select 
                  value={b.status} 
                  onClick={(e) => e.stopPropagation()} onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                  className={`px-4 py-2.5 rounded-xl font-bold text-sm border-0 outline-none w-full md:w-auto ${
                    b.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                    b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 
                    b.status === 'completed' ? 'bg-indigo-100 text-zinc-900' : 
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
      </>
    );
  })()}
</section>
              </div>
            )}

            
            {activeTab === 'settings' && (
              <section className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-zinc-100">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-emerald-500" />
                    {isAr ? 'إعدادات الصالون' : 'Salon Settings'}
                  </h3>
                </div>

                <div className="grid md:grid-cols-1 gap-4 mb-4">
                  <AdminInput 
                      labelAr="اسم الصالون (عربي)" labelEn="Salon Name (English)" 
                      valueAr={salonSettingsData.name_ar} valueEn={salonSettingsData.name_en} 
                      onChangeAr={(v) => setSalonSettingsData({...salonSettingsData, name_ar: v})} 
                      onChangeEn={(v) => setSalonSettingsData({...salonSettingsData, name_en: v})} 
                  />
                </div>
                <div className="grid md:grid-cols-1 gap-4 mb-4">
                  <AdminInput 
                      labelAr="الوصف (عربي)" labelEn="Description (English)" 
                      valueAr={salonSettingsData.description_ar} valueEn={salonSettingsData.description_en} 
                      onChangeAr={(v) => setSalonSettingsData({...salonSettingsData, description_ar: v})} 
                      onChangeEn={(v) => setSalonSettingsData({...salonSettingsData, description_en: v})} 
                  />
                </div>
                <div className="grid md:grid-cols-1 gap-4 mb-4">
                  <AdminInput 
                      labelAr="العنوان (عربي)" labelEn="Address (English)" 
                      valueAr={salonSettingsData.address_ar} valueEn={salonSettingsData.address_en} 
                      onChangeAr={(v) => setSalonSettingsData({...salonSettingsData, address_ar: v})} 
                      onChangeEn={(v) => setSalonSettingsData({...salonSettingsData, address_en: v})} 
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'نوع الصالون' : 'Salon Type'}</label>
                    <select value={salonSettingsData.salon_type || 'both'} onChange={e => setSalonSettingsData({...salonSettingsData, salon_type: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none font-medium">
                      <option value="both">{isAr ? 'رجالي ونسائي (Both)' : 'Both'}</option>
                      <option value="men">{isAr ? 'رجالي (Men)' : 'Men'}</option>
                      <option value="women">{isAr ? 'نسائي (Women)' : 'Women'}</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'رقم الجوال' : 'Mobile'}</label>
                    <input type="tel" value={salonSettingsData.mobile} onChange={e => setSalonSettingsData({...salonSettingsData, mobile: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                    <input type="email" value={salonSettingsData.email} onChange={e => setSalonSettingsData({...salonSettingsData, email: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'رقم الواتساب' : 'WhatsApp'}</label>
                    <input type="tel" value={salonSettingsData.whatsapp} onChange={e => setSalonSettingsData({...salonSettingsData, whatsapp: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'بداية الدوام' : 'Working Hours Start'}</label>
                    <input type="time" value={salonSettingsData.working_hours_start} onChange={e => setSalonSettingsData({...salonSettingsData, working_hours_start: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'نهاية الدوام' : 'Working Hours End'}</label>
                    <input type="time" value={salonSettingsData.working_hours_end} onChange={e => setSalonSettingsData({...salonSettingsData, working_hours_end: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none" />
                  </div>
                </div>

                <div className="mt-8 mb-6">
                  <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                    {isAr ? 'صور الصالون' : 'Salon Images'} (Max 3)
                  </h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="flex flex-col gap-2">
                      {salonSettingsData.images?.[i] ? (
                        <div className="relative group">
                          <img src={salonSettingsData.images[i]} alt="" className="w-full h-32 object-cover rounded-xl border border-zinc-200" />
                          <button 
                            onClick={() => {
                               const newImages = [...salonSettingsData.images];
                               newImages.splice(i, 1);
                               setSalonSettingsData({...salonSettingsData, images: newImages});
                            }}
                            className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-zinc-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-zinc-400 flex-col">
                          <ImageIcon className="w-6 h-6 mb-2" />
                          <span className="text-xs">{isAr ? 'اضغط لرفع صورة' : 'Click to upload'}</span>
                          <input 
                            type="file" 
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const url = await handleFileUpload(file, 'salons');
                                if (url) {
                                  const newImages = [...(salonSettingsData.images || [])];
                                  newImages[i] = url;
                                  setSalonSettingsData({...salonSettingsData, images: newImages.filter(Boolean)});
                                }
                              }
                            }} 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 mb-6">
                  <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                    {t.whatsapp_api_settings} (Evolution API)
                  </h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Instance Name</label>
                    <input type="text" value={evoInstance} onChange={(e) => setEvoInstance(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">API Key</label>
                    <input type="password" value={evoApiKey} onChange={(e) => setEvoApiKey(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
                  </div>
                </div>

                <div className="mt-8 mb-6">
                  <h3 className="text-xl font-bold text-zinc-900">{isAr ? 'الموقع الجغرافي (GPS)' : 'Location (GPS)'}</h3>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'الدولة' : 'Country'}</label>
                    <select value={salonCountry} onChange={(e) => { setSalonCountry(e.target.value); setSalonGov(''); setSalonCity(''); }} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none font-medium">
                      <option value="">{isAr ? 'اختر الدولة' : 'Select Country'}</option>
                      {countriesList.map(c => <option key={c.id} value={c.id}>{isAr ? c.name_ar : c.name_en}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'المحافظة / المنطقة' : 'Governorate / Region'}</label>
                    <select value={salonGov} onChange={(e) => { setSalonGov(e.target.value); setSalonCity(''); }} disabled={!salonCountry} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none font-medium disabled:opacity-50">
                      <option value="">{isAr ? 'اختر المحافظة' : 'Select Governorate'}</option>
                      {governoratesList.filter(g => g.country_id.toString() === salonCountry.toString()).map(g => <option key={g.id} value={g.id}>{isAr ? g.name_ar : g.name_en}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'المدينة' : 'City'}</label>
                    <select value={salonCity} onChange={(e) => setSalonCity(e.target.value)} disabled={!salonGov} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none font-medium disabled:opacity-50">
                      <option value="">{isAr ? 'اختر المدينة' : 'Select City'}</option>
                      {citiesList.filter(ci => ci.governorate_id.toString() === salonGov.toString()).map(city => <option key={city.id} value={city.id}>{isAr ? city.name_ar : city.name_en}</option>)}
                    </select>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-medium text-zinc-900">{isAr ? 'إحداثيات الموقع (GPS)' : 'GPS Coordinates'}</p>
                    <p className="text-sm text-zinc-500">
                      {salonLat && salonLng ? `${salonLat.toFixed(4)}, ${salonLng.toFixed(4)}` : (isAr ? 'لم يتم تحديد الموقع بعد' : 'Location not set yet')}
                    </p>
                  </div>
                  <button onClick={handleCaptureLocation} className="px-4 py-2 bg-indigo-100 text-zinc-900 rounded-lg text-sm font-bold hover:bg-indigo-200 transition-colors">
                    {isAr ? 'تحديث الموقع الحالي' : 'Update to Current Location'}
                  </button>
                </div>
                
                <button onClick={handleSaveSettings} disabled={isSavingSettings} className="mt-6 w-full md:w-auto bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors disabled:bg-slate-600">
                  {isSavingSettings ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ الإعدادات' : 'Save Settings')}
                </button>
              </section>
            )}


            {activeTab === 'services' && (

              <section className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-zinc-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                    <Scissors className="w-5 h-5 text-zinc-500" />
                    {t.services_management}
                  </h3>
                  <button 
                    onClick={() => setShowAddService(!showAddService)}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 rounded-xl font-semibold text-sm hover:bg-indigo-100 transition-colors"
                  >
                    {showAddService ? <XCircle className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                    {isAr ? 'إضافة خدمة' : 'Add Service'}
                  </button>
                </div>

                {showAddService && (
                  <div className="mb-8 p-6 bg-zinc-50 border border-zinc-200 rounded-[2rem]">
                    <AdminInput 
                      labelAr="اسم الخدمة (عربي)"
                      labelEn="Service Name (English)"
                      valueAr={srvNameAr}
                      valueEn={srvNameEn}
                      onChangeAr={setSrvNameAr}
                      onChangeEn={setSrvNameEn}
                    />
                    <div className="grid md:grid-cols-3 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">{t.original_price}</label>
                        <input type="number" value={srvPrice} onChange={(e) => setSrvPrice(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'السعر (بعد الخصم اختياري)' : 'Discount Price (Optional)'}</label>
                        <input type="number" value={srvDiscountPrice} onChange={(e) => setSrvDiscountPrice(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">{t.duration} (Minutes)</label>
                        <input type="number" value={srvDuration} onChange={(e) => setSrvDuration(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                      </div>
                    </div>
                    <button 
                      onClick={handleSaveService}
                      disabled={isSavingSrv}
                      className="mt-6 bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-zinc-800 transition-colors w-full md:w-auto disabled:bg-indigo-400"
                    >
                      {isSavingSrv ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ الخدمة' : 'Save Service')}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.length === 0 ? (
                    <p className="text-zinc-500 col-span-full text-center py-8">{isAr ? 'لا يوجد خدمات مضافة' : 'No services added'}</p>
                  ) : services.map(s => (
                    <div key={s.id} className="p-6 border border-zinc-100 rounded-[24px] bg-white flex flex-col justify-between shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 hover:border-zinc-200 hover:-translate-y-1 transition-all">
                      <div>
                        <h4 className="font-bold text-zinc-900 text-lg">{isAr ? s.name_ar : s.name_en}</h4>
                        { (s.description_ar || s.description_en) && 
                          <p className="text-sm text-zinc-500 mt-2 line-clamp-2 leading-relaxed">{isAr ? s.description_ar : s.description_en}</p>
                        }
                      </div>
                      <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                        
                          <div className="flex flex-col">
                            {s.discount_price ? (
                              <>
                                <span className="text-xs text-zinc-400 line-through">{s.original_price} {currSymbol}</span>
                                <span className="font-black text-emerald-600 text-lg">{s.discount_price} {currSymbol}</span>
                              </>
                            ) : (
                              <span className="font-black text-zinc-900 text-lg">{s.original_price} {currSymbol}</span>
                            )}
                          </div>

                        <span className="text-xs font-bold bg-zinc-50 px-3 py-1.5 rounded-lg text-zinc-600">{s.duration_minutes} {isAr ? 'دقيقة' : 'min'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'staff' && (
              <section className="bg-white p-6 md:p-8 rounded-[24px] shadow-sm border border-zinc-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-zinc-500" />
                    {t.staff_management}
                  </h3>
                  <button 
                    onClick={() => setShowAddStaff(!showAddStaff)}
                    className="flex items-center gap-2 px-4 py-2 bg-zinc-100 text-zinc-900 rounded-xl font-semibold text-sm hover:bg-indigo-100 transition-colors"
                  >
                    {showAddStaff ? <XCircle className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                    {isAr ? 'إضافة موظف' : 'Add Staff'}
                  </button>
                </div>

                {showAddStaff && (
                  <div className="mb-8 p-6 bg-zinc-50 border border-zinc-200 rounded-[2rem]">
                    <div className="grid md:grid-cols-1 gap-4 mb-4">
                      <AdminInput 
                          labelAr="الاسم الأول (عربي)" labelEn="First Name (English)" 
                          valueAr={newArtistData.first_name_ar} valueEn={newArtistData.first_name_en} 
                          onChangeAr={(v) => setNewArtistData({...newArtistData, first_name_ar: v})} 
                          onChangeEn={(v) => setNewArtistData({...newArtistData, first_name_en: v})} 
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'البريد الإلكتروني' : 'Email'}</label>
                        <input type="email" value={newArtistData.email} onChange={(e) => setNewArtistData({...newArtistData, email: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'رقم الجوال' : 'Mobile'}</label>
                        <input type="tel" value={newArtistData.mobile} onChange={(e) => setNewArtistData({...newArtistData, mobile: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'كلمة المرور (افتراضي)' : 'Password (Default)'}</label>
                        <input type="text" value={newArtistData.password} onChange={(e) => setNewArtistData({...newArtistData, password: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'الصورة الشخصية' : 'Avatar Image'}</label>
                        <div className="flex items-center gap-3">
                          {newArtistData.avatar_url && <img src={newArtistData.avatar_url} alt="Avatar" className="w-12 h-12 rounded-xl object-cover border border-zinc-200" />}
                          <input type="file" accept="image/*" onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const url = await handleFileUpload(file, 'staff');
                              if (url) setNewArtistData({...newArtistData, avatar_url: url});
                            }
                          }} className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-zinc-100 file:text-zinc-900 hover:file:bg-indigo-100 cursor-pointer" />
                        </div>
                      </div>
                      <div className="md:col-span-2 grid md:grid-cols-2 gap-4 mt-2">
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'نبذة مختصرة / خبرة (عربي)' : 'Bio / Experience (Arabic)'}</label>
                          <textarea rows={3} value={newArtistData.bio_ar} onChange={e => setNewArtistData({...newArtistData, bio_ar: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 outline-none"></textarea>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'نبذة مختصرة / خبرة (إنجليزي)' : 'Bio / Experience (English)'}</label>
                          <textarea rows={3} value={newArtistData.bio_en} onChange={e => setNewArtistData({...newArtistData, bio_en: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 outline-none"></textarea>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={handleSaveNewArtist}
                        disabled={isSavingStaff}
                        className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors disabled:bg-slate-400"
                      >
                        {isSavingStaff ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ فني جديد' : 'Save New Artist')}
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {staffList.length === 0 ? (
                    <p className="text-zinc-500 col-span-full text-center py-8">{isAr ? 'لا يوجد موظفين مضافين' : 'No staff added'}</p>
                  ) : staffList.map(st => (
                    <div key={st.id} className="p-6 border border-zinc-100 rounded-[24px] bg-white flex items-center gap-4 shadow-sm hover:shadow-xl hover:shadow-indigo-900/5 hover:border-zinc-200 hover:-translate-y-1 transition-all">
                      <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-indigo-50 text-zinc-900 rounded-[16px] flex items-center justify-center font-bold text-xl shrink-0 shadow-inner">
                        {st.profile?.first_name_en?.[0] || st.profile?.first_name_ar?.[0] || <Users className="w-6 h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-zinc-900 truncate text-lg">
                          {isAr ? st.profile?.first_name_ar : st.profile?.first_name_en} {isAr ? st.profile?.last_name_ar : st.profile?.last_name_en}
                        </h4>
                        <p className="text-sm text-zinc-500 truncate mt-0.5">{st.profile?.mobile}</p>
                      </div>
                      <div className="shrink-0 text-xs font-bold bg-zinc-50 text-zinc-600 px-3 py-1.5 rounded-lg border border-zinc-100">
                        {st.profile?.role === 'artist' ? (isAr ? 'فني' : 'Artist') : (isAr ? 'كاشير' : 'Cashier')}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      
        {/* Booking Details Modal */}
        <AnimatePresence>
          {showBookingEditModal && selectedBookingForEdit && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"
              onClick={() => setShowBookingEditModal(false)}
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                  <h2 className="text-xl font-bold text-zinc-900">
                    {isAr ? 'تفاصيل الحجز' : 'Booking Details'} #{selectedBookingForEdit.id.substring(0, 6)}
                  </h2>
                  <button onClick={() => setShowBookingEditModal(false)} className="p-2 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                      <p className="text-sm text-zinc-500 mb-1">{isAr ? 'العميل' : 'Client'}</p>
                      <p className="font-bold text-zinc-900 text-lg">
                        {isAr ? (selectedBookingForEdit.client?.first_name_ar || selectedBookingForEdit.client?.first_name_en) : (selectedBookingForEdit.client?.first_name_en || selectedBookingForEdit.client?.first_name_ar)}
                      </p>
                      <p className="text-sm text-zinc-600 mt-1">{selectedBookingForEdit.client?.mobile}</p>
                    </div>
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                      <p className="text-sm text-zinc-500 mb-1">{isAr ? 'الموظف (الفني)' : 'Staff (Artist)'}</p>
                      <p className="font-bold text-zinc-900 text-lg">
                        {isAr ? (selectedBookingForEdit.artist?.first_name_ar || selectedBookingForEdit.artist?.first_name_en) : (selectedBookingForEdit.artist?.first_name_en || selectedBookingForEdit.artist?.first_name_ar)}
                      </p>
                      <div className="mt-2">
                        <StatusBadge status={selectedBookingForEdit.status} isAr={isAr} />
                      </div>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-zinc-900 mb-4">{isAr ? 'تاريخ ووقت الحجز' : 'Date & Time'}</h3>
                    <div className="flex gap-4">
                      <div className="flex-1 bg-white border border-zinc-200 p-3 rounded-xl flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-zinc-400" />
                        <span className="font-medium text-zinc-900">{selectedBookingForEdit.booking_date}</span>
                      </div>
                      <div className="flex-1 bg-white border border-zinc-200 p-3 rounded-xl flex items-center gap-3">
                        <Clock className="w-5 h-5 text-zinc-400" />
                        <span className="font-medium text-zinc-900">{selectedBookingForEdit.booking_time}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 mb-4">{isAr ? 'الخدمات المطلوبة' : 'Requested Services'}</h3>
                    <div className="space-y-3">
                      {selectedBookingForEdit.details?.map((d: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                          <div>
                            <p className="font-bold text-zinc-900">{isAr ? d.services?.name_ar : d.services?.name_en}</p>
                            <p className="text-sm text-zinc-500">{d.services?.duration} {isAr ? 'دقيقة' : 'min'}</p>
                          </div>
                          {role !== 'artist' && (
                            <div className="text-right">
                              <p className="font-bold text-zinc-900">{d.price} {currSymbol}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {role !== 'artist' && (
                      <div className="mt-4 pt-4 border-t border-zinc-100 flex justify-between items-center">
                        <p className="text-lg font-bold text-zinc-900">{isAr ? 'الإجمالي' : 'Total'}</p>
                        <p className="text-2xl font-extrabold text-zinc-900">
                          {selectedBookingForEdit.total_amount || selectedBookingForEdit.details?.reduce((acc, d) => acc + (parseFloat(d.price) || 0), 0) || 0} {currSymbol}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
                  <button 
                    onClick={() => setShowBookingEditModal(false)}
                    className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
                  >
                    {isAr ? 'إغلاق' : 'Close'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${active ? 'bg-zinc-100 text-zinc-900' : 'hover:bg-slate-100 text-zinc-700'}`}>
      <Icon className={`w-5 h-5 ${active ? 'text-zinc-900' : 'text-zinc-400'}`} />
      {label}
    </button>
  );
}

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <div className="bg-white p-6 rounded-[16px] border border-zinc-100 shadow-sm">
      <h4 className="text-sm font-medium text-zinc-500">{title}</h4>
      <p className="text-2xl font-bold text-zinc-900 mt-1">{value}</p>
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
