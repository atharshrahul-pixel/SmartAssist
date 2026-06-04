import { use } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import Stepper from '../components/Stepper';
import { 
  Calendar, Clock, Camera, 
  AlertCircle, DollarSign, Settings, LogOut, User
} from 'lucide-react';

import SpecAppointmentsTab from '../components/specialist/SpecAppointmentsTab';
import SpecAvailabilityTab from '../components/specialist/SpecAvailabilityTab';
import SpecProfileTab from '../components/specialist/SpecProfileTab';
import SpecEarningsTab from '../components/specialist/SpecEarningsTab';
import PreVisitSummaryModal from '../components/specialist/PreVisitSummaryModal';
import { useSpecialistDashboard } from '../hooks/useSpecialistDashboard';

// react-doctor-disable-next-line react-doctor/no-giant-component
const SpecialistDashboard = () => {
  const { t } = useTranslation();
  const { token, logoutUser } = use(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const infoMessage = location.state?.infoMessage;

  const {
    dbState,
    dispatch,
    fetchProfile,
    fetchPrevisitSummary,
    handleUpdateProfile,
    handleSaveAvailability,
    handleReapply,
    handleAddSlot,
    handleRemoveSlot,
    handleLogout
  } = useSpecialistDashboard(token, navigate, logoutUser);

  if (dbState.loading) {
    return (
      <div className="container text-center" style={{ paddingTop: '100px' }}>
        <h3>{t('loading_portal')}</h3>
      </div>
    );
  }

  if (dbState.errorMsg && !dbState.specialist) {
    return (
      <div className="container text-center" style={{ paddingTop: '100px' }}>
        <h3 style={{ color: '#ef4444' }}>{dbState.errorMsg}</h3>
        <button type="button" onClick={fetchProfile} className="btn-primary" style={{ marginTop: '20px' }}>Retry</button>
      </div>
    );
  }

  // Pending Review View
  if (dbState.specialist && dbState.specialist.status === 'pending') {
    return (
      <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        <Stepper currentStep={1} flow="account" />
        <div className="container" style={{ maxWidth: '520px', paddingTop: '40px', flex: 1 }}>
          {infoMessage && (
            <div className="alert-banner-warning">
              <AlertCircle size={16} />
              <span>{infoMessage}</span>
            </div>
          )}
          <div className="card-light text-center" style={{ padding: '40px' }}>
            <Clock size={56} color="var(--color-orange)" style={{ marginBottom: '24px' }} />
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>{t('app_under_review')}</h2>
            <p style={{ opacity: 0.7, fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
              {t('hello')}, <strong>{dbState.specialist.name}</strong>. {t('triage_description', { defaultValue: 'Your request is under review.' })}
              (<strong>{dbState.specialist.licenseNumber}</strong>).
            </p>
            <button type="button" onClick={handleLogout} className="btn-secondary w-full" style={{ padding: '12px' }}>
              <LogOut size={16} style={{ marginRight: '8px' }} /> {t('logout')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Rejection & Reapply Form View
  if (dbState.specialist && dbState.specialist.status === 'rejected') {
    return (
      <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
        <Stepper currentStep={1} flow="account" />
        <div className="container" style={{ maxWidth: '600px', paddingTop: '20px', paddingBottom: '60px', flex: 1 }}>
          {infoMessage && (
            <div className="alert-banner-error">
              <AlertCircle size={16} />
              <span>{infoMessage}</span>
            </div>
          )}
          <div className="card-light" style={{ padding: '40px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
              <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>{t('app_declined')}</h2>
              <p style={{ opacity: 0.6, fontSize: '14px' }}>{t('tooltip_rejection')}</p>
            </div>

            <div className="rejection-reason-box">
              <strong>{t('reason_rejection')}</strong>
              <p style={{ margin: '6px 0 0 0', fontStyle: 'italic' }}>"{dbState.specialist.rejectionReason || 'No reasoning supplied.'}"</p>
            </div>

            <form onSubmit={handleReapply}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase' }}>{t('update_reapply')}</h3>
              
              {dbState.errorMsg && (
                <div style={{ color: '#ef4444', marginBottom: '16px', fontWeight: '600' }}>{dbState.errorMsg}</div>
              )}
              
              <div className="mb-md">
                <label htmlFor="reapply-name" className="form-label">{t('full_name_label')}</label>
                <input
                  id="reapply-name"
                  type="text"
                  className="input-field"
                  value={dbState.reapplyData.name}
                  onChange={e => dispatch({ type: 'SET_REAPPLY_FIELD', field: 'name', value: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="mb-md">
                  <label htmlFor="reapply-spec" className="form-label">{t('specialization')}</label>
                  <select
                    id="reapply-spec"
                    className="input-field"
                    value={dbState.reapplyData.specialization}
                    onChange={e => dispatch({ type: 'SET_REAPPLY_FIELD', field: 'specialization', value: e.target.value })}
                    style={{ padding: '10px 12px' }}
                  >
                    <option value="Dentist">Dentist</option>
                    <option value="Physiotherapist">Physiotherapist</option>
                    <option value="Gym Trainer">Gym Trainer</option>
                    <option value="Salon Specialist">Salon Specialist</option>
                    <option value="General Practitioner">General Practitioner</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Orthopedist">Orthopedist</option>
                    <option value="Nutritionist">Nutritionist</option>
                    <option value="ENT Specialist">ENT Specialist</option>
                    <option value="Ophthalmologist">Ophthalmologist</option>
                  </select>
                </div>

                <div className="mb-md">
                  <label htmlFor="reapply-exp" className="form-label">{t('years_experience')}</label>
                  <input
                    id="reapply-exp"
                    type="number"
                    className="input-field"
                    value={dbState.reapplyData.experience}
                    onChange={e => dispatch({ type: 'SET_REAPPLY_FIELD', field: 'experience', value: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-md">
                <label htmlFor="reapply-clinic" className="form-label">{t('clinic_name_label')}</label>
                <input
                  id="reapply-clinic"
                  type="text"
                  className="input-field"
                  value={dbState.reapplyData.clinicName}
                  onChange={e => dispatch({ type: 'SET_REAPPLY_FIELD', field: 'clinicName', value: e.target.value })}
                />
              </div>

              <div className="mb-md">
                <label htmlFor="reapply-bio" className="form-label">{t('professional_bio_label')}</label>
                <textarea
                  id="reapply-bio"
                  className="input-field"
                  value={dbState.reapplyData.bio}
                  onChange={e => dispatch({ type: 'SET_REAPPLY_FIELD', field: 'bio', value: e.target.value })}
                  rows="3"
                  style={{ padding: '12px' }}
                />
              </div>

              <div className="mb-lg">
                <label htmlFor="reapply-photo" className="form-label">{t('profile_image_label')}</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                  <div className="reapply-image-preview">
                    {dbState.reapplyPreview ? <img src={dbState.reapplyPreview} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera />}
                  </div>
                  <input
                    id="reapply-photo"
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          dispatch({ type: 'SET_REAPPLY_PHOTO', payload: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button type="submit" className="btn-primary w-full" disabled={dbState.reapplyLoading}>
                  {dbState.reapplyLoading ? t('reapplying') : t('resubmit_app')}
                </button>
                <button type="button" onClick={handleLogout} className="btn-secondary">
                  {t('logout')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Approved Specialist Dashboard
  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Stepper currentStep={2} flow="account" />

      <div className="container" style={{ paddingTop: '20px', flex: 1, paddingBottom: '60px' }}>
        
        {/* Header bar */}
        <div className="card-light dashboard-header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="dashboard-avatar">
              {dbState.specialist.profilePhoto ? (
                <img src={dbState.specialist.profilePhoto} alt={dbState.specialist.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                dbState.specialist.name.substring(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '700' }}>{dbState.specialist.name}</h1>
              <p style={{ opacity: 0.6, fontSize: '14px' }}>{t('practitioner_portal')} ({t(`category_${dbState.specialist.specialization}`, { defaultValue: dbState.specialist.specialization })})</p>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
            <LogOut size={16} /> {t('logout')}
          </button>
        </div>

        {/* Grid Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }}>
          {/* Sidebar */}
          <div>
            <div className="card-light" style={{ padding: '12px' }}>
              <button 
                type="button"
                onClick={() => dispatch({ type: 'SET_TAB', payload: 'appointments' })} 
                className={`dashboard-tab-btn ${dbState.activeTab === 'appointments' ? 'active' : ''}`}
              >
                <Calendar size={18} /> {t('appointments')}
              </button>
              <button 
                type="button"
                onClick={() => dispatch({ type: 'SET_TAB', payload: 'availability' })} 
                className={`dashboard-tab-btn ${dbState.activeTab === 'availability' ? 'active' : ''}`}
              >
                <Settings size={18} /> {t('slots_pricing')}
              </button>
              <button 
                type="button"
                onClick={() => dispatch({ type: 'SET_TAB', payload: 'profile' })} 
                className={`dashboard-tab-btn ${dbState.activeTab === 'profile' ? 'active' : ''}`}
              >
                <User size={18} /> {t('manage_profile')}
              </button>
              <button 
                type="button"
                onClick={() => dispatch({ type: 'SET_TAB', payload: 'earnings' })} 
                className={`dashboard-tab-btn ${dbState.activeTab === 'earnings' ? 'active' : ''}`}
              >
                <DollarSign size={18} /> {t('earnings_tab')}
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div>
            {dbState.activeTab === 'appointments' && (
              <SpecAppointmentsTab 
                appointments={dbState.appointments}
                summaryLoading={dbState.summaryLoading}
                onFetchPrevisitSummary={fetchPrevisitSummary}
                t={t}
              />
            )}

            {dbState.activeTab === 'availability' && (
              <SpecAvailabilityTab 
                modesConfig={dbState.modesConfig}
                slotsList={dbState.slotsList}
                newSlot={dbState.newSlot}
                saveLoading={dbState.saveLoading}
                onModesConfigChange={(mode, field, val) => {
                  dispatch({
                    type: 'SET_MODES_CONFIG',
                    payload: {
                      ...dbState.modesConfig,
                      [mode]: { ...dbState.modesConfig[mode], [field]: val }
                    }
                  });
                }}
                onNewSlotChange={val => dispatch({ type: 'SET_NEW_SLOT', payload: val })}
                onAddSlot={handleAddSlot}
                onRemoveSlot={handleRemoveSlot}
                onSaveAvailability={handleSaveAvailability}
                t={t}
              />
            )}

            {dbState.activeTab === 'profile' && (
              <SpecProfileTab 
                profileForm={dbState.profileForm}
                photoPreview={dbState.photoPreview}
                saveLoading={dbState.saveLoading}
                errorMsg={dbState.errorMsg}
                onProfileFormChange={(field, val) => dispatch({ type: 'SET_PROFILE_FIELD', field, value: val })}
                onPhotoChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      dispatch({ type: 'SET_PHOTO', payload: reader.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                onUpdateProfile={handleUpdateProfile}
                t={t}
              />
            )}

            {dbState.activeTab === 'earnings' && (
              <SpecEarningsTab 
                earnings={dbState.earnings}
                t={t}
              />
            )}
          </div>
        </div>
      </div>

      {/* Pre-Visit Summary Modal */}
      {dbState.activeSummary && (
        <PreVisitSummaryModal 
          activeSummary={dbState.activeSummary}
          onClose={() => dispatch({ type: 'SET_SUMMARY', payload: null })}
          t={t}
        />
      )}
    </div>
  );
};

export default SpecialistDashboard;
