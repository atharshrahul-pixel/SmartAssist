import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import { AppContext } from '../App';
import { User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user } = useContext(AppContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav style={{
      backgroundColor: 'var(--color-dark)',
      height: '68px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 var(--sp-md)',
      position: 'relative',
      zIndex: 1000
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
          fontWeight: '700',
          textDecoration: 'none'
        }} onClick={() => setIsOpen(false)}>
          SmartAssist
        </Link>
        
        {/* Desktop Navigation */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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

        {/* Mobile Hamburger Toggle Button */}
        <button 
          className="nav-mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--color-white)',
            cursor: 'pointer',
            padding: '8px',
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {isOpen && (
        <div 
          className="nav-mobile-menu"
          style={{
            position: 'absolute',
            top: '68px',
            left: 0,
            width: '100%',
            backgroundColor: 'var(--color-dark)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            padding: '16px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 10px 15px rgba(0,0,0,0.2)',
            animation: 'fadeInSlideDown 0.25s ease'
          }}
        >
          <Link 
            to="/lookup" 
            style={{ 
              color: 'var(--color-white)', 
              fontSize: '16px', 
              textDecoration: 'none', 
              padding: '8px 0',
              borderBottom: '1px solid rgba(255,255,255,0.05)'
            }} 
            onClick={() => setIsOpen(false)}
          >
            Check Appointments
          </Link>
          {user ? (
            <Link 
              to="/dashboard" 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-dark)',
                padding: '12px 16px',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '15px',
                textDecoration: 'none'
              }}
              onClick={() => setIsOpen(false)}
            >
              <User size={16} /> {user.name} (Dashboard)
            </Link>
          ) : (
            <Link 
              to="/login" 
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--color-white)',
                padding: '12px 16px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '15px',
                textDecoration: 'none',
                textAlign: 'center'
              }}
              onClick={() => setIsOpen(false)}
            >
              Login / Register
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
