import { useEffect, useCallback, useReducer, useRef } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://p01--smart-assist-backend--qnbs82bxhg66.code.run/api');

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.payload, hasLoaded: true };
    case 'SET_LOADED':
      return { ...state, hasLoaded: action.payload };
    case 'OPEN_RATING':
      return { ...state, ratingSpecialist: action.payload, ratingValue: 5, ratingLoading: false };
    case 'CLOSE_RATING':
      return { ...state, ratingSpecialist: null };
    case 'SET_RATING_VALUE':
      return { ...state, ratingValue: action.payload };
    case 'SET_RATING_LOADING':
      return { ...state, ratingLoading: action.payload };
    case 'SET_FAMILY_FIELD':
      return { ...state, familyFields: { ...state.familyFields, [action.field]: action.value } };
    case 'RESET_FAMILY_FIELDS':
      return { ...state, familyFields: { name: '', relationship: 'Child' }, otherRelationship: '', familyLoading: false };
    case 'SET_OTHER_RELATIONSHIP':
      return { ...state, otherRelationship: action.payload };
    case 'SET_FAMILY_LOADING':
      return { ...state, familyLoading: action.payload };
    case 'START_CANCELLING':
      return { ...state, cancellingIds: [...(state.cancellingIds || []), action.payload] };
    case 'STOP_CANCELLING':
      return { ...state, cancellingIds: (state.cancellingIds || []).filter(id => id !== action.payload) };
    case 'START_DELETING':
      return { ...state, deletingIds: [...(state.deletingIds || []), action.payload] };
    case 'STOP_DELETING':
      return { ...state, deletingIds: (state.deletingIds || []).filter(id => id !== action.payload) };
    case 'START_UNDOING':
      return { ...state, undoingIds: [...(state.undoingIds || []), action.payload] };
    case 'STOP_UNDOING':
      return { ...state, undoingIds: (state.undoingIds || []).filter(id => id !== action.payload) };
    case 'REMOVE_BOOKING_OPTIMISTIC':
      return { ...state, bookings: state.bookings.filter(b => b._id !== action.payload) };
    case 'CANCEL_BOOKING_OPTIMISTIC':
      return {
        ...state,
        bookings: state.bookings.map(b => 
          b._id === action.payload 
            ? { ...b, status: 'cancelled', cancelledAt: new Date().toISOString() } 
            : b
        )
      };
    case 'UNDO_CANCEL_BOOKING_OPTIMISTIC':
      return {
        ...state,
        bookings: state.bookings.map(b => 
          b._id === action.payload 
            ? { ...b, status: 'confirmed', cancelledAt: undefined } 
            : b
        )
      };
    default:
      return state;
  }
};

export const useDashboard = ({ user, token, logoutUser, refreshUser, navigate, t }) => {
  const tokenRef = useRef(token);
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  const [dbState, dispatch] = useReducer(dashboardReducer, {
    activeTab: 'appointments',
    bookings: [],
    hasLoaded: false,
    ratingSpecialist: null,
    ratingValue: 5,
    ratingLoading: false,
    familyFields: { name: '', relationship: 'Child' },
    otherRelationship: '',
    familyLoading: false,
    cancellingIds: [],
    deletingIds: [],
    undoingIds: []
  });

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/bookings/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && tokenRef.current === token) {
        dispatch({ type: 'SET_BOOKINGS', payload: json.bookings });
      }
    } catch (err) {
      console.error(err);
    } finally {
      if (tokenRef.current === token) {
        dispatch({ type: 'SET_LOADED', payload: true });
      }
    }
  }, [token]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && tokenRef.current === token) {
        refreshUser(json.user);
      }
    } catch (err) {
      console.error(err);
    }
  }, [token, refreshUser]);

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
    } else {
      (async () => {
        await fetchBookings();
        await fetchProfile();
      })();
    }
  }, [token, user, navigate, fetchBookings, fetchProfile]);

  const handleAddFamilyMember = async (e) => {
    e.preventDefault();
    if (!dbState.familyFields.name.trim()) return;

    dispatch({ type: 'SET_FAMILY_LOADING', payload: true });
    try {
      const relationshipToSend = dbState.familyFields.relationship === 'Other' ? dbState.otherRelationship : dbState.familyFields.relationship;
      const res = await fetch(`${BACKEND_URL}/auth/family`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: dbState.familyFields.name, relationship: relationshipToSend })
      });
      const json = await res.json();
      if (json.success) {
        dispatch({ type: 'RESET_FAMILY_FIELDS' });
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      dispatch({ type: 'SET_FAMILY_LOADING', payload: false });
    }
  };

  const handleDeleteFamilyMember = async (memberId) => {
    if (!window.confirm(t('confirm_remove_family'))) return;
    try {
      const res = await fetch(`${BACKEND_URL}/auth/family/${memberId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaimAndBook = async (waitlistEntry) => {
    if (!window.confirm(
      t('confirm_claim_slot', { 
        specialist: waitlistEntry.specialistName, 
        date: waitlistEntry.bookingDate, 
        time: waitlistEntry.bookingTime 
      })
    )) return;
    try {
      const claimRes = await fetch(`${BACKEND_URL}/bookings/waitlist/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ waitlistId: waitlistEntry._id })
      });
      const claimJson = await claimRes.json();
      if (!claimJson.success) throw new Error(claimJson.message);

      const bookingRes = await fetch(`${BACKEND_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: user.name,
          userEmail: user.email,
          specialistId: waitlistEntry.specialistId,
          bookingDate: waitlistEntry.bookingDate,
          bookingTime: waitlistEntry.bookingTime,
          userId: user.id,
          bookedFor: user.name
        })
      });
      const bookingJson = await bookingRes.json();
      if (bookingJson.success) {
        alert(t('success_claim_book'));
        fetchProfile();
        fetchBookings();
      } else {
        alert('Failed to book: ' + bookingJson.message);
      }
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    if (!dbState.ratingSpecialist) return;

    dispatch({ type: 'SET_RATING_LOADING', payload: true });
    try {
      const res = await fetch(`${BACKEND_URL}/specialists/${dbState.ratingSpecialist.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: dbState.ratingValue })
      });
      const json = await res.json();
      if (json.success) {
        alert('Thank you for rating!');
        dispatch({ type: 'CLOSE_RATING' });
        await fetchBookings();
      }
    } catch (err) {
      console.error(err);
    } finally {
      dispatch({ type: 'SET_RATING_LOADING', payload: false });
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(t('confirm_cancel_appointment'))) return;
    dispatch({ type: 'START_CANCELLING', payload: bookingId });
    dispatch({ type: 'CANCEL_BOOKING_OPTIMISTIC', payload: bookingId });
    try {
      const res = await fetch(`${BACKEND_URL}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.message);
        await fetchBookings();
      }
    } catch (err) {
      console.error(err);
      await fetchBookings();
    } finally {
      dispatch({ type: 'STOP_CANCELLING', payload: bookingId });
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm(t('confirm_delete_appointment'))) return;
    dispatch({ type: 'START_DELETING', payload: bookingId });
    await new Promise(resolve => setTimeout(resolve, 600));
    dispatch({ type: 'REMOVE_BOOKING_OPTIMISTIC', payload: bookingId });
    try {
      const res = await fetch(`${BACKEND_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.message);
        await fetchBookings();
      }
    } catch (err) {
      console.error(err);
      await fetchBookings();
    } finally {
      dispatch({ type: 'STOP_DELETING', payload: bookingId });
    }
  };

  const handleUndoCancelBooking = async (bookingId) => {
    dispatch({ type: 'START_UNDOING', payload: bookingId });
    dispatch({ type: 'UNDO_CANCEL_BOOKING_OPTIMISTIC', payload: bookingId });
    try {
      const res = await fetch(`${BACKEND_URL}/bookings/${bookingId}/undo-cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (!json.success) {
        alert(json.message);
        await fetchBookings();
      }
    } catch (err) {
      console.error(err);
      await fetchBookings();
    } finally {
      dispatch({ type: 'STOP_UNDOING', payload: bookingId });
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return {
    dbState,
    dispatch,
    handleAddFamilyMember,
    handleDeleteFamilyMember,
    handleClaimAndBook,
    handleSubmitRating,
    handleCancelBooking,
    handleUndoCancelBooking,
    handleDeleteBooking,
    handleLogout,
    fetchProfile
  };
};
