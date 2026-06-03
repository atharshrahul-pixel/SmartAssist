import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HelpTooltip from '../HelpTooltip';
import { User, Mail, Key, Award, MapPin, Shield, FileText, Camera, AlertCircle } from 'lucide-react';

const SpecialistRegisterForm = ({
  formData,
  errorMsg,
  loading,
  photoPreview,
  handleInputChange,
  handlePhotoUpload,
  handleSubmit,
}) => {
  const { t } = useTranslation();

  return (
    <form onSubmit={handleSubmit}>
      {errorMsg && (
        <div className="error-banner-container">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="mb-md" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">
            <User size={14} style={{ marginRight: '6px' }} /> {t('full_name_label')}
            <HelpTooltip text={t('full_name_register_tooltip')} />
          </label>
          <input
            type="text"
            name="name"
            className="input-field"
            placeholder={t('full_name_placeholder')}
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-md">
          <label className="form-label">
            <Mail size={14} style={{ marginRight: '6px' }} /> Email Address
            <HelpTooltip text="Your login email where waitlist updates and approvals will be sent." />
          </label>
          <input
            type="email"
            name="email"
            className="input-field"
            placeholder="jane.smith@clinic.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-md">
          <label className="form-label">
            <Key size={14} style={{ marginRight: '6px' }} /> Password
            <HelpTooltip text="Must contain at least 6 characters." />
          </label>
          <input
            type="password"
            name="password"
            className="input-field"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-md">
          <label className="form-label">
            <Award size={14} style={{ marginRight: '6px' }} /> Specialization
            <HelpTooltip text="Select your primary health or wellness specialization category." />
          </label>
          <select
            name="specialization"
            className="input-field"
            value={formData.specialization}
            onChange={handleInputChange}
            required
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
          <label className="form-label">
            <Award size={14} style={{ marginRight: '6px' }} /> Years of Experience
            <HelpTooltip text="Number of years you have been practicing." />
          </label>
          <input
            type="number"
            name="experience"
            className="input-field"
            placeholder="e.g. 8"
            value={formData.experience}
            onChange={handleInputChange}
            min="1"
            required
          />
        </div>

        <div className="mb-md">
          <label className="form-label">
            <MapPin size={14} style={{ marginRight: '6px' }} /> Clinic Name
            <HelpTooltip text="Name of the clinic or institution where you currently practice." />
          </label>
          <input
            type="text"
            name="clinicName"
            className="input-field"
            placeholder="e.g. City Health Dental"
            value={formData.clinicName}
            onChange={handleInputChange}
          />
        </div>

        <div className="mb-md">
          <label className="form-label">
            <Shield size={14} style={{ marginRight: '6px' }} /> {t('license_number_label')}
            <HelpTooltip text={t('license_number_tooltip')} />
          </label>
          <input
            type="text"
            name="licenseNumber"
            className="input-field"
            placeholder={t('license_number_placeholder')}
            value={formData.licenseNumber}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-md" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">
            <FileText size={14} style={{ marginRight: '6px' }} /> Professional Bio
            <HelpTooltip text="A brief summary of your practice, specialties, and approach to patient care." />
          </label>
          <textarea
            name="bio"
            className="input-field"
            placeholder="Tell patients about your background..."
            value={formData.bio}
            onChange={handleInputChange}
            rows="3"
            style={{ resize: 'vertical', padding: '12px' }}
          />
        </div>

        <div className="mb-lg" style={{ gridColumn: 'span 2' }}>
          <label className="form-label">
            <Camera size={14} style={{ marginRight: '6px' }} /> Profile Photo
            <HelpTooltip text="Upload a professional profile photo. Max size: 1MB." />
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
            <div className="photo-preview-box">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Camera size={20} color="var(--color-muted)" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{ fontSize: '13px' }}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="btn-primary w-full"
        disabled={loading}
        style={{ padding: '14px 28px', marginTop: '12px' }}
      >
        {loading ? t('submitting_app') : t('submit_app_btn')}
      </button>

      <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', opacity: 0.8 }}>
        Are you a patient?{' '}
        <Link to="/register" style={{ color: 'var(--color-orange)', fontWeight: '600' }}>
          Register here
        </Link>
      </div>
    </form>
  );
};

export default SpecialistRegisterForm;
