const fs = require('fs');
let content = fs.readFileSync('src/screens/ClientApp.tsx', 'utf8');

const oldFetchBooked = `  const fetchBookedTimes = async () => {
    let query = supabase.from('bookings')
      .select('booking_time, total_amount')
      .eq('salon_id', selectedSalon.id)
      .eq('booking_date', selectedDate)
      .neq('status', 'canceled')
      .neq('status', 'cancelled');
      
    if (selectedStaff) {
      query = query.eq('staff_id', selectedStaff);
    }
    
    const { data } = await query;
    if (data) {
      const fullDayOff = data.find(b => b.total_amount === -1 && b.booking_time.startsWith('00:00'));
      if (fullDayOff) {
        setBookedTimes(['FULL_DAY_OFF']);
        return;
      }
      // time in PG is usually 'HH:MM:SS', we need 'HH:MM'
      const formattedTimes = data.map(b => b.booking_time.substring(0, 5));
      setBookedTimes(formattedTimes);
    } else {
      setBookedTimes([]);
    }
  };`;

const newFetchBooked = `  const fetchBookedTimes = async () => {
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
      blockedQuery = blockedQuery.or(\`staff_id.is.null,staff_id.eq.\${selectedStaff}\`);
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
      const selectedDateStart = new Date(\`\${selectedDate}T00:00:00.000Z\`);
      const selectedDateEnd = new Date(\`\${selectedDate}T23:59:59.999Z\`);
      
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
               formattedTimes.push(\`\${hh}:\${mm}\`);
               current.setMinutes(current.getMinutes() + 30);
            }
         }
      }
    }
    
    setBookedTimes(formattedTimes);
  };`;

content = content.replace(oldFetchBooked, newFetchBooked);

fs.writeFileSync('src/screens/ClientApp.tsx', content);
console.log("Updated fetchBookedTimes");
