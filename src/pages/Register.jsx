import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../App';
import { UserPlus, User, Key, Mail } from 'lucide-react';

const BACKEND_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://akeno7594-internship-project-backend.hf.space/api';

const HelpTooltip = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <span style={{ display: 'inline-block', position: 'relative', marginLeft: '6px' }}>
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        style={{
          width: '16px', height: '16px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.06)', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '11px',
          fontWeight: 'bold', color: 'var(--color-dark)', border: 'none',
          outline: 'none', cursor: 'pointer', verticalAlign: 'middle'
        }}
      >
        ?
      </button>
      {show && (
        <span style={{
          position: 'absolute', bottom: '24px', left: '50%',
          transform: 'translateX(-50%)', width: '220px',
          background: 'var(--color-dark)', color: 'var(--color-white)',
          padding: '10px 12px', borderRadius: '8px', fontSize: '11px',
          lineHeight: '1.4', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          pointerEvents: 'none', display: 'block', textTransform: 'none',
          fontWeight: 'normal', letterSpacing: 'normal'
        }}>
          {text}
          <span style={{
            position: 'absolute', top: '100%', left: '50%',
            transform: 'translateX(-50%)', width: '0', height: '0',
            borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
            borderTop: '6px solid var(--color-dark)', display: 'block'
          }} />
        </span>
      )}
    </span>
  );
};

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useContext(AppContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
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
        setError(json.message || 'Registration failed.');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container page-transition" style={{ maxWidth: '480px', paddingTop: '80px' }}>
      <div className="card-light" style={{ padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(237, 184, 32, 0.1)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-accent)',
            marginBottom: '16px'
          }}>
            <UserPlus size={24} />
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
            Create <span className="accent-word">Account</span>
          </h2>
          <p style={{ opacity: 0.6, fontSize: '14px' }}>Join us to easily book and manage appointments.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-md">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={14} /> Full Name
              <HelpTooltip text="Please enter your full name as you would want it to appear on tickets and appointments." />
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
              <Mail size={14} /> Email Address
              <HelpTooltip text="This email will be used to log in, recover password, and receive notifications." />
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
              <Key size={14} /> Password
              <HelpTooltip text="Pick a strong password of at least 6 characters to secure your medical files." />
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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', opacity: 0.8 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-orange)', fontWeight: '600' }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
