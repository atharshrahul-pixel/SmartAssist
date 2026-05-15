import { useState, createContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Screen1Input from './pages/Screen1Input';
import Screen2Recommendation from './pages/Screen2Recommendation';
import Screen3Rejection from './pages/Screen3Rejection';
import Screen4Specialists from './pages/Screen4Specialists';
import Screen5Booking from './pages/Screen5Booking';
import Screen6Confirmation from './pages/Screen6Confirmation';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Support from './pages/Support';
import Admin from './pages/Admin';

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

  const updateState = (updates) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const addBooking = (booking) => {
    setBookings(prev => [...prev, booking]);
  };

  return (
    <AppContext.Provider value={{ state, updateState, bookings, addBooking }}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Screen1Input />} />
            <Route path="/recommendation" element={<Screen2Recommendation />} />
            <Route path="/rejection" element={<Screen3Rejection />} />
            <Route path="/specialists" element={<Screen4Specialists />} />
            <Route path="/book" element={<Screen5Booking />} />
            <Route path="/confirmation" element={<Screen6Confirmation />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/support" element={<Support />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;
