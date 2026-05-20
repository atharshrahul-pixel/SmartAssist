import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../App';
import { User } from 'lucide-react';

const Navbar = () => {
  const { user } = useContext(AppContext);

  return (
    <nav style={{
      backgroundColor: 'var(--color-dark)',
      height: '68px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--sp-md)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{
          color: 'var(--color-white)',
          fontSize: '18px',
          fontWeight: '700'
        }}>
          SmartAssist
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/lookup" style={{ color: 'var(--color-white)', fontSize: '14px', textDecoration: 'none', opacity: 0.8 }}>
            Check Appointments
          </Link>
          {user ? (
            <Link to="/dashboard" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-accent)',
              color: 'var(--color-dark)',
              padding: '6px 16px',
              borderRadius: 'var(--r-pill)',
              fontWeight: '700',
              fontSize: '13px',
              textDecoration: 'none'
            }}>
              <User size={14} /> {user.name}
            </Link>
          ) : (
            <Link to="/login" style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: 'var(--color-white)',
              padding: '6px 16px',
              borderRadius: 'var(--r-pill)',
              fontWeight: '600',
              fontSize: '13px',
              textDecoration: 'none'
            }}>
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
