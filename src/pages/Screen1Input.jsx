import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import Stepper from '../components/Stepper';
import { Upload, Zap, Shield, Clock } from 'lucide-react';

const keywords = {
  'Dentist': ['tooth','teeth','gum','dental','jaw','cavity','molar','ache','toothache'],
  'Physiotherapist': ['muscle','back','knee','joint','sprain','physio','posture','shoulder','hip','neck','pain'],
  'Gym Trainer': ['weight','fitness','gym','exercise','cardio','strength','workout','fat','bulk','slim','tone'],
  'Salon Specialist': ['hair','skin','facial','salon','grooming','nails','beard','eyebrow','wax','cut','color']
};

const recommend = (text) => {
  const lower = text.toLowerCase();
  let best = null, max = 0;
  for (const [specialist, words] of Object.entries(keywords)) {
    const count = words.filter(w => lower.includes(w)).length;
    if (count > max) { max = count; best = specialist; }
  }
  return best || 'Physiotherapist';
};

const Screen1Input = () => {
  const { state, updateState } = useContext(AppContext);
  const navigate = useNavigate();
  const [name, setName] = useState(state.name || '');
  const [problem, setProblem] = useState(state.problem || '');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || problem.length > 500) {
      setError(true);
      return;
    }
    
    const suggested = recommend(problem);
    updateState({ name, problem, recommendedSpecialist: suggested });
    navigate('/recommendation');
  };

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Stepper currentStep={1} />
      
      <div className="container" style={{ flex: 1 }}>
        <div className="split-layout">
          <div className="split-content">
            <span className="pill-tag mb-lg">AI-POWERED TRIAGE</span>
            <h1 style={{ fontSize: '64px', lineHeight: '1', marginBottom: 'var(--sp-lg)', maxWidth: '600px' }}>
              Tell us your <span className="accent-word" style={{ color: 'var(--color-orange)' }}>health</span> concern
            </h1>
            <p style={{ color: 'var(--color-dark)', fontSize: '18px', lineHeight: '1.6', maxWidth: '520px', marginBottom: 'var(--sp-xl)', opacity: 0.8 }}>
              Describe what you're experiencing and our system will recommend the right specialist for you — instantly.
            </p>

            <div className="benefits-list" style={{ marginTop: 'var(--sp-xl)' }}>
              <div className="benefit-item">
                <div className="benefit-icon"><Zap size={14} /></div>
                <span>Instant AI-powered specialist matching</span>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon"><Shield size={14} /></div>
                <span>100% secure and confidential triage</span>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon"><Clock size={14} /></div>
                <span>Skip the wait — get recommended in seconds</span>
              </div>
            </div>
          </div>

          <div className="split-form">
            <form className="card-light" onSubmit={handleSubmit}>
              <div className="mb-lg">
                <label className="form-label">Your name</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ borderColor: error && !name.trim() ? 'red' : '' }}
                />
              </div>

              <div className="mb-lg">
                <label className="form-label">Describe your problem</label>
                <textarea 
                  className="input-field" 
                  placeholder="e.g. My lower back has been hurting for a week..."
                  style={{ minHeight: '160px', resize: 'vertical', borderColor: error && problem.length > 500 ? 'red' : '' }}
                  value={problem}
                  onChange={(e) => setProblem(e.target.value)}
                />
                <div style={{ textAlign: 'right', fontSize: '14px', color: 'var(--color-muted)', marginTop: '4px' }}>
                  {problem.length} / 500
                </div>
              </div>

              <div className="mb-xl">
                <label className="form-label">Attach a report (optional)</label>
                <div style={{
                  border: '1.5px dashed var(--color-cream-dark)',
                  borderRadius: 'var(--r-md)',
                  padding: '24px 16px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: 'rgba(212, 201, 176, 0.1)'
                }}>
                  <Upload size={24} color="var(--color-muted)" style={{ marginBottom: '8px' }} />
                  <div style={{ fontSize: '15px', color: 'var(--color-dark)', marginBottom: '4px' }}>Drop file here or click to browse</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>PDF or image, max 5MB</div>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary w-full"
                disabled={!name.trim() || problem.length > 500}
                style={{ padding: '16px' }}
              >
                Find My Specialist →
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand">SmartAssist</div>
          <div className="footer-links">
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Support</a>
          </div>
        </div>
        <div className="footer-content footer-copy">
          <p>&copy; 2026 SmartAssist Health AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Screen1Input;
