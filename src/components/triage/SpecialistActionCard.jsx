import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

const SpecialistActionCard = ({
  state,
  hasSpecialists,
  getSpecialistIcon,
  handleAccept,
  handleReject,
  onNavigate,
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

      {state.idealCategory && state.idealCategory.toLowerCase() !== state.recommendedSpecialist.toLowerCase() && state.recommendedSpecialist !== 'Emergency Services' && (
        <div className="unavailable-specialist-box">
          We don't have a <strong>{state.idealCategory}</strong> right now.
        </div>
      )}

      {!hasSpecialists && state.recommendedSpecialist !== 'Emergency Services' && (
        <div className="unavailable-specialist-box">
          ℹ️ <strong>Availability Note:</strong> We currently do not have any active <strong>{state.recommendedSpecialist}</strong> specialists registered in our network. You can browse other available specialists.
        </div>
      )}
      
      {!(state.idealCategory && state.idealCategory.toLowerCase() !== state.recommendedSpecialist.toLowerCase() && state.recommendedSpecialist !== 'Emergency Services') && (
        <p style={{ fontSize: '15px', color: 'var(--color-muted)', marginBottom: '40px', lineHeight: 1.6 }}>
          {state.recommendationExplanation}
        </p>
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

      {state.recommendedSpecialist === 'Emergency Services' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a 
            href="tel:911" 
            className="btn-danger w-full text-center animate-pulse" 
            style={{ 
              padding: '16px', 
              display: 'block', 
              textDecoration: 'none', 
              fontWeight: '800', 
              fontSize: '16px',
              backgroundColor: '#ef4444',
              color: 'var(--color-white)',
              borderRadius: 'var(--r-md)',
              boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)',
              animation: 'pulse 1.5s infinite'
            }}
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
      ) : (!hasSpecialists) ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            type="button"
            className="btn-primary w-full" 
            onClick={handleAccept} 
            style={{ padding: '16px' }}
          >
            Browse Available Specialists
          </button>
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
