import { useState, createContext, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Screen1Input from './pages/Screen1Input';
import Screen2Recommendation from './pages/Screen2Recommendation';
import Screen3Rejection from './pages/Screen3Rejection';
import Screen4Specialists from './pages/Screen4Specialists';
import Screen5Booking from './pages/Screen5Booking';
import Screen6Confirmation from './pages/Screen6Confirmation';
import Screen7CheckAppointment from './pages/Screen7CheckAppointment';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Support from './pages/Support';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

export const AppContext = createContext();

function App() {
  const [state, setState] = useState({
    name: '',
    email: '',
    problem: '',
    recommendedSpecialist: '',
    accepted: null,
    rejectionReason: '',
    rejectionReasonOther: '',
    finalSpecialist: null,
    bookedDate: null,
    bookedTime: '',
    bookingId: ''
  });

  const [bookings, setBookings] = useState([]);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [showHelpModal, setShowHelpModal] = useState(false);

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const addBooking = (booking) => {
    setBookings(prev => [...prev, booking]);
  };

  const loginUser = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    // sync simple name/email fields
    updateState({ name: userData.name, email: userData.email });
  };

  const logoutUser = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const refreshUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AppContext.Provider value={{ state, updateState, bookings, addBooking, user, token, loginUser, logoutUser, refreshUser }}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Screen1Input />} />
            <Route path="/recommendation" element={<Screen2Recommendation />} />
            <Route path="/rejection" element={<Screen3Rejection />} />
            <Route path="/specialists" element={<Screen4Specialists />} />
            <Route path="/book" element={<Screen5Booking />} />
            <Route path="/confirmation" element={<Screen6Confirmation />} />
            <Route path="/lookup" element={<Screen7CheckAppointment />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/support" element={<Support />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>

        {/* Global Floating Help Widget */}
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
          <button
            onClick={() => setShowHelpModal(prev => !prev)}
            style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'var(--color-orange, #E05830)',
              color: 'white', display: 'flex', alignItems: 'center',
              justifyContent: 'center', boxShadow: '0 8px 24px rgba(224, 88, 48, 0.3)',
              border: 'none', cursor: 'pointer', outline: 'none',
              transition: 'transform 0.2s ease-in-out'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            title="Need help?"
          >
            {showHelpModal ? (
              <span style={{ fontSize: '24px', fontWeight: 'bold', lineHeight: 1 }}>×</span>
            ) : (
              <span style={{ fontSize: '28px', fontWeight: 'bold', lineHeight: 1 }}>?</span>
            )}
          </button>

          {showHelpModal && (
            <div className="card-light page-transition" style={{
              position: 'absolute', bottom: '72px', right: '0',
              width: '320px', padding: '24px', borderRadius: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              border: '1px solid rgba(0,0,0,0.08)',
              background: '#FFFFFF',
              animation: 'fadeInSlideUp 0.2s ease forwards'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                Instant Guidance
              </h3>
              
              <p style={{ fontSize: '13px', lineHeight: '1.5', opacity: 0.8, marginBottom: '16px' }}>
                Welcome to SmartAssist! We make it super easy to find and book appointments with the right healthcare specialists.
              </p>

              <div style={{ display: 'grid', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontWeight: '800', color: 'var(--color-orange)' }}>Step 1:</span>
                  <span>Tell us your symptoms in plain language (e.g. "my tooth hurts").</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontWeight: '800', color: 'var(--color-orange)' }}>Step 2:</span>
                  <span>AI suggests the most relevant specialist.</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <span style={{ fontWeight: '800', color: 'var(--color-orange)' }}>Step 3:</span>
                  <span>Select a slot and choose In-Person, Video Call, or Chat Consultation.</span>
                </div>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <div style={{ fontWeight: '800', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-muted)', marginBottom: '8px' }}>Contact Support</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '6px' }}>
                  <span>Phone:</span> <strong>+91 98765 43210</strong>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <span>Email:</span> <strong>support@smartassist.ai</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;
