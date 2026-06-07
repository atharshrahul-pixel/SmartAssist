import { useEffect, use, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import Stepper from '../components/Stepper';
import { Check, Download, RefreshCcw, Share2, Calendar, Clock, User, ShieldCheck } from 'lucide-react';
import { SafeTitle } from '../utils/titleRenderer';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://p01--smart-assist-backend--qnbs82bxhg66.code.run/api');

const Screen6Confirmation = () => {
  const { t } = useTranslation();
  const { state, updateState, addBooking } = use(AppContext);
  const navigate = useNavigate();
  const bookingAddedRef = useRef(false);

  useEffect(() => {
    if (!state.bookingId || !state.bookedDate) {
      navigate('/');
      return;
    }

    if (!bookingAddedRef.current) {
      addBooking({
        specialistId: state.finalSpecialist.id,
        date: state.bookedDate,
        time: state.bookedTime
      });
      bookingAddedRef.current = true;
    }

  }, [state.bookingId, state.bookedDate, state.bookedTime, state.finalSpecialist, navigate, addBooking]);

  const handleSavePDF = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/bookings/${state.bookingId}/pdf`);
      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${state.bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Could not download PDF. Please try again.');
    }
  };

  const handleBookAnother = () => {
    updateState({
      name: '',
      problem: '',
      recommendedSpecialist: '',
      accepted: null,
      rejectionReason: '',
      rejectionReasonOther: '',
      finalSpecialist: null,
      bookedDate: null,
      bookedTime: '',
      bookingId: ''
    });
    navigate('/');
  };

  if (!state.bookingId) return null;

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Stepper currentStep={7} />
      
      <div className="container" style={{ flex: 1, paddingTop: '48px' }}>
        <div className="conf-grid">
          {/* Left Column: Hero & Next Steps */}
          <div className="conf-hero">
            <div className="conf-success-icon">
              <Check size={32} color="#059669" strokeWidth={3} />
            </div>

            <h1 style={{ fontSize: '64px', lineHeight: '1', marginBottom: '24px', maxWidth: '500px' }}>
              <SafeTitle text={t('all_set')} />
            </h1>
            <p style={{ fontSize: '20px', color: 'var(--color-dark)', opacity: 0.8, maxWidth: '480px', marginBottom: '48px', lineHeight: '1.5' }}>
              {t('appointment_success_desc')}
            </p>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('next_steps')}
              </h3>
              
              <div className="next-step-card">
              <div className="next-step-icon">
                  <Calendar size={16} color="var(--color-orange)" />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{t('add_to_calendar')}</div>
                  <p style={{ fontSize: '13px', opacity: 0.6, margin: 0 }}>{t('add_to_calendar_desc')}</p>
                </div>
              </div>

              <div className="next-step-card">
              <div className="next-step-icon">
                  <ShieldCheck size={16} color="var(--color-orange)" />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>{t('verify_details')}</div>
                  <p style={{ fontSize: '13px', opacity: 0.6, margin: 0 }}>{t('verify_details_desc')}</p>
                </div>
              </div>
            </div>

            <button type="button" className="btn-primary" onClick={handleBookAnother} style={{ gap: '12px', padding: '16px 32px' }}>
              <RefreshCcw size={18} />
              {t('book_another')}
            </button>
          </div>

          {/* Right Column: Ticket Summary */}
          <div className="conf-summary">
            <div className="ticket-card">
              <header className="ticket-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={20} color="var(--color-accent)" />
                  <span style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '0.1em' }}>{t('official_receipt')}</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', opacity: 0.8 }}>#{state.bookingId}</div>
              </header>

              <div className="ticket-body">
                <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                  <div className="conf-avatar">
                    {state.finalSpecialist.initials}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>{state.finalSpecialist.name}</h3>
                    <span className="pill-tag" style={{ fontSize: '12px' }}>{t(`category_${state.finalSpecialist.category}`, { defaultValue: state.finalSpecialist.category })}</span>
                  </div>
                </div>

                <div className="ticket-row">
                  <div className="ticket-label"><User size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('patient_label')}</div>
                  <div className="ticket-value">{state.name}</div>
                </div>
                
                <div className="ticket-row">
                  <div className="ticket-label"><Calendar size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('date')}</div>
                  <div className="ticket-value">{state.bookedDate}</div>
                </div>

                <div className="ticket-row">
                  <div className="ticket-label"><Clock size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('time')}</div>
                  <div className="ticket-value">{state.bookedTime}</div>
                </div>

                {state.bookedMode && (
                  <div className="ticket-row">
                    <div className="ticket-label"><ShieldCheck size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />{t('mode')}</div>
                    <div className="ticket-value">{state.bookedMode} ({state.bookedDuration})</div>
                  </div>
                )}

                {state.bookedPrice !== undefined && (
                  <div className="ticket-row">
                    <div className="ticket-label"><span style={{ fontWeight: '800', marginRight: '8px', verticalAlign: 'middle' }}>₹</span>{t('fee')}</div>
                    <div className="ticket-value" style={{ fontWeight: '700', color: 'var(--color-orange)' }}>₹{state.bookedPrice}</div>
                  </div>
                )}
              </div>

              <div className="ticket-divider"></div>

              <div className="ticket-body" style={{ background: '#FAFAF9', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#000000', fontWeight: 'bold', marginBottom: '16px' }}>
                  {t('show_receipt_desc')}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button type="button" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', gap: '8px' }}>
                    <Share2 size={14} /> {t('share')}
                  </button>
                  <button type="button" onClick={handleSavePDF} className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', gap: '8px' }}>
                    <Download size={14} /> {t('save_pdf')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand">SmartAssist</div>
          <div className="footer-links">
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/terms" className="footer-link">Terms of Service</Link>
            <Link to="/support" className="footer-link">Support</Link>
          </div>
        </div>
        <div className="footer-content footer-copy">
          <p>&copy; 2026 SmartAssist Health AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Screen6Confirmation;
