import PhoneInput from 'react-phone-number-input';
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../store';
import { translations } from '../i18n';
import { MapPin, Star, ArrowRight, ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft, Calendar as CalendarIcon, Clock, User as UserIcon, Loader2, Lock, Save, Eye, X, Map as MapIcon, Grid as GridIcon, Heart } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { generateAvailableSlots } from '../lib/booking-utils';
import { supabase } from '../lib/supabase';
import { sendWhatsAppMessage } from '../lib/whatsapp';
import { getCurrencySymbol } from '../lib/currency';

type BookingStep = 'salons' | 'services' | 'datetime' | 'confirmed' | 'my-bookings' | 'profile' | 'salon-details';

export function ClientApp() {
  const { lang, isAr, user } = useAppContext();
  const t = translations[lang];

  const [step, setStep] = useState<BookingStep>('salons');
  
  const [profileData, setProfileData] = useState({ first_name_ar: '', first_name_en: '', mobile: '' });
  const [newPassword, setNewPassword] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileCountryCode, setProfileCountryCode] = useState<any>('');

  const fetchUserProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
       setProfileData({
         first_name_ar: data.first_name_ar || '',
         first_name_en: data.first_name_en || '',
         mobile: data.mobile || ''
       });
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const { error: profileErr } = await supabase.from('profiles').update({
        first_name_ar: profileData.first_name_ar,
        first_name_en: profileData.first_name_en,
        mobile: profileData.mobile
      }).eq('id', user.id);
      
      if (profileErr) throw profileErr;
      
      if (newPassword.trim()) {
         const { error: pwdErr } = await supabase.auth.updateUser({ password: newPassword });
         if (pwdErr) throw pwdErr;
      }
      
      showToast(isAr ? 'تم حفظ التعديلات بنجاح' : 'Profile updated successfully', 'success');
      setNewPassword('');
    } catch(err: any) {
      console.error(err);
      showToast(err.message || (isAr ? 'حدث خطأ أثناء الحفظ' : 'Error updating profile'), 'error');
    }
    setIsSavingProfile(false);
  };

  
  // Location filters
  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [governoratesList, setGovernoratesList] = useState<any[]>([]);
  const [citiesList, setCitiesList] = useState<any[]>([]);
  
  const [filterCountry, setFilterCountry] = useState<number | string>('');
  const [filterGov, setFilterGov] = useState<number | string>('');
  const [filterCity, setFilterCity] = useState<number | string>('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [filterSalonType, setFilterSalonType] = useState<'men' | 'women'>('men');

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


  const [selectedSalon, setSelectedSalon] = useState<any>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<string>(''); // empty means "Any"
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [bookingConfirmed, setBookingConfirmed] = useState<string | null>(null);

  // Data states
  
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    const fetchFavorites = async () => {
      if (user) {
        const { data } = await supabase.from('favorite_salons').select('salon_id').eq('user_id', user.id);
        if (data) {
          setFavorites(data.map(f => f.salon_id));
        }
      }
    };
    fetchFavorites();
  }, [user]);

  const toggleFavorite = async (salonId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!user) {
      showToast(isAr ? 'يرجى تسجيل الدخول أولاً' : 'Please login first', 'error');
      return;
    }
    
    const isFav = favorites.includes(salonId);
    
    // Optimistic UI update
    setFavorites(prev => isFav ? prev.filter(id => id !== salonId) : [...prev, salonId]);
    
    if (isFav) {
      const { error } = await supabase.from('favorite_salons').delete().eq('user_id', user.id).eq('salon_id', salonId);
      if (error) {
        setFavorites(prev => [...prev, salonId]);
        showToast(isAr ? 'حدث خطأ أثناء إزالة المفضلة' : 'Error removing favorite', 'error');
      }
    } else {
      const { error } = await supabase.from('favorite_salons').insert({ user_id: user.id, salon_id: salonId });
      if (error) {
        setFavorites(prev => prev.filter(id => id !== salonId));
        showToast(isAr ? 'حدث خطأ أثناء إضافة المفضلة' : 'Error adding favorite', 'error');
      }
    }
  };

  const [salons, setSalons] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [previewBooking, setPreviewBooking] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [rating, setRating] = useState(5);
  const [reviewedBookings, setReviewedBookings] = useState<Set<string>>(new Set());
  const [bookingFilter, setBookingFilter] = useState<'current' | 'past' | 'cancelled'>('current');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleAvailableTimes, setRescheduleAvailableTimes] = useState<string[]>([]);
  const [rescheduleBookedTimes, setRescheduleBookedTimes] = useState<string[]>([]);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    // Request GPS on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          fetchSalons(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setLocationError(isAr ? 'يرجى تفعيل الموقع (GPS) لعرض الصالونات القريبة منك بدقة.' : 'Please enable GPS to see salons near you accurately.');
          fetchSalons(); // fallback without sorting
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      fetchSalons();
    }
  }, []);

  // Haversine formula
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);  
    const dLon = (lon2 - lon1) * (Math.PI / 180); 
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
      ; 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; 
  };

  const fetchSalons = async (lat?: number, lng?: number) => {
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
  };

  const fetchSalonDetails = async (salonId: string) => {
    const [servicesRes, staffRes] = await Promise.all([
      supabase.from('services').select('*').eq('salon_id', salonId),
      supabase.from('staff').select('*, profile:profiles!profile_id(*)').eq('salon_id', salonId)
    ]);
    setServices(servicesRes.data || []);
    setStaff(staffRes.data || []);
  };



  const fetchRescheduleTimes = async (date: string, salonId: string, staffId: string | null) => {
    setRescheduleDate(date);
    setRescheduleTime('');
    try {
      const { data } = await supabase.from('bookings')
        .select('booking_time, total_amount')
        .eq('booking_date', date)
        .eq('salon_id', salonId)
        .neq('status', 'canceled')
        .neq('status', 'cancelled');
      
      let filtered = data || [];
      if (staffId) {
        const { data: staffBookings } = await supabase.from('bookings')
          .select('booking_time, total_amount')
          .eq('booking_date', date)
          .eq('staff_id', staffId)
          .neq('status', 'canceled')
          .neq('status', 'cancelled');
        filtered = staffBookings || [];
      }
      
      const isFullDayOff = filtered.some(b => b.total_amount === -1 && b.booking_time.startsWith('00:00'));
      if (isFullDayOff) {
        setRescheduleBookedTimes(['FULL_DAY_OFF']);
      } else {
        const formattedTimes = filtered.map(b => b.booking_time.substring(0, 5));
        setRescheduleBookedTimes(formattedTimes);
      }
      
      // Generate available times (simplified 9 to 21)
      const times = [];
      for(let h=9; h<=21; h++) {
         const hh = h.toString().padStart(2, '0');
         times.push(`${hh}:00`);
         times.push(`${hh}:30`);
      }
      setRescheduleAvailableTimes(times);
      
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('client_bookings_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `client_id=eq.${user.id}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          const oldStatus = payload.old.status;
          
          if (newStatus !== oldStatus) {
            let msgEn = `Your booking status was updated to ${newStatus}`;
            let msgAr = `تم تحديث حالة حجزك إلى ${newStatus}`;
            
            if (newStatus === 'confirmed') {
              msgEn = 'Your booking has been confirmed!';
              msgAr = 'تم تأكيد حجزك!';
            } else if (newStatus === 'completed') {
              msgEn = 'Your booking is completed. Thanks for visiting!';
              msgAr = 'تم اكتمال حجزك. شكراً لزيارتك!';
            } else if (newStatus === 'canceled' || newStatus === 'cancelled') {
              msgEn = 'Your booking was canceled.';
              msgAr = 'تم إلغاء حجزك.';
            }

            showToast(isAr ? msgAr : msgEn, (newStatus === 'canceled' || newStatus === 'cancelled') ? 'error' : 'success');
            
            fetchMyBookings();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAr]);

  const fetchMyBookings = async () => {
    if (!user) return;
    try {
      const { data } = await supabase.from('bookings').select(`
        *,
        salon:salons(name_ar, name_en),
        staff:staff!staff_id(profile:profiles!profile_id(first_name_ar, first_name_en)),
        details:booking_details(services(name_ar, name_en))
      `).eq('client_id', user.id).order('booking_date', { ascending: false }).order('booking_time', { ascending: false });
      setMyBookings(data || []);
    } catch(err) {
      console.error(err);
    }
  };

  const handleSalonSelect = (salon: any) => {
    setSelectedSalon(salon);
    fetchSalonDetails(salon.id);
    setStep('services');
  };

  const handleServiceToggle = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const totalPrice = selectedServices.reduce((sum, id) => {
    const s = services.find(srv => srv.id === id);
    if (!s) return sum;
    const dPrice = parseFloat(s.discount_price);
    const oPrice = parseFloat(s.original_price);
    return sum + (dPrice > 0 ? dPrice : (oPrice || 0));
  }, 0);

  const currSymbol = getCurrencySymbol(selectedSalon?.currency, isAr);

  const handleNextToDateTime = () => {
    setStep('datetime');
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
  };

  useEffect(() => {
    if (step === 'datetime' && selectedSalon && selectedDate) {
      fetchBookedTimes();
    }
  }, [selectedDate, selectedStaff, step]);

    const submitReview = async () => {
    if (!showReviewModal || !user) return;
    try {
      const { error } = await supabase.from('reviews').insert({
        booking_id: showReviewModal.id,
        client_id: user.id,
        staff_id: showReviewModal.staff_id,
        rating,
        comment: reviewComment
      });
      if (error) throw error;
      
      showToast(isAr ? 'شكراً لتقييمك!' : 'Thank you for your review!', 'success');
      setReviewedBookings(prev => new Set(prev).add(showReviewModal.id));
      setShowReviewModal(null);
      setRating(5);
      setReviewComment('');
    } catch (err: any) {
      console.error(err);
      showToast(isAr ? 'حدث خطأ: ' + err.message : 'Error: ' + err.message, 'error');
    }
  };

  const fetchBookedTimes = async () => {
    let bookingsQuery = supabase.from('bookings')
      .select('booking_time, total_amount')
      .eq('salon_id', selectedSalon.id)
      .eq('booking_date', selectedDate)
      .neq('status', 'canceled')
      .neq('status', 'cancelled');
      
    if (selectedStaff) {
      bookingsQuery = bookingsQuery.eq('staff_id', selectedStaff);
    }
    
    let blockedQuery = supabase.from('blocked_times')
      .select('start_datetime, end_datetime')
      .eq('salon_id', selectedSalon.id);

    if (selectedStaff) {
      blockedQuery = blockedQuery.or(`staff_id.is.null,staff_id.eq.${selectedStaff}`);
    } else {
      blockedQuery = blockedQuery.is('staff_id', null);
    }

    const [bRes, btRes] = await Promise.all([bookingsQuery, blockedQuery]);
    
    const formattedTimes: string[] = [];
    
    // 1. Process Bookings
    if (bRes.data) {
      const fullDayOff = bRes.data.find(b => b.total_amount === -1 && b.booking_time.startsWith('00:00'));
      if (fullDayOff) {
        setBookedTimes(['FULL_DAY_OFF']);
        return;
      }
      formattedTimes.push(...bRes.data.map(b => b.booking_time.substring(0, 5)));
    }
    
    // 2. Process Blocked Times
    if (btRes.data) {
      const selectedDateStart = new Date(`${selectedDate}T00:00:00.000Z`);
      const selectedDateEnd = new Date(`${selectedDate}T23:59:59.999Z`);
      
      for (const bt of btRes.data) {
         const start = new Date(bt.start_datetime);
         const end = new Date(bt.end_datetime);
         
         // Check if this block intersects with the selected date
         if (start <= selectedDateEnd && end >= selectedDateStart) {
            // If it's a full day block (00:00 to 23:59)
            if (start.getUTCHours() === 0 && end.getUTCHours() === 23) {
               setBookedTimes(['FULL_DAY_OFF']);
               return;
            }
            
            // Otherwise, we need to block specific slots (every 30 mins)
            // Get local hours of start and end, and block those slots
            let current = new Date(Math.max(start.getTime(), selectedDateStart.getTime()));
            const blockEnd = new Date(Math.min(end.getTime(), selectedDateEnd.getTime()));
            
            while (current < blockEnd) {
               const hh = current.getHours().toString().padStart(2, '0');
               const mm = current.getMinutes().toString().padStart(2, '0');
               formattedTimes.push(`${hh}:${mm}`);
               current.setMinutes(current.getMinutes() + 30);
            }
         }
      }
    }
    
    setBookedTimes(formattedTimes);
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !user || !selectedSalon) return;
    setIsSubmitting(true);
    try {
      // 1. Create booking
      const { data: booking, error: bookingErr } = await supabase.from('bookings').insert({
        salon_id: selectedSalon.id,
        client_id: user.id,
        staff_id: selectedStaff || null,
        booking_date: selectedDate,
        booking_time: selectedTime,
        total_amount: totalPrice,
        status: 'pending'
      }).select().single();

      if (bookingErr) throw bookingErr;

      // 2. Add booking details
      const details = selectedServices.map(serviceId => {
        const s = services.find(x => x.id === serviceId);
        return {
          booking_id: booking.id,
          service_id: serviceId,
          price: s?.discount_price || s?.original_price || 0
        };
      });

      const { error: detailsErr } = await supabase.from('booking_details').insert(details);
      if (detailsErr) throw detailsErr;

      setBookingConfirmed(booking.id);
      setStep('confirmed');

      // Send WhatsApp Notification for pending booking
      try {
        const { data: globalSettings } = await supabase.from('app_settings').select('*').eq('id', 'global').single();
        const apiUrl = globalSettings?.evolution_api_url || 'https://evo.101488.xyz';
        const instance = selectedSalon.evolution_instance || globalSettings?.evolution_instance || 'TamerMostafa';
        const apiKey = selectedSalon.evolution_api_key || globalSettings?.evolution_api_key || '78518239685A-4904-A7C3-827767FA2EEE';
        
        // Fetch user profile to get mobile
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

        if (instance && apiKey && profile?.mobile) {
          const clientName = isAr ? profile.first_name_ar : profile.first_name_en;
          const salonName = isAr ? selectedSalon.name_ar : selectedSalon.name_en;
          const artistName = isAr ? (selectedStaff?.profile?.first_name_ar || 'غير محدد') : (selectedStaff?.profile?.first_name_en || 'Not Assigned');
          const servicesStr = selectedServices.map(s => isAr ? s.name_ar : s.name_en).join(', ');
          const address = isAr ? selectedSalon.address_ar : selectedSalon.address_en;

          const message = isAr 
            ? `مرحباً ${clientName}،\nلقد استلمنا طلب حجزك رقم ${booking.id} في صالون ${salonName}.\nنحن بانتظار تأكيد الإدارة وسنعلمك قريباً!\n\n📅 التاريخ: ${selectedDate}\n⏰ الوقت: ${selectedTime}\n👩‍🎨 الفني: ${artistName}\n💅 الخدمات: ${servicesStr}\n\n📍 العنوان: ${address}\n📞 للتواصل: ${selectedSalon.mobile}\n\nيمكنك إبراز الكود الخاص بك عند الحضور.` 
            : `Hello ${clientName},\nWe received your booking request #${booking.id} at ${salonName}.\nAwaiting admin confirmation. We will notify you soon!\n\n📅 Date: ${selectedDate}\n⏰ Time: ${selectedTime}\n👩‍🎨 Artist: ${artistName}\n💅 Services: ${servicesStr}\n\n📍 Address: ${address}\n📞 Phone: ${selectedSalon.mobile}\n\nPlease show your QR code upon arrival.`;
          
          await sendWhatsAppMessage(apiUrl, instance, apiKey, profile.mobile, message);
        }
      } catch (err) {
        console.error('Failed to send WA message on booking creation', err);
      }

    } catch (err: any) {
      alert((isAr ? 'حدث خطأ أثناء الحجز، أو أن الوقت محجوز بالفعل.' : 'Error during booking, or time already taken.') + ' ' + (err.message || JSON.stringify(err)));
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFlow = () => {
    setSelectedSalon(null);
    setSelectedServices([]);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedStaff('');
    setBookingConfirmed(null);
    setStep('salons');
  };

  const availableSlots = useMemo(() => {
    if (!selectedSalon || !selectedDate || bookedTimes.includes('FULL_DAY_OFF')) return [];
    
    return generateAvailableSlots(
      selectedSalon.working_hours_start || selectedSalon.open_time || '09:00',
      selectedSalon.working_hours_end || selectedSalon.close_time || '22:00',
      selectedSalon.max_bookings_per_hour || 1,
      bookedTimes
    );
  }, [selectedSalon, selectedDate, bookedTimes]);


  const overlays = (
    <>
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"
            onClick={() => setShowReviewModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[24px] w-full max-w-sm overflow-hidden shadow-2xl"
              dir={isAr ? 'rtl' : 'ltr'}
            >
              <div className="flex justify-between items-center p-6 border-b border-zinc-100">
                <h3 className="text-xl font-bold text-zinc-900">{isAr ? 'تقييم الخدمة' : 'Rate Service'}</h3>
                <button onClick={() => setShowReviewModal(null)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6 text-center">
                <div className="flex justify-center gap-2" dir="ltr">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star className={`w-8 h-8 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-zinc-100 text-zinc-200'}`} />
                    </button>
                  ))}
                </div>
                <div className="text-left" dir={isAr ? 'rtl' : 'ltr'}>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">{isAr ? 'ملاحظاتك (اختياري)' : 'Notes (Optional)'}</label>
                  <textarea 
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-amber-500 outline-none resize-none h-24"
                    placeholder={isAr ? 'كيف كانت تجربتك؟' : 'How was your experience?'}
                  />
                </div>
              </div>
              <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex gap-3">
                <button onClick={() => setShowReviewModal(null)} className="flex-1 py-3 text-sm font-bold text-zinc-600 bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button onClick={submitReview} className="flex-1 py-3 text-sm font-bold text-white bg-zinc-900 rounded-xl hover:bg-slate-800 transition-colors shadow-md shadow-zinc-900/10">
                  {isAr ? 'إرسال التقييم' : 'Submit Review'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-xl"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                <h3 className="font-bold text-xl text-zinc-900">{isAr ? 'تفاصيل الحجز' : 'Booking Details'}</h3>
                <button onClick={() => setPreviewBooking(null)} className="p-2 bg-zinc-50 rounded-full text-zinc-400 hover:text-zinc-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="text-zinc-500 text-sm font-medium mb-1">{isAr ? 'الصالون' : 'Salon'}</h4>
                  <p className="font-bold text-zinc-900 text-lg">{isAr ? previewBooking.salon?.name_ar : previewBooking.salon?.name_en}</p>
                </div>
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-zinc-500 text-sm font-medium mb-1">{isAr ? 'التاريخ' : 'Date'}</h4>
                    <p className="font-bold text-zinc-900">{previewBooking.booking_date}</p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-zinc-500 text-sm font-medium mb-1">{isAr ? 'الوقت' : 'Time'}</h4>
                    <p className="font-bold text-zinc-900">{previewBooking.booking_time?.substring(0,5)}</p>
                  </div>
                </div>
                <div>
                  <h4 className="text-zinc-500 text-sm font-medium mb-2">{isAr ? 'الخدمات' : 'Services'}</h4>
                  <div className="space-y-2">
                    {previewBooking.details?.map((d: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-zinc-50 rounded-xl">
                        <span className="font-medium text-zinc-900">{isAr ? d.services?.name_ar : d.services?.name_en}</span>
                        <span className="text-sm font-bold text-zinc-900">{currSymbol} {d.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                  <span className="text-zinc-500 font-medium">{isAr ? 'الإجمالي' : 'Total'}</span>
                  <span className="text-2xl font-bold text-zinc-900">{currSymbol} {previewBooking.total_amount}</span>
                </div>
                <div className="flex justify-center pt-2">
                  <QRCodeSVG value={previewBooking.id} size={100} level="M" />
                </div>
                
                {(previewBooking.status === 'pending' || previewBooking.status === 'confirmed') && (
                  <div className="pt-4">
                    <button 
                      onClick={() => {
                        handleCancelBooking(previewBooking.id);
                        setPreviewBooking(null);
                      }}
                      className="w-full py-3.5 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-colors border border-rose-100"
                    >
                      {isAr ? 'إلغاء الحجز' : 'Cancel Booking'}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Global Toast Notification */}
      {/* Global Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-24 left-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border ${
              toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
              toast.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' :
              'bg-blue-50 border-blue-100 text-blue-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  if (step === 'confirmed' && bookingConfirmed) {
    return (
      <>
      <div className="max-w-2xl mx-auto p-4 md:p-8 mt-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[24px] p-8 border border-zinc-100 shadow-sm text-center"
        >
          <div className="w-20 h-20 bg-zinc-100 text-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-zinc-900 mb-2">{isAr ? 'تم تأكيد الحجز!' : 'Booking Confirmed!'}</h2>
          <p className="text-zinc-500 mb-8">
            {isAr ? 'تم حفظ تفاصيل حجزك بنجاح.' : 'Your booking details have been saved successfully.'}
          </p>

          <div className="bg-zinc-50 rounded-[16px] p-6 mb-8 inline-block text-left w-full max-w-sm" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-200">
              <span className="text-zinc-500 font-medium">{isAr ? 'رقم الحجز' : 'Booking ID'}</span>
              <span className="font-bold text-zinc-900 uppercase">{bookingConfirmed.split('-')[0]}</span>
            </div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-zinc-200">
              <span className="text-zinc-500 font-medium">{isAr ? 'الوقت والتاريخ' : 'Date & Time'}</span>
              <span className="font-bold text-zinc-900">{selectedDate} / {selectedTime}</span>
            </div>
            <div className="flex flex-col mb-4 pb-4 border-b border-zinc-200 gap-2">
              <div className="flex justify-between items-center">
                <span className="text-zinc-500 font-medium">{isAr ? 'الخدمات المحجوزة' : 'Booked Services'}</span>
                <span className="text-xs font-bold bg-zinc-100 px-2 py-1 rounded-md">{selectedServices.length}</span>
              </div>
              <div className="space-y-1 mt-1">
                {selectedServices.map(srvId => {
                  const srv = services.find(s => s.id === srvId);
                  return srv ? (
                    <div key={srvId} className="flex justify-between text-sm">
                      <span className="font-semibold text-zinc-800">{isAr ? srv.name_ar : srv.name_en}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 font-medium">{isAr ? 'الإجمالي' : 'Total Amount'}</span>
              <span className="font-bold text-zinc-900 text-lg">{currSymbol} {totalPrice}</span>
            </div>
          </div>

          <div className="flex justify-center mb-8">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-zinc-100">
              <QRCodeSVG value={bookingConfirmed} size={150} level="M" />
              <p className="text-xs text-zinc-400 mt-3">{isAr ? 'امسح الكود عند الوصول' : 'Scan code upon arrival'}</p>
            </div>
          </div>

          <button onClick={resetFlow} className="w-full max-w-sm bg-zinc-900 text-white py-3.5 rounded-xl font-medium hover:bg-slate-800 transition-colors">
            {isAr ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </motion.div>
      </div>
      {overlays}
    </>
    );
  }

  if (step === 'datetime' && selectedSalon) {
    return (
      <>
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        <button onClick={() => setStep('services')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-medium">
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {isAr ? 'العودة للخدمات' : 'Back to Services'}
        </button>

        <div className="bg-white rounded-[24px] p-6 md:p-8 border border-zinc-100 shadow-sm">
          <h2 className="text-2xl font-bold text-zinc-900 mb-6">{isAr ? 'اختر الموعد والفني' : 'Select Date & Artist'}</h2>

          {/* Artist Selection */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-zinc-700 mb-3 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-zinc-900" />
              {isAr ? 'اختر فني التجميل (اختياري)' : 'Select Artist (Optional)'}
            </label>
            <div className="flex overflow-x-auto gap-3 pb-2 snap-x">
              <div 
                onClick={() => { setSelectedStaff(''); setSelectedTime(''); }}
                className={`flex-shrink-0 snap-start px-6 py-3 rounded-xl border-2 font-bold cursor-pointer transition-colors ${selectedStaff === '' ? 'border-zinc-900 bg-zinc-100 text-zinc-900' : 'border-zinc-100 bg-white text-zinc-600 hover:border-zinc-200'}`}
              >
                {isAr ? 'غير محدد (أي فني متاح)' : 'Any Available'}
              </div>
              {staff.map(member => (
                <div 
                  key={member.id}
                  onClick={() => { setSelectedStaff(member.id); setSelectedTime(''); }}
                  className={`flex-shrink-0 snap-start px-6 py-3 rounded-xl border-2 font-bold cursor-pointer transition-colors flex items-center gap-3 ${selectedStaff === member.id ? 'border-zinc-900 bg-zinc-100 text-zinc-900' : 'border-zinc-100 bg-white text-zinc-600 hover:border-zinc-200'}`}
                >
                  
                  {member.profile?.avatar_url && (
                    <img src={member.profile.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  )}
                  {isAr ? (member.profile?.first_name_ar || 'فني') : (member.profile?.first_name_en || 'Artist')}

                </div>
              ))}
            </div>
          </div>

          {/* Date Selection */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-zinc-700 mb-3 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-zinc-900" />
              {isAr ? 'تاريخ الحجز' : 'Booking Date'}
            </label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
              min={new Date().toISOString().split('T')[0]}
              className="w-full md:w-auto bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-zinc-900 outline-none font-medium"
            />
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-bold text-zinc-700 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-zinc-900" />
                {isAr ? 'الأوقات المتاحة' : 'Available Times'}
              </label>
              
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3" dir="ltr">
                  {availableSlots.map(slot => (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`py-3 rounded-xl font-bold transition-colors ${
                        !slot.available 
                          ? 'opacity-50 cursor-not-allowed bg-zinc-100 text-zinc-400'
                          : selectedTime === slot.time 
                            ? 'bg-zinc-900 text-white shadow-md' 
                            : 'bg-zinc-50 text-zinc-700 hover:bg-slate-100'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-zinc-50 text-zinc-500 rounded-xl text-center text-sm font-medium">
                  {isAr ? 'عفواً، لا يوجد أوقات متاحة في هذا اليوم.' : 'Sorry, no available times on this date.'}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-zinc-100">
            <button 
              onClick={handleBook}
              disabled={!selectedDate || !selectedTime}
              className="w-full px-8 py-4 bg-zinc-900 hover:bg-zinc-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-lg shadow-md"
            >
              {t.book_now}
            </button>
          </div>
        </div>
      </div>
      {overlays}
    </>
    );
  }

  if (step === 'salon-details' && selectedSalon) {
    return (
      <>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-24">
        {/* Header Carousel */}
        <div className="relative h-64 md:h-96 bg-zinc-900 rounded-[24px] overflow-hidden shadow-sm group">
          {selectedSalon.images && selectedSalon.images.length > 0 ? (
            <>
              <img 
                src={selectedSalon.images[currentImageIndex]} 
                alt={isAr ? selectedSalon.name_ar : selectedSalon.name_en} 
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
              />
              {selectedSalon.images.length > 1 && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? selectedSalon.images.length - 1 : prev - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === selectedSalon.images.length - 1 ? 0 : prev + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-colors">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {selectedSalon.images.map((_: any, idx: number) => (
                      <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/40'}`} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : selectedSalon.image_url && (
            <img 
              src={selectedSalon.image_url} 
              alt={isAr ? selectedSalon.name_ar : selectedSalon.name_en} 
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                    <button onClick={() => setStep('salons')} className={`absolute top-4 md:top-6 ${isAr ? 'right-4 md:right-6' : 'left-4 md:left-6'} px-4 py-2.5 bg-zinc-900/60 hover:bg-zinc-900/80 backdrop-blur-md rounded-xl text-white transition-all flex items-center gap-2 font-bold text-sm shadow-xl z-[60] border border-white/20`}>
            {isAr ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            {isAr ? 'عودة للرئيسية' : 'Back to Home'}
          </button>
          
          <button onClick={() => toggleFavorite(selectedSalon.id)} className={`absolute top-4 md:top-6 ${isAr ? 'left-4 md:left-6' : 'right-4 md:right-6'} p-2.5 bg-zinc-900/60 hover:bg-zinc-900/80 backdrop-blur-md rounded-xl transition-all shadow-xl z-[60] border border-white/20`}>
            <Heart className={`w-6 h-6 ${favorites.includes(selectedSalon.id) ? 'text-rose-500 fill-rose-500' : 'text-white'}`} />
          </button>

          
          <div className="absolute bottom-6 left-6 right-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{isAr ? selectedSalon.name_ar : selectedSalon.name_en}</h1>
            <div className="flex flex-wrap items-center gap-3 text-white/90 text-sm font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {isAr ? selectedSalon.address_ar || 'العنوان غير متوفر' : selectedSalon.address_en || 'Address not available'}
              </span>
              {selectedSalon.computedDistance && selectedSalon.computedDistance !== Infinity && (
                <span className="bg-white/20 px-2 py-1 rounded-md">{selectedSalon.computedDistance.toFixed(1)} km</span>
              )}
              {selectedSalon.avgRating > 0 && (
                <span className="flex items-center gap-1 text-amber-400 bg-black/40 px-2 py-1 rounded-md">
                  <Star className="w-4 h-4 fill-current" />
                  {selectedSalon.avgRating.toFixed(1)} ({selectedSalon.reviewsCount})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h3 className="text-xl font-bold text-zinc-900 mb-4">{isAr ? 'عن الصالون' : 'About'}</h3>
              <p className="text-zinc-600 leading-relaxed">
                {isAr ? selectedSalon.description_ar || 'لا يوجد وصف.' : selectedSalon.description_en || 'No description available.'}
              </p>
            </section>
            
            <section>
              <h3 className="text-xl font-bold text-zinc-900 mb-4">{isAr ? 'الخدمات المتوفرة' : 'Available Services'}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {services.map(srv => (
                  <div key={srv.id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-zinc-900">{isAr ? srv.name_ar : srv.name_en}</h4>
                      <p className="text-xs text-zinc-500 mt-1">{srv.duration_minutes} {isAr ? 'دقيقة' : 'min'}</p>
                    </div>
                    <div className="text-right">
                      {srv.discount_price ? (
                        <>
                          <div className="text-xs text-zinc-400 line-through">{currSymbol} {srv.original_price}</div>
                          <div className="font-bold text-zinc-900">{currSymbol} {srv.discount_price}</div>
                        </>
                      ) : (
                        <div className="font-bold text-zinc-900">{currSymbol} {srv.original_price}</div>
                      )}
                    </div>
                  </div>
                ))}
                {services.length === 0 && <p className="text-zinc-500 text-sm">{isAr ? 'لا توجد خدمات مضافة.' : 'No services added.'}</p>}
              </div>
            </section>
            
            <section>
              <h3 className="text-xl font-bold text-zinc-900 mb-4">{isAr ? 'فريق العمل' : 'Our Team'}</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {staff.map(member => (
                  <div key={member.id} className="snap-start shrink-0 w-32 text-center">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden bg-zinc-100 mb-3 border-2 border-white shadow-sm">
                      {member.profile?.avatar_url ? (
                         <img src={member.profile.avatar_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                         <div className="w-full h-full flex items-center justify-center text-zinc-400"><UserIcon className="w-8 h-8" /></div>
                      )}
                    </div>
                    <h4 className="font-bold text-zinc-900 text-sm">{isAr ? member.profile?.first_name_ar : member.profile?.first_name_en}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">{isAr ? 'فني تجميل' : 'Artist'}</p>
                  </div>
                ))}
                {staff.length === 0 && <p className="text-zinc-500 text-sm">{isAr ? 'لا يوجد فنيين حالياً.' : 'No artists currently.'}</p>}
              </div>
            </section>
          </div>

          <div className="md:col-span-1">
            <div className="sticky top-6 bg-white border border-zinc-100 p-6 rounded-[24px] shadow-sm">
              <h3 className="font-bold text-zinc-900 text-lg mb-4">{isAr ? 'حجز موعد' : 'Book Appointment'}</h3>
              <p className="text-sm text-zinc-500 mb-6">{isAr ? 'احجز موعدك الآن واستمتع بخدماتنا.' : 'Book your appointment now and enjoy our services.'}</p>
              <button onClick={() => setStep('services')} className="w-full py-4 text-white bg-zinc-900 hover:bg-slate-800 font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                {t.book_now}
              </button>
            </div>
          </div>
        </div>
      </div>
      {overlays}
      </>
    );
  }

  if (step === 'services' && selectedSalon) {
    return (
      <>
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        <button onClick={() => setSelectedSalon(null)} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-medium">
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {isAr ? 'العودة للصالونات' : 'Back to Salons'}
        </button>

        <div className="bg-white rounded-[24px] overflow-hidden border border-zinc-100 shadow-sm">
          <div className="h-48 md:h-64 relative bg-slate-100">
            {selectedSalon.image_url && <img src={selectedSalon.image_url} alt="Salon" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
            <div className="absolute bottom-6 px-6 md:px-8 text-white w-full">
              <h2 className="text-3xl font-bold mb-2">{isAr ? selectedSalon.name_ar : selectedSalon.name_en}</h2>
              <div className="flex items-center gap-4 text-sm font-medium">
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {selectedSalon.rating || 'New'}</span>
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-slate-300" /> {selectedSalon.location_text || 'Nearby'}</span>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <h3 className="text-xl font-bold text-zinc-900 mb-6">{isAr ? 'اختر الخدمات' : 'Select Services'}</h3>
            <div className="space-y-3">
              {services.map(service => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <div 
                    key={service.id} 
                    onClick={() => handleServiceToggle(service.id)}
                    className={`p-4 rounded-[16px] border-2 transition-all cursor-pointer flex justify-between items-center ${isSelected ? 'border-zinc-900 bg-zinc-100' : 'border-zinc-100 hover:border-zinc-200 bg-white'}`}
                  >
                    <div>
                      <h4 className={`font-bold ${isSelected ? 'text-zinc-900' : 'text-zinc-900'}`}>
                        {isAr ? service.name_ar : service.name_en}
                      </h4>
                    </div>
                    <span className={`font-bold ${isSelected ? 'text-zinc-900' : 'text-zinc-600'} flex flex-col items-end`}>
                      {service.discount_price ? (
                        <>
                          <span className="text-xs line-through opacity-50">{currSymbol} {service.original_price}</span>
                          <span className="text-zinc-900">{currSymbol} {service.discount_price}</span>
                        </>
                      ) : (
                        <span>{currSymbol} {service.original_price}</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-zinc-500 font-medium">{isAr ? 'إجمالي السعر' : 'Total Price'}</p>
                <p className="text-3xl font-bold text-zinc-900">{currSymbol} {totalPrice}</p>
              </div>
              <button 
                onClick={handleNextToDateTime}
                disabled={selectedServices.length === 0}
                className="w-full md:w-auto px-8 py-3.5 bg-zinc-900 hover:bg-zinc-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isAr ? 'التالي' : 'Next'} ({selectedServices.length})
                {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
      {overlays}
    </>
    );
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm(isAr ? 'هل أنت متأكد من إلغاء هذا الحجز؟' : 'Are you sure you want to cancel this booking?')) return;
    try {
      const { error } = await supabase.from('bookings').update({ status: 'canceled' }).eq('id', bookingId);
      if (error) throw error;
      setMyBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'canceled' } : b));
      showToast(isAr ? 'تم إلغاء الحجز بنجاح' : 'Booking cancelled successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast(isAr ? 'حدث خطأ أثناء الإلغاء: ' + err.message : 'Error cancelling booking: ' + err.message, 'error');
    }
  };

  if (step === 'profile') {
    return (
      <>
      <div className="max-w-2xl mx-auto p-4 md:p-8 space-y-6">
        <button onClick={() => setStep('salons')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-medium">
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {isAr ? 'العودة للصالونات' : 'Back to Salons'}
        </button>
        <div className="bg-white rounded-[24px] overflow-hidden border border-zinc-100 shadow-sm p-6 md:p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-zinc-100">
            <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">{isAr ? 'حسابي' : 'My Profile'}</h2>
              <p className="text-zinc-500 text-sm mt-1">{user?.email}</p>
            </div>
          </div>
          
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'الاسم (عربي)' : 'First Name (Arabic)'}</label>
                <input type="text" value={profileData.first_name_ar} onChange={e => setProfileData({...profileData, first_name_ar: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'الاسم (إنجليزي)' : 'First Name (English)'}</label>
                <input type="text" value={profileData.first_name_en} onChange={e => setProfileData({...profileData, first_name_en: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'رقم الجوال' : 'Mobile Number'}</label>
              <div className="relative" dir="ltr">
                <PhoneInput
                  international
                  defaultCountry={profileCountryCode || 'SA'}
                  value={profileData.mobile}
                  onChange={(val: any) => setProfileData({...profileData, mobile: val || ''})}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus-within:ring-2 focus-within:ring-zinc-900 outline-none transition-all"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t border-zinc-100">
              <label className="block text-sm font-medium text-zinc-700 mb-1.5">{isAr ? 'كلمة المرور الجديدة (اختياري)' : 'New Password (Optional)'}</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-zinc-400 absolute top-3.5 left-4" />
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder={isAr ? 'اتركه فارغاً إذا لم ترغب بتغييره' : 'Leave empty to keep current'}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-12 pr-4 py-3 outline-none" 
                />
              </div>
            </div>
            
            <div className="pt-6">
              <button 
                onClick={handleSaveProfile}
                disabled={isSavingProfile}
                className="w-full bg-zinc-900 text-white rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 disabled:opacity-70 transition-all"
              >
                {isSavingProfile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {isSavingProfile ? (isAr ? 'جاري الحفظ...' : 'Saving...') : (isAr ? 'حفظ التعديلات' : 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      </div>
      {overlays}
    </>
    );
  }

  if (step === 'my-bookings') {
    const now = new Date();
    now.setHours(0,0,0,0);
    const today = now.toISOString().split('T')[0];
    const currentDateTime = new Date();

    const filteredBookings = myBookings.filter(b => {
      if (bookingFilter === 'canceled') return b.status === 'canceled';
      if (b.status === 'canceled') return false; 
      
      const isPast = b.booking_date < today || b.status === 'completed';
      if (bookingFilter === 'past') return isPast;
      if (bookingFilter === 'current') return !isPast;
      return true;
    });

    return (
      <>
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        <button onClick={() => setStep('salons')} className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-medium">
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {isAr ? 'العودة للصالونات' : 'Back to Salons'}
        </button>

        <h2 className="text-3xl font-bold text-zinc-900 mb-6">{isAr ? 'حجوزاتي' : 'My Bookings'}</h2>

        <div className="flex bg-zinc-100 p-1.5 rounded-xl mb-6">
          <button onClick={() => setBookingFilter('current')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${bookingFilter === 'current' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}>
            {isAr ? 'الحالية' : 'Current'}
          </button>
          <button onClick={() => setBookingFilter('past')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${bookingFilter === 'past' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}>
            {isAr ? 'السابقة' : 'Past'}
          </button>
          <button onClick={() => setBookingFilter('canceled')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${bookingFilter === 'canceled' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-900'}`}>
            {isAr ? 'الملغية' : 'Canceled'}
          </button>
        </div>

        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 font-medium">
              {isAr ? 'لا توجد حجوزات.' : 'No bookings found.'}
            </div>
          ) : (
            filteredBookings.map(b => {
              const bookingDateTimeStr = `${b.booking_date}T${b.booking_time}`;
              const bookingDateObj = new Date(bookingDateTimeStr);
              const diffMs = bookingDateObj.getTime() - currentDateTime.getTime();
              const hoursDiff = diffMs / (1000 * 60 * 60);
              const canCancel = (b.status === 'pending' || b.status === 'confirmed'); // Allow cancellation for pending/confirmed

              return (
                <div key={b.id} className="bg-white p-6 rounded-[24px] border border-zinc-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 mb-1">{isAr ? b.salon?.name_ar : b.salon?.name_en}</h3>
                    <div className="text-sm font-medium text-zinc-500 mb-2">
                      {b.booking_date} • {b.booking_time.substring(0,5)}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {b.details?.map((d: any, idx: number) => (
                        <span key={idx} className="bg-zinc-100 text-zinc-700 text-xs px-2 py-1 rounded-md font-medium">
                          {isAr ? d.services?.name_ar : d.services?.name_en}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end gap-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${b.status === 'canceled' ? 'bg-rose-100 text-rose-700' : b.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : b.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                      {isAr ? (b.status === 'canceled' ? 'ملغي' : b.status === 'completed' ? 'مكتمل' : b.status === 'pending' ? 'قيد الانتظار' : 'مؤكد') : (b.status === 'canceled' ? 'Canceled' : b.status === 'completed' ? 'Completed' : b.status === 'pending' ? 'Pending' : 'Confirmed')}
                    </span>
                    {b.status === 'confirmed' && (
                       <span className="text-xs text-zinc-400 font-mono">ID: {b.id.substring(0,8)}</span>
                    )}
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <button 
                        onClick={() => setPreviewBooking(b)}
                        className="text-xs font-bold px-3 py-1.5 rounded-lg bg-zinc-50 text-zinc-600 hover:bg-zinc-100 transition-colors border border-zinc-200 flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {isAr ? 'التفاصيل' : 'Details'}
                      </button>
                      {b.status === 'completed' && !reviewedBookings.has(b.id) && (
                        <button 
                          onClick={() => { setRating(5); setReviewComment(''); setShowReviewModal(b); }}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors border border-amber-200 flex items-center gap-1.5"
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          {isAr ? 'تقييم' : 'Rate'}
                        </button>
                      )}
                      {canCancel && (
                        <button 
                          onClick={() => handleCancelBooking(b.id)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-100"
                        >
                          {isAr ? 'إلغاء' : 'Cancel'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {overlays}
    </>
    );
  }

  return (
    <>
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24">
      {/* Hero Section */}
      <section className="relative bg-zinc-900 rounded-[24px] overflow-hidden p-8 md:p-12 text-white">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay" />
        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {isAr ? 'اكتشف أفضل صالونات التجميل بالقرب منك' : 'Discover the best beauty salons near you'}
          </h2>
          <div className="flex gap-3">
            <button onClick={() => { fetchMyBookings(); setStep('my-bookings'); }} className="mt-4 bg-white/20 hover:bg-white/30 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors">
              {isAr ? 'عرض حجوزاتي' : 'View My Bookings'}
            </button>
            <button onClick={() => { fetchUserProfile(); setStep('profile'); }} className="mt-4 bg-white/20 hover:bg-white/30 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-colors">
              {isAr ? 'حسابي' : 'My Profile'}
            </button>
          </div>
          <div className="flex bg-white/10 backdrop-blur-md rounded-full p-1.5 mt-6 border border-white/20">
            <button 
              onClick={() => setFilterSalonType('men')}
              className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${filterSalonType === 'men' ? 'bg-white text-zinc-900 shadow-sm' : 'text-white hover:bg-white/10'}`}
            >
              {t.men_salons}
            </button>
            <button 
              onClick={() => setFilterSalonType('women')}
              className={`flex-1 rounded-full py-2.5 text-sm font-semibold transition-colors ${filterSalonType === 'women' ? 'bg-white text-zinc-900 shadow-sm' : 'text-white hover:bg-white/10'}`}
            >
              {t.women_salons}
            </button>
          </div>
        </div>
      </section>

      {/* Salons List */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-zinc-900">{t.discover_salons}</h3>
            {locationError && (
              <p className="text-sm text-red-500 font-medium mt-1">{locationError}</p>
            )}
            {!userLocation && !locationError && (
              <p className="text-sm text-amber-500 font-medium mt-1 flex items-center gap-1">
                <Loader2 className="w-4 h-4 animate-spin" /> 
                {isAr ? 'جاري تحديد موقعك لعرض الأقرب...' : 'Detecting location to show nearby...'}
              </p>
            )}
          </div>
          {!userLocation && (
            <button 
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                      setLocationError(null);
                      fetchSalons(position.coords.latitude, position.coords.longitude);
                    },
                    (error) => {
                      setLocationError(isAr ? 'يرجى تفعيل الموقع (GPS) لعرض الصالونات القريبة منك بدقة.' : 'Please enable GPS to see salons near you accurately.');
                    }
                  );
                }
              }}
              className="text-sm font-medium text-zinc-900 flex items-center gap-1 hover:bg-zinc-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <MapPin className="w-4 h-4" />
              {isAr ? 'تحديث الموقع' : 'Update location'}
            </button>
          )}
        </div>

        
        
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
                  key={`fav-${salon.id}`}
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

        {/* Filters */}
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-zinc-100 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-zinc-900" />
              {isAr ? 'تصفية الصالونات' : 'Filter Salons'}
            </h3>
            <div className="flex items-center gap-2 bg-zinc-50 p-1 rounded-xl border border-zinc-200">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}>
                <GridIcon className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode('map')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'}`}>
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'distance' | 'rating')}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none font-medium text-sm"
              >
                <option value="distance">{isAr ? 'الأقرب مسافة' : 'Nearest Distance'}</option>
                <option value="rating">{isAr ? 'الأعلى تقييماً' : 'Highest Rating'}</option>
              </select>
            </div>
            <div>
              <select value={filterCountry} onChange={e => { const val = e.target.value; setFilterCountry(val); setFilterGov(''); setFilterCity(''); updateProfileLocation(val, '', ''); }} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none font-medium">
                <option value="">{isAr ? 'كل الدول' : 'All Countries'}</option>
                {countriesList.map(c => <option key={c.id} value={c.id}>{isAr ? c.name_ar : c.name_en}</option>)}
              </select>
            </div>
            <div>
              <select value={filterGov} onChange={e => { const val = e.target.value; setFilterGov(val); setFilterCity(''); updateProfileLocation(filterCountry, val, ''); }} disabled={!filterCountry} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none font-medium disabled:opacity-50">
                <option value="">{isAr ? 'كل المحافظات' : 'All Governorates'}</option>
                {governoratesList.filter(g => g.country_id.toString() === filterCountry.toString()).map(g => <option key={g.id} value={g.id}>{isAr ? g.name_ar : g.name_en}</option>)}
              </select>
            </div>
            <div>
              <select value={filterCity} onChange={e => { const val = e.target.value; setFilterCity(val); updateProfileLocation(filterCountry, filterGov, val); }} disabled={!filterGov} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2.5 outline-none font-medium disabled:opacity-50">
                <option value="">{isAr ? 'كل المدن' : 'All Cities'}</option>
                {citiesList.filter(ci => ci.governorate_id.toString() === filterGov.toString()).map(city => <option key={city.id} value={city.id}>{isAr ? city.name_ar : city.name_en}</option>)}
              </select>
            </div>
          </div>
        </div>

        
        {/* processedSalons are calculated right before rendering */}
        {(() => {
          const processedSalons = salons.filter(s => {
            if (filterCountry && s.country_id && s.country_id?.toString() !== filterCountry.toString()) return false;
            if (filterGov && s.governorate_id && s.governorate_id?.toString() !== filterGov.toString()) return false;
            if (filterCity && s.city_id && s.city_id?.toString() !== filterCity.toString()) return false;
            if (s.type && s.type !== 'both' && s.type !== filterSalonType) return false;
            return true;
          }).sort((a, b) => {
             if (sortBy === 'distance') {
                return (a.computedDistance ?? Infinity) - (b.computedDistance ?? Infinity);
             } else {
                return (b.avgRating ?? 0) - (a.avgRating ?? 0);
             }
          });
          
          if (viewMode === 'map') {
             const validMapSalons = processedSalons.filter(s => s.lat && s.lng);
             let minLat = userLocation?.lat || (validMapSalons.length ? Math.min(...validMapSalons.map(s => s.lat)) : 0);
             let maxLat = userLocation?.lat || (validMapSalons.length ? Math.max(...validMapSalons.map(s => s.lat)) : 0);
             let minLng = userLocation?.lng || (validMapSalons.length ? Math.min(...validMapSalons.map(s => s.lng)) : 0);
             let maxLng = userLocation?.lng || (validMapSalons.length ? Math.max(...validMapSalons.map(s => s.lng)) : 0);

             const latRange = maxLat - minLat || 0.02;
             const lngRange = maxLng - minLng || 0.02;
             minLat -= latRange * 0.15; maxLat += latRange * 0.15;
             minLng -= lngRange * 0.15; maxLng += lngRange * 0.15;

             const getTop = (lat) => `${100 - ((lat - minLat) / (maxLat - minLat)) * 100}%`;
             const getLeft = (lng) => `${((lng - minLng) / (maxLng - minLng)) * 100}%`;
             
             return (
                <div className="relative w-full h-[600px] bg-slate-50/50 border border-zinc-200 rounded-[24px] overflow-hidden shadow-sm">
                   <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                   
                   {userLocation && (
                      <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center" style={{ top: getTop(userLocation.lat), left: getLeft(userLocation.lng) }}>
                        <div className="w-5 h-5 bg-blue-500 rounded-full border-[3px] border-white shadow-md animate-pulse" />
                        <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded-full mt-1 shadow-sm text-zinc-700">{isAr ? 'موقعك' : 'You'}</span>
                      </div>
                   )}

                   {validMapSalons.map(salon => (
                      <div key={salon.id} onClick={() => { setSelectedSalon(salon); setCurrentImageIndex(0); setStep('salon-details'); fetchSalonDetails(salon.id); }} className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20 flex flex-col items-center" style={{ top: getTop(salon.lat), left: getLeft(salon.lng) }}>
                        <MapPin className="w-8 h-8 text-zinc-900 fill-white transition-transform group-hover:scale-125 group-hover:text-amber-500 drop-shadow-md" />
                        <div className="absolute top-full mt-1 bg-white px-3 py-1.5 rounded-xl shadow-lg border border-zinc-100 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col items-center z-30">
                           {isAr ? salon.name_ar : salon.name_en}
                           <div className="text-[10px] text-zinc-500 font-medium mt-0.5 flex justify-center items-center gap-1">
                              <Star className="w-3 h-3 text-amber-500 fill-current" /> {salon.avgRating ? salon.avgRating.toFixed(1) : (salon.rating || 'New')}
                           </div>
                        </div>
                      </div>
                   ))}
                   
                   {validMapSalons.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-zinc-400 font-medium">
                         {isAr ? 'لا تتوفر إحداثيات للصالونات لعرضها على الخريطة' : 'No salon coordinates available to display on map'}
                      </div>
                   )}
                </div>
             );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedSalons.map((salon, i) => (
                <motion.div 
              key={salon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[16px] overflow-hidden border border-zinc-100 shadow-sm hover:shadow-md transition-all group flex flex-col"
            >
              <div className="h-48 overflow-hidden relative bg-slate-100">
                {(salon.images?.[0] || salon.image_url) && <img src={salon.images?.[0] || salon.image_url} alt={isAr ? salon.name_ar : salon.name_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                
                <button onClick={(e) => toggleFavorite(salon.id, e)} className="absolute top-3 left-3 p-2 bg-white/90 hover:bg-white backdrop-blur-md rounded-full transition-colors z-10 shadow-sm">
                  <Heart className={`w-4 h-4 ${favorites.includes(salon.id) ? 'text-rose-500 fill-rose-500' : 'text-zinc-400'}`} />
                </button>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-slate-800">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {salon.avgRating ? salon.avgRating.toFixed(1) : (salon.rating || 'New')}
                </div>
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h4 className="text-lg font-bold text-zinc-900">{isAr ? salon.name_ar : salon.name_en}</h4>
                  {salon.computedDistance && salon.computedDistance !== Infinity ? (
                    <span className="text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-1 rounded-full flex items-center gap-1 shrink-0">
                      <MapPin className="w-3 h-3" />
                      {salon.computedDistance.toFixed(1)} km
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-zinc-500 bg-slate-100 px-2 py-1 rounded-full shrink-0">{salon.location_text || (salon.city || 'Nearby')}</span>
                  )}
                </div>
                
                <p className="text-sm text-zinc-500 mb-4 line-clamp-2">
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  {isAr ? salon.address_ar || 'العنوان غير متوفر' : salon.address_en || 'Address not available'}
                </p>
                
                <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-zinc-50">
                  <button onClick={() => { setSelectedSalon(salon); setCurrentImageIndex(0); setStep('salon-details'); fetchSalonDetails(salon.id); }} className="w-full py-2.5 text-sm font-bold text-zinc-700 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition-colors">
                    {isAr ? 'عرض' : 'View'}
                  </button>
                  <button onClick={() => { setSelectedSalon(salon); setCurrentImageIndex(0); setStep('services'); fetchSalonDetails(salon.id); }} className="w-full py-2.5 text-sm font-bold text-white bg-zinc-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm">
                    {isAr ? 'حجز' : 'Book'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
          {processedSalons.length === 0 && !isLoadingData && (
                <div className="col-span-full text-center py-12 text-zinc-500">
                  {isAr ? 'لا يوجد صالونات متاحة حالياً.' : 'No salons available right now.'}
                </div>
              )}
            </div>
          );
        })()}
        
      </section>


      
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-24 left-1/2 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl border ${
              toast.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
              toast.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' :
              'bg-blue-50 border-blue-100 text-blue-800'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
            <span className="text-sm font-bold whitespace-nowrap">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
      {overlays}
    </>
  );
}
