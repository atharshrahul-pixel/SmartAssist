import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import Stepper from '../components/Stepper';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, User, AlertCircle, Bell } from 'lucide-react';

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
  const [bookedFor, setBookedFor] = useState('Myself');

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
    
    try {
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
          bookedFor: bookedFor === 'Myself' ? (user ? user.name : state.name) : bookedFor
        })
      });
      const data = await response.json();

      if (data.success) {
        updateState({ 
          bookedDate: selectedDate, 
          bookedTime: selectedTime,
          bookingId: data.booking.receiptId
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

            {user && (
              <div className="card-light" style={{ padding: '20px', marginBottom: '24px' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                  <User size={14} /> Who is this appointment for?
                </label>
                <select 
                  className="input-field" 
                  value={bookedFor} 
                  onChange={e => setBookedFor(e.target.value)}
                  style={{ marginTop: '8px', padding: '10px 12px' }}
                >
                  <option value="Myself">Myself ({user.name})</option>
                  {user.familyProfiles && user.familyProfiles.map(member => (
                    <option key={member._id} value={member.name}>{member.name} ({member.relationship})</option>
                  ))}
                </select>
              </div>
            )}

            {selectedDate ? (
              <div className="card-light" style={{ animation: 'fadeInSlideUp 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Clock size={18} color="var(--color-orange)" />
                  <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Available Times</h3>
                </div>
                
                <div className="time-grid mb-xl">
                  {state.finalSpecialist.availableSlots.map(slot => {
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
