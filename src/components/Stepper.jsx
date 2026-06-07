import { Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Stepper = ({ currentStep, flow = 'booking', stepNamesOverride }) => {
  const { t } = useTranslation();
  let steps = [1, 2, 3, 4, 5, 6];
  let stepNames = stepNamesOverride || [
    t('step_1_name'),
    t('step_2_name'),
    t('step_3_name'),
    t('step_4_name'),
    t('step_5_name'),
    t('step_6_name')
  ];
  let title = t('step_title', { current: currentStep, total: 6, name: stepNames[currentStep - 1] });

  if (flow === 'account') {
    return null;
  } else if (flow === 'lookup') {
    steps = [1, 2];
    stepNames = [
      t('step_1_lookup'),
      t('step_2_lookup')
    ];
    title = currentStep > 2 
      ? t('lookup_complete_title')
      : t('step_title', { current: currentStep, total: 2, name: stepNames[currentStep - 1] });
  } else if (flow === 'booking' && currentStep > 6) {
    title = t('booking_complete_title');
  }

  return (
    <div className="stepper-wrapper" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '24px 0 12px 0', gap: '8px' }}>
      <div className="stepper-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: 0 }}>
        {steps.map((step, index) => {
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          const status = isActive ? 'active' : isCompleted ? 'completed' : 'pending';
          
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
              <div className={`step-marker ${status}`}>
                {isCompleted ? <Check size={18} /> : step}
              </div>
              {index < steps.length - 1 && (
                <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />
              )}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--color-orange)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {flow === 'booking' && currentStep > 6 ? (
          <span style={{ color: '#10B981' }}>{title}</span>
        ) : (
          <span>{title}</span>
        )}
      </div>
    </div>
  );
};

export default Stepper;
