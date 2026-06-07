import { Calendar, Users, Bell } from 'lucide-react';

const SidebarTabs = ({ activeTab, waitlistCount, setActiveTab, t }) => {
  return (
    <div>
      <div className="card-light" style={{ padding: '12px' }}>
        <button 
          type="button"
          onClick={() => setActiveTab('appointments')} 
          className={`dashboard-tab-btn ${activeTab === 'appointments' ? 'active' : ''}`}
        >
          <Calendar size={18} /> {t('appointments')}
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('family')} 
          className={`dashboard-tab-btn ${activeTab === 'family' ? 'active' : ''}`}
        >
          <Users size={18} /> {t('family_profiles', { defaultValue: 'Family Profiles' })}
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('waitlists')} 
          className={`dashboard-tab-btn ${activeTab === 'waitlists' ? 'active' : ''}`}
        >
          <Bell size={18} /> {t('waitlist')} ({waitlistCount})
        </button>
      </div>
    </div>
  );
};

export default SidebarTabs;
