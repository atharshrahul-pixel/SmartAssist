import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import HelpTooltip from '../components/HelpTooltip';
import Stepper from '../components/Stepper';
import { translateError } from '../utils/errorTranslator';
import { UserPlus, User, Key, Mail, Award, MapPin, Shield, FileText, Camera, AlertCircle } from 'lucide-react';

const BACKEND_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://akeno7594-internship-project-backend.hf.space/api';

const SpecialistRegister = () => {
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

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1.2 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 1MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, profilePhoto: reader.result }));
      setPhotoPreview(reader.result);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) return setErrorMsg('Please enter your full name.');
    if (!formData.email.trim()) return setErrorMsg('Please enter your email.');
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      return setErrorMsg('Please enter a valid email format.');
    }

    if (!formData.password.trim() || formData.password.length < 6) {
      return setErrorMsg('Password must be at least 6 characters.');
    }

    if (!formData.licenseNumber.trim()) {
      return setErrorMsg('Please enter your medical license or registration number.');
    }

    if (!formData.experience || isNaN(formData.experience) || Number(formData.experience) <= 0) {
      return setErrorMsg('Please enter a valid number of years of experience.');
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${BACKEND_URL}/auth/register/specialist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(json.message || 'Application submitted successfully!');
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
        setPhotoPreview(null);
      } else {
        setErrorMsg(translateError(json.message || 'Registration failed.'));
      }
    } catch (err) {
      setErrorMsg(translateError('Connection failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <Stepper currentStep={1} flow="account" />

      <div className="container" style={{ maxWidth: '640px', paddingTop: '20px', paddingBottom: '60px', flex: 1 }}>
        <div className="card-light" style={{ padding: '40px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(237, 184, 32, 0.1)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-accent)',
              marginBottom: '16px'
            }}>
              <UserPlus size={24} />
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
              Specialist <span className="accent-word">Onboarding</span>
            </h2>
            <p style={{ opacity: 0.6, fontSize: '14px' }}>Register to join our network of certified healthcare professionals.</p>
          </div>

          {successMsg ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', background: '#ECFDF5',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: '#10B981', marginBottom: '20px', border: '2px solid #10B981'
              }}>
                ✓
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>Application Submitted!</h3>
              <p style={{ opacity: 0.7, fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
                Your professional credentials are currently under review by our administration team. 
                We will notify you via email once your account has been verified and approved.
              </p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 24px' }}>
                  Log In to Check Status
                </Link>
                <Link to="/" className="btn-secondary" style={{ textDecoration: 'none', padding: '12px 24px' }}>
                  Back to Homepage
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errorMsg && (
                <div style={{
                  background: 'rgba(224, 88, 48, 0.1)',
                  color: 'var(--color-orange)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="mb-md" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">
                    <User size={14} style={{ marginRight: '6px' }} /> Full Name
                    <HelpTooltip text="Enter your full name including professional credentials if desired (e.g. Dr. Jane Smith)." />
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="input-field"
                    placeholder="Dr. Jane Smith"
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
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dermatologist">Dermatologist</option>
                    <option value="General Physician">General Physician</option>
                    <option value="Pediatrician">Pediatrician</option>
                    <option value="Therapist">Therapist</option>
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
                    <Shield size={14} style={{ marginRight: '6px' }} /> License Number
                    <HelpTooltip text="Your official medical license or registration number (must be unique)." />
                  </label>
                  <input
                    type="text"
                    name="licenseNumber"
                    className="input-field"
                    placeholder="e.g. LIC-98342-MD"
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
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      background: 'rgba(0,0,0,0.03)',
                      border: '2px dashed rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
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
                {loading ? 'Submitting Application...' : 'Submit Onboarding Application'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', opacity: 0.8 }}>
                Are you a patient?{' '}
                <Link to="/register" style={{ color: 'var(--color-orange)', fontWeight: '600' }}>
                  Register here
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecialistRegister;
