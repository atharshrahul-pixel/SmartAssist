import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../App';
import Stepper from '../components/Stepper';
import { ArrowLeft, ChevronRight, MessageSquare } from 'lucide-react';

const reasons = [
  "Wrong recommendation",
  "Different issue",
  "Prefer another specialist",
  "Other"
];

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

const Screen3Rejection = () => {
  const { state, updateState } = useContext(AppContext);
  const navigate = useNavigate();
  const [reason, setReason] = useState(state.rejectionReason || '');
  const [other, setOther] = useState(state.rejectionReasonOther || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason || (reason === 'Other' && !other.trim())) return;
    
    updateState({ rejectionReason: reason, rejectionReasonOther: other });
    navigate('/specialists');
  };

  return (
    <div className="page-transition" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stepper currentStep={3} />
      
      <div className="container" style={{ flex: 1 }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <Link to="/recommendation" className="back-link">
            <ArrowLeft size={16} />
            Back to recommendation
          </Link>
          
          <div className="text-center mb-xl">
            <span className="pill-tag mb-lg" style={{ background: 'var(--color-orange)', color: 'var(--color-white)' }}>
              HELP US IMPROVE
            </span>
            <h2 style={{ fontSize: '40px', lineHeight: '1.2', marginBottom: '16px' }}>
              Why wasn't this the right <span className="accent-word" style={{ color: 'var(--color-orange)' }}>match?</span>
            </h2>
            <p style={{ color: 'var(--color-dark)', opacity: 0.6, fontSize: '16px' }}>
              Your feedback helps our AI learn and provide better recommendations for everyone.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              {reasons.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`choice-chip ${reason === r ? 'active' : ''}`}
                  onClick={() => setReason(r)}
                >
                  {r}
                  <ChevronRight size={18} opacity={reason === r ? 1 : 0.3} />
                </button>
              ))}
            </div>

            {reason === 'Other' && (
              <div className="mb-lg" style={{ animation: 'fadeInSlideUp 0.3s ease' }}>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={14} />
                  Tell us more
                  <HelpTooltip text="Enter details about why the recommended specialist was not appropriate for your condition." />
                </label>
                <textarea 
                  className="input-field placeholder-dark"
                  placeholder="Please describe why the recommendation didn't fit..."
                  style={{ minHeight: '120px', resize: 'vertical' }}
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                  autoFocus
                />
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={!reason || (reason === 'Other' && !other.trim())}
              style={{ padding: '16px', marginTop: 'var(--sp-md)' }}
            >
              Continue to Specialists →
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Screen3Rejection;
