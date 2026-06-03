import { Info } from 'lucide-react';

const ExpiredSession = ({ onRestart }) => {
  return (
    <div className="expired-session-container">
      <div className="expired-session-card">
        <div className="expired-icon-wrapper">
          <Info size={32} color="var(--color-orange)" />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>Triage Session Expired</h2>
        <p style={{ color: 'var(--color-dark)', opacity: 0.7, marginBottom: '32px', lineHeight: '1.6' }}>
          To protect your privacy and ensure clinical accuracy, inactive triage sessions are automatically cleared. Please restart the assessment.
        </p>
        <button type="button" className="btn-primary w-full" onClick={onRestart}>
          Restart Assessment
        </button>
      </div>
    </div>
  );
};

export default ExpiredSession;
