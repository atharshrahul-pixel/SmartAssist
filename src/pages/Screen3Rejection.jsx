import { useState, use } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Stepper from '../components/Stepper';
import HelpTooltip from '../components/HelpTooltip';
import { ArrowLeft, ChevronRight, MessageSquare } from 'lucide-react';

const Screen3Rejection = () => {
  const { t } = useTranslation();
  const { state, updateState } = use(AppContext);
  const navigate = useNavigate();
  const [reason, setReason] = useState(state.rejectionReason || '');
  const [other, setOther] = useState(state.rejectionReasonOther || '');

  const reasons = [
    t('reason_wrong_rec'),
    t('reason_diff_issue'),
    t('reason_prefer_another'),
    t('reason_other')
  ];

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
            {t('back_to_recommendation')}
          </Link>
          
          <div className="text-center mb-xl">
            <span className="pill-tag mb-lg" style={{ background: 'var(--color-orange)', color: 'var(--color-white)' }}>
              {t('help_us_improve')}
            </span>
            <h2 style={{ fontSize: '40px', lineHeight: '1.2', marginBottom: '16px' }}>
              {t('why_not_right_match')} <span className="accent-word" style={{ color: 'var(--color-orange)' }}>{t('match')}</span>
            </h2>
            <p style={{ color: 'var(--color-dark)', opacity: 0.6, fontSize: '16px' }}>
              {t('feedback_desc')}
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

            {reason === t('reason_other') && (
              <div className="mb-lg" style={{ animation: 'fadeInSlideUp 0.3s ease' }}>
                <label htmlFor="reject-other-input" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MessageSquare size={14} />
                  {t('tell_us_more')}
                  <HelpTooltip text={t('tooltip_rejection')} />
                </label>
                <textarea 
                  id="reject-other-input"
                  className="input-field placeholder-dark"
                  placeholder={t('rejection_placeholder')}
                  style={{ minHeight: '120px', resize: 'vertical' }}
                  value={other}
                  onChange={(e) => setOther(e.target.value)}
                />
              </div>
            )}

            <button 
              type="submit" 
              className="btn-primary w-full"
              disabled={!reason || (reason === t('reason_other') && !other.trim())}
              style={{ padding: '16px', marginTop: 'var(--sp-md)' }}
            >
              {t('continue_to_specialists')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Screen3Rejection;
