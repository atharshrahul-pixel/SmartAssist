import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import HelpTooltip from '../components/HelpTooltip';
import Stepper from '../components/Stepper';
import { 
  Calendar, Clock, User, Heart, Star, Users, List, 
  Trash2, Plus, Bell, LogOut, CheckCircle, Award,
  Download, Filter, FileText
} from 'lucide-react';
import { generateReceiptPDF } from '../utils/receiptGenerator';

const BACKEND_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://akeno7594-internship-project-backend.hf.space/api';

const WaitlistHoldTimer = ({ notifiedAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const notifiedTime = new Date(notifiedAt).getTime();
      const diffSinceNotification = Date.now() - notifiedTime;
      const isDevHold = diffSinceNotification < 60 * 1000 && (notifiedTime + 60 * 1000 - Date.now() > 0);
      const holdDuration = isDevHold ? 60 * 1000 : 10 * 60 * 1000;
      const difference = notifiedTime + holdDuration - Date.now();

      if (difference <= 0) {
        setTimeLeft('Expired');
        if (onExpire) onExpire();
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s left`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [notifiedAt, onExpire]);

  return (
    <span style={{ fontSize: '12px', color: 'var(--color-orange)', fontWeight: 'bold' }}>
      ({timeLeft})
    </span>
  );
};

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
  const [otherRelationship, setOtherRelationship] = useState('');
  const [familyLoading, setFamilyLoading] = useState(false);

  // Appointments Sub-Tab & Filters State
  const [appointmentSubTab, setAppointmentSubTab] = useState('upcoming'); // 'upcoming' or 'past'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFamilyMember, setSelectedFamilyMember] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  const isPastBooking = (booking) => {
    try {
      const bDate = new Date(`${booking.bookingDate} ${booking.bookingTime}`);
      if (!isNaN(bDate.getTime())) {
        return bDate < new Date();
      }
      const justDate = new Date(booking.bookingDate);
      if (!isNaN(justDate.getTime())) {
        const today = new Date();
        today.setHours(0,0,0,0);
        return justDate < today;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return new Date();
    if (dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
  };

  const handleDownloadReceipt = async (booking) => {
    setDownloadingId(booking.receiptId);
    try {
      await generateReceiptPDF(booking);
    } catch (err) {
      console.error(err);
      alert('Failed to generate receipt PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  const upcomingAppointments = bookings
    .filter(b => !isPastBooking(b))
    .sort((a, b) => {
      const dateA = new Date(`${a.bookingDate} ${a.bookingTime}`);
      const dateB = new Date(`${b.bookingDate} ${b.bookingTime}`);
      return dateA - dateB;
    });

  const sortedPastAppointments = bookings
    .filter(b => isPastBooking(b))
    .sort((a, b) => {
      const dateA = new Date(`${a.bookingDate} ${a.bookingTime}`);
      const dateB = new Date(`${b.bookingDate} ${b.bookingTime}`);
      return dateB - dateA;
    });

  const categories = Array.from(new Set([
    'Dentist', 'Physiotherapist', 'Gym Trainer', 'Salon Specialist',
    ...bookings.map(b => b.specialistCategory).filter(Boolean)
  ]));

  const familyOptions = Array.from(new Set([
    'Myself',
    ...(user.familyProfiles ? user.familyProfiles.map(m => m.name) : []),
    ...bookings.map(b => b.bookedFor).filter(Boolean)
  ]));

  const filteredPastAppointments = sortedPastAppointments.filter(b => {
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
        if (patientName !== user.name) return false;
      } else {
        if (patientName !== selectedFamilyMember) return false;
      }
    }
    
    return true;
  });

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
                <div>
                  {/* Sub Tabs */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '2px solid rgba(0,0,0,0.05)', paddingBottom: '12px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setAppointmentSubTab('upcoming')}
                      style={{
                        padding: '8px 20px',
                        borderRadius: 'var(--r-pill)',
                        fontWeight: '700',
                        fontSize: '13px',
                        backgroundColor: appointmentSubTab === 'upcoming' ? 'var(--color-dark)' : 'transparent',
                        color: appointmentSubTab === 'upcoming' ? 'var(--color-white)' : 'var(--color-dark)',
                        border: appointmentSubTab === 'upcoming' ? 'none' : '1.5px solid var(--color-dark)',
                        outline: 'none'
                      }}
                    >
                      Upcoming Appointments ({upcomingAppointments.length})
                    </button>
                    <button
                      onClick={() => setAppointmentSubTab('past')}
                      style={{
                        padding: '8px 20px',
                        borderRadius: 'var(--r-pill)',
                        fontWeight: '700',
                        fontSize: '13px',
                        backgroundColor: appointmentSubTab === 'past' ? 'var(--color-dark)' : 'transparent',
                        color: appointmentSubTab === 'past' ? 'var(--color-white)' : 'var(--color-dark)',
                        border: appointmentSubTab === 'past' ? 'none' : '1.5px solid var(--color-dark)',
                        outline: 'none'
                      }}
                    >
                      Past Appointments & History ({sortedPastAppointments.length})
                    </button>
                  </div>

                  {/* Upcoming Sub-Tab */}
                  {appointmentSubTab === 'upcoming' && (
                    <div>
                      {upcomingAppointments.length === 0 ? (
                        <div className="card-light" style={{ textAlign: 'center', padding: '48px' }}>
                          <p style={{ opacity: 0.6, marginBottom: '16px' }}>You don't have any upcoming appointments.</p>
                          <button onClick={() => navigate('/')} className="btn-primary">Book Now</button>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                          {upcomingAppointments.map(b => (
                            <div key={b.receiptId} className="card-light page-transition" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{b.specialistName}</h3>
                                  <span className="pill-tag">{b.specialistCategory}</span>
                                  <span className="pill-tag" style={{ background: '#4CAF50', color: 'white' }}>Upcoming</span>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', opacity: 0.8, marginBottom: '6px' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {b.bookingDate}</span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {b.bookingTime}</span>
                                </div>
                                <p style={{ fontSize: '13px', opacity: 0.6 }}>Patient: <strong>{b.bookedFor || b.userName}</strong> (Receipt ID: {b.receiptId})</p>
                              </div>

                              <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                  onClick={() => handleDownloadReceipt(b)} 
                                  className="btn-secondary" 
                                  style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                                  disabled={downloadingId === b.receiptId}
                                >
                                  <Download size={14} /> {downloadingId === b.receiptId ? 'Generating...' : 'Receipt'}
                                </button>
                                <button 
                                  onClick={() => setRatingSpecialist({ id: b.specialistId, name: b.specialistName })} 
                                  className="btn-ghost" 
                                  style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
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

                  {/* Past Sub-Tab */}
                  {appointmentSubTab === 'past' && (
                    <div>
                      {/* Filter Bar */}
                      <div className="card-light page-transition" style={{ padding: '20px', marginBottom: '24px', border: '1px solid rgba(0,0,0,0.06)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                          <Filter size={16} color="var(--color-orange)" />
                          <h3 style={{ fontSize: '15px', fontWeight: '700', margin: 0 }}>Filter History</h3>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' }}>
                          <div>
                            <label className="form-label" style={{ fontSize: '11px', marginBottom: '6px' }}>Start Date</label>
                            <input 
                              type="date" 
                              className="input-field" 
                              value={startDate} 
                              onChange={e => setStartDate(e.target.value)} 
                              style={{ padding: '8px 12px', fontSize: '13px' }}
                            />
                          </div>
                          
                          <div>
                            <label className="form-label" style={{ fontSize: '11px', marginBottom: '6px' }}>End Date</label>
                            <input 
                              type="date" 
                              className="input-field" 
                              value={endDate} 
                              onChange={e => setEndDate(e.target.value)} 
                              style={{ padding: '8px 12px', fontSize: '13px' }}
                            />
                          </div>
                          
                          <div>
                            <label className="form-label" style={{ fontSize: '11px', marginBottom: '6px' }}>Specialist Category</label>
                            <select 
                              className="input-field" 
                              value={selectedCategory} 
                              onChange={e => setSelectedCategory(e.target.value)}
                              style={{ padding: '8px 12px', fontSize: '13px' }}
                            >
                              <option value="">All Categories</option>
                              {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="form-label" style={{ fontSize: '11px', marginBottom: '6px' }}>Patient</label>
                            <select 
                              className="input-field" 
                              value={selectedFamilyMember} 
                              onChange={e => setSelectedFamilyMember(e.target.value)}
                              style={{ padding: '8px 12px', fontSize: '13px' }}
                            >
                              <option value="">All Patients</option>
                              {familyOptions.map(member => (
                                <option key={member} value={member}>
                                  {member === 'Myself' ? `Myself (${user.name})` : member}
                                </option>
                              ))}
                            </select>
                          </div>

                          {(startDate || endDate || selectedCategory || selectedFamilyMember) && (
                            <div>
                              <button 
                                onClick={() => {
                                  setStartDate('');
                                  setEndDate('');
                                  setSelectedCategory('');
                                  setSelectedFamilyMember('');
                                }}
                                className="btn-secondary" 
                                style={{ width: '100%', padding: '10px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                              >
                                Reset Filters
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {filteredPastAppointments.length === 0 ? (
                        <div className="card-light" style={{ textAlign: 'center', padding: '48px' }}>
                          <p style={{ opacity: 0.6 }}>No past appointments matching selected filters.</p>
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                          {filteredPastAppointments.map(b => (
                            <div key={b.receiptId} className="card-light page-transition" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                  <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{b.specialistName}</h3>
                                  <span className="pill-tag">{b.specialistCategory}</span>
                                  <span className="pill-tag" style={{ background: '#78909C', color: 'white' }}>Past</span>
                                </div>
                                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', opacity: 0.8, marginBottom: '6px' }}>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {b.bookingDate}</span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {b.bookingTime}</span>
                                </div>
                                <p style={{ fontSize: '13px', opacity: 0.6 }}>Patient: <strong>{b.bookedFor || b.userName}</strong> (Receipt ID: {b.receiptId})</p>
                              </div>

                              <div style={{ display: 'flex', gap: '12px' }}>
                                <button 
                                  onClick={() => handleDownloadReceipt(b)} 
                                  className="btn-primary" 
                                  style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
                                  disabled={downloadingId === b.receiptId}
                                >
                                  <Download size={14} /> {downloadingId === b.receiptId ? 'Generating...' : 'Download Receipt'}
                                </button>
                                <button 
                                  onClick={() => setRatingSpecialist({ id: b.specialistId, name: b.specialistName })} 
                                  className="btn-ghost" 
                                  style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
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
                      <label className="form-label">
                        Full Name
                        <HelpTooltip text="Enter the full name of your family member as it should appear on their appointment ticket." />
                      </label>
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
                      <label className="form-label">
                        Relationship
                        <HelpTooltip text="Select how this person is related to you." />
                      </label>
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

                    {familyFields.relationship === 'Other' && (
                      <div className="mb-lg" style={{ animation: 'fadeInSlideUp 0.25s ease' }}>
                        <label className="form-label">
                          Specify Relationship
                          <HelpTooltip text="Tell us how you are related to this person (e.g. Sibling, Cousin, Friend)." />
                        </label>
                        <input
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
    </div>
  );
};

export default Dashboard;
