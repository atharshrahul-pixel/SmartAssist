import { use } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import Stepper from '../components/Stepper';

import AppointmentsTab from '../components/dashboard/AppointmentsTab';
import FamilyTab from '../components/dashboard/FamilyTab';
import WaitlistsTab from '../components/dashboard/WaitlistsTab';
import RatingModal from '../components/dashboard/RatingModal';
import UserHeader from '../components/dashboard/UserHeader';
import SidebarTabs from '../components/dashboard/SidebarTabs';
import { useDashboard } from '../hooks/useDashboard';

const Dashboard = () => {
  const { t } = useTranslation();
  const { user, token, logoutUser, refreshUser } = use(AppContext);
  const navigate = useNavigate();

  const {
    dbState,
    dispatch,
    handleAddFamilyMember,
    handleDeleteFamilyMember,
    handleClaimAndBook,
    handleSubmitRating,
    handleCancelBooking,
    handleDeleteBooking,
    handleLogout,
    fetchProfile
  } = useDashboard({ user, token, logoutUser, refreshUser, navigate, t });

  if (!user) return null;

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Stepper currentStep={2} flow="account" />
      <div className="container" style={{ paddingTop: '20px', flex: 1 }}>
      
      {/* Header bar */}
      <UserHeader user={user} handleLogout={handleLogout} t={t} />

      {/* Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 18fr', gap: '32px' }}>
        {/* Sidebar tabs */}
        <SidebarTabs 
          activeTab={dbState.activeTab} 
          waitlistCount={user.waitlistAppointments ? user.waitlistAppointments.length : 0} 
          setActiveTab={tab => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab })} 
          t={t} 
        />

        {/* Content area */}
        <div>
          {dbState.activeTab === 'appointments' && (
            <AppointmentsTab 
              bookings={dbState.bookings}
              hasLoaded={dbState.hasLoaded}
              onRateSpecialist={val => dispatch({ type: 'OPEN_RATING', payload: val })}
              onCancelBooking={handleCancelBooking}
              onDeleteBooking={handleDeleteBooking}
              cancellingIds={dbState.cancellingIds || []}
              deletingIds={dbState.deletingIds || []}
              onBookNow={() => navigate('/')}
              t={t}
            />
          )}

          {dbState.activeTab === 'family' && (
            <FamilyTab 
              familyProfiles={user.familyProfiles}
              familyFields={dbState.familyFields}
              otherRelationship={dbState.otherRelationship}
              familyLoading={dbState.familyLoading}
              onAddFamilyMember={handleAddFamilyMember}
              onDeleteFamilyMember={handleDeleteFamilyMember}
              onFieldChange={(field, val) => dispatch({ type: 'SET_FAMILY_FIELD', field, value: val })}
              onOtherRelationshipChange={val => dispatch({ type: 'SET_OTHER_RELATIONSHIP', payload: val })}
              t={t}
            />
          )}

          {dbState.activeTab === 'waitlists' && (
            <WaitlistsTab 
              waitlistAppointments={user.waitlistAppointments}
              onClaimAndBook={handleClaimAndBook}
              onExpire={fetchProfile}
              t={t}
            />
          )}
        </div>
      </div>

      {/* Rating Modal */}
      {dbState.ratingSpecialist && (
        <RatingModal 
          ratingSpecialist={dbState.ratingSpecialist}
          ratingValue={dbState.ratingValue}
          ratingLoading={dbState.ratingLoading}
          onRatingValueChange={val => dispatch({ type: 'SET_RATING_VALUE', payload: val })}
          onSubmitRating={handleSubmitRating}
          onClose={() => dispatch({ type: 'CLOSE_RATING' })}
          t={t}
        />
      )}
      </div>
    </div>
  );
};

export default Dashboard;
