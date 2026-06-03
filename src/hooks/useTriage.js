import { useState, useEffect, useRef, useReducer } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { translateError } from '../utils/errorTranslator';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://p01--smart-assist-backend--qnbs82bxhg66.code.run/api');

const initialTriageState = {
  triageStarted: false,
  chatHistory: [],
  chatInput: '',
  loading: false,
  triageError: '',
  recording: false,
  transcribing: false,
  micError: null,
  recordingSeconds: 0,
};

function triageReducer(state, action) {
  switch (action.type) {
    case 'START_TRIAGE':
      return {
        ...state,
        triageStarted: true,
        chatHistory: action.payload.chatHistory,
        triageError: '',
      };
    case 'RESET_CHAT':
      return {
        ...state,
        chatInput: '',
        triageError: '',
        chatHistory: action.payload.chatHistory,
      };
    case 'SET_CHAT_INPUT':
      return { ...state, chatInput: action.payload };
    case 'START_SENDING':
      return {
        ...state,
        chatHistory: action.payload.updatedHistory,
        chatInput: '',
        loading: true,
        triageError: '',
      };
    case 'RECEIVE_MESSAGE':
      return {
        ...state,
        chatHistory: action.payload.updatedHistory,
        loading: false,
      };
    case 'TRIAGE_ERROR':
      return {
        ...state,
        triageError: action.payload,
        loading: false,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'START_RECORDING':
      return {
        ...state,
        micError: null,
        recording: true,
        recordingSeconds: 0,
      };
    case 'STOP_RECORDING':
      return {
        ...state,
        recording: false,
      };
    case 'SET_RECORDING_SECONDS':
      return {
        ...state,
        recordingSeconds: action.payload,
      };
    case 'START_TRANSCRIBING':
      return {
        ...state,
        transcribing: true,
        micError: null,
      };
    case 'TRANSCRIBE_SUCCESS':
      return {
        ...state,
        transcribing: false,
        chatInput: action.payload,
      };
    case 'MIC_ERROR':
      return {
        ...state,
        micError: action.payload,
        recording: false,
        transcribing: false,
      };
    case 'CLEAR_MIC_ERROR':
      return { ...state, micError: null };
    case 'CLEAR_TRIAGE_ERROR':
      return { ...state, triageError: '' };
    default:
      return state;
  }
}

export function useTriage(appContextState, updateState, user) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formState, setFormState] = useState({
    name: appContextState.name || '',
    email: appContextState.email || '',
    errorMsg: '',
    appointmentFor: appContextState.appointmentFor || 'myself',
    otherName: appContextState.otherName || '',
  });

  const [triageState, dispatch] = useReducer(triageReducer, initialTriageState);

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

  const resolvedName = user
    ? (formState.appointmentFor === 'myself' ? user.name : (formState.appointmentFor === 'other' ? formState.otherName : formState.appointmentFor))
    : formState.name;

  const resolvedEmail = user ? user.email : formState.email;

  const chatBottomRef = useRef(null);
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

  const handleTranscribe = async (audioBlob) => {
    dispatch({ type: 'START_TRANSCRIBING' });

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
        dispatch({ type: 'TRANSCRIBE_SUCCESS', payload: data.text });
      } else {
        throw new Error(data.message || 'Transcription failed.');
      }
    } catch (err) {
      console.error(err);
      dispatch({ type: 'MIC_ERROR', payload: 'Failed to transcribe audio. Please try again.' });
    }
  };

  const startRecording = async () => {
    audioChunksRef.current = [];
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      dispatch({ type: 'MIC_ERROR', payload: 'Audio recording is not supported in this browser.' });
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
      dispatch({ type: 'START_RECORDING' });

      timerRef.current = setInterval(() => {
        dispatch({
          type: 'SET_RECORDING_SECONDS',
          payload: Math.min(recordingSeconds + 1, 60)
        });
      }, 1000);

    } catch (err) {
      console.error(err);
      dispatch({ type: 'MIC_ERROR', payload: 'Microphone access denied or error occurred.' });
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

    dispatch({ type: 'STOP_RECORDING' });
  };

  useEffect(() => {
    if (recording && recordingSeconds >= 60) {
      stopRecording();
    }
  }, [recording, recordingSeconds]);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, loading]);

  const userTurnCount = chatHistory.filter(m => m.role === 'user').length;

  const handleStartTriage = (e) => {
    e.preventDefault();
    if (formState.appointmentFor === 'other' && !formState.otherName.trim()) {
      setFormState(prev => ({ ...prev, errorMsg: t('error_patient_name') }));
      return;
    }
    if (!user) {
      if (!formState.name.trim()) {
        setFormState(prev => ({ ...prev, errorMsg: t('error_your_name') }));
        return;
      }
      if (!formState.email.trim()) {
        setFormState(prev => ({ ...prev, errorMsg: t('error_your_email') }));
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formState.email.trim())) {
        setFormState(prev => ({ ...prev, errorMsg: t('error_valid_email') }));
        return;
      }
    }
    setFormState(prev => ({ ...prev, errorMsg: '' }));
    updateState({
      name: resolvedName.trim(),
      email: resolvedEmail.trim(),
      appointmentFor: formState.appointmentFor,
      otherName: formState.appointmentFor === 'other' ? formState.otherName.trim() : ''
    });

    dispatch({
      type: 'START_TRIAGE',
      payload: {
        chatHistory: [
          {
            role: 'assistant',
            content: t('nurse_greeting', { name: resolvedName.trim() })
          }
        ]
      }
    });
  };

  const handleResetChat = () => {
    dispatch({
      type: 'RESET_CHAT',
      payload: {
        chatHistory: [
          {
            role: 'assistant',
            content: t('nurse_greeting', { name: resolvedName.trim() })
          }
        ]
      }
    });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const messageText = chatInput.trim();
    if (!messageText || messageText.length > 500 || loading || userTurnCount >= 3) return;

    const updatedHistory = [...chatHistory, { role: 'user', content: messageText }];
    dispatch({ type: 'START_SENDING', payload: { updatedHistory } });

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const simulateFallback = urlParams.get('simulateFallback') === 'true';
      const triageEndpoint = `${BACKEND_URL}/recommendations/triage${simulateFallback ? '?simulateFallback=true' : ''}`;

      const response = await fetch(triageEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: resolvedName,
          messages: updatedHistory
        })
      });

      const data = await response.json();

      if (data.success) {
        if (data.type === 'question') {
          dispatch({
            type: 'RECEIVE_MESSAGE',
            payload: {
              updatedHistory: [...updatedHistory, { role: 'assistant', content: data.text }]
            }
          });
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
            name: resolvedName,
            email: resolvedEmail,
            appointmentFor: formState.appointmentFor,
            otherName: formState.appointmentFor === 'other' ? formState.otherName.trim() : '',
            problem: problemText,
            recommendedSpecialist: data.specialistCategory,
            idealCategory: data.idealCategory || data.specialistCategory,
            suspectedCondition: data.suspectedCondition || '',
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
        dispatch({
          type: 'TRIAGE_ERROR',
          payload: translateError(data.message || 'Triage assistant failed. Please try again.')
        });
      }
    } catch (err) {
      console.error(err);
      dispatch({
        type: 'TRIAGE_ERROR',
        payload: translateError('Could not connect to the triage service.')
      });
    }
  };

  return {
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
  };
}
