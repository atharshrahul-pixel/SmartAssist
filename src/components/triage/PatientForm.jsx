import { useTranslation } from 'react-i18next';
import HelpTooltip from '../HelpTooltip';
import { AlertCircle } from 'lucide-react';

const PatientForm = ({
  user,
  name,
  setName,
  email,
  setEmail,
  appointmentFor,
  setAppointmentFor,
  otherName,
  setOtherName,
  locationQuery,
  setLocationQuery,
  hasLocation,
  onDetectLocation,
  onClearLocation,
  detectingLocation,
  errorMsg,
  setErrorMsg,
  loading,
  onSubmit,
}) => {
  const { t } = useTranslation();

  return (
    <form className="card-light" onSubmit={onSubmit}>
      {errorMsg && (
        <div className="error-banner-container">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {user ? (
        <>
          <div className="mb-lg">
            <label htmlFor="appointment-for-select" className="form-label">
              {t('appointment_for_label')}
              <HelpTooltip text={t('tooltip_appointment_for')} />
            </label>
            <select
              id="appointment-for-select"
              className="input-field"
              value={appointmentFor}
              onChange={(e) => {
                setAppointmentFor(e.target.value);
                setErrorMsg('');
              }}
            >
              <option value="myself">{t('myself')} ({user.name})</option>
              {user.familyProfiles && user.familyProfiles.map((member) => (
                <option key={member._id} value={member.name}>
                  {member.name} ({t(`rel_${member.relationship.toLowerCase()}`, { defaultValue: member.relationship })})
                </option>
              ))}
              <option value="other">{t('someone_else')}</option>
            </select>
          </div>

          {appointmentFor === 'other' && (
            <div className="mb-lg">
              <label htmlFor="patient-name-reg" className="form-label">
                {t('patient_name')}
                <HelpTooltip text={t('tooltip_patient_name')} />
              </label>
              <input
                id="patient-name-reg"
                type="text"
                className="input-field"
                placeholder={t('patient_name_placeholder')}
                value={otherName}
                onChange={(e) => {
                  setOtherName(e.target.value);
                  setErrorMsg('');
                }}
                style={{ borderColor: errorMsg && appointmentFor === 'other' && !otherName.trim() ? 'red' : '' }}
              />
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mb-lg">
            <label htmlFor="your-name-input" className="form-label">
              {t('your_name')}
              <HelpTooltip text={t('tooltip_your_name')} />
            </label>
            <input
              id="your-name-input"
              type="text"
              className="input-field"
              placeholder={t('enter_your_full_name')}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrorMsg('');
              }}
              style={{ borderColor: errorMsg && !name.trim() ? 'red' : '' }}
            />
          </div>

          <div className="mb-lg">
            <label htmlFor="your-email-input" className="form-label">
              {t('email_address')}
              <HelpTooltip text={t('tooltip_email')} />
            </label>
            <input
              id="your-email-input"
              type="email"
              className="input-field"
              placeholder={t('enter_your_email')}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrorMsg('');
              }}
              style={{ borderColor: errorMsg && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) ? 'red' : '' }}
            />
          </div>
        </>
      )}

      <div className="mb-lg">
        <label htmlFor="location-query-input" className="form-label">
          {t('your_location_label', { defaultValue: 'Your Location (ZIP or City)' })}
          <HelpTooltip text={t('tooltip_location', { defaultValue: 'Used to find the nearest specialists in your area.' })} />
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            id="location-query-input"
            type="text"
            className="input-field"
            placeholder={hasLocation ? t('location_detected', { defaultValue: 'GPS location active' }) : "e.g. Chennai 600001"}
            value={locationQuery || ''}
            onChange={(e) => {
              setLocationQuery(e.target.value);
              setErrorMsg('');
            }}
            readOnly={hasLocation}
            style={{ flex: 1, backgroundColor: hasLocation ? 'rgba(255, 255, 255, 0.05)' : '', cursor: hasLocation ? 'not-allowed' : 'text' }}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={onDetectLocation}
            disabled={detectingLocation}
            style={{ padding: '0 16px', fontSize: '14px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {detectingLocation ? t('detecting', { defaultValue: 'Detecting...' }) : (hasLocation ? t('detected_check', { defaultValue: '✓ GPS Active' }) : t('detect_btn', { defaultValue: 'Use GPS' }))}
          </button>
        </div>
        {hasLocation && (
          <div style={{ marginTop: '6px', textAlign: 'right' }}>
            <button
              type="button"
              onClick={onClearLocation}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent)',
                cursor: 'pointer',
                fontSize: '12px',
                textDecoration: 'underline',
                padding: 0
              }}
            >
              {t('enter_manually_btn', { defaultValue: 'Enter Pin Code Manually' })}
            </button>
          </div>
        )}
      </div>

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={loading}
        style={{ padding: '16px' }}
      >
        {t('start_triage')} →
      </button>
    </form>
  );
};

export default PatientForm;
