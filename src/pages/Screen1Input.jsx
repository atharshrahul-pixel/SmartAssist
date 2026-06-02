import { useState, useContext, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../App';
import Stepper from '../components/Stepper';
import HelpTooltip from '../components/HelpTooltip';
import { translateError } from '../utils/errorTranslator';
import { Zap, Shield, Clock, Mic, Square, AlertCircle } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://p01--smart-assist-backend--qnbs82bxhg66.code.run/api');

const words = ['health', 'smile', 'fitness', 'muscles', 'wellness'];

const Screen1Input = () => {
  const { t } = useTranslation();
  const { state, updateState, user } = useContext(AppContext);
  const navigate = useNavigate();
  const [name, setName] = useState(state.name || '');
  const [email, setEmail] = useState(state.email || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [triageError, setTriageError] = useState('');
  const [loading, setLoading] = useState(false);

  const [appointmentFor, setAppointmentFor] = useState(state.appointmentFor || 'myself');
  const [otherName, setOtherName] = useState(state.otherName || '');

  useEffect(() => {
    if (user) {
      if (appointmentFor === 'myself') {
        setName(user.name);
        setEmail(user.email);
      } else if (appointmentFor === 'other') {
        setName(otherName);
        setEmail(user.email);
      } else {
        setName(appointmentFor);
        setEmail(user.email);
      }
    }
  }, [appointmentFor, otherName, user]);

  const [triageStarted, setTriageStarted] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const [wordIndex, setWordIndex] = useState(0);
  const chatBottomRef = useRef(null);

  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [micError, setMicError] = useState(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError('Audio recording is not supported in this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
        'audio/mp4',
        'audio/aac',
      ];
      let selectedMimeType = '';
      for (const mime of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mime)) {
          selectedMimeType = mime;
          break;
        }
      }

      const options = selectedMimeType ? { mimeType: selectedMimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: selectedMimeType || 'audio/webm' });
        await handleTranscribe(audioBlob);
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 59) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err) {
      console.error(err);
      setMicError('Microphone access denied or error occurred.');
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setRecording(false);
  };

  const handleTranscribe = async (audioBlob) => {
    setTranscribing(true);
    setMicError(null);

    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.wav');

    try {
      const response = await fetch(`${BACKEND_URL}/recommendations/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Server returned error response');
      }

      const data = await response.json();
      if (data.success && data.text) {
        setChatInput(data.text);
      } else {
        throw new Error(data.message || 'Transcription failed.');
      }
    } catch (err) {
      console.error(err);
      setMicError('Failed to transcribe audio. Please try again.');
    } finally {
      setTranscribing(false);
    }
  };

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
    setTriageError('');
    if (appointmentFor === 'other' && !otherName.trim()) {
      setErrorMsg(t('error_patient_name'));
      return;
    }
    if (!user) {
      if (!name.trim()) {
        setErrorMsg(t('error_your_name'));
        return;
      }
      if (!email.trim()) {
        setErrorMsg(t('error_your_email'));
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setErrorMsg(t('error_valid_email'));
        return;
      }
    }
    setErrorMsg('');
    updateState({
      name: name.trim(),
      email: email.trim(),
      appointmentFor,
      otherName: appointmentFor === 'other' ? otherName.trim() : ''
    });
    setTriageStarted(true);
    setChatHistory([
      {
        role: 'assistant',
        content: t('nurse_greeting', { name: name.trim() })
      }
    ]);
  };

  const handleResetChat = () => {
    setChatInput('');
    setTriageError('');
    setChatHistory([
      {
        role: 'assistant',
        content: t('nurse_greeting', { name: name.trim() })
      }
    ]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const messageText = chatInput.trim();
    if (!messageText || messageText.length > 500 || loading || userTurnCount >= 3) return;

    setTriageError('');
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
          const problemText = updatedHistory.find(m => m.role === 'user')?.content || messageText;
          const specialistKeywords = {
            'Dentist': ['tooth','teeth','gum','dental','jaw','cavity','molar','ache','toothache'],
            'Physiotherapist': ['muscle','back','knee','joint','sprain','physio','posture','shoulder','hip','neck','pain'],
            'Gym Trainer': ['weight','fitness','gym','exercise','cardio','strength','workout','fat','bulk','slim','tone'],
            'Salon Specialist': ['hair','skin','facial','salon','grooming','nails','beard','eyebrow','wax','cut','color']
          };
          const keywords = (specialistKeywords[data.specialistCategory] || []).filter(word => 
            problemText.toLowerCase().includes(word)
          );

          updateState({
            name,
            email,
            appointmentFor,
            otherName: appointmentFor === 'other' ? otherName.trim() : '',
            problem: problemText,
            recommendedSpecialist: data.specialistCategory,
            idealCategory: data.idealCategory || data.specialistCategory,
            confidence: data.confidence || 85,
            urgency: data.urgency || 'Soon',
            source: data.source,
            recommendationExplanation: data.text,
            chatHistory: updatedHistory,
            detectedKeywords: keywords
          });
          navigate('/recommendation');
        }
      } else {
        setTriageError(translateError(data.message || 'Triage assistant failed. Please try again.'));
      }
    } catch (err) {
      console.error(err);
      setTriageError(translateError('Could not connect to the triage service.'));
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
            <span className="pill-tag mb-lg">{t('ai_powered_triage')}</span>
            <h1 style={{ fontSize: '64px', lineHeight: '1', marginBottom: 'var(--sp-lg)', maxWidth: '600px' }}>
              {t('tell_us_your')}{' '}
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
              {t('concern')}
            </h1>
            <p style={{ color: 'var(--color-dark)', fontSize: '18px', lineHeight: '1.6', maxWidth: '520px', marginBottom: 'var(--sp-xl)', opacity: 0.8 }}>
              {t('triage_description')}
            </p>

            <div className="benefits-list" style={{ marginTop: 'var(--sp-xl)' }}>
              <div className="benefit-item">
                <div className="benefit-icon"><Zap size={14} /></div>
                <span>{t('benefit_1')}</span>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon"><Shield size={14} /></div>
                <span>{t('benefit_2')}</span>
              </div>
              <div className="benefit-item">
                <div className="benefit-icon"><Clock size={14} /></div>
                <span>{t('benefit_3')}</span>
              </div>
            </div>
          </div>

          <div className="split-form">
            {!triageStarted ? (
              <form className="card-light" onSubmit={handleStartTriage}>
                {errorMsg && (
                  <div style={{
                    padding: '12px',
                    background: 'rgba(224, 88, 48, 0.1)',
                    color: 'var(--color-orange)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} />
                    <span>
                      {errorMsg}
                    </span>
                  </div>
                )}

                {user ? (
                  <>
                    <div className="mb-lg">
                      <label className="form-label">
                        {t('appointment_for_label')}
                        <HelpTooltip text={t('tooltip_appointment_for')} />
                      </label>
                      <select 
                        className="input-field" 
                        value={appointmentFor} 
                        onChange={(e) => {
                          setAppointmentFor(e.target.value);
                          setErrorMsg('');
                        }}
                      >
                        <option value="myself">{t('myself')} ({user.name})</option>
                        {user.familyProfiles && user.familyProfiles.map((member) => (
                          <option key={member._id} value={member.name}>
                            {member.name} ({member.relationship})
                          </option>
                        ))}
                        <option value="other">{t('someone_else')}</option>
                      </select>
                    </div>

                    {appointmentFor === 'other' && (
                      <div className="mb-lg">
                        <label className="form-label">
                          {t('patient_name')}
                          <HelpTooltip text={t('tooltip_patient_name')} />
                        </label>
                        <input 
                          type="text" 
                          className="input-field" 
                          placeholder={t('patient_name_placeholder')}
                          value={otherName}
                          onChange={(e) => {
                            setOtherName(e.target.value);
                            setErrorMsg('');
                          }}
                          style={{ borderColor: errorMsg && appointmentFor === 'other' && !otherName.trim() ? 'red' : '' }}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-lg">
                      <label className="form-label">
                        {t('your_name')}
                        <HelpTooltip text={t('tooltip_your_name')} />
                      </label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder={t('enter_your_full_name')}
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setErrorMsg('');
                        }}
                        style={{ borderColor: errorMsg && !name.trim() ? 'red' : '' }}
                      />
                    </div>

                    <div className="mb-lg">
                      <label className="form-label">
                        {t('email_address')}
                        <HelpTooltip text={t('tooltip_email')} />
                      </label>
                      <input 
                        type="email" 
                        className="input-field" 
                        placeholder={t('enter_your_email')}
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setErrorMsg('');
                        }}
                        style={{ borderColor: errorMsg && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ? 'red' : '' }}
                      />
                    </div>
                  </>
                )}

                <button 
                  type="submit" 
                  className="btn-primary w-full"
                  disabled={loading}
                  style={{ padding: '16px' }}
                >
                  {t('start_triage')} →
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
                    <span style={{ fontWeight: '700', fontSize: '15px' }}>{t('ai_triage_nurse')}</span>
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
                    {t('reset_chat')}
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
                          {userTurnCount >= 3 ? t('finalizing') : t('nurse_typing')}
                        </span>
                        <span className="dot-flashing" />
                      </div>
                    </div>
                  )}
                  
                  <div ref={chatBottomRef} />
                </div>

                {micError && (
                  <div style={{
                    margin: '8px 16px',
                    padding: '10px 14px',
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    borderRadius: '8px',
                    color: '#b91c1c',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} />
                    <span style={{ flex: 1 }}>{micError}</span>
                    <button 
                      type="button"
                      onClick={() => setMicError(null)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#b91c1c',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        padding: '0 4px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}

                {triageError && (
                  <div style={{
                    margin: '8px 16px',
                    padding: '10px 14px',
                    background: '#fef2f2',
                    border: '1px solid #fee2e2',
                    borderRadius: '8px',
                    color: '#b91c1c',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={16} />
                    <span style={{ flex: 1 }}>{triageError}</span>
                    <button 
                      type="button"
                      onClick={() => setTriageError('')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#b91c1c',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        padding: '0 4px'
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}

                <form onSubmit={handleSendMessage} style={{
                  padding: '16px',
                  background: 'var(--color-white)',
                  borderTop: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={recording ? stopRecording : startRecording}
                      disabled={loading || transcribing || userTurnCount >= 3}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        background: recording ? '#ef4444' : 'var(--color-dark)',
                        color: 'var(--color-white)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.3s'
                      }}
                      title={recording ? "Stop recording" : "Record voice input"}
                    >
                      {recording ? <Square size={18} /> : <Mic size={18} />}
                    </button>

                    <input
                      type="text"
                      className="input-field"
                      placeholder={
                        recording 
                          ? t('recording_status', { seconds: recordingSeconds })
                          : transcribing 
                            ? t('transcribing')
                            : userTurnCount >= 3 
                              ? t('triage_completed')
                              : t('chat_placeholder')
                      }
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      disabled={loading || userTurnCount >= 3 || recording || transcribing}
                      style={{ flex: 1, margin: 0 }}
                    />
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading || !chatInput.trim() || chatInput.length > 500 || userTurnCount >= 3 || recording || transcribing}
                      style={{ padding: '0 20px', minWidth: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {t('send')}
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
                        ? t('finalizing')
                        : `${t('turn')} ${userTurnCount}/3`}
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
