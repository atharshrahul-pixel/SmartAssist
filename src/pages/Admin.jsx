import { useState } from 'react';
import { ShieldCheck, Calendar, Mail, Clock, Trash2 } from 'lucide-react';

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

  const deleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/admin/dashboard/${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-secret': secret }
      });
      if (res.ok) {
        setData(prev => prev.filter(b => b._id !== id));
      } else {
        alert('Failed to delete appointment');
      }
    } catch (err) {
      alert('Failed to delete appointment');
    }
  };

  if (!data) return (
    <div className="container" style={{ maxWidth: '400px', paddingTop: '100px' }}>
      <div className="card-light" style={{ padding: '40px', textAlign: 'center' }}>
        <ShieldCheck size={48} color="var(--color-orange)" style={{ marginBottom: '16px' }} />
        <h2 style={{ marginBottom: '24px' }}>Admin Access</h2>
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
        {error && <p style={{ color: 'var(--color-orange)', marginTop: '16px', fontSize: '14px' }}>{error}</p>}
      </div>
    </div>
  );

  return (
    <div className="container" style={{ padding: '48px 16px' }}>
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', fontFamily: 'Playfair Display' }}>Admin Dashboard</h1>
          <p style={{ opacity: 0.7 }}>Overview of all scheduled appointments and patient feedback.</p>
        </div>
        <div className="pill-tag" style={{ background: 'var(--color-dark)', color: 'var(--color-white)' }}>
          {data ? data.length : 0} Total Bookings
        </div>
      </header>

      <div className="card-light" style={{ padding: '0', overflowX: 'auto', borderRadius: 'var(--r-lg)' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-cream-dark)', backgroundColor: 'rgba(237, 184, 32, 0.05)' }}>
              <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Patient Details</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Specialist</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Appointment Time</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Feedback</th>
              <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data && data.map(b => (
              <tr key={b._id} style={{ borderBottom: '1px solid #f0edeb' }}>
                <td style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800' }}>
                      {b.userName ? b.userName.substring(0, 2).toUpperCase() : '??'}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700' }}>{b.userName}</div>
                      <div style={{ fontSize: '13px', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Mail size={12} /> {b.userEmail}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '24px' }}>
                  <div style={{ fontWeight: '600' }}>{b.specialistName}</div>
                  <div style={{ fontSize: '13px', color: 'var(--color-orange)', fontWeight: '600' }}>{b.specialistCategory}</div>
                </td>
                <td style={{ padding: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                    <Calendar size={14} opacity={0.6} /> {b.bookingDate}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', opacity: 0.6 }}>
                    <Clock size={14} /> {b.bookingTime}
                  </div>
                </td>
                <td style={{ padding: '24px', maxWidth: '300px' }}>
                  {b.rejectionReason ? (
                    <div>
                      <span className="pill-tag" style={{ background: 'rgba(224, 88, 48, 0.1)', color: 'var(--color-orange)', marginBottom: '8px' }}>
                        {b.rejectionReason}
                      </span>
                      <p style={{ fontSize: '13px', opacity: 0.8, fontStyle: 'italic' }}>"{b.rejectionReasonOther}"</p>
                    </div>
                  ) : (
                    <span style={{ fontSize: '13px', opacity: 0.4 }}>No feedback provided</span>
                  )}
                </td>
                <td style={{ padding: '24px' }}>
                    <button className="btn-danger" style={{ padding: '8px' }} onClick={() => deleteBooking(b._id)}>
                        <Trash2 size={16} />
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data && data.length === 0 && <div style={{ padding: '64px', textAlign: 'center', opacity: 0.5 }}>No appointment records found in database.</div>}
      </div>
    </div>
  );
};

export default Admin;
