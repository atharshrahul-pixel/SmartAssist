import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import Stepper from '../components/Stepper';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, User, AlertCircle, Bell, MapPin, Video, MessageSquare } from 'lucide-react';

const BACKEND_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://akeno7594-internship-project-backend.hf.space/api';

const Screen5Booking = () => {
  const { state, updateState, user, token } = useContext(AppContext);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Custom states for DB synced booking & waitlist
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [bookedFor, setBookedFor] = useState(() => {
    if (state.appointmentFor) {
      if (state.appointmentFor === 'myself') return 'Myself';
      if (state.appointmentFor === 'other') return state.otherName || 'Someone else';
      return state.appointmentFor;
    }
    return 'Myself';
  });
  const [otherName, setOtherName] = useState(state.otherName || '');
  const [selectedMode, setSelectedMode] = useState('inPerson');

  const getAvailableSlots = () => {
    const modes = state.finalSpecialist?.appointmentModes;
    if (modes && modes[selectedMode] && Array.isArray(modes[selectedMode].slots)) {
      return modes[selectedMode].slots;
    }
    return state.finalSpecialist?.availableSlots || [];
  };

  useEffect(() => {
    if (!state.finalSpecialist) {
      navigate('/specialists');
    }
  }, [state.finalSpecialist, navigate]);

  useEffect(() => {
    if (selectedDate && state.finalSpecialist) {
      fetchOccupiedSlots();
    }
  }, [selectedDate, state.finalSpecialist]);

  const fetchOccupiedSlots = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/bookings/occupied?specialistId=${state.finalSpecialist.id}&bookingDate=${selectedDate}`);
      const json = await res.json();
      if (json.success) {
        setOccupiedSlots(json.slots);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirm = async () => {
    setLoading(true);
    setErrorMsg('');
    
    const finalBookedFor = bookedFor === 'Myself'
      ? (user ? user.name : state.name)
      : (bookedFor === 'Someone else' ? otherName : bookedFor);

    if (user && bookedFor === 'Someone else' && !otherName.trim()) {
      setErrorMsg("Please enter patient name.");
      setLoading(false);
      return;
    }

    try {
      const modeData = state.finalSpecialist.appointmentModes?.[selectedMode] || {
        price: selectedMode === 'inPerson' ? 100 : (selectedMode === 'video' ? 60 : 30),
        duration: selectedMode === 'inPerson' ? '30 mins' : (selectedMode === 'video' ? '20 mins' : '15 mins')
      };

      const response = await fetch(`${BACKEND_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: user ? user.name : state.name,
          userEmail: user ? user.email : state.email,
          specialistId: state.finalSpecialist.id,
          bookingDate: selectedDate,
          bookingTime: selectedTime,
          rejectionReason: state.rejectionReason,
          rejectionReasonOther: state.rejectionReasonOther,
          userId: user ? user.id : undefined,
          bookedFor: finalBookedFor,
          appointmentMode: selectedMode === 'inPerson' ? 'In-Person' : (selectedMode === 'video' ? 'Video Call' : 'Chat Consultation'),
          price: modeData.price,
          duration: modeData.duration
        })
      });
      const data = await response.json();

      if (data.success) {
        updateState({ 
          bookedDate: selectedDate, 
          bookedTime: selectedTime,
          bookingId: data.booking.receiptId,
          bookedMode: selectedMode === 'inPerson' ? 'In-Person' : (selectedMode === 'video' ? 'Video Call' : 'Chat Consultation'),
          bookedPrice: modeData.price,
          bookedDuration: modeData.duration
        });
        navigate('/confirmation');
      } else {
        setErrorMsg(data.message || "Booking failed.");
      }
    } catch (err) {
      setErrorMsg("Could not connect to the booking service.");
    } finally {
      setLoading(false);
    }
  };

  const handleJoinWaitlist = async () => {
    if (!user) {
      alert('Please log in to join the waitlist.');
      navigate('/login');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const response = await fetch(`${BACKEND_URL}/auth/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          specialistId: state.finalSpecialist.id,
          specialistName: state.finalSpecialist.name,
          bookingDate: selectedDate,
          bookingTime: selectedTime
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Successfully joined the waitlist for this slot!');
        navigate('/dashboard');
      } else {
        setErrorMsg(data.message || 'Failed to join waitlist.');
      }
    } catch (err) {
      setErrorMsg('Could not connect to the waitlist service.');
    } finally {
      setLoading(false);
    }
  };

  if (!state.finalSpecialist) return null;

  const days = Array.from({length: 30}, (_, i) => i + 1);
  const today = 15;
  const isSelectedTimeOccupied = occupiedSlots.includes(selectedTime);

  return (
    <div className="page-transition" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stepper currentStep={5} />
      
      <div className="container" style={{ flex: 1 }}>
        <div className="text-center mb-xl">
          <span className="pill-tag mb-lg">SECURE YOUR SLOT</span>
          <h1 style={{ fontSize: '48px', lineHeight: '1.1', marginBottom: 'var(--sp-md)' }}>
            Book your <span className="accent-word" style={{ color: 'var(--color-orange)' }}>appointment</span>
          </h1>
        </div>

        <div className="booking-grid">
          <section className="calendar-section">
            <div className="cal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CalIcon size={24} color="var(--color-orange)" />
                <h3 style={{ fontSize: '20px', fontWeight: '800' }}>Select Date</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button className="btn-ghost" style={{ padding: '8px', borderRadius: '50%' }}>
                  <ChevronLeft size={20} />
                </button>
                <div style={{ fontWeight: '700', fontSize: '16px', minWidth: '120px', textAlign: 'center' }}>
                  October 2024
                </div>
                <button className="btn-ghost" style={{ padding: '8px', borderRadius: '50%' }}>
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="cal-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="cal-day-label">{d}</div>
              ))}
              {days.map(d => {
                const isPast = d < today;
                const isSelected = selectedDate === `Oct ${d}, 2024`;
                const isToday = d === today;
                return (
                  <button
                    key={d}
                    disabled={isPast}
                    className={`cal-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                    onClick={() => { setSelectedDate(`Oct ${d}, 2024`); setSelectedTime(''); setErrorMsg(''); }}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="booking-controls">
            <div className="card-dark" style={{ padding: '24px', marginBottom: '24px', borderRadius: 'var(--r-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{
                  width: '44px', height: '44px',
                  borderRadius: '12px', background: 'var(--color-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '16px', fontWeight: '800', color: 'var(--color-dark)'
                }}>
                  {state.finalSpecialist.initials}
                </div>
                <div>
                  <div style={{ color: 'var(--color-white)', fontSize: '16px', fontWeight: '700' }}>{state.finalSpecialist.name}</div>
                  <div style={{ color: 'var(--color-accent)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{state.finalSpecialist.category}</div>
                </div>
                <button 
                  className="btn-ghost" 
                  style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: '12px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
                  onClick={() => navigate('/specialists')}
                >
                  Change
                </button>
              </div>
            </div>

            <div className="card-light" style={{ padding: '20px', marginBottom: '24px' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginBottom: '12px' }}>
                <Clock size={14} /> Appointment Mode
              </label>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[
                  { key: 'inPerson', label: 'In-Person', icon: <MapPin size={14} />, defaultPrice: 100, defaultDuration: '30 mins' },
                  { key: 'video', label: 'Video Call', icon: <Video size={14} />, defaultPrice: 60, defaultDuration: '20 mins' },
                  { key: 'chat', label: 'Chat Consult', icon: <MessageSquare size={14} />, defaultPrice: 30, defaultDuration: '15 mins' }
                ].map(m => {
                  const modeConfig = state.finalSpecialist.appointmentModes?.[m.key] || {
                    enabled: true,
                    price: m.defaultPrice,
                    duration: m.defaultDuration
                  };
                  
                  if (!modeConfig.enabled) return null;

                  const isSel = selectedMode === m.key;
                  
                  return (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => { setSelectedMode(m.key); setSelectedTime(''); setErrorMsg(''); }}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '10px 4px',
                        borderRadius: '8px',
                        background: isSel ? 'var(--color-orange)' : 'rgba(0,0,0,0.03)',
                        border: isSel ? '1px solid var(--color-orange)' : '1px solid rgba(0,0,0,0.08)',
                        color: isSel ? 'white' : 'var(--color-dark)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        gap: '2px',
                        outline: 'none'
                      }}
                    >
                      <div style={{ opacity: isSel ? 1 : 0.6 }}>{m.icon}</div>
                      <span style={{ fontSize: '11px', fontWeight: '800' }}>{m.label}</span>
                      <span style={{ fontSize: '9px', opacity: 0.6 }}>{modeConfig.duration}</span>
                      <span style={{ fontSize: '10px', fontWeight: '700', marginTop: '2px' }}>${modeConfig.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {user && (
              <div className="card-light" style={{ padding: '20px', marginBottom: '24px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                  <User size={14} /> Who is this appointment for?
                </label>
                <select 
                  className="input-field" 
                  value={(bookedFor === 'Myself' || (user.familyProfiles && user.familyProfiles.some(m => m.name === bookedFor))) ? bookedFor : 'Someone else'} 
                  onChange={e => {
                    const val = e.target.value;
                    if (val === 'Someone else') {
                      setBookedFor(otherName || 'Someone else');
                    } else {
                      setBookedFor(val);
                    }
                  }}
                  style={{ marginTop: '8px', padding: '10px 12px' }}
                >
                  <option value="Myself">Myself ({user.name})</option>
                  {user.familyProfiles && user.familyProfiles.map(member => (
                    <option key={member._id} value={member.name}>{member.name} ({member.relationship})</option>
                  ))}
                  <option value="Someone else">Someone else</option>
                </select>

                {bookedFor !== 'Myself' && (!user.familyProfiles || !user.familyProfiles.some(m => m.name === bookedFor)) && (
                  <div style={{ marginTop: '12px' }}>
                    <label className="form-label" style={{ fontSize: '11px' }}>Patient Name</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Enter patient's full name"
                      value={otherName}
                      onChange={e => {
                        const val = e.target.value;
                        setOtherName(val);
                        setBookedFor(val);
                      }}
                      style={{ marginTop: '4px', padding: '10px 12px' }}
                    />
                  </div>
                )}
              </div>
            )}

            {selectedDate ? (
              <div className="card-light" style={{ animation: 'fadeInSlideUp 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Clock size={18} color="var(--color-orange)" />
                  <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Available Times</h3>
                </div>
                
                <div className="time-grid mb-xl">
                  {getAvailableSlots().map(slot => {
                    const isOccupied = occupiedSlots.includes(slot);
                    const isSelected = selectedTime === slot;

                    return (
                      <button
                        key={slot}
                        className={`time-slot ${isSelected ? 'active' : ''}`}
                        style={{
                          position: 'relative',
                          border: isOccupied ? '1.5px solid var(--color-orange)' : undefined,
                          color: isOccupied ? 'var(--color-orange)' : undefined,
                        }}
                        onClick={() => { setSelectedTime(slot); setErrorMsg(''); }}
                      >
                        {slot}
                        {isOccupied && (
                          <span style={{
                            position: 'absolute', top: '2px', right: '4px', width: '6px', height: '6px',
                            borderRadius: '50%', background: 'var(--color-orange)'
                          }} />
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedTime && isSelectedTimeOccupied && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-orange)', fontSize: '13px', marginBottom: '16px', padding: '12px', background: 'rgba(224, 88, 48, 0.1)', borderRadius: '8px' }}>
                    <AlertCircle size={16} />
                    This slot is currently full. You can join the waitlist.
                  </div>
                )}

                {errorMsg && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-orange)', fontSize: '13px', marginBottom: '16px', padding: '12px', background: 'rgba(224, 88, 48, 0.1)', borderRadius: '8px' }}>
                    <AlertCircle size={16} />
                    {errorMsg}
                  </div>
                )}

                {isSelectedTimeOccupied ? (
                  <button 
                    className="btn-primary w-full"
                    disabled={!selectedDate || !selectedTime || loading}
                    onClick={handleJoinWaitlist}
                    style={{ padding: '18px', background: 'var(--color-orange)', color: 'white' }}
                  >
                    <Bell size={16} style={{ marginRight: '8px' }} />
                    {loading ? 'Joining...' : 'Join Waitlist'}
                  </button>
                ) : (
                  <button 
                    className="btn-primary w-full"
                    disabled={!selectedDate || !selectedTime || loading}
                    onClick={handleConfirm}
                    style={{ padding: '18px' }}
                  >
                    {loading ? 'Confirming...' : 'Confirm Booking →'}
                  </button>
                )}
              </div>
            ) : (
              <div className="card-light" style={{ textAlign: 'center', padding: '48px 24px', borderStyle: 'dashed' }}>
                <CalIcon size={32} color="var(--color-muted)" style={{ marginBottom: '16px' }} />
                <p style={{ fontSize: '14px', opacity: 0.6 }}>Please select a date from the calendar to view available time slots.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Screen5Booking;
