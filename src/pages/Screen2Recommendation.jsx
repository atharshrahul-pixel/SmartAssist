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

  useEffect(() => {
    if (!state.recommendedSpecialist) {
      navigate('/');
    }
    const timer = setTimeout(() => {
      setBarWidth(85);
    }, 300);
    return () => clearTimeout(timer);
  }, [state.recommendedSpecialist, navigate]);

  const handleAccept = () => {
    updateState({ accepted: true, finalSpecialist: null });
    navigate('/specialists');
  };

  const handleReject = () => {
    updateState({ accepted: false });
    navigate('/rejection');
  };

  if (!state.recommendedSpecialist) return null;

  const detectedKeywords = specialistKeywords[state.recommendedSpecialist].filter(word => 
    state.problem.toLowerCase().includes(word)
  );

  return (
    <div className="page-transition" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stepper currentStep={2} />
      
      <div className="container" style={{ flex: 1 }}>
        <div className="text-center mb-xl">
          <span className="pill-tag mb-lg">ANALYSIS COMPLETE</span>
          <h1 style={{ fontSize: '48px', lineHeight: '1.1', marginBottom: 'var(--sp-md)' }}>
            We found your <span className="accent-word" style={{ color: 'var(--color-orange)' }}>specialist</span>
          </h1>
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
              
              <p style={{ fontSize: '15px', color: 'var(--color-muted)', marginBottom: '40px', lineHeight: 1.6 }}>
                Expert care tailored for your specific symptoms and health history.
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
