import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../App';
import { UserPlus, User, Key, Mail } from 'lucide-react';
import HelpTooltip from '../components/HelpTooltip';
import { translateError } from '../utils/errorTranslator';
import Stepper from '../components/Stepper';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://p01--smart-assist-backend--qnbs82bxhg66.code.run/api');

const Register = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { state, loginUser } = useContext(AppContext);
  const navigate = useNavigate();
  
  const flow = state.finalSpecialist ? 'booking' : 'account';
  const currentStep = state.finalSpecialist ? 5 : 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError(t('error_name_required'));
      return;
    }
    if (!email.trim()) {
      setError(t('error_your_email'));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError(t('error_valid_email'));
      return;
    }
    if (!password.trim()) {
      setError(t('error_password_required'));
      return;
    }
    if (password.length < 6) {
      setError(t('error_password_short'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${BACKEND_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role: 'user' })
      });

      const json = await res.json();
      if (json.success) {
        loginUser(json.user, json.token);
        navigate('/dashboard');
      } else {
        setError(translateError(json.message || 'Registration failed.'));
      }
    } catch (err) {
      setError(translateError('Connection failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Stepper currentStep={currentStep} flow={flow} />
      <div className="container" style={{ maxWidth: '480px', paddingTop: '40px', flex: 1 }}>
        <div className="card-light" style={{ padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="register-avatar-icon">
            <UserPlus size={24} />
          </div>
          <h2 
            style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}
            dangerouslySetInnerHTML={{ __html: t('create_account') }}
          />
          <p style={{ opacity: 0.6, fontSize: '14px' }}>{t('join_us_desc')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-md">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} /> {t('full_name_label')}
              <HelpTooltip text={t('full_name_tooltip')} />
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="mb-md">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={14} /> {t('email_label')}
              <HelpTooltip text={t('email_tooltip_register')} />
            </label>
            <input
              type="email"
              className="input-field"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-lg">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Key size={14} /> {t('password_label')}
              <HelpTooltip text={t('password_tooltip_register')} />
            </label>
            <input
              type="password"
              className="input-field"
              placeholder="•••••••• (Min. 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(224, 88, 48, 0.1)',
              color: 'var(--color-orange)',
              padding: '12px',
              borderRadius: 'var(--r-sm)',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full" disabled={loading} style={{ padding: '14px 28px' }}>
            {loading ? t('creating_account') : t('register')}
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
