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
