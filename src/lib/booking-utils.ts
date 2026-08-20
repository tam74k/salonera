export function generateAvailableSlots(
  openTime: string, // e.g., "09:00"
  closeTime: string, // e.g., "22:00"
  maxBookingsPerHour: number, // 1 or 2
  bookedTimes: string[] // e.g., ["10:00", "10:30"]
): { time: string, available: boolean }[] {
  // If maxBookingsPerHour is 2, slots are every 30 minutes, else every 60 minutes
  const interval = maxBookingsPerHour >= 2 ? 30 : 60;
  
  const timeToMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const minsToTime = (m: number) => {
    const h = Math.floor(m / 60).toString().padStart(2, '0');
    const mins = (m % 60).toString().padStart(2, '0');
    return `${h}:${mins}`;
  };

  const startMins = timeToMins(openTime);
  const closeMins = timeToMins(closeTime);
  
  // Rule: up to one hour before closing
  const endMins = closeMins - 60; 

  const slots: { time: string, available: boolean }[] = [];
  for (let time = startMins; time <= endMins; time += interval) {
    const timeStr = minsToTime(time);
    
    // Check if this time is booked
    slots.push({
      time: timeStr,
      available: !bookedTimes.includes(timeStr)
    });
  }

  return slots;
}
