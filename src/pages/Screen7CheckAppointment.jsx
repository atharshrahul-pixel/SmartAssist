import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Stepper from '../components/Stepper';
import { Search, Calendar, Clock, User, Mail } from 'lucide-react';

const BACKEND_URL = 'https://akeno7594-internship-project-backend.hf.space/api';

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
        <div style={{ display: 'flex', gap: '12px' }}>
            <input className="input-field" placeholder="Email or Receipt ID" onChange={e => setQuery(e.target.value)} />
            <button className="btn-primary" onClick={handleSearch} disabled={loading}>{loading ? 'Searching...' : 'Lookup'}</button>
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
