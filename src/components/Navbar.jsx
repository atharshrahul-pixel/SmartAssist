import { Link } from 'react-router-dom';

const Navbar = () => {
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
        <button className="pill-tag" style={{ border: 'none', cursor: 'pointer' }}>
          Book Appointment
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
