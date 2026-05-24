import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Stepper from '../components/Stepper';
import { Search, Calendar, Clock, User, Mail } from 'lucide-react';

const BACKEND_URL = 'https://akeno7594-internship-project-backend.hf.space/api';

const HelpTooltip = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <span style={{ display: 'inline-block', position: 'relative', marginLeft: '6px' }}>
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        style={{
          width: '16px', height: '16px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.06)', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '11px',
          fontWeight: 'bold', color: 'var(--color-dark)', border: 'none',
          outline: 'none', cursor: 'pointer', verticalAlign: 'middle'
        }}
      >
        ?
      </button>
      {show && (
        <span style={{
          position: 'absolute', bottom: '24px', left: '50%',
          transform: 'translateX(-50%)', width: '220px',
          background: 'var(--color-dark)', color: 'var(--color-white)',
          padding: '10px 12px', borderRadius: '8px', fontSize: '11px',
          lineHeight: '1.4', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          pointerEvents: 'none', display: 'block', textTransform: 'none',
          fontWeight: 'normal', letterSpacing: 'normal'
        }}>
          {text}
          <span style={{
            position: 'absolute', top: '100%', left: '50%',
            transform: 'translateX(-50%)', width: '0', height: '0',
            borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
            borderTop: '6px solid var(--color-dark)', display: 'block'
          }} />
        </span>
      )}
    </span>
  );
};

const Screen7CheckAppointment = () => {
  const [query, setQuery] = useState('');
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/lookup/${query}`);
      const json = await res.json();
      if (json.success) {
        setBookings(json.bookings);
      } else {
        setError('No appointments found.');
      }
    } catch {
      setError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '48px', maxWidth: '800px' }}>
      <header className="text-center" style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px' }}>Check Your Appointment</h1>
        <p style={{ opacity: 0.7 }}>Enter your Email or Receipt ID to lookup your booking details.</p>
      </header>
      
      <div className="card-light" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
            Lookup Details
            <HelpTooltip text="Enter the email address you booked with, or the receipt code (e.g. SA-...) you received." />
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
              <input className="input-field" placeholder="Email or Receipt ID" onChange={e => setQuery(e.target.value)} />
              <button className="btn-primary" onClick={handleSearch} disabled={loading}>{loading ? 'Searching...' : 'Lookup'}</button>
          </div>
        </div>
        {error && <p style={{ color: 'var(--color-orange)', marginTop: '16px' }}>{error}</p>}
      </div>

      {bookings && bookings.map(b => (
        <div key={b.receiptId} className="card-light" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '18px' }}>{b.specialistName}</h3>
                    <p style={{ opacity: 0.7 }}>{b.specialistCategory}</p>
                </div>
                <span className="pill-tag">{b.receiptId}</span>
            </div>
            <div style={{ marginTop: '16px', display: 'flex', gap: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Calendar size={16}/> {b.bookingDate}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16}/> {b.bookingTime}</div>
            </div>
        </div>
      ))}
    </div>
  );
};

export default Screen7CheckAppointment;
