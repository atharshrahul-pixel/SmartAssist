import { useReducer, use, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import Stepper from '../components/Stepper';
import HelpTooltip from '../components/HelpTooltip';
import { translateError } from '../utils/errorTranslator';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, Clock, User, AlertCircle, Bell, MapPin, Video, MessageSquare } from 'lucide-react';

const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://p01--smart-assist-backend--qnbs82bxhg66.code.run/api');

const SPECIALIST_AVATAR_STYLE = {
  width: '44px',
  height: '44px',
  borderRadius: '12px',
  background: 'var(--color-accent)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '16px',
  fontWeight: '800',
  color: 'var(--color-dark)'
};

const ALERT_BOX_STYLE = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  color: 'var(--color-orange)',
  fontSize: '13px',
  marginBottom: '16px',
  padding: '12px',
  background: 'rgba(224, 88, 48, 0.1)',
  borderRadius: '8px'
};


const getInitialBookingState = (state) => {
  const initialBookedFor = state.appointmentFor
    ? (state.appointmentFor === 'myself' ? 'myself' : (state.otherName || 'other'))
    : 'myself';
  return {
    selectedDate: null,
    selectedTime: '',
    errorMsg: '',
    loading: false,
    currentDate: new Date(),
    occupiedSlots: [],
    bookedFor: initialBookedFor,
    otherName: state.otherName || '',
    selectedMode: 'inPerson',
  };
};

function bookingReducer(state, action) {
  switch (action.type) {
    case 'SET_DATE':
      return { ...state, selectedDate: action.payload, selectedTime: '', errorMsg: '' };
    case 'SET_TIME':
      return { ...state, selectedTime: action.payload, errorMsg: '' };
    case 'SET_ERROR':
      return { ...state, errorMsg: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CURRENT_DATE':
      return { ...state, currentDate: action.payload };
    case 'SET_OCCUPIED_SLOTS':
      return { ...state, occupiedSlots: action.payload };
    case 'SET_BOOKED_FOR':
      return { ...state, bookedFor: action.payload };
    case 'SET_OTHER_NAME':
      return { ...state, otherName: action.payload };
    case 'SET_MODE':
      return { ...state, selectedMode: action.payload, selectedTime: '', errorMsg: '' };
    default:
      return state;
  }
}


const CalendarGrid = ({ calendarCells, todayDate, selectedDate, onSelectDay, getFormattedDateString }) => {
  return (
    <div className="cal-grid">
      {['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].map(d => (
        <div key={d} className="cal-day-label">{d.toUpperCase()}</div>
      ))}
      {calendarCells.map((dayDate, index) => {
        if (dayDate === null) {
          return <div key={`empty-${index}`} className="cal-day empty" style={{ visibility: 'hidden' }}></div>;
        }
        const isPast = dayDate < todayDate;
        const formattedStr = getFormattedDateString(dayDate);
        const isSelected = selectedDate === formattedStr;
        const isToday = dayDate.getDate() === todayDate.getDate() && 
                        dayDate.getMonth() === todayDate.getMonth() && 
                        dayDate.getFullYear() === todayDate.getFullYear();
        return (
          <button
            key={`day-${dayDate.getTime()}`}
            type="button"
            disabled={isPast}
            className={`cal-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
            onClick={() => onSelectDay(formattedStr)}
            style={isPast ? { opacity: 0.3, cursor: 'not-allowed' } : {}}
          >
            {dayDate.getDate()}
          </button>
        );
      })}
    </div>
  );
};

const BookingDetailsSidebar = ({
  state,
  loading,
  selectedDate,
  selectedTime,
  selectedMode,
  bookedFor,
  otherName,
  errorMsg,
  occupiedSlots,
  isSelectedTimeOccupied,
  getAvailableSlots,
  onSelectMode,
  onSelectTime,
  onSetBookedFor,
  onSetOtherName,
  onConfirm,
  onJoinWaitlist,
  t,
  navigate
}) => {
  return (
    <aside className="booking-controls">
      <div className="card-dark" style={{ padding: '24px', marginBottom: '24px', borderRadius: 'var(--r-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
          <div style={SPECIALIST_AVATAR_STYLE}>
            {state.finalSpecialist.initials}
          </div>
          <div>
            <div style={{ color: 'var(--color-white)', fontSize: '16px', fontWeight: '700' }}>{state.finalSpecialist.name}</div>
            <div style={{ color: 'var(--color-accent)', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>{state.finalSpecialist.category}</div>
          </div>
          <button 
            type="button"
            className="btn-ghost" 
            style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: '12px', border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white' }}
            onClick={() => navigate('/specialists')}
          >
            {t('change_btn')}
          </button>
        </div>
      </div>

      <div className="card-light" style={{ padding: '20px', marginBottom: '24px' }}>
        <span className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginBottom: '12px' }}>
          <Clock size={14} /> {t('appointment_mode_label')}
          <HelpTooltip text={t('tooltip_mode')} />
        </span>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          {[
            { key: 'inPerson', label: t('in_person'), icon: <MapPin size={14} />, defaultPrice: 100, defaultDuration: '30 mins' },
            { key: 'video', label: t('video_call'), icon: <Video size={14} />, defaultPrice: 60, defaultDuration: '20 mins' },
            { key: 'chat', label: t('chat_consult'), icon: <MessageSquare size={14} />, defaultPrice: 30, defaultDuration: '15 mins' }
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
                onClick={() => onSelectMode(m.key)}
                className={`booking-mode-btn ${isSel ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '12px 8px',
                  borderRadius: '10px',
                  border: isSel ? '2px solid var(--color-orange)' : '1px solid var(--color-cream-dark)',
                  background: isSel ? 'var(--color-cream)' : 'transparent',
                  color: 'var(--color-dark)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {m.icon}
                <span style={{ fontSize: '12px', fontWeight: '700' }}>{m.label}</span>
                <span style={{ fontSize: '12px', opacity: 0.6 }}>${modeConfig.price}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card-light" style={{ padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <span className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginBottom: '12px' }}>
            <User size={14} /> {t('appointment_for_label')}
            <HelpTooltip text={t('tooltip_appointment_for')} />
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button 
              type="button"
              className={`booking-mode-btn ${bookedFor === 'myself' ? 'active' : ''}`} 
              onClick={() => onSetBookedFor('myself')}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: bookedFor === 'myself' ? '2px solid var(--color-orange)' : '1px solid var(--color-cream-dark)',
                background: bookedFor === 'myself' ? 'var(--color-cream)' : 'transparent',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {t('myself')}
            </button>
            <button 
              type="button"
              className={`booking-mode-btn ${bookedFor !== 'myself' ? 'active' : ''}`} 
              onClick={() => onSetBookedFor('other')}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: bookedFor !== 'myself' ? '2px solid var(--color-orange)' : '1px solid var(--color-cream-dark)',
                background: bookedFor !== 'myself' ? 'var(--color-cream)' : 'transparent',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              {t('someone_else')}
            </button>
          </div>

          {bookedFor !== 'myself' && (
            <div style={{ marginTop: '16px' }}>
              <input 
                type="text" 
                className="input-field" 
                placeholder={t('patient_full_name')}
                value={otherName}
                onChange={e => onSetOtherName(e.target.value)}
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <span className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', marginBottom: '12px' }}>
            <Clock size={14} /> {t('select_time')}
            <HelpTooltip text={t('tooltip_time')} />
          </span>
          
          {selectedDate ? (
            <div className="time-grid mb-xl">
              {getAvailableSlots().map(slot => {
                const isOccupied = occupiedSlots.includes(slot);
                const isSelected = selectedTime === slot;

                return (
                  <button
                    key={slot}
                    type="button"
                    className={`time-slot ${isSelected ? 'active' : ''}`}
                    style={{
                      position: 'relative',
                      border: isOccupied ? '1.5px solid var(--color-orange)' : undefined,
                      color: isOccupied ? 'var(--color-orange)' : undefined,
                    }}
                    onClick={() => onSelectTime(slot)}
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
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 12px', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: '8px', marginBottom: '24px' }}>
              <CalIcon size={24} color="var(--color-muted)" style={{ marginBottom: '8px' }} />
              <p style={{ fontSize: '13px', opacity: 0.6 }}>{t('select_date_prompt')}</p>
            </div>
          )}

          {selectedDate && selectedTime && isSelectedTimeOccupied && (
            <div style={ALERT_BOX_STYLE}>
              <AlertCircle size={16} />
              {t('waitlist_msg')}
            </div>
          )}

          {errorMsg && (
            <div style={ALERT_BOX_STYLE}>
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          {selectedDate && isSelectedTimeOccupied ? (
            <button 
              type="button"
              className="btn-primary w-full"
              disabled={loading}
              onClick={onJoinWaitlist}
              style={{ padding: '18px', background: 'var(--color-orange)', color: 'white' }}
            >
              <Bell size={16} style={{ marginRight: '8px' }} />
              {loading ? t('joining') : t('join_waitlist')}
            </button>
          ) : (
            <button 
              type="button"
              className="btn-primary w-full"
              disabled={loading}
              onClick={onConfirm}
              style={{ padding: '18px' }}
            >
              {loading ? t('confirming') : t('confirm_booking_arrow')}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

const Screen5Booking = () => {
  const { t } = useTranslation();
  const { state, updateState, user, token } = use(AppContext);
  const navigate = useNavigate();

  const [bookingState, dispatch] = useReducer(bookingReducer, getInitialBookingState(state));

  const getAvailableSlots = () => {
    const modes = state.finalSpecialist?.appointmentModes;
    if (modes && modes[bookingState.selectedMode] && Array.isArray(modes[bookingState.selectedMode].slots)) {
      return modes[bookingState.selectedMode].slots;
    }
    return state.finalSpecialist?.availableSlots || [];
  };

  useEffect(() => {
    if (!state.finalSpecialist) {
      navigate('/specialists');
    }
  }, [state.finalSpecialist, navigate]);

  useEffect(() => {
    if (!bookingState.selectedDate || !state.finalSpecialist) return;

    let isMounted = true;
    const fetchOccupiedSlots = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/bookings/occupied?specialistId=${state.finalSpecialist.id}&bookingDate=${bookingState.selectedDate}`);
        const json = await res.json();
        if (!isMounted) return;
        if (json.success) {
          dispatch({ type: 'SET_OCCUPIED_SLOTS', payload: json.slots });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchOccupiedSlots();
    return () => {
      isMounted = false;
    };
  }, [bookingState.selectedDate, state.finalSpecialist]);

  const handleConfirm = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: '' });
    
    const finalBookedFor = bookingState.bookedFor === 'myself'
      ? (user ? user.name : state.name)
      : (bookingState.bookedFor === 'other' ? bookingState.otherName : bookingState.bookedFor);

    if (user && bookingState.bookedFor === 'other' && !bookingState.otherName.trim()) {
      dispatch({ type: 'SET_ERROR', payload: t('error_patient_name_short') });
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      const modeData = state.finalSpecialist.appointmentModes?.[bookingState.selectedMode] || {
        price: bookingState.selectedMode === 'inPerson' ? 100 : (bookingState.selectedMode === 'video' ? 60 : 30),
        duration: bookingState.selectedMode === 'inPerson' ? '30 mins' : (bookingState.selectedMode === 'video' ? '20 mins' : '15 mins')
      };

      const response = await fetch(`${BACKEND_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: user ? user.name : state.name,
          userEmail: user ? user.email : state.email,
          specialistId: state.finalSpecialist.id,
          bookingDate: bookingState.selectedDate,
          bookingTime: bookingState.selectedTime,
          rejectionReason: state.rejectionReason,
          rejectionReasonOther: state.rejectionReasonOther,
          userId: user ? user.id : undefined,
          bookedFor: finalBookedFor,
          appointmentMode: bookingState.selectedMode === 'inPerson' ? 'In-Person' : (bookingState.selectedMode === 'video' ? 'Video Call' : 'Chat Consultation'),
          price: modeData.price,
          duration: modeData.duration,
          triageUrgency: state.urgency,
          triageExplanation: state.recommendationExplanation,
          triageHistory: state.chatHistory,
          triageKeywords: state.detectedKeywords,
          symptoms: state.problem
        })
      });
      const data = await response.json();

      if (data.success) {
        updateState({ 
          bookedDate: bookingState.selectedDate, 
          bookedTime: bookingState.selectedTime,
          bookingId: data.booking.receiptId,
          bookedMode: bookingState.selectedMode === 'inPerson' ? 'In-Person' : (bookingState.selectedMode === 'video' ? 'Video Call' : 'Chat Consultation'),
          bookedPrice: modeData.price,
          bookedDuration: modeData.duration
        });
        navigate('/confirmation');
      } else {
        dispatch({ type: 'SET_ERROR', payload: translateError(data.message || t('error_booking_failed')) });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: translateError(t('error_connect_booking')) });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const handleJoinWaitlist = async () => {
    if (!user) {
      alert(t('error_waitlist_login'));
      navigate('/login');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: '' });
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
          bookingDate: bookingState.selectedDate,
          bookingTime: bookingState.selectedTime
        })
      });
      const data = await response.json();
      if (data.success) {
        alert(t('success_waitlist'));
        navigate('/dashboard');
      } else {
        dispatch({ type: 'SET_ERROR', payload: translateError(data.message || t('error_waitlist_failed')) });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: translateError(t('error_connect_waitlist')) });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  if (!state.finalSpecialist) return null;

  const currentMonth = bookingState.currentDate.getMonth();
  const currentYear = bookingState.currentDate.getFullYear();
  
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
  const totalDays = getDaysInMonth(currentYear, currentMonth);
  
  const calendarCells = [];
  
  for (let i = 0; i < firstDayIndex; i++) {
    calendarCells.push(null);
  }
  
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push(new Date(currentYear, currentMonth, d));
  }

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const getFormattedDateString = (dObj) => {
    if (!dObj) return '';
    return `${t(`abbr_month_${dObj.getMonth()}`)} ${dObj.getDate()}, ${dObj.getFullYear()}`;
  };

  const handlePrevMonth = () => {
    const prevDate = new Date(bookingState.currentDate.getFullYear(), bookingState.currentDate.getMonth() - 1, 1);
    const limit = new Date();
    limit.setDate(1);
    limit.setHours(0, 0, 0, 0);
    if (prevDate < limit) return;
    dispatch({ type: 'SET_CURRENT_DATE', payload: prevDate });
  };

  const handleNextMonth = () => {
    const nextDate = new Date(bookingState.currentDate.getFullYear(), bookingState.currentDate.getMonth() + 1, 1);
    dispatch({ type: 'SET_CURRENT_DATE', payload: nextDate });
  };

  const isPrevMonthDisabled = currentMonth === todayDate.getMonth() && currentYear === todayDate.getFullYear();
  const isSelectedTimeOccupied = bookingState.occupiedSlots.includes(bookingState.selectedTime);

  return (
    <div className="page-transition" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stepper currentStep={5} />
      
      <div className="container" style={{ flex: 1 }}>
        <div className="text-center mb-xl">
          <span className="pill-tag mb-lg">{t('secure_your_slot')}</span>
          <h1 style={{ fontSize: '48px', lineHeight: '1.1', marginBottom: 'var(--sp-md)' }}>
            {t('book_appointment_title')} <span className="accent-word" style={{ color: 'var(--color-orange)' }}>{t('appointment')}</span>
          </h1>
        </div>

        <div className="booking-grid">
          <section className="calendar-section">
            <div className="cal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <CalIcon size={24} color="var(--color-orange)" />
                <h3 style={{ fontSize: '20px', fontWeight: '800' }}>{t('select_date')}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <button 
                  type="button"
                  className="btn-ghost" 
                  onClick={handlePrevMonth} 
                  disabled={isPrevMonthDisabled} 
                  style={{ padding: '8px', borderRadius: '50%', opacity: isPrevMonthDisabled ? 0.3 : 1, cursor: isPrevMonthDisabled ? 'not-allowed' : 'pointer' }}
                >
                  <ChevronLeft size={20} />
                </button>
                <div style={{ fontWeight: '700', fontSize: '16px', minWidth: '160px', textAlign: 'center' }}>
                  {t(`month_${currentMonth}`)} {currentYear}
                </div>
                <button 
                  type="button"
                  className="btn-ghost" 
                  onClick={handleNextMonth} 
                  style={{ padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <CalendarGrid 
              calendarCells={calendarCells}
              todayDate={todayDate}
              selectedDate={bookingState.selectedDate}
              onSelectDay={formattedStr => dispatch({ type: 'SET_DATE', payload: formattedStr })}
              getFormattedDateString={getFormattedDateString}
              t={t}
            />
          </section>

          <BookingDetailsSidebar 
            state={state}
            user={user}
            loading={bookingState.loading}
            selectedDate={bookingState.selectedDate}
            selectedTime={bookingState.selectedTime}
            selectedMode={bookingState.selectedMode}
            bookedFor={bookingState.bookedFor}
            otherName={bookingState.otherName}
            errorMsg={bookingState.errorMsg}
            occupiedSlots={bookingState.occupiedSlots}
            isSelectedTimeOccupied={isSelectedTimeOccupied}
            getAvailableSlots={getAvailableSlots}
            onSelectMode={mode => dispatch({ type: 'SET_MODE', payload: mode })}
            onSelectTime={time => dispatch({ type: 'SET_TIME', payload: time })}
            onSetBookedFor={val => dispatch({ type: 'SET_BOOKED_FOR', payload: val })}
            onSetOtherName={val => dispatch({ type: 'SET_OTHER_NAME', payload: val })}
            onConfirm={handleConfirm}
            onJoinWaitlist={handleJoinWaitlist}
            t={t}
            navigate={navigate}
          />
        </div>
      </div>
    </div>
  );
};

export default Screen5Booking;
