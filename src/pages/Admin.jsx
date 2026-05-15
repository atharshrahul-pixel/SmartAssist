import { useState } from 'react';

const BACKEND_URL = 'https://akeno7594-internship-project-backend.hf.space/api';

const Admin = () => {
  const [secret, setSecret] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${BACKEND_URL}/admin/dashboard`, {
        headers: { 'x-admin-secret': secret }
      });
      const json = await res.json();
      if (json.success) {
        setData(json.bookings);
      } else {
        setError('Access denied: Invalid Secret Key.');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!data) return (
    <div className="container" style={{ maxWidth: '400px', paddingTop: '100px' }}>
      <div className="card-light" style={{ padding: '40px' }}>
        <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>Admin Access</h2>
        <input 
          type="password" 
          className="input-field" 
          placeholder="Enter Secret Key" 
          onChange={e => setSecret(e.target.value)} 
          style={{ marginBottom: '16px' }}
        />
        <button className="btn-primary w-full" onClick={fetchDashboard} disabled={loading}>
          {loading ? 'Verifying...' : 'Access Dashboard'}
        </button>
        {error && <p style={{ color: 'var(--color-orange)', marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>{error}</p>}
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '48px 16px' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>Admin Dashboard</h1>
        <p style={{ opacity: 0.7 }}>Manage appointments, specialist feedback, and system logs.</p>
      </header>

      <div className="card-light" style={{ overflowX: 'auto', padding: '0' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-cream-dark)', backgroundColor: 'rgba(237, 184, 32, 0.05)' }}>
              <th style={{ padding: '16px 24px' }}>Patient</th>
              <th style={{ padding: '16px 24px' }}>Specialist</th>
              <th style={{ padding: '16px 24px' }}>Time</th>
              <th style={{ padding: '16px 24px' }}>Feedback</th>
            </tr>
          </thead>
          <tbody>
            {data.map(b => (
              <tr key={b.receiptId} style={{ borderBottom: '1px solid var(--color-cream-dark)' }}>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontWeight: '700' }}>{b.userName}</div>
                  <div style={{ fontSize: '13px', opacity: 0.6 }}>{b.userEmail}</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div style={{ fontWeight: '600' }}>{b.specialistName}</div>
                  <div style={{ fontSize: '13px', opacity: 0.6 }}>{b.specialistCategory}</div>
                </td>
                <td style={{ padding: '20px 24px' }}>
                  <div>{b.bookingDate}</div>
                  <div style={{ fontSize: '13px', opacity: 0.6 }}>{b.bookingTime}</div>
                </td>
                <td style={{ padding: '20px 24px', maxWidth: '300px' }}>
                  {b.rejectionReason ? (
                    <div>
                      <span className="tag-highlight" style={{ fontSize: '12px' }}>{b.rejectionReason}</span>
                      <p style={{ fontSize: '13px', marginTop: '4px', opacity: 0.8 }}>{b.rejectionReasonOther}</p>
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', opacity: 0.4 }}>No feedback</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data.length === 0 && <p style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>No bookings found.</p>}
      </div>
    </div>
  );
};

export default Admin;
