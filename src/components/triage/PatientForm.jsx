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
            <label className="form-label">
              {t('appointment_for_label')}
              <HelpTooltip text={t('tooltip_appointment_for')} />
            </label>
            <select
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
