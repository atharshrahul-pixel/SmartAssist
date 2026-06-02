import { useState, useEffect } from 'react';
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
import SpecialistRegister from './pages/SpecialistRegister';
import SpecialistDashboard from './pages/SpecialistDashboard';
import SupportChatWidget from './components/SupportChatWidget';
import { AppContext } from './context/AppContext';

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
            <Route path="/specialist/register" element={<SpecialistRegister />} />
            <Route path="/specialist/dashboard" element={<SpecialistDashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>

        {/* Global Floating Help Chat Widget */}
        <SupportChatWidget />
      </div>
    </AppContext.Provider>
  );
}

export default App;
