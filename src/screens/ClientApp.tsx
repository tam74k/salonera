import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../store';
import { translations } from '../i18n';
import { MapPin, Star, ArrowRight, ArrowLeft, CheckCircle2, ChevronRight, ChevronLeft, Calendar as CalendarIcon, Clock, User as UserIcon, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { generateAvailableSlots } from '../lib/booking-utils';
import { supabase } from '../lib/supabase';
import { sendWhatsAppMessage } from '../lib/whatsapp';

type BookingStep = 'salons' | 'services' | 'datetime' | 'confirmed';

export function ClientApp() {
  const { lang, isAr, user } = useAppContext();
  const t = translations[lang];

  const [step, setStep] = useState<BookingStep>('salons');
  
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
  const [salons, setSalons] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
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
    const { data } = await supabase.from('salons').select('*');
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
    return sum + (s?.price || 0);
  }, 0);

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

  const fetchBookedTimes = async () => {
    let query = supabase.from('bookings')
      .select('booking_time')
      .eq('salon_id', selectedSalon.id)
      .eq('booking_date', selectedDate)
      .neq('status', 'canceled');
      
    if (selectedStaff) {
      query = query.eq('staff_id', selectedStaff);
    }
    
    const { data } = await query;
    if (data) {
      // time in PG is usually 'HH:MM:SS', we need 'HH:MM'
      const formattedTimes = data.map(b => b.booking_time.substring(0, 5));
      setBookedTimes(formattedTimes);
    } else {
      setBookedTimes([]);
    }
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
          const message = isAr 
            ? `مرحباً ${clientName}،\nلقد استلمنا طلب حجزك رقم ${booking.id}.\nنحن بانتظار تأكيد الإدارة وسنعلمك قريباً!\nيمكنك إبراز الكود الخاص بك عند الحضور.` 
            : `Hello ${clientName},\nWe received your booking request #${booking.id}.\nAwaiting admin confirmation. We will notify you soon!\nPlease show your QR code upon arrival.`;
          
          await sendWhatsAppMessage(apiUrl, instance, apiKey, profile.mobile, message);
        }
      } catch (err) {
        console.error('Failed to send WA message on booking creation', err);
      }

    } catch (err: any) {
      alert(isAr ? 'حدث خطأ أثناء الحجز، أو أن الوقت محجوز بالفعل.' : 'Error during booking, or time already taken.');
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
    if (!selectedSalon || !selectedDate) return [];
    
    return generateAvailableSlots(
      selectedSalon.working_hours_start || selectedSalon.open_time || '09:00',
      selectedSalon.working_hours_end || selectedSalon.close_time || '22:00',
      selectedSalon.max_bookings_per_hour || 1,
      bookedTimes
    );
  }, [selectedSalon, selectedDate, bookedTimes]);

  if (step === 'confirmed' && bookingConfirmed) {
    return (
      <div className="max-w-2xl mx-auto p-4 md:p-8 mt-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center"
        >
          <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">{isAr ? 'تم تأكيد الحجز!' : 'Booking Confirmed!'}</h2>
          <p className="text-slate-500 mb-8">
            {isAr ? 'تم حفظ تفاصيل حجزك بنجاح.' : 'Your booking details have been saved successfully.'}
          </p>

          <div className="bg-slate-50 rounded-2xl p-6 mb-8 inline-block text-left w-full max-w-sm" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
              <span className="text-slate-500 font-medium">{isAr ? 'رقم الحجز' : 'Booking ID'}</span>
              <span className="font-bold text-slate-900">{bookingConfirmed}</span>
            </div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
              <span className="text-slate-500 font-medium">{isAr ? 'الوقت والتاريخ' : 'Date & Time'}</span>
              <span className="font-bold text-slate-900">{selectedDate} / {selectedTime}</span>
            </div>
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
              <span className="text-slate-500 font-medium">{isAr ? 'عدد الخدمات' : 'Services Count'}</span>
              <span className="font-bold text-slate-900">{selectedServices.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">{isAr ? 'الإجمالي' : 'Total Amount'}</span>
              <span className="font-bold text-indigo-600 text-lg">SAR {totalPrice}</span>
            </div>
          </div>

          <div className="flex justify-center mb-8">
            <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-100">
              <QRCodeSVG value={bookingConfirmed} size={150} level="M" />
              <p className="text-xs text-slate-400 mt-3">{isAr ? 'امسح الكود عند الوصول' : 'Scan code upon arrival'}</p>
            </div>
          </div>

          <button onClick={resetFlow} className="w-full max-w-sm bg-slate-900 text-white py-3.5 rounded-xl font-medium hover:bg-slate-800 transition-colors">
            {isAr ? 'العودة للرئيسية' : 'Back to Home'}
          </button>
        </motion.div>
      </div>
    );
  }

  if (step === 'datetime' && selectedSalon) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        <button onClick={() => setStep('services')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium">
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {isAr ? 'العودة للخدمات' : 'Back to Services'}
        </button>

        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">{isAr ? 'اختر الموعد والفني' : 'Select Date & Artist'}</h2>

          {/* Artist Selection */}
          <div className="mb-8">
            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-indigo-500" />
              {isAr ? 'اختر فني التجميل (اختياري)' : 'Select Artist (Optional)'}
            </label>
            <div className="flex overflow-x-auto gap-3 pb-2 snap-x">
              <div 
                onClick={() => { setSelectedStaff(''); setSelectedTime(''); }}
                className={`flex-shrink-0 snap-start px-6 py-3 rounded-xl border-2 font-bold cursor-pointer transition-colors ${selectedStaff === '' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'}`}
              >
                {isAr ? 'غير محدد (أي فني متاح)' : 'Any Available'}
              </div>
              {staff.map(member => (
                <div 
                  key={member.id}
                  onClick={() => { setSelectedStaff(member.id); setSelectedTime(''); }}
                  className={`flex-shrink-0 snap-start px-6 py-3 rounded-xl border-2 font-bold cursor-pointer transition-colors flex items-center gap-3 ${selectedStaff === member.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-600 hover:border-slate-200'}`}
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
            <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-500" />
              {isAr ? 'تاريخ الحجز' : 'Booking Date'}
            </label>
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
              min={new Date().toISOString().split('T')[0]}
              className="w-full md:w-auto bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
            />
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
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
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed line-through'
                          : selectedTime === slot.time 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 text-slate-500 rounded-xl text-center text-sm font-medium">
                  {isAr ? 'عفواً، لا يوجد أوقات متاحة في هذا اليوم.' : 'Sorry, no available times on this date.'}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 pt-8 border-t border-slate-100">
            <button 
              onClick={handleBook}
              disabled={!selectedDate || !selectedTime}
              className="w-full px-8 py-4 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 text-lg shadow-md"
            >
              {t.book_now}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'services' && selectedSalon) {
    return (
      <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">
        <button onClick={() => setSelectedSalon(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium">
          {isAr ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          {isAr ? 'العودة للصالونات' : 'Back to Salons'}
        </button>

        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
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
            <h3 className="text-xl font-bold text-slate-900 mb-6">{isAr ? 'اختر الخدمات' : 'Select Services'}</h3>
            <div className="space-y-3">
              {services.map(service => {
                const isSelected = selectedServices.includes(service.id);
                return (
                  <div 
                    key={service.id} 
                    onClick={() => handleServiceToggle(service.id)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex justify-between items-center ${isSelected ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200 bg-white'}`}
                  >
                    <div>
                      <h4 className={`font-bold ${isSelected ? 'text-indigo-900' : 'text-slate-900'}`}>
                        {isAr ? service.name_ar : service.name_en}
                      </h4>
                    </div>
                    <span className={`font-bold ${isSelected ? 'text-indigo-600' : 'text-slate-600'} flex flex-col items-end`}>
                      {service.discount_price ? (
                        <>
                          <span className="text-xs line-through opacity-50">SAR {service.original_price}</span>
                          <span className="text-emerald-600">SAR {service.discount_price}</span>
                        </>
                      ) : (
                        <span>SAR {service.original_price}</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-slate-500 font-medium">{isAr ? 'إجمالي السعر' : 'Total Price'}</p>
                <p className="text-3xl font-bold text-slate-900">SAR {totalPrice}</p>
              </div>
              <button 
                onClick={handleNextToDateTime}
                disabled={selectedServices.length === 0}
                className="w-full md:w-auto px-8 py-3.5 bg-slate-900 hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {isAr ? 'التالي' : 'Next'} ({selectedServices.length})
                {isAr ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8 pb-24">
      {/* Hero Section */}
      <section className="relative bg-slate-900 rounded-3xl overflow-hidden p-8 md:p-12 text-white">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay" />
        <div className="relative z-10 max-w-lg">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {isAr ? 'اكتشف أفضل صالونات التجميل بالقرب منك' : 'Discover the best beauty salons near you'}
          </h2>
          <div className="flex bg-white/10 backdrop-blur-md rounded-full p-1.5 mt-6 border border-white/20">
            <button className="flex-1 bg-white text-slate-900 rounded-full py-2.5 text-sm font-semibold shadow-sm">
              {t.men_salons}
            </button>
            <button className="flex-1 text-white rounded-full py-2.5 text-sm font-medium hover:bg-white/10 transition-colors">
              {t.women_salons}
            </button>
          </div>
        </div>
      </section>

      {/* Salons List */}
      <section>
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{t.discover_salons}</h3>
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
              className="text-sm font-medium text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <MapPin className="w-4 h-4" />
              {isAr ? 'تحديث الموقع' : 'Update location'}
            </button>
          )}
        </div>

        
        {/* Filters */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            {isAr ? 'تصفية الصالونات حسب المنطقة' : 'Filter Salons by Region'}
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <select value={filterCountry} onChange={e => { const val = e.target.value; setFilterCountry(val); setFilterGov(''); setFilterCity(''); updateProfileLocation(val, '', ''); }} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-medium">
                <option value="">{isAr ? 'كل الدول' : 'All Countries'}</option>
                {countriesList.map(c => <option key={c.id} value={c.id}>{isAr ? c.name_ar : c.name_en}</option>)}
              </select>
            </div>
            <div>
              <select value={filterGov} onChange={e => { const val = e.target.value; setFilterGov(val); setFilterCity(''); updateProfileLocation(filterCountry, val, ''); }} disabled={!filterCountry} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-medium disabled:opacity-50">
                <option value="">{isAr ? 'كل المحافظات' : 'All Governorates'}</option>
                {governoratesList.filter(g => g.country_id.toString() === filterCountry.toString()).map(g => <option key={g.id} value={g.id}>{isAr ? g.name_ar : g.name_en}</option>)}
              </select>
            </div>
            <div>
              <select value={filterCity} onChange={e => { const val = e.target.value; setFilterCity(val); updateProfileLocation(filterCountry, filterGov, val); }} disabled={!filterGov} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none font-medium disabled:opacity-50">
                <option value="">{isAr ? 'كل المدن' : 'All Cities'}</option>
                {citiesList.filter(ci => ci.governorate_id.toString() === filterGov.toString()).map(city => <option key={city.id} value={city.id}>{isAr ? city.name_ar : city.name_en}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {salons.filter(s => {
            if (filterCountry && s.country_id?.toString() !== filterCountry.toString()) return false;
            if (filterGov && s.governorate_id?.toString() !== filterGov.toString()) return false;
            if (filterCity && s.city_id?.toString() !== filterCity.toString()) return false;
            return true;
          }).map((salon, i) => (
            <motion.div 
              key={salon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => handleSalonSelect(salon)}
              className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:-translate-y-1"
            >
              <div className="h-48 overflow-hidden relative bg-slate-100">
                {(salon.images?.[0] || salon.image_url) && <img src={salon.images?.[0] || salon.image_url} alt={isAr ? salon.name_ar : salon.name_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1 text-xs font-bold text-slate-800">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {salon.rating || 'New'}
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-lg font-bold text-slate-900">{isAr ? salon.name_ar : salon.name_en}</h4>
                  {salon.computedDistance && salon.computedDistance !== Infinity ? (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {salon.computedDistance.toFixed(1)} km
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{salon.location_text || (salon.city || 'Nearby')}</span>
                  )}
                </div>
                <div className="flex items-center justify-end mt-4">
                  <span className="flex items-center gap-1 text-sm font-bold text-indigo-600 group-hover:text-indigo-700">
                    {t.book_now}
                    {isAr ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          {salons.length === 0 && !isLoadingData && (
            <div className="col-span-full text-center py-12 text-slate-500">
              {isAr ? 'لا يوجد صالونات متاحة حالياً.' : 'No salons available right now.'}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
