import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import Stepper from '../components/Stepper';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, User, AlertCircle } from 'lucide-react';

const Screen5Booking = () => {
  const { state, updateState, bookings } = useContext(AppContext);
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!state.finalSpecialist) {
      navigate('/specialists');
    }
  }, [state.finalSpecialist, navigate]);

  const handleConfirm = () => {
    const isBooked = bookings.some(b => 
      b.specialistId === state.finalSpecialist.id && 
      b.date === selectedDate && 
      b.time === selectedTime
    );

    if (isBooked) {
      setErrorMsg("This slot was just taken. Please choose another time.");
      setSelectedTime('');
      return;
    }

    const bookingId = "SM-" + Date.now().toString(36).toUpperCase();
    
    updateState({ 
      bookedDate: selectedDate, 
      bookedTime: selectedTime,
      bookingId: bookingId
    });
    
    navigate('/confirmation');
  };

  if (!state.finalSpecialist) return null;

  const days = Array.from({length: 30}, (_, i) => i + 1);
  const today = 15;

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

            {selectedDate ? (
              <div className="card-light" style={{ animation: 'fadeInSlideUp 0.3s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Clock size={18} color="var(--color-orange)" />
                  <h3 style={{ fontSize: '18px', fontWeight: '800' }}>Available Times</h3>
                </div>
                
                <div className="time-grid mb-xl">
                  {state.finalSpecialist.slots.map(slot => {
                    const isBooked = bookings.some(b => 
                      b.specialistId === state.finalSpecialist.id && 
                      b.date === selectedDate && 
                      b.time === slot
                    );
                    const isSelected = selectedTime === slot;

                    return (
                      <button
                        key={slot}
                        disabled={isBooked}
                        className={`time-slot ${isSelected ? 'active' : ''}`}
                        onClick={() => { setSelectedTime(slot); setErrorMsg(''); }}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>

                {errorMsg && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-orange)', fontSize: '13px', marginBottom: '16px', padding: '12px', background: 'rgba(224, 88, 48, 0.1)', borderRadius: '8px' }}>
                    <AlertCircle size={16} />
                    {errorMsg}
                  </div>
                )}

                <button 
                  className="btn-primary w-full"
                  disabled={!selectedDate || !selectedTime}
                  onClick={handleConfirm}
                  style={{ padding: '18px' }}
                >
                  Confirm Booking →
                </button>
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
