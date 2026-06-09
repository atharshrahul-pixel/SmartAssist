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

  const [detectingLocation, setDetectingLocation] = useState(false);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://p01--smart-assist-backend--qnbs82bxhg66.code.run/api');

  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      setDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const roundedLat = Math.round(latitude * 100) / 100;
          const roundedLng = Math.round(longitude * 100) / 100;
          updateState({ lat: roundedLat, lng: roundedLng });
          localStorage.setItem('user_lat', roundedLat);
          localStorage.setItem('user_lng', roundedLng);

          try {
            const response = await fetch(`${BACKEND_URL}/specialists/reverse-geocode`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lat: roundedLat, lng: roundedLng })
            });
            const geoData = await response.json();
            if (geoData.success && geoData.pincode) {
              setFormState(prev => ({ ...prev, locationQuery: geoData.pincode }));
            } else {
              setFormState(prev => ({ ...prev, locationQuery: `${roundedLat}, ${roundedLng}` }));
            }
          } catch (err) {
            console.error('Error during reverse geocoding:', err.message);
            setFormState(prev => ({ ...prev, locationQuery: `${roundedLat}, ${roundedLng}` }));
          }
          setDetectingLocation(false);
        },
        async (error) => {
          console.warn('Geolocation permission denied or unavailable. Trying last known location.');
          const lastLat = localStorage.getItem('user_lat');
          const lastLng = localStorage.getItem('user_lng');
          if (lastLat && lastLng) {
            const latVal = parseFloat(lastLat);
            const lngVal = parseFloat(lastLng);
            updateState({ lat: latVal, lng: lngVal });

            try {
              const response = await fetch(`${BACKEND_URL}/specialists/reverse-geocode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat: latVal, lng: lngVal })
              });
              const geoData = await response.json();
              if (geoData.success && geoData.pincode) {
                setFormState(prev => ({ ...prev, locationQuery: geoData.pincode }));
              } else {
                setFormState(prev => ({ ...prev, locationQuery: `${latVal}, ${lngVal}` }));
              }
            } catch (err) {
              setFormState(prev => ({ ...prev, locationQuery: `${latVal}, ${lngVal}` }));
            }
          }
          setDetectingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 8000,
          maximumAge: 60000
        }
      );
    }
  };

  const handleClearLocation = () => {
    updateState({ lat: null, lng: null });
    setFormState(prev => ({ ...prev, locationQuery: '' }));
  };

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
                locationQuery={formState.locationQuery}
                setLocationQuery={(val) => setFormState(prev => ({ ...prev, locationQuery: val }))}
                hasLocation={!!appContextState.lat && !!appContextState.lng}
                onDetectLocation={handleDetectLocation}
                onClearLocation={handleClearLocation}
                detectingLocation={detectingLocation}
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
