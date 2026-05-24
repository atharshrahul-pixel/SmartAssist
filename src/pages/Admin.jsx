import { useState } from 'react';
import { ShieldCheck, Calendar, Mail, Clock, Trash2, Award, Shield, User, MapPin } from 'lucide-react';

const BACKEND_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://akeno7594-internship-project-backend.hf.space/api';

const Admin = () => {
  const [secret, setSecret] = useState('');
  const [data, setData] = useState(null);
  const [specialists, setSpecialists] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings');
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
      
      const specRes = await fetch(`${BACKEND_URL}/admin/dashboard/specialists/pending`, {
        headers: { 'x-admin-secret': secret }
      });
      const specJson = await specRes.json();

      if (json.success && specJson.success) {
        setData(json.bookings);
        setSpecialists(specJson.specialists);
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

  const handleApproveSpecialist = async (id) => {
    if (!window.confirm('Approve this specialist to join the platform?')) return;
    try {
      const res = await fetch(`${BACKEND_URL}/admin/dashboard/specialists/${id}/approve`, {
        method: 'POST',
        headers: { 'x-admin-secret': secret }
      });
      const json = await res.json();
      if (json.success) {
        alert('Specialist approved successfully!');
        setSpecialists(prev => prev.filter(s => s._id !== id));
      } else {
        alert(json.message || 'Failed to approve specialist');
      }
    } catch {
      alert('Connection error');
    }
  };

  const handleRejectSpecialist = async (id) => {
    const reason = window.prompt('Enter reason for rejecting this specialist:');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('Rejection reason is required.');
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/admin/dashboard/specialists/${id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': secret
        },
        body: JSON.stringify({ reason: reason.trim() })
      });
      const json = await res.json();
      if (json.success) {
        alert('Specialist application rejected.');
        setSpecialists(prev => prev.filter(s => s._id !== id));
      } else {
        alert(json.message || 'Failed to reject specialist');
      }
    } catch {
      alert('Connection error');
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
      <header style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyBetween: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '32px', marginBottom: '8px', fontFamily: 'Playfair Display' }}>Admin Dashboard</h1>
          <p style={{ opacity: 0.7 }}>Manage appointments and verify incoming healthcare specialist registrations.</p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--color-cream-dark)' }}>
        <button 
          onClick={() => setActiveTab('bookings')} 
          style={{
            background: 'transparent', border: 'none', padding: '12px 16px', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
            borderBottom: activeTab === 'bookings' ? '3px solid var(--color-orange)' : '3px solid transparent',
            color: activeTab === 'bookings' ? 'var(--color-orange)' : 'var(--color-muted)',
            outline: 'none'
          }}
        >
          Appointments ({data ? data.length : 0})
        </button>
        <button 
          onClick={() => setActiveTab('specialists')} 
          style={{
            background: 'transparent', border: 'none', padding: '12px 16px', fontWeight: '700', fontSize: '15px', cursor: 'pointer',
            borderBottom: activeTab === 'specialists' ? '3px solid var(--color-orange)' : '3px solid transparent',
            color: activeTab === 'specialists' ? 'var(--color-orange)' : 'var(--color-muted)',
            outline: 'none'
          }}
        >
          Specialist Approvals ({specialists ? specialists.length : 0})
        </button>
      </div>

      {activeTab === 'bookings' ? (
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
      ) : (
        <div className="card-light" style={{ padding: '0', overflowX: 'auto', borderRadius: 'var(--r-lg)' }}>
          <table className="w-full" style={{ borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-cream-dark)', backgroundColor: 'rgba(237, 184, 32, 0.05)' }}>
                <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Specialist</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Licensing & Institution</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Bio Summary</th>
                <th style={{ padding: '20px 24px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {specialists && specialists.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid #f0edeb' }}>
                  <td style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--color-cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800' }}>
                        {s.initials || s.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: '700' }}>{s.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--color-orange)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Award size={12} /> {s.specialization} ({s.experience})
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '24px' }}>
                    <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={13} opacity={0.6} /> {s.clinicName || 'Not Specified'}</div>
                    <div style={{ fontSize: '13px', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Shield size={12} /> License: {s.licenseNumber}
                    </div>
                  </td>
                  <td style={{ padding: '24px', maxWidth: '350px' }}>
                    <p style={{ fontSize: '13px', opacity: 0.8, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                      {s.bio || 'No bio provided'}
                    </p>
                  </td>
                  <td style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '8px 16px', fontSize: '13px' }} 
                        onClick={() => handleApproveSpecialist(s._id)}
                      >
                        Approve
                      </button>
                      <button 
                        className="btn-danger" 
                        style={{ padding: '8px 16px', fontSize: '13px' }} 
                        onClick={() => handleRejectSpecialist(s._id)}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {specialists && specialists.length === 0 && <div style={{ padding: '64px', textAlign: 'center', opacity: 0.5 }}>No pending specialist applications found.</div>}
        </div>
      )}
    </div>
  );
};

export default Admin;
