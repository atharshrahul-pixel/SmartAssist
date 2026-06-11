import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

const SpecialistActionCard = ({
  state,
  hasSpecialists,
  getSpecialistIcon,
  handleAccept,
  handleReject,
  onNavigate,
  handleAcceptFallback,
}) => {
  const u = state.urgency;
  const config = {
    Urgent: {
      text: 'Urgent — consider ER',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      borderColor: '#ef4444',
      textColor: '#f87171',
      icon: <AlertTriangle size={12} color="#f87171" style={{ marginRight: '4px' }} />
    },
    Soon: {
      text: 'Soon — within days',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      borderColor: '#f59e0b',
      textColor: '#fbbf24',
      icon: <Clock size={12} color="#fbbf24" style={{ marginRight: '4px' }} />
    },
    Routine: {
      text: 'Routine — book anytime',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      borderColor: '#10b981',
      textColor: '#34d399',
      icon: <CheckCircle size={12} color="#34d399" style={{ marginRight: '4px' }} />
    }
  }[u] || {
    text: 'Routine — book anytime',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10b981',
    textColor: '#34d399',
    icon: <CheckCircle size={12} color="#34d399" style={{ marginRight: '4px' }} />
  };

  const isNotAvailable = state.recommendedSpecialist !== 'Emergency Services' && 
    (!hasSpecialists || (state.idealCategory && state.idealCategory.toLowerCase() !== state.recommendedSpecialist.toLowerCase()));

  if (isNotAvailable) {
    const unavailableSpecialistName = state.idealCategory || state.recommendedSpecialist;
    return (
      <div className="card-dark card-dark-container">
        <div className="specialist-icon-container">
          {getSpecialistIcon(unavailableSpecialistName)}
        </div>
        
        <div className="specialist-pill-row">
          <span className="pill-tag recommended-pill">
            RECOMMENDED
          </span>
          {state.urgency && (
            <span 
              className="pill-tag" 
              style={{
                background: config.bgColor,
                border: `1px solid ${config.borderColor}`,
                color: config.textColor,
                display: 'inline-flex',
                alignItems: 'center',
                margin: 0
              }}
            >
              {config.icon}
              {config.text.toUpperCase()}
            </span>
          )}
        </div>
        
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-white)', marginBottom: '12px' }}>
          {unavailableSpecialistName} Recommended
        </h2>

        <div className="unavailable-specialist-box specialist-unavailable-banner" style={{ background: 'rgba(237, 184, 32, 0.15)', borderColor: 'var(--color-accent)' }}>
          No {unavailableSpecialistName}s registered on Smart Assist. Try Near You to find local clinics.
        </div>

        <p style={{ fontSize: '15px', color: 'var(--color-muted)', marginBottom: '40px', lineHeight: 1.6, textAlign: 'left' }}>
          {state.recommendationExplanation}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            type="button"
            className="btn-primary w-full" 
            onClick={handleAccept} 
            style={{ padding: '16px', fontWeight: '700' }}
          >
            FIND NEARBY {unavailableSpecialistName.toUpperCase()}S
          </button>
          <button 
            type="button"
            className="btn-danger w-full" 
            onClick={() => onNavigate('/')} 
          >
            GO BACK TO HOMEPAGE
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card-dark card-dark-container">
      <div className="specialist-icon-container">
        {getSpecialistIcon(state.idealCategory || state.recommendedSpecialist)}
      </div>
      
      <div className="specialist-pill-row">
        <span className="pill-tag recommended-pill">
          RECOMMENDED
        </span>
        {state.urgency && (
          <span 
            className="pill-tag" 
            style={{
              background: config.bgColor,
              border: `1px solid ${config.borderColor}`,
              color: config.textColor,
              display: 'inline-flex',
              alignItems: 'center',
              margin: 0
            }}
          >
            {config.icon}
            {config.text.toUpperCase()}
          </span>
        )}
      </div>
      
      <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-white)', marginBottom: '12px' }}>
        {state.idealCategory || state.recommendedSpecialist}
      </h2>

      {state.recommendedSpecialist === 'Emergency Services' && (
        <div className="emergency-alert-box">
          <AlertTriangle size={24} color="#f87171" style={{ float: 'left', marginRight: '12px', marginTop: '2px' }} />
          <strong>CRITICAL EMERGENCY:</strong> Your symptoms indicate a high-risk medical emergency. <strong>Please visit the nearest Emergency Room (ER) or call Emergency Services (911) immediately.</strong> Do not attempt to schedule a wellness appointment.
        </div>
      )}

      {state.urgency === 'Urgent' && state.recommendedSpecialist !== 'Emergency Services' && (
        <div className="emergency-alert-box-urgent">
          <AlertTriangle size={20} color="#f87171" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '700', color: '#f87171' }}>Emergency Warning</h4>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: '#fca5a5' }}>
              Potential emergency detected. If you are experiencing chest pain, breathing difficulty, or severe symptoms, please visit the nearest Emergency Room (ER) immediately.
            </p>
          </div>
        </div>
      )}

      <p style={{ fontSize: '15px', color: 'var(--color-muted)', marginBottom: '40px', lineHeight: 1.6 }}>
        {state.recommendationExplanation}
      </p>

      {state.recommendedSpecialist === 'Emergency Services' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a 
            href="tel:911" 
            className="btn-danger w-full text-center animate-pulse emergency-call-btn" 
          >
            🚨 Call Emergency Services (911)
          </a>
          <a 
            href="https://www.google.com/maps/search/?api=1&query=emergency+room+near+me" 
            target="_blank" 
            rel="noopener noreferrer"
            className="btn-primary w-full text-center" 
            style={{ 
              padding: '16px', 
              display: 'block', 
              textDecoration: 'none', 
              fontWeight: '700'
            }}
          >
            📍 Find Nearest Emergency Room (ER)
          </a>
          <button 
            type="button"
            className="btn-danger w-full" 
            onClick={() => onNavigate('/')} 
            style={{ background: 'transparent' }}
          >
            Go Back to Homepage
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button type="button" className="btn-primary w-full" onClick={handleAccept} style={{ padding: '16px' }}>
            Accept & Book Appointment
          </button>
          <button type="button" className="btn-danger w-full" onClick={handleReject} style={{ background: 'transparent' }}>
            Not right for me
          </button>
        </div>
      )}
    </div>
  );
};

export default SpecialistActionCard;
