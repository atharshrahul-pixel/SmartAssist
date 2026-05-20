import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import { 
  Calendar, Clock, User, Heart, Star, Users, List, 
  Trash2, Plus, Bell, LogOut, CheckCircle, Award
} from 'lucide-react';

const BACKEND_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://akeno7594-internship-project-backend.hf.space/api';

const Dashboard = () => {
  const { user, token, logoutUser, refreshUser } = useContext(AppContext);
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
  const [familyLoading, setFamilyLoading] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      navigate('/login');
    } else {
      fetchBookings();
      fetchProfile();
    }
  }, [token, user, navigate]);

  const fetchBookings = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/bookings/user`, {
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
  };

  const fetchProfile = async () => {
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
  };

  const handleAddFamilyMember = async (e) => {
    e.preventDefault();
    if (!familyFields.name.trim()) return;

    setFamilyLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/family`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(familyFields)
      });
      const json = await res.json();
      if (json.success) {
        setFamilyFields({ name: '', relationship: 'Child' });
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFamilyLoading(false);
    }
  };

  const handleDeleteFamilyMember = async (memberId) => {
    if (!window.confirm('Remove family member?')) return;
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
    if (!window.confirm(`Claim slot for ${waitlistEntry.specialistName} on ${waitlistEntry.bookingDate} at ${waitlistEntry.bookingTime}?`)) return;
    try {
      // Claim slot
      const claimRes = await fetch(`${BACKEND_URL}/auth/waitlist/claim`, {
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
        alert('Slot successfully booked and claimed!');
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
    <div className="container page-transition" style={{ paddingTop: '40px' }}>
      {/* Header bar */}
      <div className="card-light" style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px' }}>
            {user.name.substring(0,2).toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700' }}>Hello, {user.name}</h1>
            <p style={{ opacity: 0.6, fontSize: '14px' }}>Welcome to your personal health portal</p>
          </div>
        </div>
        <button onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 18fr', gap: '32px' }}>
        {/* Sidebar tabs */}
        <div>
          <div className="card-light" style={{ padding: '12px' }}>
            <button 
              onClick={() => setActiveTab('appointments')} 
              style={{
                width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                borderRadius: 'var(--r-md)', textAlign: 'left', fontWeight: '600',
                background: activeTab === 'appointments' ? 'var(--color-accent)' : 'transparent',
                color: activeTab === 'appointments' ? 'var(--color-dark)' : 'inherit',
                marginBottom: '4px'
              }}
            >
              <Calendar size={18} /> Appointments
            </button>
            <button 
              onClick={() => setActiveTab('family')} 
              style={{
                width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                borderRadius: 'var(--r-md)', textAlign: 'left', fontWeight: '600',
                background: activeTab === 'family' ? 'var(--color-accent)' : 'transparent',
                color: activeTab === 'family' ? 'var(--color-dark)' : 'inherit',
                marginBottom: '4px'
              }}
            >
              <Users size={18} /> Family Profiles
            </button>
            <button 
              onClick={() => setActiveTab('waitlists')} 
              style={{
                width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                borderRadius: 'var(--r-md)', textAlign: 'left', fontWeight: '600',
                background: activeTab === 'waitlists' ? 'var(--color-accent)' : 'transparent',
                color: activeTab === 'waitlists' ? 'var(--color-dark)' : 'inherit'
              }}
            >
              <Bell size={18} /> Waitlist ({user.waitlistAppointments ? user.waitlistAppointments.length : 0})
            </button>
          </div>
        </div>

        {/* Content area */}
        <div>
          {activeTab === 'appointments' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Your Appointments</h2>
              {!hasLoaded ? (
                <p style={{ opacity: 0.6 }}>Loading appointments...</p>
              ) : bookings.length === 0 ? (
                <div className="card-light" style={{ textAlign: 'center', padding: '48px' }}>
                  <p style={{ opacity: 0.6, marginBottom: '16px' }}>You don't have any booked appointments yet.</p>
                  <button onClick={() => navigate('/')} className="btn-primary">Book Now</button>
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {bookings.map(b => (
                    <div key={b.receiptId} className="card-light" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{b.specialistName}</h3>
                          <span className="pill-tag">{b.specialistCategory}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', opacity: 0.8, marginBottom: '6px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {b.bookingDate}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {b.bookingTime}</span>
                        </div>
                        <p style={{ fontSize: '13px', opacity: 0.6 }}>Patient: <strong>{b.bookedFor || b.userName}</strong> (Receipt ID: {b.receiptId})</p>
                      </div>

                      <div>
                        <button 
                          onClick={() => setRatingSpecialist({ id: b.specialistId, name: b.specialistName })} 
                          className="btn-ghost" 
                          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          <Star size={16} /> Rate Specialist
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
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Family Profiles</h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                {/* List */}
                <div>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {(!user.familyProfiles || user.familyProfiles.length === 0) ? (
                      <p style={{ opacity: 0.6 }}>No family members added yet.</p>
                    ) : (
                      user.familyProfiles.map(member => (
                        <div key={member._id} className="card-light" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '16px' }}>{member.name}</div>
                            <div style={{ fontSize: '13px', color: 'var(--color-orange)', fontWeight: '600' }}>{member.relationship}</div>
                          </div>
                          <button onClick={() => handleDeleteFamilyMember(member._id)} className="btn-danger" style={{ padding: '8px' }}>
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
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Add Family Member</h3>
                    
                    <div className="mb-md">
                      <label className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        value={familyFields.name}
                        onChange={e => setFamilyFields(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Name of family member"
                        required
                      />
                    </div>

                    <div className="mb-lg">
                      <label className="form-label">Relationship</label>
                      <select 
                        className="input-field"
                        value={familyFields.relationship}
                        onChange={e => setFamilyFields(prev => ({ ...prev, relationship: e.target.value }))}
                      >
                        <option value="Child">Child</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Parent">Parent</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <button type="submit" className="btn-primary w-full" disabled={familyLoading}>
                      <Plus size={16} style={{ marginRight: '6px' }} /> Add Member
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'waitlists' && (
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Waitlist Notifications</h2>
              <div style={{ display: 'grid', gap: '16px' }}>
                {(!user.waitlistAppointments || user.waitlistAppointments.length === 0) ? (
                  <p style={{ opacity: 0.6 }}>No waitlisted slots.</p>
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
                            {entry.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '14px', opacity: 0.8 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {entry.bookingDate}</span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {entry.bookingTime}</span>
                        </div>
                      </div>

                      {entry.status === 'notified' && (
                        <div>
                          <button 
                            onClick={() => handleClaimAndBook(entry)} 
                            className="btn-primary" 
                            style={{ 
                              background: 'var(--color-orange)', 
                              color: 'white', 
                              boxShadow: '0 0 10px rgba(224, 88, 48, 0.4)',
                              animation: 'pulse 1.5s infinite alternate'
                            }}
                          >
                            Claim Slot
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
                <label className="form-label" style={{ marginBottom: '12px' }}>Rating (1 - 5 Stars)</label>
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
                <button type="button" onClick={() => setRatingSpecialist(null)} className="btn-secondary w-full">Cancel</button>
                <button type="submit" className="btn-primary w-full" disabled={ratingLoading}>Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
