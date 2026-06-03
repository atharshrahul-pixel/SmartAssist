import { useTranslation } from 'react-i18next';
import { Zap, Shield, Clock } from 'lucide-react';

const TriageIntro = ({ words, wordIndex }) => {
  const { t } = useTranslation();
  return (
    <div className="split-content">
      <span className="pill-tag mb-lg">{t('ai_powered_triage')}</span>
      <h1 style={{ fontSize: '64px', lineHeight: '1', marginBottom: 'var(--sp-lg)', maxWidth: '600px' }}>
        {t('tell_us_your')}{' '}
        <span className="text-rotator-container">
          <span className="text-rotator-ghost" aria-hidden="true">wellness</span>
          {words.map((word, idx) => {
            let className = 'text-rotator-word';
            if (idx === wordIndex) {
              className += ' active';
            } else if (idx === (wordIndex - 1 + words.length) % words.length) {
              className += ' exit';
            } else {
              className += ' idle';
            }
            return (
              <span key={word} className={className}>
                {word}
              </span>
            );
          })}
        </span>{' '}
        {t('concern')}
      </h1>
      <p style={{ color: 'var(--color-dark)', fontSize: '18px', lineHeight: '1.6', maxWidth: '520px', marginBottom: 'var(--sp-xl)', opacity: 0.8 }}>
        {t('triage_description')}
      </p>

      <div className="benefits-list" style={{ marginTop: 'var(--sp-xl)' }}>
        <div className="benefit-item">
          <div className="benefit-icon"><Zap size={14} /></div>
          <span>{t('benefit_1')}</span>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon"><Shield size={14} /></div>
          <span>{t('benefit_2')}</span>
        </div>
        <div className="benefit-item">
          <div className="benefit-icon"><Clock size={14} /></div>
          <span>{t('benefit_3')}</span>
        </div>
      </div>
    </div>
  );
};

export default TriageIntro;
