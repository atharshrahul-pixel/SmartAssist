import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../App';
import Stepper from '../components/Stepper';
import HelpTooltip from '../components/HelpTooltip';
import { ArrowLeft, ChevronRight, MessageSquare } from 'lucide-react';

const reasons = [
  "Wrong recommendation",
  "Different issue",
  "Prefer another specialist",
  "Other"
];

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
