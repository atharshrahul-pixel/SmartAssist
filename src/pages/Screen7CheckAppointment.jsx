import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Stepper from '../components/Stepper';
import HelpTooltip from '../components/HelpTooltip';
import { Search, Calendar, Clock, User, Mail } from 'lucide-react';

const BACKEND_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://akeno7594-internship-project-backend.hf.space/api';

const Screen7CheckAppointment = () => {
  const [query, setQuery] = useState('');
  const [bookings, setBookings] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const currentStep = bookings === null ? 1 : 2;

  const handleSearch = async (searchQuery) => {
    const q = searchQuery !== undefined ? searchQuery : query;
    if (!q.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/lookup/${q}`);
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const receiptId = params.get('receiptId');
    if (receiptId) {
      setQuery(receiptId);
      handleSearch(receiptId);
    }
  }, []);

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Stepper currentStep={currentStep} flow="lookup" />
      <div className="container" style={{ paddingTop: '20px', maxWidth: '800px', flex: 1 }}>
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
              <input 
                className="input-field" 
                placeholder="Email or Receipt ID" 
                value={query}
                onChange={e => setQuery(e.target.value)} 
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              />
              <button className="btn-primary" onClick={() => handleSearch()} disabled={loading}>{loading ? 'Searching...' : 'Lookup'}</button>
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
    </div>
  );
};

export default Screen7CheckAppointment;
