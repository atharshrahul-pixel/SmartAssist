import { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../App';
import Stepper from '../components/Stepper';
import { Zap, Shield, Clock } from 'lucide-react';

const BACKEND_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://akeno7594-internship-project-backend.hf.space/api';

const words = ['health', 'smile', 'fitness', 'muscles', 'wellness'];

const Screen1Input = () => {
  const { state, updateState } = useContext(AppContext);
  const navigate = useNavigate();
  const [name, setName] = useState(state.name || '');
  const [email, setEmail] = useState(state.email || '');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const [triageStarted, setTriageStarted] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const [wordIndex, setWordIndex] = useState(0);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, loading]);

  const userTurnCount = chatHistory.filter(m => m.role === 'user').length;

  const handleStartTriage = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError(true);
      return;
    }
    setError(false);
    setTriageStarted(true);
    setChatHistory([
      {
        role: 'assistant',
        content: `Hi ${name.trim()}, I'm your AI Triage Nurse. What health or wellness symptoms or concerns are you experiencing today?`
      }
    ]);
  };

  const handleResetChat = () => {
    setChatInput('');
    setChatHistory([
      {
        role: 'assistant',
        content: `Hi ${name.trim()}, I'm your AI Triage Nurse. What health or wellness symptoms or concerns are you experiencing today?`
      }
    ]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const messageText = chatInput.trim();
    if (!messageText || messageText.length > 500 || loading || userTurnCount >= 3) return;

    const updatedHistory = [...chatHistory, { role: 'user', content: messageText }];
    setChatHistory(updatedHistory);
    setChatInput('');
    setLoading(true);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const simulateFallback = urlParams.get('simulateFallback') === 'true';
      const triageEndpoint = `${BACKEND_URL}/recommendations/triage${simulateFallback ? '?simulateFallback=true' : ''}`;

      const response = await fetch(triageEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          messages: updatedHistory
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.type === 'question') {
          setChatHistory([...updatedHistory, { role: 'assistant', content: data.text }]);
        } else if (data.type === 'recommendation') {
          updateState({
            name,
            email,
            problem: updatedHistory.find(m => m.role === 'user')?.content || messageText,
            recommendedSpecialist: data.specialistCategory,
            source: data.source,
            recommendationExplanation: data.text
          });
          navigate('/recommendation');
        }
      } else {
        alert(data.message || 'Triage assistant failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Could not connect to the triage service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Stepper currentStep={1} />
      
      <style>{`
        .dot-flashing {
          position: relative;
          width: 6px;
          height: 6px;
          border-radius: 5px;
          background-color: var(--color-orange);
          color: var(--color-orange);
          animation: dot-flashing 1s infinite linear alternate;
          animation-delay: 0.5s;
          margin-left: 12px;
          display: inline-block;
        }
        .dot-flashing::before, .dot-flashing::after {
          content: "";
          display: inline-block;
          position: absolute;
          top: 0;
        }
        .dot-flashing::before {
          left: -12px;
          width: 6px;
          height: 6px;
          border-radius: 5px;
          background-color: var(--color-orange);
          color: var(--color-orange);
          animation: dot-flashing 1s infinite linear alternate;
          animation-delay: 0s;
        }
        .dot-flashing::after {
          left: 12px;
          width: 6px;
          height: 6px;
          border-radius: 5px;
          background-color: var(--color-orange);
          color: var(--color-orange);
          animation: dot-flashing 1s infinite linear alternate;
          animation-delay: 1s;
        }
        @keyframes dot-flashing {
          0% {
            background-color: var(--color-orange);
          }
          50%, 100% {
            background-color: rgba(237, 184, 32, 0.2);
          }
        }
      `}</style>

      <div className="container" style={{ flex: 1 }}>
        <div className="split-layout">
          <div className="split-content">
            <span className="pill-tag mb-lg">AI-POWERED TRIAGE</span>
            <h1 style={{ fontSize: '64px', lineHeight: '1', marginBottom: 'var(--sp-lg)', maxWidth: '600px' }}>
              Tell us your{' '}
              <span className="text-rotator-container">
                <span className="text-rotator-ghost" aria-hidden="true">wellness</span>
                {words.map((word, idx) => {
                  let className = 'text-rotator-word';
                  if (idx === wordIndex) {
                    className += ' active';
                  } else if (idx === (wordIndex - 1 + words.length) % words.length) {
                    className += ' exit';
                  } else {
                    className += ' idle';
                  }
                  return (
                    <span key={word} className={className}>
                      {word}
                    </span>
                  );
                })}
              </span>{' '}
              concern
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
            {!triageStarted ? (
              <form className="card-light" onSubmit={handleStartTriage}>
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
                  <label className="form-label">Email Address</label>
                  <input 
                    type="email" 
                    className="input-field" 
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ borderColor: error && !email.trim() ? 'red' : '' }}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary w-full"
                  disabled={!name.trim() || !email.trim() || loading}
                  style={{ padding: '16px' }}
                >
                  Start AI Triage Chat →
                </button>
              </form>
            ) : (
              <div className="card-light" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '520px',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                border: '1px solid rgba(237,184,32,0.1)',
                overflow: 'hidden',
                padding: 0
              }}>
                <div style={{
                  padding: '16px 20px',
                  background: 'var(--color-dark)',
                  color: 'var(--color-white)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#22c55e',
                      boxShadow: '0 0 8px #22c55e'
                    }} />
                    <span style={{ fontWeight: '700', fontSize: '15px' }}>AI Triage Nurse</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleResetChat} 
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--color-muted)',
                      fontSize: '12px',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Reset Chat
                  </button>
                </div>

                <div className="chat-messages" style={{
                  flex: 1,
                  padding: '20px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  background: '#faf9f6'
                }}>
                  {chatHistory.map((msg, index) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: isUser ? 'flex-end' : 'flex-start',
                        width: '100%'
                      }}>
                        <div style={{
                          maxWidth: '80%',
                          padding: '12px 16px',
                          borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                          background: isUser ? 'var(--color-dark)' : 'var(--color-white)',
                          color: isUser ? 'var(--color-white)' : 'var(--color-dark)',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                          border: isUser ? 'none' : '1px solid rgba(0,0,0,0.06)',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {msg.content}
                        </div>
                      </div>
                    );
                  })}

                  {loading && (
                    <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                      <div style={{
                        padding: '12px 16px',
                        borderRadius: '16px 16px 16px 4px',
                        background: 'var(--color-white)',
                        color: 'var(--color-muted)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                        border: '1px solid rgba(0,0,0,0.06)',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>
                          {userTurnCount >= 3 ? 'Finalizing recommendation...' : 'Triage Nurse is typing...'}
                        </span>
                        <span className="dot-flashing" />
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatBottomRef} />
                </div>

                <form onSubmit={handleSendMessage} style={{
                  padding: '16px',
                  background: 'var(--color-white)',
                  borderTop: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      className="input-field"
                      placeholder={userTurnCount >= 3 ? "Triage completed." : "Type your response..."}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={loading || userTurnCount >= 3}
                      style={{ flex: 1, margin: 0 }}
                    />
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading || !chatInput.trim() || chatInput.length > 500 || userTurnCount >= 3}
                      style={{ padding: '0 20px', minWidth: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      Send
                    </button>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: 'var(--color-muted)',
                    padding: '0 4px'
                  }}>
                    <span>
                      {userTurnCount >= 3 
                        ? 'Triage complete. Generating recommendation...' 
                        : `Turn ${userTurnCount}/3`}
                    </span>
                    <span style={{ color: chatInput.length > 500 ? 'red' : 'inherit' }}>
                      {chatInput.length} / 500
                    </span>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand">SmartAssist</div>
          <div className="footer-links">
            <Link to="/privacy" className="footer-link">Privacy Policy</Link>
            <Link to="/terms" className="footer-link">Terms of Service</Link>
            <Link to="/support" className="footer-link">Support</Link>
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
