import { useEffect, use, useCallback, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import Stepper from '../components/Stepper';
import { LogOut, Calendar, Users, Bell } from 'lucide-react';

import AppointmentsTab from '../components/dashboard/AppointmentsTab';
import FamilyTab from '../components/dashboard/FamilyTab';
import WaitlistsTab from '../components/dashboard/WaitlistsTab';
import RatingModal from '../components/dashboard/RatingModal';

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
    default:
      return state;
  }
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, token, logoutUser, refreshUser } = use(AppContext);
  const navigate = useNavigate();

  const [dbState, dispatch] = useReducer(dashboardReducer, {
    activeTab: 'appointments',
    bookings: [],
    hasLoaded: false,
    ratingSpecialist: null,
    ratingValue: 5,
    ratingLoading: false,
    familyFields: { name: '', relationship: 'Child' },
    otherRelationship: '',
    familyLoading: false
  });

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/bookings/user`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        dispatch({ type: 'SET_BOOKINGS', payload: json.bookings });
      }
    } catch (err) {
      console.error(err);
    } finally {
      dispatch({ type: 'SET_LOADED', payload: true });
    }
  }, [token]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
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
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    } finally {
      dispatch({ type: 'SET_RATING_LOADING', payload: false });
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm(t('confirm_cancel_appointment'))) return;
    try {
      const res = await fetch(`${BACKEND_URL}/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        fetchBookings();
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm(t('confirm_delete_appointment'))) return;
    try {
      const res = await fetch(`${BACKEND_URL}/bookings/${bookingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (json.success) {
        fetchBookings();
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Stepper currentStep={2} flow="account" />
      <div className="container" style={{ paddingTop: '20px', flex: 1 }}>
      
      {/* Header bar */}
      <div className="card-light dashboard-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="dashboard-avatar">
            {user.name.substring(0,2).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700' }}>{t('hello')}, {user.name}</h1>
            <p style={{ opacity: 0.6, fontSize: '14px' }}>{t('health_portal_welcome')}</p>
          </div>
        </div>
        <button type="button" onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
          <LogOut size={16} /> {t('logout')}
        </button>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 18fr', gap: '32px' }}>
        {/* Sidebar tabs */}
        <div>
          <div className="card-light" style={{ padding: '12px' }}>
            <button 
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'appointments' })} 
              className={`dashboard-tab-btn ${dbState.activeTab === 'appointments' ? 'active' : ''}`}
            >
              <Calendar size={18} /> {t('appointments')}
            </button>
            <button 
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'family' })} 
              className={`dashboard-tab-btn ${dbState.activeTab === 'family' ? 'active' : ''}`}
            >
              <Users size={18} /> {t('family_profiles', { defaultValue: 'Family Profiles' })}
            </button>
            <button 
              type="button"
              onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'waitlists' })} 
              className={`dashboard-tab-btn ${dbState.activeTab === 'waitlists' ? 'active' : ''}`}
            >
              <Bell size={18} /> {t('waitlist')} ({user.waitlistAppointments ? user.waitlistAppointments.length : 0})
            </button>
          </div>
        </div>

        {/* Content area */}
        <div>
          {dbState.activeTab === 'appointments' && (
            <AppointmentsTab 
              bookings={dbState.bookings}
              hasLoaded={dbState.hasLoaded}
              onRateSpecialist={val => dispatch({ type: 'OPEN_RATING', payload: val })}
              onCancelBooking={handleCancelBooking}
              onDeleteBooking={handleDeleteBooking}
              onBookNow={() => navigate('/')}
              t={t}
            />
          )}

          {dbState.activeTab === 'family' && (
            <FamilyTab 
              familyProfiles={user.familyProfiles}
              familyFields={dbState.familyFields}
              otherRelationship={dbState.otherRelationship}
              familyLoading={dbState.familyLoading}
              onAddFamilyMember={handleAddFamilyMember}
              onDeleteFamilyMember={handleDeleteFamilyMember}
              onFieldChange={(field, val) => dispatch({ type: 'SET_FAMILY_FIELD', field, value: val })}
              onOtherRelationshipChange={val => dispatch({ type: 'SET_OTHER_RELATIONSHIP', payload: val })}
              t={t}
            />
          )}

          {dbState.activeTab === 'waitlists' && (
            <WaitlistsTab 
              waitlistAppointments={user.waitlistAppointments}
              onClaimAndBook={handleClaimAndBook}
              onExpire={fetchProfile}
              t={t}
            />
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {dbState.ratingSpecialist && (
        <RatingModal 
          ratingSpecialist={dbState.ratingSpecialist}
          ratingValue={dbState.ratingValue}
          ratingLoading={dbState.ratingLoading}
          onRatingValueChange={val => dispatch({ type: 'SET_RATING_VALUE', payload: val })}
          onSubmitRating={handleSubmitRating}
          onClose={() => dispatch({ type: 'CLOSE_RATING' })}
          t={t}
        />
      )}
      </div>
    </div>
  );
};

export default Dashboard;
