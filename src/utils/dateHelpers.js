export const REBOOK_INTERVALS = {
  'Dentist': { days: 180, label: '6 months' },
  'Physiotherapist': { days: 14, label: '2 weeks' },
  'Gym Trainer': { days: 3, label: '3 days' },
  'Salon Specialist': { days: 30, label: '4 weeks' },
  'default': { days: 30, label: '1 month' }
};

export const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  if (dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(dateStr);
};

export const isPastBooking = (booking) => {
  try {
    const bDate = new Date(`${booking.bookingDate} ${booking.bookingTime}`);
    if (!isNaN(bDate.getTime())) {
      return bDate < new Date();
    }
    const justDate = parseLocalDate(booking.bookingDate);
    if (!isNaN(justDate.getTime())) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return justDate < today;
    }
    return false;
  } catch (e) {
    return false;
  }
};

export const calculateRebookStatus = (booking) => {
  if (!booking) return null;
  
  const intervalConfig = REBOOK_INTERVALS[booking.specialistCategory] || REBOOK_INTERVALS['default'];
  const bookingDate = new Date(`${booking.bookingDate} ${booking.bookingTime}`);
  if (isNaN(bookingDate.getTime())) return null;
  
  const now = new Date();
  const diffMs = now - bookingDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  const recommendedDays = intervalConfig.days;
  const remainingDays = recommendedDays - diffDays;
  
  let timeElapsedString = '';
  if (diffDays === 0) {
    timeElapsedString = 'today';
  } else if (diffDays === 1) {
    timeElapsedString = '1 day ago';
  } else if (diffDays < 7) {
    timeElapsedString = `${diffDays} days ago`;
  } else {
    const weeks = Math.floor(diffDays / 7);
    timeElapsedString = weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  
  const isOverdue = remainingDays <= 0;
  
  return {
    booking,
    diffDays,
    remainingDays,
    timeElapsedString,
    isOverdue,
    recommendedLabel: intervalConfig.label
  };
};
