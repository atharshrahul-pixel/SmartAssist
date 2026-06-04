import { Camera } from 'lucide-react';

const SpecProfileTab = ({
  profileForm,
  photoPreview,
  saveLoading,
  errorMsg,
  onProfileFormChange,
  onPhotoChange,
  onUpdateProfile,
  t
}) => {
  return (
    <form onSubmit={onUpdateProfile} className="card-light" style={{ padding: '32px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>{t('professional_profile_details')}</h2>

      {errorMsg && (
        <div style={{ color: '#ef4444', marginBottom: '16px', fontWeight: '600' }}>{errorMsg}</div>
      )}

      <div className="mb-md">
        <label htmlFor="profile-clinic" className="form-label">{t('clinic_name_label')}</label>
        <input
          id="profile-clinic"
          type="text"
          className="input-field"
          value={profileForm.clinicName}
          onChange={e => onProfileFormChange('clinicName', e.target.value)}
        />
      </div>

      <div className="mb-md">
        <label htmlFor="profile-exp" className="form-label">{t('years_experience')}</label>
        <input
          id="profile-exp"
          type="number"
          className="input-field"
          value={profileForm.experience}
          onChange={e => onProfileFormChange('experience', e.target.value)}
          required
        />
      </div>

      <div className="mb-md">
        <label htmlFor="profile-bio" className="form-label">{t('professional_bio_label')}</label>
        <textarea
          id="profile-bio"
          className="input-field"
          value={profileForm.bio}
          onChange={e => onProfileFormChange('bio', e.target.value)}
          rows="4"
          style={{ padding: '12px' }}
        />
      </div>

      <div className="mb-lg">
        <label htmlFor="profile-photo" className="form-label">{t('profile_image_label')}</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
          <div className="profile-image-preview">
            {photoPreview ? <img src={photoPreview} alt="Profile Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Camera />}
          </div>
          <input
            id="profile-photo"
            type="file"
            accept="image/*"
            onChange={onPhotoChange}
          />
        </div>
      </div>

      <button type="submit" className="btn-primary" disabled={saveLoading} style={{ padding: '12px 24px' }}>
        {saveLoading ? t('saving_profile') : t('save_profile_changes')}
      </button>
    </form>
  );
};

export default SpecProfileTab;
