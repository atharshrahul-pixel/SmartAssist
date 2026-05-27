import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../App';
import HelpTooltip from '../components/HelpTooltip';
import Stepper from '../components/Stepper';
import { 
  Calendar, Clock, User, Award, Shield, FileText, Camera, 
  AlertCircle, DollarSign, Settings, LogOut, CheckCircle, Eye, Plus, X 
} from 'lucide-react';

const BACKEND_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://akeno7594-internship-project-backend.hf.space/api';

const SpecialistDashboard = () => {
  const { token, logoutUser } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const infoMessage = location.state?.infoMessage;

  const [specialist, setSpecialist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Dashboard navigation
  const [activeTab, setActiveTab] = useState('appointments');

  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [activeSummary, setActiveSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Earnings state
  const [earnings, setEarnings] = useState({ totalEarnings: 0, earningsList: [] });

  // Profile forms
  const [profileForm, setProfileForm] = useState({
    name: '',
    specialization: 'Dentist',
    experience: '',
    clinicName: '',
    bio: '',
    profilePhoto: ''
  });
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);

  // Slots state
  const [newSlot, setNewSlot] = useState('');
  const [slotsList, setSlotsList] = useState([]);

  // Consultation modes
  const [modesConfig, setModesConfig] = useState({
    inPerson: { enabled: true, price: 100, duration: '30 mins' },
    video: { enabled: true, price: 60, duration: '20 mins' },
    chat: { enabled: true, price: 30, duration: '15 mins' }
  });

  // Reapply Form
  const [reapplyData, setReapplyData] = useState({
    name: '',
    specialization: 'Dentist',
    experience: '',
    clinicName: '',
    bio: '',
    profilePhoto: ''
  });
  const [reapplyPreview, setReapplyPreview] = useState(null);
  const [reapplyLoading, setReapplyLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      fetchProfile();
    }
  }, [token]);

  const fetchProfile = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${BACKEND_URL}/specialists/my/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setSpecialist(json.specialist);
        setSlotsList(json.specialist.availableSlots || []);
        setModesConfig(json.specialist.appointmentModes || {
          inPerson: { enabled: true, price: 100, duration: '30 mins' },
          video: { enabled: true, price: 60, duration: '20 mins' },
          chat: { enabled: true, price: 30, duration: '15 mins' }
        });
        setProfileForm({
          name: json.specialist.name || '',
          specialization: json.specialist.specialization || 'Dentist',
          experience: json.specialist.experience ? parseInt(json.specialist.experience) : '',
          clinicName: json.specialist.clinicName || '',
          bio: json.specialist.bio || '',
          profilePhoto: json.specialist.profilePhoto || ''
        });
        setReapplyData({
          name: json.specialist.name || '',
          specialization: json.specialist.specialization || 'Dentist',
          experience: json.specialist.experience ? parseInt(json.specialist.experience) : '',
          clinicName: json.specialist.clinicName || '',
          bio: json.specialist.bio || '',
          profilePhoto: json.specialist.profilePhoto || ''
        });
        setPhotoPreview(json.specialist.profilePhoto);
        setReapplyPreview(json.specialist.profilePhoto);

        if (json.specialist.status === 'approved') {
          fetchAppointments();
          fetchEarnings();
        }
      } else {
        setErrorMsg(json.message || 'Failed to retrieve profile.');
      }
    } catch {
      setErrorMsg('Failed to connect to profile server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/specialists/my/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setAppointments(json.appointments);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEarnings = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/specialists/my/earnings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setEarnings(json);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPrevisitSummary = async (bookingId) => {
    setSummaryLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/specialists/my/appointments/${bookingId}/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setActiveSummary(json.summary);
      } else {
        alert(json.message || 'Failed to fetch summary');
      }
    } catch {
      alert('Network error');
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${BACKEND_URL}/specialists/my/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      const json = await res.json();
      if (json.success) {
        setSpecialist(json.specialist);
        alert('Profile details updated successfully!');
      } else {
        setErrorMsg(json.message || 'Profile save failed.');
      }
    } catch {
      setErrorMsg('Network error.');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveAvailability = async () => {
    setSaveLoading(true);
    try {
      const slotsRes = await fetch(`${BACKEND_URL}/specialists/my/slots`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ slots: slotsList })
      });

      const modesRes = await fetch(`${BACKEND_URL}/specialists/my/modes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentModes: modesConfig })
      });

      const slotsJson = await slotsRes.json();
      const modesJson = await modesRes.json();

      if (slotsJson.success && modesJson.success) {
        setSpecialist(slotsJson.specialist);
        alert('Availability slots and pricing configured successfully!');
      } else {
        alert('Failed to save availability settings.');
      }
    } catch {
      alert('Connection error');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleReapply = async (e) => {
    e.preventDefault();
    setReapplyLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${BACKEND_URL}/auth/reapply/specialist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reapplyData)
      });
      const json = await res.json();
      if (json.success) {
        alert('Reapplication submitted successfully!');
        fetchProfile();
      } else {
        setErrorMsg(json.message || 'Reapplication failed.');
      }
    } catch {
      setErrorMsg('Connection error.');
    } finally {
      setReapplyLoading(false);
    }
  };

  const handleAddSlot = () => {
    if (!newSlot.trim()) return;
    if (slotsList.includes(newSlot.trim())) return;
    setSlotsList(prev => [...prev, newSlot.trim()].sort());
    setNewSlot('');
  };

  const handleRemoveSlot = (slotToRemove) => {
    setSlotsList(prev => prev.filter(s => s !== slotToRemove));
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="container text-center" style={{ paddingTop: '100px' }}>
        <h3>Loading portal details...</h3>
      </div>
    );
  }

  // Pending Review View
  if (specialist && specialist.status === 'pending') {
    return (
      <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        <Stepper currentStep={1} flow="account" />
        <div className="container" style={{ maxWidth: '520px', paddingTop: '40px', flex: 1 }}>
          {infoMessage && (
            <div style={{
              background: 'rgba(237, 184, 32, 0.1)',
              color: 'var(--color-orange)',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '20px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{infoMessage}</span>
            </div>
          )}
          <div className="card-light text-center" style={{ padding: '40px' }}>
            <Clock size={56} color="var(--color-orange)" style={{ marginBottom: '24px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>Application Under Review</h2>
            <p style={{ opacity: 0.7, fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
              Hello, <strong>{specialist.name}</strong>. Your healthcare practitioner onboarding request is under review. 
              Admin staff are verifying your license number (<strong>{specialist.licenseNumber}</strong>). 
              Please check back soon.
            </p>
            <button onClick={handleLogout} className="btn-secondary w-full" style={{ padding: '12px' }}>
              <LogOut size={16} style={{ marginRight: '8px' }} /> Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rejection & Reapply Form View
  if (specialist && specialist.status === 'rejected') {
    return (
      <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        <Stepper currentStep={1} flow="account" />
        <div className="container" style={{ maxWidth: '600px', paddingTop: '20px', paddingBottom: '60px', flex: 1 }}>
          {infoMessage && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              marginBottom: '20px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{infoMessage}</span>
            </div>
          )}
          <div className="card-light" style={{ padding: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>Application Declined</h2>
              <p style={{ opacity: 0.6, fontSize: '14px' }}>Your onboarding request requires modification.</p>
            </div>

            <div style={{
              background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '8px', 
              padding: '16px', color: '#991b1b', fontSize: '14px', marginBottom: '28px', lineHeight: '1.6'
            }}>
              <strong>Reason for Rejection:</strong>
              <p style={{ margin: '6px 0 0 0', fontStyle: 'italic' }}>"{specialist.rejectionReason || 'No reasoning supplied.'}"</p>
            </div>

            <form onSubmit={handleReapply}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase' }}>Update and Reapply</h3>
              
              <div className="mb-md">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={reapplyData.name}
                  onChange={e => setReapplyData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="mb-md">
                  <label className="form-label">Specialization</label>
                  <select
                    className="input-field"
                    value={reapplyData.specialization}
                    onChange={e => setReapplyData(prev => ({ ...prev, specialization: e.target.value }))}
                    style={{ padding: '10px 12px' }}
                  >
                    <option value="Dentist">Dentist</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="General Physician">General Physician</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Therapist">Therapist</option>
                  </select>
                </div>

                <div className="mb-md">
                  <label className="form-label">Years of Experience</label>
                  <input
                    type="number"
                    className="input-field"
                    value={reapplyData.experience}
                    onChange={e => setReapplyData(prev => ({ ...prev, experience: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="mb-md">
                <label className="form-label">Clinic Name</label>
                <input
                  type="text"
                  className="input-field"
                  value={reapplyData.clinicName}
                  onChange={e => setReapplyData(prev => ({ ...prev, clinicName: e.target.value }))}
                />
              </div>

              <div className="mb-md">
                <label className="form-label">Professional Bio</label>
                <textarea
                  className="input-field"
                  value={reapplyData.bio}
                  onChange={e => setReapplyData(prev => ({ ...prev, bio: e.target.value }))}
                  rows="3"
                  style={{ padding: '12px' }}
                />
              </div>

              <div className="mb-lg">
                <label className="form-label">Profile Image</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #ddd' }}>
                    {reapplyPreview ? <img src={reapplyPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera />}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setReapplyData(prev => ({ ...prev, profilePhoto: reader.result }));
                          setReapplyPreview(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button type="submit" className="btn-primary w-full" disabled={reapplyLoading}>
                  {reapplyLoading ? 'Reapplying...' : 'Resubmit Application'}
                </button>
                <button type="button" onClick={handleLogout} className="btn-secondary">
                  Logout
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Approved Specialist Dashboard
  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Stepper currentStep={2} flow="account" />

      <div className="container" style={{ paddingTop: '20px', flex: 1, paddingBottom: '60px' }}>
        {/* Header bar */}
        <div className="card-light" style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '18px', overflow: 'hidden' }}>
              {specialist.profilePhoto ? (
                <img src={specialist.profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                specialist.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700' }}>{specialist.name}</h1>
              <p style={{ opacity: 0.6, fontSize: '14px' }}>Specialist Practitioner Portal ({specialist.specialization})</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>

        {/* Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }}>
          {/* Sidebar */}
          <div>
            <div className="card-light" style={{ padding: '12px' }}>
              <button 
                onClick={() => setActiveTab('appointments')} 
                style={{
                  width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                  borderRadius: 'var(--r-md)', textAlign: 'left', fontWeight: '600', border: 'none', cursor: 'pointer',
                  background: activeTab === 'appointments' ? 'var(--color-accent)' : 'transparent',
                  color: activeTab === 'appointments' ? 'var(--color-dark)' : 'inherit',
                  marginBottom: '4px', outline: 'none'
                }}
              >
                <Calendar size={18} /> Appointments
              </button>
              <button 
                onClick={() => setActiveTab('availability')} 
                style={{
                  width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                  borderRadius: 'var(--r-md)', textAlign: 'left', fontWeight: '600', border: 'none', cursor: 'pointer',
                  background: activeTab === 'availability' ? 'var(--color-accent)' : 'transparent',
                  color: activeTab === 'availability' ? 'var(--color-dark)' : 'inherit',
                  marginBottom: '4px', outline: 'none'
                }}
              >
                <Settings size={18} /> Slots & Pricing
              </button>
              <button 
                onClick={() => setActiveTab('profile')} 
                style={{
                  width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                  borderRadius: 'var(--r-md)', textAlign: 'left', fontWeight: '600', border: 'none', cursor: 'pointer',
                  background: activeTab === 'profile' ? 'var(--color-accent)' : 'transparent',
                  color: activeTab === 'profile' ? 'var(--color-dark)' : 'inherit',
                  marginBottom: '4px', outline: 'none'
                }}
              >
                <User size={18} /> Manage Profile
              </button>
              <button 
                onClick={() => setActiveTab('earnings')} 
                style={{
                  width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px',
                  borderRadius: 'var(--r-md)', textAlign: 'left', fontWeight: '600', border: 'none', cursor: 'pointer',
                  background: activeTab === 'earnings' ? 'var(--color-accent)' : 'transparent',
                  color: activeTab === 'earnings' ? 'var(--color-dark)' : 'inherit',
                  outline: 'none'
                }}
              >
                <DollarSign size={18} /> Earnings
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div>
            {activeTab === 'appointments' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Upcoming Appointments</h2>
                <div style={{ display: 'grid', gap: '16px' }}>
                  {appointments.length === 0 ? (
                    <div className="card-light text-center" style={{ padding: '48px' }}>
                      <p style={{ opacity: 0.5 }}>No appointments scheduled yet.</p>
                    </div>
                  ) : (
                    appointments.map(b => (
                      <div key={b._id} className="card-light" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                        <div>
                          <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>{b.bookedFor || b.userName}</h3>
                          <div style={{ display: 'flex', gap: '16px', fontSize: '13px', opacity: 0.7, marginTop: '8px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} /> {b.bookingDate}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> {b.bookingTime}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={13} /> {b.appointmentMode}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => fetchPrevisitSummary(b._id)} 
                          className="btn-secondary"
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
                        >
                          <Eye size={14} /> View Pre-Visit Summary
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="card-light" style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Availability & Consultation Modes</h2>
                
                {/* Mode Pricing Settings */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase' }}>Configure Consultation Modes</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                    {[
                      { key: 'inPerson', label: 'In-Person' },
                      { key: 'video', label: 'Video Call' },
                      { key: 'chat', label: 'Chat Consult' }
                    ].map(mode => (
                      <div key={mode.key} style={{ padding: '16px', border: '1px solid var(--color-cream-dark)', borderRadius: '8px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '14px', marginBottom: '12px' }}>
                          <input 
                            type="checkbox" 
                            checked={modesConfig[mode.key]?.enabled} 
                            onChange={e => setModesConfig(prev => ({
                              ...prev,
                              [mode.key]: { ...prev[mode.key], enabled: e.target.checked }
                            }))}
                          />
                          {mode.label}
                        </label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div>
                            <label style={{ fontSize: '11px', opacity: 0.6 }}>Price (₹)</label>
                            <input 
                              type="number" 
                              className="input-field" 
                              value={modesConfig[mode.key]?.price}
                              onChange={e => setModesConfig(prev => ({
                                ...prev,
                                [mode.key]: { ...prev[mode.key], price: Number(e.target.value) }
                              }))}
                              disabled={!modesConfig[mode.key]?.enabled}
                              style={{ padding: '6px 8px', marginTop: '2px' }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '11px', opacity: 0.6 }}>Duration</label>
                            <input 
                              type="text" 
                              className="input-field" 
                              value={modesConfig[mode.key]?.duration}
                              onChange={e => setModesConfig(prev => ({
                                ...prev,
                                [mode.key]: { ...prev[mode.key], duration: e.target.value }
                              }))}
                              disabled={!modesConfig[mode.key]?.enabled}
                              style={{ padding: '6px 8px', marginTop: '2px' }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available Slots Config */}
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase' }}>Manage Availability Hours</h3>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="e.g. 10:30 AM" 
                      value={newSlot}
                      onChange={e => setNewSlot(e.target.value)}
                      style={{ maxWidth: '200px' }}
                    />
                    <button onClick={handleAddSlot} className="btn-primary" style={{ padding: '0 20px', display: 'flex', alignItems: 'center' }}>
                      <Plus size={16} /> Add Slot
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {slotsList.length === 0 ? (
                      <p style={{ opacity: 0.5, fontSize: '13px' }}>No availability slots defined. Please add slots above.</p>
                    ) : (
                      slotsList.map(slot => (
                        <div key={slot} style={{
                          display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px',
                          background: 'var(--color-cream)', borderRadius: '16px', fontSize: '13px', fontWeight: '700'
                        }}>
                          {slot}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveSlot(slot)} 
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}
                          >
                            <X size={14} color="#ef4444" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <button onClick={handleSaveAvailability} className="btn-primary" disabled={saveLoading} style={{ padding: '12px 24px' }}>
                  {saveLoading ? 'Saving settings...' : 'Save Availability & Pricing'}
                </button>
              </div>
            )}

            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="card-light" style={{ padding: '32px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>Professional Profile Details</h2>

                <div className="mb-md">
                  <label className="form-label">Clinic Name</label>
                  <input
                    type="text"
                    className="input-field"
                    value={profileForm.clinicName}
                    onChange={e => setProfileForm(prev => ({ ...prev, clinicName: e.target.value }))}
                  />
                </div>

                <div className="mb-md">
                  <label className="form-label">Years of Experience</label>
                  <input
                    type="number"
                    className="input-field"
                    value={profileForm.experience}
                    onChange={e => setProfileForm(prev => ({ ...prev, experience: e.target.value }))}
                    required
                  />
                </div>

                <div className="mb-md">
                  <label className="form-label">Professional Bio</label>
                  <textarea
                    className="input-field"
                    value={profileForm.bio}
                    onChange={e => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    rows="4"
                    style={{ padding: '12px' }}
                  />
                </div>

                <div className="mb-lg">
                  <label className="form-label">Profile Image</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd' }}>
                      {photoPreview ? <img src={photoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera />}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setProfileForm(prev => ({ ...prev, profilePhoto: reader.result }));
                            setPhotoPreview(reader.result);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" disabled={saveLoading} style={{ padding: '12px 24px' }}>
                  {saveLoading ? 'Saving profile...' : 'Save Profile Changes'}
                </button>
              </form>
            )}

            {activeTab === 'earnings' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Earnings & Payout Overview</h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
                  <div className="card-light" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(237, 184, 32, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-orange)' }}>
                      <DollarSign size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', opacity: 0.6 }}>Total Accumulated Earnings</div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-dark)' }}>₹{earnings.totalEarnings}</div>
                    </div>
                  </div>

                  <div className="card-light" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(237, 184, 32, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-orange)' }}>
                      <CheckCircle size={24} />
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', opacity: 0.6 }}>Settled Consultations</div>
                      <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-dark)' }}>{earnings.earningsList?.length || 0}</div>
                    </div>
                  </div>
                </div>

                <div className="card-light" style={{ padding: '0', overflowX: 'auto', borderRadius: 'var(--r-lg)' }}>
                  <table className="w-full" style={{ borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--color-cream-dark)', backgroundColor: 'rgba(237, 184, 32, 0.05)' }}>
                        <th style={{ padding: '16px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>Date & Time</th>
                        <th style={{ padding: '16px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>Patient Name</th>
                        <th style={{ padding: '16px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>Mode</th>
                        <th style={{ padding: '16px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>Earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earnings.earningsList && earnings.earningsList.map(e => (
                        <tr key={e.bookingId} style={{ borderBottom: '1px solid #f0edeb' }}>
                          <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                            {e.date} at {e.time}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '700' }}>
                            {e.patientName}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                            {e.mode}
                          </td>
                          <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '700', color: 'var(--color-orange)' }}>
                            ₹{e.amount}
                          </td>
                        </tr>
                      ))}
                      {(!earnings.earningsList || earnings.earningsList.length === 0) && (
                        <tr>
                          <td colSpan="4" style={{ padding: '32px', textAlign: 'center', opacity: 0.5 }}>No payouts recorded.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pre-Visit Summary Modal */}
      {activeSummary && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000, padding: '16px'
        }}>
          <div className="card-light" style={{ maxWidth: '640px', width: '100%', padding: '32px', position: 'relative', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <button 
              onClick={() => setActiveSummary(null)} 
              style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
            <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--color-cream-dark)', paddingBottom: '12px' }}>Pre-Visit Case Summary</h3>
            
            <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', opacity: 0.5, textTransform: 'uppercase' }}>Patient Name</label>
                  <div style={{ fontWeight: '700', fontSize: '15px' }}>{activeSummary.patientName}</div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', opacity: 0.5, textTransform: 'uppercase' }}>Patient Contact</label>
                  <div style={{ fontSize: '14px' }}>{activeSummary.patientEmail}</div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', opacity: 0.5, textTransform: 'uppercase' }}>Appointment Details</label>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>
                    {activeSummary.date} at {activeSummary.time} ({activeSummary.appointmentMode})
                  </div>
                </div>
              </div>

              {activeSummary.triageUrgency && (() => {
                const u = activeSummary.triageUrgency;
                const config = {
                  Urgent: { bgColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', text: 'Urgent — Attention Recommended' },
                  Soon: { bgColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', text: 'Soon — Within Days' },
                  Routine: { bgColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', text: 'Routine — Standard Visit' }
                }[u] || { bgColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', text: 'Routine' };

                return (
                  <div>
                    <label style={{ fontSize: '11px', opacity: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Urgency Level</label>
                    <div style={{
                      backgroundColor: config.bgColor,
                      color: config.color,
                      border: `1.5px solid ${config.color}`,
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '800',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      display: 'inline-block'
                    }}>
                      {config.text}
                    </div>
                  </div>
                );
              })()}

              <div>
                <label style={{ fontSize: '11px', opacity: 0.5, textTransform: 'uppercase' }}>Primary Symptoms & Concerns</label>
                <div style={{
                  padding: '12px', background: 'var(--color-cream)', borderRadius: '8px', 
                  fontSize: '14px', lineHeight: '1.5', fontStyle: 'italic', marginTop: '4px'
                }}>
                  {activeSummary.symptoms ? `"${activeSummary.symptoms}"` : (activeSummary.rejectionReasonOther ? `"${activeSummary.rejectionReasonOther}"` : 'No symptom description provided.')}
                </div>
              </div>

              {activeSummary.triageExplanation && (
                <div>
                  <label style={{ fontSize: '11px', opacity: 0.5, textTransform: 'uppercase' }}>AI Triage Recommendation</label>
                  <div style={{
                    padding: '12px', background: 'rgba(237, 184, 32, 0.05)', border: '1px solid rgba(237, 184, 32, 0.2)', borderRadius: '8px', 
                    fontSize: '14px', lineHeight: '1.5', marginTop: '4px'
                  }}>
                    {activeSummary.triageExplanation}
                  </div>
                </div>
              )}

              {activeSummary.triageKeywords && activeSummary.triageKeywords.length > 0 && (
                <div>
                  <label style={{ fontSize: '11px', opacity: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>Detected Symptoms Markers</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {activeSummary.triageKeywords.map(keyword => (
                      <span key={keyword} style={{
                        backgroundColor: 'rgba(237, 184, 32, 0.1)',
                        border: '1px solid var(--color-orange)',
                        color: 'var(--color-dark)',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeSummary.triageHistory && activeSummary.triageHistory.length > 0 && (
                <div>
                  <label style={{ fontSize: '11px', opacity: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Triage Conversation History</label>
                  <div style={{
                    background: 'var(--color-cream)',
                    border: '1px solid var(--color-cream-dark)',
                    borderRadius: '12px',
                    padding: '16px',
                    maxHeight: '220px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    {activeSummary.triageHistory.map((msg, i) => {
                      const isUser = msg.role === 'user';
                      return (
                        <div key={i} style={{
                          alignSelf: isUser ? 'flex-end' : 'flex-start',
                          backgroundColor: isUser ? 'var(--color-orange)' : 'var(--color-white)',
                          color: isUser ? 'var(--color-white)' : 'var(--color-dark)',
                          padding: '10px 14px',
                          borderRadius: isUser ? '14px 14px 0 14px' : '14px 14px 14px 0',
                          maxWidth: '85%',
                          fontSize: '13px',
                          lineHeight: '1.45',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                          {msg.content}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setActiveSummary(null)} className="btn-primary w-full" style={{ marginTop: '20px', padding: '14px' }}>
              Close Summary
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialistDashboard;
