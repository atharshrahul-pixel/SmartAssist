import { useEffect, useState, use, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Stepper from '../components/Stepper';
import ExpiredSession from '../components/triage/ExpiredSession';
import AIReportCard from '../components/triage/AIReportCard';
import SpecialistActionCard from '../components/triage/SpecialistActionCard';
import { Activity, Scissors, Dumbbell, Stethoscope, AlertTriangle, Info } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://p01--smart-assist-backend--qnbs82bxhg66.code.run/api');

const getSpecialistIcon = (category) => {
  const normalized = (category || '').toLowerCase();
  if (normalized.includes('dent')) return <Stethoscope size={40} color="var(--color-orange)" />;
  if (normalized.includes('physio') || normalized.includes('therap')) return <Activity size={40} color="var(--color-orange)" />;
  if (normalized.includes('gym') || normalized.includes('trainer') || normalized.includes('fit')) return <Dumbbell size={40} color="var(--color-orange)" />;
  if (normalized.includes('salon') || normalized.includes('groom') || normalized.includes('style') || normalized.includes('cut')) return <Scissors size={40} color="var(--color-orange)" />;
  if (normalized.includes('emerg') || normalized.includes('service') || normalized.includes('er')) return <AlertTriangle size={40} color="#ef4444" />;
  return <Stethoscope size={40} color="var(--color-orange)" />;
};

const specialistKeywords = {
  'Dentist': ['tooth','teeth','gum','dental','jaw','cavity','molar','ache','toothache'],
  'Physiotherapist': ['muscle','back','knee','joint','sprain','physio','posture','shoulder','hip','neck','pain'],
  'Gym Trainer': ['weight','fitness','gym','exercise','cardio','strength','workout','fat','bulk','slim','tone'],
  'Salon Specialist': ['hair','skin','facial','salon','grooming','nails','beard','eyebrow','wax','cut','color'],
  'Emergency Services': ['chest pain','shortness of breath','breathing difficulty','heavy bleeding','severe head injury','unconscious','sudden weakness','stroke','heart attack']
};

const Screen2Recommendation = () => {
  const { state, updateState } = use(AppContext);
  const navigate = useNavigate();
  const [barWidth, setBarWidth] = useState(0);

  const hasExpired = !state.name || !state.problem || !state.recommendationExplanation;

  const detectedKeywords = useMemo(() => {
    if (hasExpired) return [];
    const allKeywords = Array.from(new Set(Object.values(specialistKeywords).flat()));
    return allKeywords.filter(word => 
      state.problem.toLowerCase().includes(word.toLowerCase())
    );
  }, [hasExpired, state.problem]);

  const [hasSpecialists, setHasSpecialists] = useState(true);

  // react-doctor-disable-next-line react-doctor/no-fetch-in-effect
  useEffect(() => {
    if (hasExpired) return;
    let active = true;

    const queryParams = new URLSearchParams();
    if (state.recommendedSpecialist) {
      queryParams.append('category', state.recommendedSpecialist);
    }
    if (state.lat && state.lng) {
      queryParams.append('lat', state.lat);
      queryParams.append('lng', state.lng);
    }

    fetch(`${BACKEND_URL}/specialists?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        if (data.success && state.recommendedSpecialist) {
          const matching = data.specialists.filter(s => {
            const specCat = (s.category || s.specialization || '').toLowerCase().trim();
            const recCat = state.recommendedSpecialist.toLowerCase().trim();
            const normSpec = (specCat === 'gym trainer' || specCat === 'gym') ? 'gym' : specCat;
            const normRec = (recCat === 'gym trainer' || recCat === 'gym') ? 'gym' : recCat;
            return normSpec === normRec;
          });
          setHasSpecialists(matching.length > 0);
        }
      })
      .catch(err => {
        if (active) console.error("Error checking specialist availability:", err);
      });
    return () => {
      active = false;
    };
  }, [hasExpired, state.recommendedSpecialist, state.lat, state.lng]);

  useEffect(() => {
    if (!hasExpired) {
      const timer = setTimeout(() => {
        setBarWidth(state.confidence || 85);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [hasExpired, state.confidence]);

  const handleAccept = () => {
    updateState({ 
      accepted: true, 
      finalSpecialist: null,
      recommendedSpecialist: state.idealCategory || state.recommendedSpecialist
    });
    navigate('/specialists');
  };

  const handleAcceptFallback = () => {
    updateState({ accepted: true, finalSpecialist: null, recommendedSpecialist: 'All' });
    navigate('/specialists');
  };

  const handleReject = () => {
    updateState({ accepted: false });
    navigate('/rejection');
  };

  if (hasExpired) {
    return (
      <div className="page-transition" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
        <style>{`
          .expired-session-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 80vh;
            padding: 24px;
            background: var(--color-bg);
          }
          .expired-session-card {
            max-width: 480px;
            text-align: center;
            padding: 48px 32px;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.05);
            border: 1px solid rgba(237,184,32,0.1);
          }
          .expired-icon-wrapper {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: rgba(237,184,32,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          }
        `}</style>
        <ExpiredSession onRestart={() => navigate('/')} />
      </div>
    );
  }

  return (
    <div className="page-transition" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stepper currentStep={2} />
      
      <style>{`
        .report-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .suspected-condition-box {
          margin-bottom: 24px;
          padding: 14px 16px;
          background: var(--color-cream);
          border-radius: 12px;
          border-left: 4px solid var(--color-orange);
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
        }
        .suspected-condition-label {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          opacity: 0.6;
          font-weight: 700;
          display: block;
          margin-bottom: 4px;
          color: var(--color-dark);
        }
        .suspected-condition-value {
          font-size: 16px;
          color: var(--color-dark);
          display: block;
        }
        .confidence-label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .confidence-bar-bg {
          background: var(--color-cream);
          height: 12px;
          border-radius: 6px;
          overflow: hidden;
          position: relative;
        }
        .confidence-bar-fill {
          background: var(--color-orange);
          height: 100%;
          transition: width 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .confidence-percent {
          text-align: right;
          font-size: 13px;
          font-weight: 700;
          margin-top: 6px;
          color: var(--color-orange);
        }
        .keywords-label {
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .keywords-fallback {
          font-size: 14px;
          color: var(--color-dark);
          opacity: 0.5;
        }
        
        .card-dark-container {
          padding: 40px;
          text-align: center;
        }
        .specialist-icon-container {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background-color: rgba(237,184,32,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          border: 1px solid rgba(237,184,32,0.2);
        }
        .specialist-pill-row {
          display: flex;
          justify-content: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .recommended-pill {
          background: rgba(255,255,255,0.1);
          color: var(--color-white);
          margin: 0;
        }
        .emergency-alert-box {
          background: rgba(239, 68, 68, 0.15);
          border: 2px solid #ef4444;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          text-align: left;
          font-size: 14.5px;
          line-height: 1.6;
          color: #fca5a5;
          animation: fadeInSlideUp 0.3s ease;
        }
        .unavailable-specialist-box {
          background: rgba(237, 184, 32, 0.1);
          border: 1.5px solid var(--color-orange);
          border-radius: 12px;
          padding: 14px 16px;
          margin-bottom: 24px;
          text-align: left;
          font-size: 13px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.9);
        }
        .emergency-alert-box-urgent {
          background: rgba(239, 68, 68, 0.1);
          border: 1.5px solid #ef4444;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
          text-align: left;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          animation: fadeInSlideUp 0.3s ease;
        }
      `}</style>

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
            <AIReportCard
              state={state}
              barWidth={barWidth}
              detectedKeywords={detectedKeywords}
            />

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '0 16px' }}>
              <Info size={18} style={{ marginTop: '2px', flexShrink: 0, color: 'var(--color-orange)' }} />
              <p className="footer-text">
                You can always choose a different specialist on the next screen if this recommendation doesn't feel right.
              </p>
            </div>
          </div>
 
          <div className="split-form">
            <SpecialistActionCard
              state={state}
              hasSpecialists={hasSpecialists}
              getSpecialistIcon={getSpecialistIcon}
              handleAccept={handleAccept}
              handleReject={handleReject}
              onNavigate={navigate}
              handleAcceptFallback={handleAcceptFallback}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Screen2Recommendation;
