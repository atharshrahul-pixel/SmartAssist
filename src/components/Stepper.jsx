import { Check } from 'lucide-react';

const Stepper = ({ currentStep }) => {
  const steps = [1, 2, 3, 4, 5, 6];
  
  return (
    <div className="stepper-container">
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
  );
};

export default Stepper;
