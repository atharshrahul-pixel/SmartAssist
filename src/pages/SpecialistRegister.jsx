import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Stepper from '../components/Stepper';
import { translateError } from '../utils/errorTranslator';
import SpecialistSuccessCard from '../components/specialist/SpecialistSuccessCard';
import SpecialistRegisterForm from '../components/specialist/SpecialistRegisterForm';
import { UserPlus } from 'lucide-react';
import { renderSafeTitle } from '../utils/titleRenderer';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://p01--smart-assist-backend--qnbs82bxhg66.code.run/api');

const SpecialistRegister = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: 'Dentist',
    experience: '',
    clinicName: '',
    licenseNumber: '',
    bio: '',
    profilePhoto: ''
  });

  const [uiState, setUiState] = useState({
    errorMsg: '',
    successMsg: '',
    loading: false,
    photoPreview: null
  });

  const { errorMsg, successMsg, loading, photoPreview } = uiState;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setUiState(prev => ({ ...prev, errorMsg: '' }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1.2 * 1024 * 1024) {
      setUiState(prev => ({ ...prev, errorMsg: t('image_size_error') }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, profilePhoto: reader.result }));
      setUiState(prev => ({ ...prev, photoPreview: reader.result, errorMsg: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return setUiState(prev => ({ ...prev, errorMsg: t('error_name_required') }));
    if (!formData.email.trim()) return setUiState(prev => ({ ...prev, errorMsg: t('error_email_required') }));
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      return setUiState(prev => ({ ...prev, errorMsg: t('error_valid_email') }));
    }

    if (!formData.password.trim() || formData.password.length < 6) {
      return setUiState(prev => ({ ...prev, errorMsg: t('error_password_short') }));
    }

    if (!formData.licenseNumber.trim()) {
      return setUiState(prev => ({ ...prev, errorMsg: t('license_number_tooltip') }));
    }

    if (!formData.experience || isNaN(formData.experience) || Number(formData.experience) <= 0) {
      return setUiState(prev => ({ ...prev, errorMsg: 'Please enter a valid number of years of experience.' }));
    }

    setUiState(prev => ({ ...prev, loading: true, errorMsg: '' }));

    try {
      const res = await fetch(`${BACKEND_URL}/auth/register/specialist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      if (json.success) {
        setFormData({
          name: '',
          email: '',
          password: '',
          specialization: 'Dentist',
          experience: '',
          clinicName: '',
          licenseNumber: '',
          bio: '',
          profilePhoto: ''
        });
        setUiState({
          errorMsg: '',
          successMsg: json.message || 'Application submitted successfully!',
          loading: false,
          photoPreview: null
        });
      } else {
        setUiState(prev => ({
          ...prev,
          loading: false,
          errorMsg: translateError(json.message || 'Registration failed.')
        }));
      }
    } catch {
      setUiState(prev => ({
        ...prev,
        loading: false,
        errorMsg: translateError('Connection failed. Please try again.')
      }));
    }
  };

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Stepper currentStep={1} flow="account" />

      <style>{`
        .register-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(237, 184, 32, 0.1);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--color-accent);
          margin-bottom: 16px;
        }
        .success-badge-container {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: #ECFDF5;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #10B981;
          margin-bottom: 20px;
          border: 2px solid #10B981;
          font-size: 24px;
          font-weight: 700;
        }
        .error-banner-container {
          background: 'rgba(224, 88, 48, 0.1)';
          color: 'var(--color-orange)';
          padding: '12px';
          border-radius: '8px';
          font-size: '13px';
          font-weight: '600';
          margin-bottom: '24px';
          display: 'flex';
          align-items: 'center';
          gap: '8px';
        }
        .photo-preview-box {
          width: 64px;
          height: 64px;
          border-radius: 12px;
          background: rgba(0,0,0,0.03);
          border: 2px dashed rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }
      `}</style>

      <div className="container" style={{ maxWidth: '640px', paddingTop: '20px', paddingBottom: '60px', flex: 1 }}>
        <div className="card-light" style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="register-icon-wrapper">
              <UserPlus size={24} />
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
              {renderSafeTitle(t('specialist_onboarding_title'))}
            </h2>
            <p style={{ opacity: 0.6, fontSize: '14px' }}>{t('specialist_onboarding_desc')}</p>
          </div>

          {successMsg ? (
            <SpecialistSuccessCard />
          ) : (
            <SpecialistRegisterForm
              formData={formData}
              errorMsg={errorMsg}
              loading={loading}
              photoPreview={photoPreview}
              handleInputChange={handleInputChange}
              handlePhotoUpload={handlePhotoUpload}
              handleSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecialistRegister;
