import { Check } from 'lucide-react';

const Stepper = ({ currentStep }) => {
  const steps = [1, 2, 3, 4, 5, 6];
  
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--sp-xl) var(--sp-md) 0'
    }}>
      {steps.map((step, index) => {
        const isActive = step === currentStep;
        const isCompleted = step < currentStep;
        
        return (
          <div key={step} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--r-pill)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '700',
              background: isActive ? 'var(--color-accent)' : isCompleted ? 'var(--color-dark)' : 'transparent',
              border: !isActive && !isCompleted ? '1px solid var(--color-cream-dark)' : 'none',
              color: isActive ? 'var(--color-dark)' : isCompleted ? 'var(--color-white)' : 'var(--color-muted)'
            }}>
              {isCompleted ? <Check size={14} /> : step}
            </div>
            {index < steps.length - 1 && (
              <div style={{
                width: '32px',
                height: '1px',
                margin: '0 8px',
                background: isCompleted ? 'var(--color-dark)' : 'var(--color-cream-dark)'
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
