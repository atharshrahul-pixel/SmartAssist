import { useState } from 'react';

const BACKEND_URL = 'https://akeno7594-internship-project-backend.hf.space/api';

const Admin = () => {
  const [secret, setSecret] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const fetchDashboard = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/dashboard`, {
        headers: { 'x-admin-secret': secret }
      });
      const json = await res.json();
      if (json.success) {
        setData(json.bookings);
        setError('');
      } else {
        setError('Unauthorized');
      }
    } catch {
      setError('Connection Error');
    }
  };

  if (!data) return (
    <div className="container" style={{ maxWidth: '400px' }}>
      <h2>Admin Login</h2>
      <input type="password" className="input-field" placeholder="Secret Key" onChange={e => setSecret(e.target.value)} />
      <button className="btn-primary w-full mt-md" onClick={fetchDashboard}>Enter</button>
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
    </div>
  );

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      <table className="w-full mt-lg" style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
            <th>Name</th>
            <th>Email</th>
            <th>Specialist</th>
            <th>Booking</th>
            <th>Feedback</th>
          </tr>
        </thead>
        <tbody>
          {data.map(b => (
            <tr key={b.receiptId} style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
              <td style={{ padding: '12px 0' }}>{b.userName}</td>
              <td>{b.userEmail}</td>
              <td>{b.specialistCategory} ({b.specialistName})</td>
              <td>{b.bookingDate} {b.bookingTime}</td>
              <td>{b.rejectionReason} {b.rejectionReasonOther}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
