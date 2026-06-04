import { useEffect, useCallback, useReducer } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://p01--smart-assist-backend--qnbs82bxhg66.code.run/api');

const specialistReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, errorMsg: action.payload };
    case 'FETCH_SUCCESS':
      return { 
        ...state, 
        specialist: action.payload.specialist,
        slotsList: action.payload.slotsList,
        modesConfig: action.payload.modesConfig,
        profileForm: action.payload.profileForm,
        photoPreview: action.payload.photoPreview,
        reapplyData: action.payload.reapplyData,
        reapplyPreview: action.payload.photoPreview,
        loading: false,
        errorMsg: ''
      };
    case 'SET_APPOINTMENTS':
      return { ...state, appointments: action.payload };
    case 'SET_EARNINGS':
      return { ...state, earnings: action.payload };
    case 'SET_NEW_SLOT':
      return { ...state, newSlot: action.payload };
    case 'ADD_SLOT':
      return { ...state, slotsList: [...state.slotsList, action.payload].sort(), newSlot: '' };
    case 'REMOVE_SLOT':
      return { ...state, slotsList: state.slotsList.filter(s => s !== action.payload) };
    case 'SET_MODES_CONFIG':
      return { ...state, modesConfig: action.payload };
    case 'SET_PROFILE_FIELD':
      return { ...state, profileForm: { ...state.profileForm, [action.field]: action.value } };
    case 'SET_PHOTO':
      return { 
        ...state, 
        profileForm: { ...state.profileForm, profilePhoto: action.payload },
        photoPreview: action.payload
      };
    case 'SET_REAPPLY_FIELD':
      return { ...state, reapplyData: { ...state.reapplyData, [action.field]: action.value } };
    case 'SET_REAPPLY_PHOTO':
      return { 
        ...state, 
        reapplyData: { ...state.reapplyData, profilePhoto: action.payload },
        reapplyPreview: action.payload
      };
    case 'SET_SUMMARY':
      return { ...state, activeSummary: action.payload };
    case 'SET_SUMMARY_LOADING':
      return { ...state, summaryLoading: action.payload };
    case 'SET_SAVE_LOADING':
      return { ...state, saveLoading: action.payload };
    case 'SET_REAPPLY_LOADING':
      return { ...state, reapplyLoading: action.payload };
    default:
      return state;
  }
};

export const useSpecialistDashboard = (token, navigate, logoutUser) => {
  const [dbState, dispatch] = useReducer(specialistReducer, {
    specialist: null,
    loading: true,
    errorMsg: '',
    activeTab: 'appointments',
    appointments: [],
    activeSummary: null,
    summaryLoading: false,
    earnings: { totalEarnings: 0, earningsList: [] },
    profileForm: {
      name: '',
      specialization: 'Dentist',
      experience: '',
      clinicName: '',
      bio: '',
      profilePhoto: ''
    },
    photoPreview: null,
    saveLoading: false,
    newSlot: '',
    slotsList: [],
    modesConfig: {
      inPerson: { enabled: true, price: 100, duration: '30 mins' },
      video: { enabled: true, price: 60, duration: '20 mins' },
      chat: { enabled: true, price: 30, duration: '15 mins' }
    },
    reapplyData: {
      name: '',
      specialization: 'Dentist',
      experience: '',
      clinicName: '',
      bio: '',
      profilePhoto: ''
    },
    reapplyPreview: null,
    reapplyLoading: false
  });

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/specialists/my/appointments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        dispatch({ type: 'SET_APPOINTMENTS', payload: json.appointments });
      }
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const fetchEarnings = useCallback(async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/specialists/my/earnings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        dispatch({ type: 'SET_EARNINGS', payload: json });
      }
    } catch (err) {
      console.error(err);
    }
  }, [token]);

  const fetchProfile = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: '' });
    try {
      const res = await fetch(`${BACKEND_URL}/specialists/my/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        const spec = json.specialist;
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            specialist: spec,
            slotsList: spec.availableSlots || [],
            modesConfig: spec.appointmentModes || {
              inPerson: { enabled: true, price: 100, duration: '30 mins' },
              video: { enabled: true, price: 60, duration: '20 mins' },
              chat: { enabled: true, price: 30, duration: '15 mins' }
            },
            profileForm: {
              name: spec.name || '',
              specialization: spec.specialization || 'Dentist',
              experience: spec.experience ? parseInt(spec.experience) : '',
              clinicName: spec.clinicName || '',
              bio: spec.bio || '',
              profilePhoto: spec.profilePhoto || ''
            },
            reapplyData: {
              name: spec.name || '',
              specialization: spec.specialization || 'Dentist',
              experience: spec.experience ? parseInt(spec.experience) : '',
              clinicName: spec.clinicName || '',
              bio: spec.bio || '',
              profilePhoto: spec.profilePhoto || ''
            },
            photoPreview: spec.profilePhoto
          }
        });

        if (spec.status === 'approved') {
          fetchAppointments();
          fetchEarnings();
        }
      } else {
        dispatch({ type: 'SET_ERROR', payload: json.message || 'Failed to retrieve profile.' });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to profile server.' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [token, fetchAppointments, fetchEarnings]);

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else {
      (async () => {
        await fetchProfile();
      })();
    }
  }, [token, navigate, fetchProfile]);

  const fetchPrevisitSummary = async (bookingId) => {
    dispatch({ type: 'SET_SUMMARY_LOADING', payload: true });
    try {
      const res = await fetch(`${BACKEND_URL}/specialists/my/appointments/${bookingId}/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        dispatch({ type: 'SET_SUMMARY', payload: json.summary });
      } else {
        alert(json.message || 'Failed to fetch summary');
      }
    } catch {
      alert('Network error');
    } finally {
      dispatch({ type: 'SET_SUMMARY_LOADING', payload: false });
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SET_SAVE_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: '' });
    try {
      const res = await fetch(`${BACKEND_URL}/specialists/my/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dbState.profileForm)
      });
      const json = await res.json();
      if (json.success) {
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            specialist: json.specialist,
            slotsList: json.specialist.availableSlots || [],
            modesConfig: json.specialist.appointmentModes || dbState.modesConfig,
            profileForm: dbState.profileForm,
            photoPreview: dbState.photoPreview,
            reapplyData: dbState.reapplyData
          }
        });
        alert('Profile details updated successfully!');
      } else {
        dispatch({ type: 'SET_ERROR', payload: json.message || 'Profile save failed.' });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Network error.' });
    } finally {
      dispatch({ type: 'SET_SAVE_LOADING', payload: false });
    }
  };

  const handleSaveAvailability = async () => {
    dispatch({ type: 'SET_SAVE_LOADING', payload: true });
    try {
      const slotsRes = await fetch(`${BACKEND_URL}/specialists/my/slots`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ slots: dbState.slotsList })
      });

      const modesRes = await fetch(`${BACKEND_URL}/specialists/my/modes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ appointmentModes: dbState.modesConfig })
      });

      const slotsJson = await slotsRes.json();
      const modesJson = await modesRes.json();

      if (slotsJson.success && modesJson.success) {
        dispatch({
          type: 'FETCH_SUCCESS',
          payload: {
            specialist: slotsJson.specialist,
            slotsList: slotsJson.specialist.availableSlots || [],
            modesConfig: slotsJson.specialist.appointmentModes || dbState.modesConfig,
            profileForm: dbState.profileForm,
            photoPreview: dbState.photoPreview,
            reapplyData: dbState.reapplyData
          }
        });
        alert('Availability slots and pricing configured successfully!');
      } else {
        alert('Failed to save availability settings.');
      }
    } catch {
      alert('Connection error');
    } finally {
      dispatch({ type: 'SET_SAVE_LOADING', payload: false });
    }
  };

  const handleReapply = async (e) => {
    e.preventDefault();
    dispatch({ type: 'SET_REAPPLY_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: '' });
    try {
      const res = await fetch(`${BACKEND_URL}/auth/reapply/specialist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dbState.reapplyData)
      });
      const json = await res.json();
      if (json.success) {
        alert('Reapplication submitted successfully!');
        fetchProfile();
      } else {
        dispatch({ type: 'SET_ERROR', payload: json.message || 'Reapplication failed.' });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: 'Connection error.' });
    } finally {
      dispatch({ type: 'SET_REAPPLY_LOADING', payload: false });
    }
  };

  const handleAddSlot = () => {
    if (!dbState.newSlot.trim()) return;
    if (dbState.slotsList.includes(dbState.newSlot.trim())) return;
    dispatch({ type: 'ADD_SLOT', payload: dbState.newSlot.trim() });
  };

  const handleRemoveSlot = (slotToRemove) => {
    dispatch({ type: 'REMOVE_SLOT', payload: slotToRemove });
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return {
    dbState,
    dispatch,
    fetchProfile,
    fetchPrevisitSummary,
    handleUpdateProfile,
    handleSaveAvailability,
    handleReapply,
    handleAddSlot,
    handleRemoveSlot,
    handleLogout
  };
};
