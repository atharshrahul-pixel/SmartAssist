import { LogOut } from 'lucide-react';

const UserHeader = ({ user, handleLogout, t }) => {
  return (
    <div className="card-light dashboard-header-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="dashboard-avatar">
          {user.name.substring(0, 2).toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700' }}>{t('hello')}, {user.name}</h1>
          <p style={{ opacity: 0.6, fontSize: '14px' }}>{t('health_portal_welcome')}</p>
        </div>
      </div>
      <button type="button" onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
        <LogOut size={16} /> {t('logout')}
      </button>
    </div>
  );
};

export default UserHeader;
