import { useState, use, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import Stepper from '../components/Stepper';
import TriageIntro from '../components/triage/TriageIntro';
import PatientForm from '../components/triage/PatientForm';
import TriageChat from '../components/triage/TriageChat';
import { useTriage } from '../hooks/useTriage';

const words = ['health', 'smile', 'fitness', 'muscles', 'wellness'];

const Screen1Input = () => {
  const { t } = useTranslation();
  const { state: appContextState, updateState, user } = use(AppContext);
  const [wordIndex, setWordIndex] = useState(0);

  const {
    formState,
    setFormState,
    triageState,
    dispatch,
    resolvedName,
    chatBottomRef,
    userTurnCount,
    handleStartTriage,
    handleResetChat,
    handleSendMessage,
    startRecording,
    stopRecording,
  } = useTriage(appContextState, updateState, user);

  const {
    triageStarted,
    chatHistory,
    chatInput,
    loading,
    triageError,
    recording,
    transcribing,
    micError,
    recordingSeconds,
  } = triageState;

  // Rotator effect
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

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
        
        .error-banner-container {
          padding: 12px;
          background: rgba(224, 88, 48, 0.1);
          color: var(--color-orange);
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .chat-card-container {
          display: flex;
          flex-direction: column;
          height: 520px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          border: 1px solid rgba(237,184,32,0.1);
          overflow: hidden;
          padding: 0;
        }
        .chat-header {
          padding: 16px 20px;
          background: var(--color-dark);
          color: var(--color-white);
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #22c55e;
          box-shadow: 0 0 8px #22c55e;
        }
        .reset-btn {
          background: transparent;
          border: none;
          color: var(--color-muted);
          font-size: 12px;
          cursor: pointer;
          text-decoration: underline;
        }
        .chat-messages-container {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: #faf9f6;
        }
        .message-wrapper {
          display: flex;
          width: 100%;
        }
        .message-wrapper.user {
          justify-content: flex-end;
        }
        .message-wrapper.assistant {
          justify-content: flex-start;
        }
        .message-bubble {
          max-width: 80%;
          padding: 12px 16px;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        }
        .message-bubble.user {
          border-radius: 16px 16px 4px 16px;
          background: var(--color-dark);
          color: var(--color-white);
          border: none;
        }
        .message-bubble.assistant {
          border-radius: 16px 16px 16px 4px;
          background: var(--color-white);
          color: var(--color-dark);
          border: 1px solid rgba(0,0,0,0.06);
        }
        .typing-bubble {
          padding: 12px 16px;
          border-radius: 16px 16px 16px 4px;
          background: var(--color-white);
          color: var(--color-muted);
          box-shadow: 0 2px 8px rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.06);
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .alert-banner {
          margin: 8px 16px;
          padding: 10px 14px;
          background: #fef2f2;
          border: 1px solid #fee2e2;
          border-radius: 8px;
          color: #b91c1c;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .alert-banner-close {
          background: transparent;
          border: none;
          color: #b91c1c;
          font-weight: bold;
          cursor: pointer;
          padding: 0 4px;
        }
        .chat-form {
          padding: 16px;
          background: var(--color-white);
          border-top: 1px solid rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .input-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .record-btn {
          padding: 12px;
          border-radius: 8px;
          background: var(--color-dark);
          color: var(--color-white);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.3s;
        }
        .record-btn.recording {
          background: #ef4444;
        }
        .send-btn {
          padding: 0 20px;
          min-width: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .counter-row {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--color-muted);
          padding: 0 4px;
        }
      `}</style>

      <div className="container" style={{ flex: 1 }}>
        <div className="split-layout">
          <TriageIntro words={words} wordIndex={wordIndex} />

          <div className="split-form">
            {!triageStarted ? (
              <PatientForm
                user={user}
                name={formState.name}
                setName={(val) => setFormState(prev => ({ ...prev, name: val }))}
                email={formState.email}
                setEmail={(val) => setFormState(prev => ({ ...prev, email: val }))}
                appointmentFor={formState.appointmentFor}
                setAppointmentFor={(val) => setFormState(prev => ({ ...prev, appointmentFor: val }))}
                otherName={formState.otherName}
                setOtherName={(val) => setFormState(prev => ({ ...prev, otherName: val }))}
                errorMsg={formState.errorMsg}
                setErrorMsg={(val) => setFormState(prev => ({ ...prev, errorMsg: val }))}
                loading={loading}
                onSubmit={handleStartTriage}
              />
            ) : (
              <TriageChat
                chatHistory={chatHistory}
                loading={loading}
                chatInput={chatInput}
                setChatInput={(val) => dispatch({ type: 'SET_CHAT_INPUT', payload: val })}
                recording={recording}
                recordingSeconds={recordingSeconds}
                transcribing={transcribing}
                micError={micError}
                setMicError={(val) => {
                  if (val === null) dispatch({ type: 'CLEAR_MIC_ERROR' });
                  else dispatch({ type: 'MIC_ERROR', payload: val });
                }}
                triageError={triageError}
                setTriageError={(val) => {
                  if (val === '') dispatch({ type: 'CLEAR_TRIAGE_ERROR' });
                  else dispatch({ type: 'TRIAGE_ERROR', payload: val });
                }}
                userTurnCount={userTurnCount}
                resolvedName={resolvedName}
                chatBottomRef={chatBottomRef}
                onResetChat={handleResetChat}
                onSendMessage={handleSendMessage}
                startRecording={startRecording}
                stopRecording={stopRecording}
              />
            )}
          </div>
        </div>
      </div>

      <footer className="site-footer">
        <div className="footer-content">
          <div className="footer-brand">SmartAssist</div>
          <div className="footer-links">
            <Link to="/privacy" className="footer-link">{t('privacy_policy')}</Link>
            <Link to="/terms" className="footer-link">{t('terms_of_service')}</Link>
            <Link to="/support" className="footer-link">{t('support')}</Link>
            <Link to="/specialist/register" className="footer-link" style={{ color: 'var(--color-accent)', fontWeight: '700' }}>{t('specialist_onboarding')}</Link>
          </div>
        </div>
        <div className="footer-content footer-copy">
          <p>{t('copyright')}</p>
        </div>
      </footer>
    </div>
  );
};

export default Screen1Input;
