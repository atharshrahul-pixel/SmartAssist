import { useEffect, useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../App';
import Stepper from '../components/Stepper';
import { Check, Download, RefreshCcw, Share2, Calendar, Clock, User, ShieldCheck } from 'lucide-react';

const Screen6Confirmation = () => {
  const { state, updateState, addBooking } = useContext(AppContext);
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!state.bookingId || !state.bookedDate) {
      navigate('/');
      return;
    }

    addBooking({
      specialistId: state.finalSpecialist.id,
      date: state.bookedDate,
      time: state.bookedTime
    });

    const timer = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <Stepper currentStep={6} />
      
      <div className="container" style={{ flex: 1, paddingTop: '48px' }}>
        <div className="conf-grid">
          {/* Left Column: Hero & Next Steps */}
          <div className="conf-hero">
            <div style={{
              width: '64px', height: '64px',
              borderRadius: '20px', background: '#ECFDF5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '32px',
              border: '2px solid #10B981'
            }}>
              <Check size={32} color="#059669" strokeWidth={3} />
            </div>

            <h1 style={{ fontSize: '64px', lineHeight: '1', marginBottom: '24px', maxWidth: '500px' }}>
              You're all <span className="accent-word" style={{ color: 'var(--color-orange)' }}>set!</span>
            </h1>
            <p style={{ fontSize: '20px', color: 'var(--color-dark)', opacity: 0.8, maxWidth: '480px', marginBottom: '48px', lineHeight: '1.5' }}>
              Your appointment has been successfully scheduled. We've sent a confirmation to your registered email address.
            </p>

            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Next Steps
              </h3>
              
              <div className="next-step-card">
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(224, 88, 48, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Calendar size={16} color="var(--color-orange)" />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>Add to Calendar</div>
                  <p style={{ fontSize: '13px', opacity: 0.6, margin: 0 }}>Sync this appointment with Google, Outlook, or Apple Calendar.</p>
                </div>
              </div>

              <div className="next-step-card">
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(224, 88, 48, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={16} color="var(--color-orange)" />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>Verify Details</div>
                  <p style={{ fontSize: '13px', opacity: 0.6, margin: 0 }}>Check your email for the pre-visit preparation checklist.</p>
                </div>
              </div>
            </div>

            <button className="btn-primary" onClick={handleBookAnother} style={{ gap: '12px', padding: '16px 32px' }}>
              <RefreshCcw size={18} />
              Book Another Appointment
            </button>
          </div>

          {/* Right Column: Ticket Summary */}
          <div className="conf-summary">
            <div className="ticket-card">
              <header className="ticket-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={20} color="var(--color-accent)" />
                  <span style={{ fontSize: '14px', fontWeight: '800', letterSpacing: '0.1em' }}>OFFICIAL RECEIPT</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: '700', opacity: 0.8 }}>#{state.bookingId}</div>
              </header>

              <div className="ticket-body">
                <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
                  <div style={{
                    width: '64px', height: '64px',
                    borderRadius: '16px', background: 'var(--color-cream)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', fontWeight: '800', color: 'var(--color-dark)'
                  }}>
                    {state.finalSpecialist.initials}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>{state.finalSpecialist.name}</h3>
                    <span className="pill-tag" style={{ fontSize: '10px' }}>{state.finalSpecialist.category}</span>
                  </div>
                </div>

                <div className="ticket-row">
                  <div className="ticket-label"><User size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Patient</div>
                  <div className="ticket-value">{state.name}</div>
                </div>
                
                <div className="ticket-row">
                  <div className="ticket-label"><Calendar size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Date</div>
                  <div className="ticket-value">{state.bookedDate}</div>
                </div>

                <div className="ticket-row">
                  <div className="ticket-label"><Clock size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Time</div>
                  <div className="ticket-value">{state.bookedTime}</div>
                </div>

                {state.bookedMode && (
                  <div className="ticket-row">
                    <div className="ticket-label"><ShieldCheck size={14} style={{ marginRight: '8px', verticalAlign: 'middle' }} />Mode</div>
                    <div className="ticket-value">{state.bookedMode} ({state.bookedDuration})</div>
                  </div>
                )}

                {state.bookedPrice !== undefined && (
                  <div className="ticket-row">
                    <div className="ticket-label"><span style={{ fontWeight: '800', marginRight: '8px', verticalAlign: 'middle' }}>$</span>Fee</div>
                    <div className="ticket-value" style={{ fontWeight: '700', color: 'var(--color-orange)' }}>${state.bookedPrice}</div>
                  </div>
                )}
              </div>

              <div className="ticket-divider"></div>

              <div className="ticket-body" style={{ background: '#FAFAF9', textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginBottom: '16px' }}>
                  Show this ticket at the reception upon arrival.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', gap: '8px' }}>
                    <Share2 size={14} /> Share
                  </button>
                  <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px', gap: '8px' }}>
                    <Download size={14} /> Save PDF
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
