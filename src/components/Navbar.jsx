import { Link } from 'react-router-dom';
import { use, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import { User, Menu, X } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
  const { t } = useTranslation();
  const { user } = use(AppContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar-main">
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
          <LanguageSelector />
          {user ? (
            <Link to={user.role === 'specialist' ? '/specialist/dashboard' : '/dashboard'} className="navbar-user-badge">
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
              {t('login_register')}
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button 
          type="button"
          className="nav-mobile-toggle"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown Menu */}
      {isOpen && (
        <div className="nav-mobile-menu">
          <LanguageSelector />
          {user ? (
            <Link 
              to={user.role === 'specialist' ? '/specialist/dashboard' : '/dashboard'} 
              className="nav-mobile-user-badge"
              onClick={() => setIsOpen(false)}
            >
              <User size={16} /> {user.name} ({t('dashboard')})
            </Link>
          ) : (
            <Link 
              to="/login" 
              className="nav-mobile-login"
              onClick={() => setIsOpen(false)}
            >
              {t('login_register')}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
