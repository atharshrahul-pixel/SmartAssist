import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, Calendar, Mail, Clock, Trash2, Award, Shield, MapPin, X } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://p01--smart-assist-backend--qnbs82bxhg66.code.run/api');

const MODAL_OVERLAY_STYLE = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(28, 16, 8, 0.45)',
  backdropFilter: 'blur(10px)',
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px'
};

const MODAL_CONTENT_STYLE = {
  backgroundColor: 'var(--color-white)',
  borderRadius: 'var(--r-xl)',
  border: '1px solid var(--color-cream-dark)',
  maxWidth: '680px',
  width: '100%',
  maxHeight: '90vh',
  overflowY: 'auto',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  position: 'relative'
};

const CLOSE_BUTTON_STYLE = {
  position: 'absolute',
  top: '20px',
  right: '20px',
  background: 'rgba(28, 16, 8, 0.05)',
  border: 'none',
  borderRadius: '50%',
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: 'var(--color-dark)',
  transition: 'all 0.2s'
};

const MODAL_HEADER_STYLE = {
  padding: '40px 40px 24px 40px',
  borderBottom: '1px solid var(--color-cream-dark)',
  display: 'flex',
  gap: '24px',
  alignItems: 'center'
};

const TAB_BUTTON_BASE_STYLE = {
  background: 'transparent',
  border: 'none',
  padding: '12px 16px',
  fontWeight: '700',
  fontSize: '15px',
  cursor: 'pointer',
  outline: 'none'
};

const initialState = {
  secret: '',
  data: null,
  specialists: [],
  activeTab: 'bookings',
  error: '',
  loading: false,
  selectedSpecialist: null,
};

const adminReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SECRET':
      return { ...state, secret: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SELECTED_SPECIALIST':
      return { ...state, selectedSpecialist: action.payload };
    case 'FETCH_START':
      return { ...state, loading: true, error: '' };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, data: action.payload.bookings, specialists: action.payload.specialists };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'DELETE_BOOKING':
      return { ...state, data: state.data ? state.data.filter(b => b._id !== action.payload) : null };
    case 'REMOVE_SPECIALIST':
      return {
        ...state,
        specialists: state.specialists ? state.specialists.filter(s => s._id !== action.payload) : [],
        selectedSpecialist: state.selectedSpecialist?._id === action.payload ? null : state.selectedSpecialist
      };
    default:
      return state;
  }
};

const SecretGate = ({ secret, setSecret, onAccess, loading, error, t }) => {
  return (
    <div className="container" style={{ maxWidth: '400px', paddingTop: '100px' }}>
      <div className="card-light" style={{ padding: '40px', textAlign: 'center' }}>
        <ShieldCheck size={48} color="var(--color-orange)" style={{ marginBottom: '16px' }} />
        <h2 style={{ marginBottom: '24px' }}>{t('admin_access')}</h2>
        <input 
          type="password" 
          className="input-field" 
          placeholder={t('enter_secret_key')} 
          aria-label={t('enter_secret_key')}
          value={secret}
          onChange={e => setSecret(e.target.value)} 
          style={{ marginBottom: '16px' }}
        />
        <button type="button" className="btn-primary w-full" onClick={onAccess} disabled={loading}>
          {loading ? t('verifying') : t('access_dashboard')}
        </button>
        {error && <p style={{ color: 'var(--color-orange)', marginTop: '16px', fontSize: '14px' }}>{error}</p>}
      </div>
    </div>
  );
};

const BookingsTab = ({ data, onDelete, t }) => {
  return (
    <div className="card-light" style={{ padding: '0', overflowX: 'auto', borderRadius: 'var(--r-lg)' }}>
      <table className="w-full" style={{ borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-cream-dark)', backgroundColor: 'rgba(237, 184, 32, 0.05)' }}>
            <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>{t('patient_details_col')}</th>
            <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>{t('specialist')}</th>
            <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>{t('appointment_time_col')}</th>
            <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>{t('feedback_col')}</th>
            <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>{t('actions_col')}</th>
          </tr>
        </thead>
        <tbody>
          {data && data.map(b => (
            <tr key={b._id} style={{ borderBottom: '1px solid #f0edeb' }}>
              <td style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800' }}>
                    {b.userName ? b.userName.substring(0, 2).toUpperCase() : '??'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700' }}>{b.userName}</div>
                    <div style={{ fontSize: '13px', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={12} /> {b.userEmail}
                    </div>
                  </div>
                </div>
              </td>
              <td style={{ padding: '24px' }}>
                <div style={{ fontWeight: '600' }}>{b.specialistName}</div>
                <div style={{ fontSize: '13px', color: 'var(--color-orange)', fontWeight: '600' }}>{b.specialistCategory}</div>
              </td>
              <td style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <Calendar size={14} opacity={0.6} /> {b.bookingDate}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', opacity: 0.6 }}>
                  <Clock size={14} /> {b.bookingTime}
                </div>
              </td>
              <td style={{ padding: '24px', maxWidth: '300px' }}>
                {b.rejectionReason ? (
                  <div>
                    <span className="pill-tag" style={{ background: 'rgba(224, 88, 48, 0.1)', color: 'var(--color-orange)', marginBottom: '8px' }}>
                      {b.rejectionReason}
                    </span>
                    <p style={{ fontSize: '13px', opacity: 0.8, fontStyle: 'italic' }}>"{b.rejectionReasonOther}"</p>
                  </div>
                ) : (
                  <span style={{ fontSize: '13px', opacity: 0.4 }}>{t('no_feedback')}</span>
                )}
              </td>
              <td style={{ padding: '24px' }}>
                  <button type="button" className="btn-danger" style={{ padding: '8px' }} onClick={() => onDelete(b._id)}>
                      <Trash2 size={16} />
                  </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data && data.length === 0 && <div style={{ padding: '64px', textAlign: 'center', opacity: 0.5 }}>{t('no_appointment_records')}</div>}
    </div>
  );
};

const SpecialistsTab = ({ specialists, onSelect, onApprove, onReject, t }) => {
  return (
    <div className="card-light" style={{ padding: '0', overflowX: 'auto', borderRadius: 'var(--r-lg)' }}>
      <table className="w-full" style={{ borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-cream-dark)', backgroundColor: 'rgba(237, 184, 32, 0.05)' }}>
            <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>{t('specialist')}</th>
            <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>{t('licensing_institution_col')}</th>
            <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>{t('bio_summary_col')}</th>
            <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>{t('actions_col')}</th>
          </tr>
        </thead>
        <tbody>
          {specialists && specialists.map(s => (
            <tr 
              key={s._id} 
              style={{ borderBottom: '1px solid #f0edeb', cursor: 'pointer', transition: 'background-color 0.2s' }}
              onClick={() => onSelect(s)}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(237, 184, 32, 0.03)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <td style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {s.profilePhoto ? (
                    <img 
                      src={s.profilePhoto} 
                      alt={s.name} 
                      style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--color-cream-dark)' }} 
                    />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--color-cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800' }}>
                      {s.initials || s.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: '700' }}>{s.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-orange)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Award size={12} /> {s.specialization} ({s.experience})
                    </div>
                  </div>
                </div>
              </td>
              <td style={{ padding: '24px' }}>
                <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} opacity={0.6} /> {s.clinicName || 'Not Specified'}</div>
                <div style={{ fontSize: '13px', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Shield size={12} /> License: {s.licenseNumber}
                </div>
              </td>
              <td style={{ padding: '24px', maxWidth: '350px' }}>
                <p style={{ fontSize: '13px', opacity: 0.8, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {s.bio || 'No bio provided'}
                </p>
              </td>
              <td style={{ padding: '24px' }}>
                <div style={{ display: 'flex', gap: '8px' }} onClick={e => e.stopPropagation()}>
                  <button 
                    type="button"
                    className="btn-primary" 
                    style={{ padding: '8px 16px', fontSize: '13px' }} 
                    onClick={() => onApprove(s._id)}
                  >
                    {t('approve')}
                  </button>
                  <button 
                    type="button"
                    className="btn-danger" 
                    style={{ padding: '8px 16px', fontSize: '13px' }} 
                    onClick={() => onReject(s._id)}
                  >
                    {t('reject')}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {specialists && specialists.length === 0 && <div style={{ padding: '64px', textAlign: 'center', opacity: 0.5 }}>No pending specialist applications found.</div>}
    </div>
  );
};

const renderAppointmentModes = (modes, t) => {
  if (!modes) return <p style={{ opacity: 0.5, margin: 0, fontSize: '13.5px' }}>{t('no_modes_configured')}</p>;
  
  const modeKeys = ['inPerson', 'video', 'chat'];
  const modeLabels = {
    inPerson: t('in_person_visit'),
    video: t('video_consult'),
    chat: t('chat_session')
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {modeKeys.map(key => {
        const m = modes[key];
        const enabled = m && m.enabled;
        return (
          <div 
            key={key} 
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 16px',
              borderRadius: 'var(--r-md)',
              background: enabled ? 'rgba(237, 184, 32, 0.06)' : 'rgba(0, 0, 0, 0.02)',
              border: enabled ? '1px solid rgba(237, 184, 32, 0.15)' : '1px solid rgba(0, 0, 0, 0.05)',
              opacity: enabled ? 1 : 0.5
            }}
          >
            <div>
              <div style={{ fontWeight: '700', fontSize: '14px', color: enabled ? 'var(--color-dark)' : 'var(--color-muted)' }}>
                {modeLabels[key]}
              </div>
              {enabled && (
                <div style={{ fontSize: '12px', opacity: 0.6, marginTop: '2px' }}>
                  {m.duration || 'N/A'}
                </div>
              )}
            </div>
            <div>
              {enabled ? (
                <span style={{ fontWeight: '800', color: 'var(--color-orange)', fontSize: '15px' }}>
                  ${m.price}
                </span>
              ) : (
                <span style={{ fontSize: '12px', opacity: 0.6 }}>Disabled</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const SpecialistDetailsModal = ({ s, onClose, onApprove, onReject, t }) => {
  return (
    <div style={MODAL_OVERLAY_STYLE} onClick={onClose}>
      <div style={MODAL_CONTENT_STYLE} onClick={e => e.stopPropagation()}>
        
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          style={CLOSE_BUTTON_STYLE}
        >
          <X size={18} />
        </button>

        {/* Modal Header / Profile Intro */}
        <div style={MODAL_HEADER_STYLE}>
          {s.profilePhoto ? (
            <img 
              src={s.profilePhoto} 
              alt={s.name} 
              style={{
                width: '88px',
                height: '88px',
                borderRadius: '20px',
                objectFit: 'cover',
                border: '3px solid rgba(237, 184, 32, 0.2)'
              }}
            />
          ) : (
            <div style={{
              width: '88px',
              height: '88px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, var(--color-accent) 0%, var(--color-orange) 100%)',
              color: 'var(--color-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              fontWeight: '800'
            }}>
              {s.initials || s.name.substring(0, 2).toUpperCase()}
            </div>
          )}
          
          <div>
            <span className="pill-tag" style={{ background: 'rgba(237, 184, 32, 0.1)', color: 'var(--color-orange)', marginBottom: '8px', display: 'inline-block' }}>
              {t('pending_verification')}
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: '800', margin: '4px 0 8px 0', fontFamily: 'Playfair Display' }}>
              {s.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14.5px', color: 'var(--color-muted)', fontWeight: '600' }}>
              <Award size={14} color="var(--color-orange)" /> {s.specialization} ({s.experience} Years Experience)
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '32px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
            
            {/* Left column: Bio & Credentials */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', marginBottom: '8px', fontWeight: '800' }}>
                  {t('biography_summary')}
                </h4>
                <p style={{ 
                  fontSize: '14.5px', 
                  lineHeight: '1.6', 
                  opacity: 0.9, 
                  margin: 0,
                  whiteSpace: 'pre-wrap', 
                  maxHeight: '240px',
                  overflowY: 'auto',
                  paddingRight: '8px'
                }}>
                  {s.bio || 'No biography details provided.'}
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', marginBottom: '12px', fontWeight: '800' }}>
                  {t('clinic_licensing')}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                    <MapPin size={16} opacity={0.7} color="var(--color-orange)" /> 
                    <span><strong>{t('clinic')}:</strong> {s.clinicName || 'Not specified'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px' }}>
                    <Shield size={16} opacity={0.7} color="var(--color-orange)" /> 
                    <span><strong>{t('license_no')}:</strong> <code>{s.licenseNumber}</code></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Appointment Modes */}
            <div>
              <h4 style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)', marginBottom: '12px', fontWeight: '800' }}>
                {t('consultation_pricing')}
              </h4>
              {renderAppointmentModes(s.appointmentModes, t)}
            </div>

          </div>
        </div>

        {/* Modal Footer / Decision Actions */}
        <div style={{
          padding: '24px 40px 40px 40px',
          borderTop: '1px solid var(--color-cream-dark)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button 
            type="button"
            className="btn-danger" 
            style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '700' }} 
            onClick={() => onReject(s._id)}
          >
            {t('reject_app')}
          </button>
          <button 
            type="button"
            className="btn-primary" 
            style={{ padding: '12px 24px', fontSize: '14px', fontWeight: '700' }} 
            onClick={() => onApprove(s._id)}
          >
            {t('approve_onboard')}
          </button>
        </div>

      </div>
    </div>
  );
};

const Admin = () => {
  const { t } = useTranslation();

  const [state, dispatch] = useReducer(adminReducer, initialState);

  const fetchDashboard = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: '' });
    try {
      const res = await fetch(`${BACKEND_URL}/admin/dashboard`, {
        headers: { 'x-admin-secret': state.secret }
      });
      const json = await res.json();
      
      const specRes = await fetch(`${BACKEND_URL}/admin/dashboard/specialists/pending`, {
        headers: { 'x-admin-secret': state.secret }
      });
      const specJson = await specRes.json();

      if (res.status === 403 || specRes.status === 403 || json.message === 'Unauthorized' || specJson.message === 'Unauthorized') {
        dispatch({ type: 'SET_ERROR', payload: t('error_invalid_secret', { defaultValue: 'Invalid secret key. Access denied.' }) });
      } else if (json.success && specJson.success) {
        dispatch({ type: 'FETCH_SUCCESS', payload: { bookings: json.bookings, specialists: specJson.specialists } });
      } else {
        dispatch({ type: 'SET_ERROR', payload: json.message || specJson.message || t('error_connect_triage') });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: t('connection_error') });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteBooking = async (id) => {
    if (!window.confirm(t('confirm_delete_appointment'))) return;
    try {
      const res = await fetch(`${BACKEND_URL}/admin/dashboard/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-secret': state.secret }
      });
      if (res.ok) {
        dispatch({ type: 'DELETE_BOOKING', payload: id });
      } else {
        alert('Failed to delete appointment');
      }
    } catch {
      alert('Failed to delete appointment');
    }
  };

  const handleApproveSpecialist = async (id) => {
    if (!window.confirm(t('confirm_approve_specialist'))) return;
    try {
      const res = await fetch(`${BACKEND_URL}/admin/dashboard/specialists/${id}/approve`, {
        method: 'POST',
        headers: { 'x-admin-secret': state.secret }
      });
      const json = await res.json();
      if (json.success) {
        alert(t('success_approved'));
        dispatch({ type: 'REMOVE_SPECIALIST', payload: id });
      } else {
        alert(json.message || 'Failed to approve specialist');
      }
    } catch {
      alert('Connection error');
    }
  };

  const handleRejectSpecialist = async (id) => {
    const reason = window.prompt(t('reject_reason_prompt'));
    if (reason === null) return;
    if (!reason.trim()) {
      alert(t('reject_reason_required'));
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/admin/dashboard/specialists/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': state.secret
        },
        body: JSON.stringify({ reason: reason.trim() })
      });
      const json = await res.json();
      if (json.success) {
        alert(t('success_rejected'));
        dispatch({ type: 'REMOVE_SPECIALIST', payload: id });
      } else {
        alert(json.message || 'Failed to reject specialist');
      }
    } catch {
      alert('Connection error');
    }
  };

  if (!state.data) {
    return (
      <SecretGate 
        secret={state.secret}
        setSecret={val => dispatch({ type: 'SET_SECRET', payload: val })}
        onAccess={fetchDashboard}
        loading={state.loading}
        error={state.error}
        t={t}
      />
    );
  }

  return (
    <div className="container" style={{ padding: '48px 16px' }}>
      <header style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', fontFamily: 'Playfair Display' }}>{t('admin_dashboard')}</h1>
          <p style={{ opacity: 0.7 }}>{t('admin_desc')}</p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--color-cream-dark)' }}>
        <button 
          type="button"
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'bookings' })} 
          style={{
            ...TAB_BUTTON_BASE_STYLE,
            borderBottom: state.activeTab === 'bookings' ? '3px solid var(--color-orange)' : '3px solid transparent',
            color: state.activeTab === 'bookings' ? 'var(--color-orange)' : 'var(--color-muted)',
          }}
        >
          {t('appointments')} ({state.data ? state.data.length : 0})
        </button>
        <button 
          type="button"
          onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: 'specialists' })} 
          style={{
            ...TAB_BUTTON_BASE_STYLE,
            borderBottom: state.activeTab === 'specialists' ? '3px solid var(--color-orange)' : '3px solid transparent',
            color: state.activeTab === 'specialists' ? 'var(--color-orange)' : 'var(--color-muted)',
          }}
        >
          {t('specialist_approvals')} ({state.specialists ? state.specialists.length : 0})
        </button>
      </div>

      {state.activeTab === 'bookings' ? (
        <BookingsTab 
          data={state.data}
          onDelete={deleteBooking}
          t={t}
        />
      ) : (
        <SpecialistsTab 
          specialists={state.specialists}
          onSelect={val => dispatch({ type: 'SET_SELECTED_SPECIALIST', payload: val })}
          onApprove={handleApproveSpecialist}
          onReject={handleRejectSpecialist}
          t={t}
        />
      )}

      {/* Specialist Details Modal Overlay */}
      {state.selectedSpecialist && (
        <SpecialistDetailsModal 
          s={state.selectedSpecialist}
          onClose={() => dispatch({ type: 'SET_SELECTED_SPECIALIST', payload: null })}
          onApprove={handleApproveSpecialist}
          onReject={handleRejectSpecialist}
          t={t}
        />
      )}
    </div>
  );
};

export default Admin;
