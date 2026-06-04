import { useState, useEffect, use, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import HelpTooltip from '../components/HelpTooltip';
import Stepper from '../components/Stepper';
import { 
  Calendar, Clock, Star, Users, 
  Trash2, Plus, Bell, LogOut
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://p01--smart-assist-backend--qnbs82bxhg66.code.run/api');

const WaitlistHoldTimer = ({ notifiedAt, onExpire }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState('');
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const notifiedTime = new Date(notifiedAt).getTime();
      const diffSinceNotification = Date.now() - notifiedTime;
      const isDevHold = diffSinceNotification < 60 * 1000 && (notifiedTime + 60 * 1000 - Date.now() > 0);
      const holdDuration = isDevHold ? 60 * 1000 : 10 * 60 * 1000;
      const difference = notifiedTime + holdDuration - Date.now();

      if (difference <= 0) {
        setTimeLeft('Expired');
        if (onExpireRef.current) onExpireRef.current();
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s ${t('left', { defaultValue: 'left' })}`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [notifiedAt, t]);

  return (
    <span style={{ fontSize: '12px', color: 'var(--color-orange)', fontWeight: 'bold' }}>
      ({timeLeft})
    </span>
  );
};


const Dashboard = () => {
  const { t } = useTranslation();
  const { user, token, logoutUser, refreshUser } = use(AppContext);
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('appointments');
  const [bookings, setBookings] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Rating Modal/Form State
  const [ratingSpecialist, setRatingSpecialist] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingLoading, setRatingLoading] = useState(false);

  // Family Form State
  const [familyFields, setFamilyFields] = useState({ name: '', relationship: 'Child' });
  const [otherRelationship, setOtherRelationship] = useState('');
  const [familyLoading, setFamilyLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/bookings/my-bookings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setBookings(json.bookings);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHasLoaded(true);
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
    if (!familyFields.name.trim()) return;

    setFamilyLoading(true);
    try {
      const relationshipToSend = familyFields.relationship === 'Other' ? otherRelationship : familyFields.relationship;
      const res = await fetch(`${BACKEND_URL}/auth/family`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: familyFields.name, relationship: relationshipToSend })
      });
      const json = await res.json();
      if (json.success) {
        setFamilyFields({ name: '', relationship: 'Child' });
        setOtherRelationship('');
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFamilyLoading(false);
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
      // Claim slot
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

      // Book appointment
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
    if (!ratingSpecialist) return;

    setRatingLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/specialists/${ratingSpecialist.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: ratingValue })
      });
      const json = await res.json();
      if (json.success) {
        alert('Thank you for rating!');
        setRatingSpecialist(null);
        fetchBookings();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRatingLoading(false);
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
      <div className="card-light" style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>
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
              onClick={() => setActiveTab('appointments')} 
              style={{
                width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                borderRadius: 'var(--r-md)', textAlign: 'left', fontWeight: '600',
                background: activeTab === 'appointments' ? 'var(--color-accent)' : 'transparent',
                color: activeTab === 'appointments' ? 'var(--color-dark)' : 'inherit',
                marginBottom: '4px'
              }}
            >
              <Calendar size={18} /> {t('appointments')}
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('family')} 
              style={{
                width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                borderRadius: 'var(--r-md)', textAlign: 'left', fontWeight: '600',
                background: activeTab === 'family' ? 'var(--color-accent)' : 'transparent',
                color: activeTab === 'family' ? 'var(--color-dark)' : 'inherit',
                marginBottom: '4px'
              }}
            >
              <Users size={18} /> {t('family_profiles', { defaultValue: 'Family Profiles' })}
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('waitlists')} 
              style={{
                width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                borderRadius: 'var(--r-md)', textAlign: 'left', fontWeight: '600',
                background: activeTab === 'waitlists' ? 'var(--color-accent)' : 'transparent',
                color: activeTab === 'waitlists' ? 'var(--color-dark)' : 'inherit'
              }}
            >
              <Bell size={18} /> {t('waitlist')} ({user.waitlistAppointments ? user.waitlistAppointments.length : 0})
            </button>
          </div>
        </div>

        {/* Content area */}
        <div>
          {activeTab === 'appointments' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>{t('your_appointments')}</h2>
              {!hasLoaded ? (
                <p style={{ opacity: 0.6 }}>{t('loading')}...</p>
              ) : bookings.length === 0 ? (
                <div className="card-light" style={{ textAlign: 'center', padding: '48px' }}>
                  <p style={{ opacity: 0.6, marginBottom: '16px' }}>{t('no_appointments')}</p>
                  <button type="button" onClick={() => navigate('/')} className="btn-primary">{t('book_now')}</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {bookings.map(b => (
                    <div key={b.receiptId} className="card-light" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{b.specialistName}</h3>
                          <span className="pill-tag">{t(`category_${b.specialistCategory}`, { defaultValue: b.specialistCategory })}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', opacity: 0.8, marginBottom: '6px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {b.bookingDate}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {b.bookingTime}</span>
                        </div>
                        <p style={{ fontSize: '13px', opacity: 0.6 }}>{t('patient_label')}: <strong>{b.bookedFor || b.userName}</strong> ({t('receipt_id')}: {b.receiptId})</p>
                      </div>

                      <div>
                        <button 
                          type="button"
                          onClick={() => setRatingSpecialist({ id: b.specialistId, name: b.specialistName })} 
                          className="btn-ghost" 
                          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <Star size={16} /> {t('rate_specialist')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'family' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>{t('family_profiles')}</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* List */}
                <div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {(!user.familyProfiles || user.familyProfiles.length === 0) ? (
                      <p style={{ opacity: 0.6 }}>{t('no_family')}</p>
                    ) : (
                      user.familyProfiles.map(member => (
                        <div key={member._id} className="card-light" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '16px' }}>{member.name}</div>
                            <div style={{ fontSize: '13px', color: 'var(--color-orange)', fontWeight: '600' }}>{t(`rel_${member.relationship.toLowerCase()}`, { defaultValue: member.relationship })}</div>
                          </div>
                           <button type="button" onClick={() => handleDeleteFamilyMember(member._id)} className="btn-danger" style={{ padding: '8px' }}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Form */}
                <div>
                  <form onSubmit={handleAddFamilyMember} className="card-light" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>{t('add_family_member')}</h3>
                    
                    <div className="mb-md">
                      <label htmlFor="family-name-input" className="form-label">
                        {t('your_name')}
                        <HelpTooltip text={t('tooltip_your_name')} />
                      </label>
                      <input 
                        id="family-name-input"
                        type="text" 
                        className="input-field" 
                        value={familyFields.name}
                        onChange={e => setFamilyFields(prev => ({ ...prev, name: e.target.value }))}
                        placeholder={t('patient_name_placeholder')}
                        required
                      />
                    </div>

                    <div className="mb-lg">
                      <label className="form-label">
                        {t('relationship', { defaultValue: 'Relationship' })}
                        <HelpTooltip text="Select how this person is related to you." />
                      </label>
                      <select 
                        className="input-field"
                        value={familyFields.relationship}
                        onChange={e => setFamilyFields(prev => ({ ...prev, relationship: e.target.value }))}
                      >
                        <option value="Child">{t('rel_child')}</option>
                        <option value="Spouse">{t('rel_spouse')}</option>
                        <option value="Parent">{t('rel_parent')}</option>
                        <option value="Other">{t('rel_other')}</option>
                      </select>
                    </div>

                    {familyFields.relationship === 'Other' && (
                      <div className="mb-lg" style={{ animation: 'fadeInSlideUp 0.25s ease' }}>
                        <label htmlFor="family-relationship-other" className="form-label">
                          {t('specify_relationship')}
                          <HelpTooltip text="Tell us how you are related to this person (e.g. Sibling, Cousin, Friend)." />
                        </label>
                        <input
                          id="family-relationship-other"
                          type="text"
                          className="input-field"
                          value={otherRelationship}
                          onChange={e => setOtherRelationship(e.target.value)}
                          placeholder="e.g. Sibling, Aunt, Friend"
                          required
                        />
                      </div>
                    )}

                    <button type="submit" className="btn-primary w-full" disabled={familyLoading}>
                      <Plus size={16} style={{ marginRight: '6px' }} /> {t('add_member_btn')}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'waitlists' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>{t('waitlist_notifications')}</h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                {(!user.waitlistAppointments || user.waitlistAppointments.length === 0) ? (
                  <p style={{ opacity: 0.6 }}>{t('no_waitlist')}</p>
                ) : (
                  user.waitlistAppointments.map(entry => (
                    <div 
                      key={entry._id} 
                      className="card-light" 
                      style={{ 
                        padding: '20px 24px', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        borderLeft: entry.status === 'notified' ? '4px solid var(--color-orange)' : '1px solid var(--color-cream-dark)'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{entry.specialistName}</h3>
                          <span 
                            className="pill-tag"
                            style={{ 
                              background: entry.status === 'notified' ? 'var(--color-orange)' : entry.status === 'claimed' ? 'green' : 'var(--color-accent)',
                              color: 'var(--color-white)'
                            }}
                          >
                            {t(`status_${entry.status}`, { defaultValue: entry.status })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', opacity: 0.8, alignItems: 'center' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {entry.bookingDate}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {entry.bookingTime}</span>
                          {entry.status === 'notified' && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-orange)' }}>
                              <Clock size={12} />
                              <WaitlistHoldTimer notifiedAt={entry.notifiedAt} onExpire={fetchProfile} />
                            </span>
                          )}
                        </div>
                      </div>

                      {entry.status === 'notified' && (
                        <div>
                           <button 
                            type="button"
                            onClick={() => handleClaimAndBook(entry)} 
                            className="btn-primary" 
                            style={{ 
                              background: 'var(--color-orange)', 
                              color: 'white', 
                              boxShadow: '0 0 10px rgba(224, 88, 48, 0.4)',
                              animation: 'pulse 1.5s infinite alternate'
                            }}
                          >
                            {t('claim_slot')}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {ratingSpecialist && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card-light page-transition" style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Rate {ratingSpecialist.name}</h3>
            
            <form onSubmit={handleSubmitRating}>
              <div className="mb-lg" style={{ textAlign: 'center' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '12px' }}>Rating (1 - 5 Stars)</span>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  {[1, 2, 3, 4, 5].map(val => (
                    <button 
                      key={val} 
                      type="button"
                      onClick={() => setRatingValue(val)}
                      style={{ 
                        color: val <= ratingValue ? 'var(--color-accent)' : 'var(--color-muted)',
                        transform: val <= ratingValue ? 'scale(1.2)' : 'none'
                      }}
                    >
                      <Star size={36} fill={val <= ratingValue ? 'var(--color-accent)' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setRatingSpecialist(null)} className="btn-secondary w-full">{t('cancel_btn', { defaultValue: 'Cancel' })}</button>
                <button type="submit" className="btn-primary w-full" disabled={ratingLoading}>{t('send')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Dashboard;
