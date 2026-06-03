import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SpecialistSuccessCard = () => {
  const { t } = useTranslation();

  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div className="success-badge-container">
        ✓
      </div>
      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px' }}>{t('application_submitted')}</h3>
      <p style={{ opacity: 0.7, fontSize: '14px', lineHeight: '1.6', marginBottom: '24px' }}>
        {t('app_review_desc')}
      </p>
      <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
        <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', padding: '12px 24px' }}>
          {t('login_check_status')}
        </Link>
        <Link to="/" className="btn-secondary" style={{ textDecoration: 'none', padding: '12px 24px' }}>
          {t('back_to_homepage')}
        </Link>
      </div>
    </div>
  );
};

export default SpecialistSuccessCard;
