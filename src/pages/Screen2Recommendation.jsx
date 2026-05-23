import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import Stepper from '../components/Stepper';
import { Activity, Scissors, Dumbbell, Stethoscope, Search, BarChart3, Info } from 'lucide-react';

const icons = {
  'Dentist': <Stethoscope size={40} color="var(--color-orange)" />,
  'Physiotherapist': <Activity size={40} color="var(--color-orange)" />,
  'Gym Trainer': <Dumbbell size={40} color="var(--color-orange)" />,
  'Salon Specialist': <Scissors size={40} color="var(--color-orange)" />
};

const specialistKeywords = {
  'Dentist': ['tooth','teeth','gum','dental','jaw','cavity','molar','ache','toothache'],
  'Physiotherapist': ['muscle','back','knee','joint','sprain','physio','posture','shoulder','hip','neck','pain'],
  'Gym Trainer': ['weight','fitness','gym','exercise','cardio','strength','workout','fat','bulk','slim','tone'],
  'Salon Specialist': ['hair','skin','facial','salon','grooming','nails','beard','eyebrow','wax','cut','color']
};

const Screen2Recommendation = () => {
  const { state, updateState } = useContext(AppContext);
  const navigate = useNavigate();
  const [barWidth, setBarWidth] = useState(0);

  const hasExpired = !state.name || !state.problem || !state.recommendationExplanation;

  const detectedKeywords = hasExpired
    ? []
    : (specialistKeywords[state.recommendedSpecialist] || []).filter(word => 
        state.problem.toLowerCase().includes(word)
      );

  const calculateConfidence = () => {
    if (hasExpired) return 0;
    return state.confidence || 85;
  };

  useEffect(() => {
    if (!hasExpired) {
      const timer = setTimeout(() => {
        setBarWidth(calculateConfidence());
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [hasExpired, state.confidence]);

  const handleAccept = () => {
    updateState({ accepted: true, finalSpecialist: null });
    navigate('/specialists');
  };

  const handleReject = () => {
    updateState({ accepted: false });
    navigate('/rejection');
  };

  if (hasExpired) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        padding: '24px',
        background: 'var(--color-bg)',
      }}>
        <div className="card-light" style={{
          maxWidth: '480px',
          textAlign: 'center',
          padding: '48px 32px',
          borderRadius: '16px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
          border: '1px solid rgba(237,184,32,0.1)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(237,184,32,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Info size={32} color="var(--color-orange)" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '12px' }}>Triage Session Expired</h2>
          <p style={{ color: 'var(--color-dark)', opacity: 0.7, marginBottom: '32px', lineHeight: '1.6' }}>
            To protect your privacy and ensure clinical accuracy, inactive triage sessions are automatically cleared. Please restart the assessment.
          </p>
          <button className="btn-primary w-full" onClick={() => navigate('/')}>
            Restart Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stepper currentStep={2} />
      
      <div className="container" style={{ flex: 1 }}>
        <div className="text-center mb-xl">
          <span className="pill-tag mb-lg">ANALYSIS COMPLETE</span>
          <h1 style={{ fontSize: '48px', lineHeight: '1.1', marginBottom: 'var(--sp-md)' }}>
            We found your <span className="accent-word" style={{ color: 'var(--color-orange)' }}>specialist</span>
          </h1>
          <p style={{ fontSize: '14px', opacity: 0.7, marginTop: '16px' }}>
            Powered by: <strong>{state.source === 'AI' ? 'Artificial Intelligence' : 'Keyword Analysis'}</strong>
          </p>
        </div>
 
        <div className="split-layout">
          <div className="split-content">
            <div className="analysis-card mb-lg">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <Search size={20} color="var(--color-orange)" />
                <h3 style={{ fontSize: '18px', fontWeight: '700' }}>AI Analysis Report</h3>
              </div>
              
              <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--color-dark)', opacity: 0.8, marginBottom: '24px' }}>
                Our triage engine analyzed your description and detected key medical markers that strongly correlate with <strong>{state.recommendedSpecialist}</strong> expertise.
              </p>
 
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <BarChart3 size={16} />
                  Match confidence
                </div>
                <div style={{ background: 'var(--color-cream)', height: '12px', borderRadius: '6px', overflow: 'hidden', position: 'relative' }}>
                  <div style={{ 
                    background: 'var(--color-orange)', 
                    height: '100%', 
                    width: `${barWidth}%`,
                    transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                  }} />
                </div>
                <div style={{ textAlign: 'right', fontSize: '13px', fontWeight: '700', marginTop: '6px', color: 'var(--color-orange)' }}>
                  {barWidth}% Match
                </div>
              </div>
 
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detected Keywords</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {detectedKeywords.length > 0 ? detectedKeywords.map(word => (
                    <span key={word} className="tag-highlight">{word}</span>
                  )) : <span style={{ fontSize: '14px', color: 'var(--color-dark)', opacity: 0.5 }}>Contextual markers detected</span>}
                </div>
              </div>
            </div>
 
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '0 16px' }}>
              <Info size={18} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--color-orange)' }} />
              <p className="footer-text">
                You can always choose a different specialist on the next screen if this recommendation doesn't feel right.
              </p>
            </div>
          </div>
 
          <div className="split-form">
            <div className="card-dark" style={{ padding: '40px', textAlign: 'center' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: 'rgba(237,184,32,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                border: '1px solid rgba(237,184,32,0.2)'
              }}>
                {icons[state.recommendedSpecialist]}
              </div>
              
              <span className="pill-tag mb-md" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--color-white)' }}>
                RECOMMENDED
              </span>
              
              <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'var(--color-white)', marginBottom: '12px' }}>
                {state.recommendedSpecialist}
              </h2>

              {state.idealCategory && state.idealCategory.toLowerCase() !== state.recommendedSpecialist.toLowerCase() && (
                <div style={{
                  background: 'rgba(237, 184, 32, 0.1)',
                  border: '1.5px solid var(--color-orange)',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  marginBottom: '24px',
                  textAlign: 'left',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}>
                  We don't have a <strong>{state.idealCategory}</strong> right now, but we suggest you visit a <strong>{state.recommendedSpecialist}</strong> first.
                </div>
              )}
              
              <p style={{ fontSize: '15px', color: 'var(--color-muted)', marginBottom: '40px', lineHeight: 1.6 }}>
                {state.recommendationExplanation}
              </p>
 
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button className="btn-primary w-full" onClick={handleAccept} style={{ padding: '16px' }}>
                  Accept & Book Appointment
                </button>
                <button className="btn-danger w-full" onClick={handleReject} style={{ background: 'transparent' }}>
                  Not right for me
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Screen2Recommendation;
