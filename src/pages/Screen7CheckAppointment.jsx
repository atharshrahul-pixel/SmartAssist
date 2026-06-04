import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Stepper from '../components/Stepper';
import HelpTooltip from '../components/HelpTooltip';
import { Calendar, Clock } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://p01--smart-assist-backend--qnbs82bxhg66.code.run/api');

const Screen7CheckAppointment = () => {
  const { t } = useTranslation();
  const [query, setQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('receiptId') || '';
  });
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
      const res = await fetch(`${BACKEND_URL}/bookings/lookup/${q}`);
      const json = await res.json();
      if (json.success) {
        setBookings(json.bookings);
      } else {
        setError(t('no_appointments_found'));
      }
    } catch {
      setError(t('connection_error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const receiptId = params.get('receiptId');
    if (!receiptId) return;

    let isMounted = true;
    const fetchBookingOnMount = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${BACKEND_URL}/bookings/lookup/${receiptId}`);
        const json = await res.json();
        if (!isMounted) return;
        if (json.success) {
          setBookings(json.bookings);
        } else {
          setError(t('no_appointments_found'));
        }
      } catch {
        if (isMounted) setError(t('connection_error'));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchBookingOnMount();
    return () => {
      isMounted = false;
    };
  }, [t]);

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Stepper currentStep={currentStep} flow="lookup" />
      <div className="container" style={{ paddingTop: '20px', maxWidth: '800px', flex: 1 }}>
        <header className="text-center" style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px' }}>{t('check_your_appointment')}</h1>
        <p style={{ opacity: 0.7 }}>{t('lookup_desc')}</p>
      </header>
      
      <div className="card-light" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
            {t('lookup_details')}
            <HelpTooltip text={t('lookup_tooltip')} />
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                className="input-field" 
                placeholder={t('email_receipt_placeholder')} 
                aria-label={t('email_receipt_placeholder')}
                value={query}
                onChange={e => setQuery(e.target.value)} 
                onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              />
              <button type="button" className="btn-primary" onClick={() => handleSearch()} disabled={loading}>{loading ? t('searching') : t('lookup_btn')}</button>
          </div>
        </div>
        {error && <p style={{ color: 'var(--color-orange)', marginTop: '16px' }}>{error}</p>}
      </div>

      {bookings && bookings.map(b => (
        <div key={b.receiptId} className="card-light" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '18px' }}>{b.specialistName}</h3>
                    <p style={{ opacity: 0.7 }}>{t(`category_${b.specialistCategory}`, { defaultValue: b.specialistCategory })}</p>
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
