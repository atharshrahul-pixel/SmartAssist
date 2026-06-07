import { useReducer, use } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import { UserPlus, User, Key, Mail } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';
import { translateError } from '../utils/errorTranslator';
import Stepper from '../components/Stepper';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://p01--smart-assist-backend--qnbs82bxhg66.code.run/api');

const registerReducer = (state, action) => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'START_SUBMIT':
      return { ...state, loading: true, error: '' };
    case 'END_SUBMIT':
      return { ...state, loading: false };
    default:
      return state;
  }
};

const Register = () => {
  const { t } = useTranslation();
  const [regState, dispatch] = useReducer(registerReducer, {
    name: '',
    email: '',
    password: '',
    error: '',
    loading: false
  });
  const { state: appContextState, loginUser } = use(AppContext);
  const navigate = useNavigate();
  
  const flow = appContextState.finalSpecialist ? 'booking' : 'account';
  const currentStep = appContextState.finalSpecialist ? 5 : 1;
  const customStepNames = [
    t('step_1_name'),
    t('step_2_name'),
    t('step_3_name'),
    t('step_4_name'),
    t('create_account'),
    t('step_6_name')
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!regState.name.trim()) {
      dispatch({ type: 'SET_ERROR', payload: t('error_name_required') });
      return;
    }
    if (!regState.email.trim()) {
      dispatch({ type: 'SET_ERROR', payload: t('error_your_email') });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regState.email.trim())) {
      dispatch({ type: 'SET_ERROR', payload: t('error_valid_email') });
      return;
    }
    if (!regState.password.trim()) {
      dispatch({ type: 'SET_ERROR', payload: t('error_password_required') });
      return;
    }
    if (regState.password.length < 6) {
      dispatch({ type: 'SET_ERROR', payload: t('error_password_short') });
      return;
    }

    dispatch({ type: 'START_SUBMIT' });

    try {
      const res = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regState.name, email: regState.email, password: regState.password, role: 'user' })
      });

      const json = await res.json();
      if (json.success) {
        loginUser(json.user, json.token);
        navigate('/dashboard');
      } else {
        dispatch({ type: 'SET_ERROR', payload: translateError(json.message || 'Registration failed.') });
      }
    } catch {
      dispatch({ type: 'SET_ERROR', payload: translateError('Connection failed. Please try again.') });
    }
  };

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Stepper currentStep={currentStep} flow={flow} stepNamesOverride={flow === 'booking' ? customStepNames : null} />
      <div className="container" style={{ maxWidth: '480px', paddingTop: '40px', flex: 1 }}>
        <div className="card-light" style={{ padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="register-avatar-icon">
            <UserPlus size={24} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
            {t('create_account')}
          </h2>
          <p style={{ opacity: 0.6, fontSize: '14px' }}>{t('join_us_desc')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-md">
            <label htmlFor="reg-name" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} /> {t('full_name_label')}
              <HelpTooltip text={t('full_name_tooltip')} />
            </label>
            <input
              id="reg-name"
              type="text"
              className="input-field"
              placeholder="John Doe"
              value={regState.name}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'name', value: e.target.value })}
              required
            />
          </div>

          <div className="mb-md">
            <label htmlFor="reg-email" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} /> {t('email_label')}
              <HelpTooltip text={t('email_tooltip_register')} />
            </label>
            <input
              id="reg-email"
              type="email"
              className="input-field"
              placeholder="john@example.com"
              value={regState.email}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'email', value: e.target.value })}
              required
            />
          </div>

          <div className="mb-lg">
            <label htmlFor="reg-password" className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={14} /> {t('password_label')}
              <HelpTooltip text={t('password_tooltip_register')} />
            </label>
            <input
              id="reg-password"
              type="password"
              className="input-field"
              placeholder="•••••••• (Min. 6 characters)"
              value={regState.password}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'password', value: e.target.value })}
              required
            />
          </div>

          {regState.error && (
            <div className="error-alert-banner">
              {regState.error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={regState.loading} style={{ padding: '14px 28px' }}>
            {regState.loading ? t('creating_account') : t('register')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', opacity: 0.8, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div>
            {t('already_account')}{' '}
            <Link to="/login" style={{ color: 'var(--color-orange)', fontWeight: '600' }}>
              {t('login')}
            </Link>
          </div>
          <div style={{ fontSize: '13px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginTop: '4px' }}>
            {t('specialist_register_link').split('?')[0]}?{' '}
            <Link to="/specialist/register" style={{ color: 'var(--color-accent)', fontWeight: '700' }}>
              {t('specialist_register_link').split('?')[1]?.trim() || t('register')}
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
