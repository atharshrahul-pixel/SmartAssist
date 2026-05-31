import { useMemo } from 'react';
import { isPastBooking, parseLocalDate } from '../utils/dateHelpers';

export const useAppointmentFilters = (bookings, user, startDate, endDate, selectedCategory, selectedFamilyMember) => {
  const upcomingAppointments = useMemo(() => {
    return bookings
      .filter(b => !isPastBooking(b))
      .sort((a, b) => {
        const dateA = new Date(`${a.bookingDate} ${a.bookingTime}`);
        const dateB = new Date(`${b.bookingDate} ${b.bookingTime}`);
        return dateA - dateB;
      });
  }, [bookings]);

  const sortedPastAppointments = useMemo(() => {
    return bookings
      .filter(b => isPastBooking(b))
      .sort((a, b) => {
        const dateA = new Date(`${a.bookingDate} ${a.bookingTime}`);
        const dateB = new Date(`${b.bookingDate} ${b.bookingTime}`);
        return dateB - dateA;
      });
  }, [bookings]);

  const categories = useMemo(() => {
    return Array.from(new Set([
      'Dentist', 'Physiotherapist', 'Gym Trainer', 'Salon Specialist',
      ...bookings.map(b => b.specialistCategory).filter(Boolean)
    ]));
  }, [bookings]);

  const familyOptions = useMemo(() => {
    return Array.from(new Set([
      'Myself',
      ...(user?.familyProfiles ? user.familyProfiles.map(m => m.name) : []),
      ...bookings.map(b => b.bookedFor).filter(Boolean)
    ]));
  }, [bookings, user]);

  const filteredPastAppointments = useMemo(() => {
    return sortedPastAppointments.filter(b => {
      const bookingDateObj = parseLocalDate(b.bookingDate);
      
      if (startDate) {
        const startObj = parseLocalDate(startDate);
        startObj.setHours(0,0,0,0);
        bookingDateObj.setHours(0,0,0,0);
        if (bookingDateObj < startObj) return false;
      }
      
      if (endDate) {
        const endObj = parseLocalDate(endDate);
        endObj.setHours(23,59,59,999);
        bookingDateObj.setHours(0,0,0,0);
        if (bookingDateObj > endObj) return false;
      }
      
      if (selectedCategory && b.specialistCategory !== selectedCategory) {
        return false;
      }
      
      if (selectedFamilyMember) {
        const patientName = b.bookedFor || b.userName;
        if (selectedFamilyMember === 'Myself') {
          if (patientName !== user?.name) return false;
        } else {
          if (patientName !== selectedFamilyMember) return false;
        }
      }
      
      return true;
    });
  }, [sortedPastAppointments, startDate, endDate, selectedCategory, selectedFamilyMember, user]);

  return {
    upcomingAppointments,
    sortedPastAppointments,
    categories,
    familyOptions,
    filteredPastAppointments
  };
};
