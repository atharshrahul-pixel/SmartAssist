import { Check } from 'lucide-react';

const Stepper = ({ currentStep, flow = 'booking' }) => {
  let steps = [1, 2, 3, 4, 5, 6];
  let stepNames = [
    "Tell us what's wrong",
    "View recommended doctor",
    "Give your opinion",
    "Pick a specialist",
    "Choose date and time",
    "Get your receipt"
  ];
  let title = `Step ${currentStep} of 6: ${stepNames[currentStep - 1]}`;

  if (flow === 'account') {
    steps = [1, 2];
    stepNames = [
      "Sign in or create account",
      "View dashboard & appointments"
    ];
    title = currentStep > 2 
      ? "Account Access Complete" 
      : `Step ${currentStep} of 2: ${stepNames[currentStep - 1]}`;
  } else if (flow === 'lookup') {
    steps = [1, 2];
    stepNames = [
      "Enter email or receipt code",
      "View matching appointments"
    ];
    title = currentStep > 2 
      ? "Lookup Complete" 
      : `Step ${currentStep} of 2: ${stepNames[currentStep - 1]}`;
  } else if (flow === 'booking' && currentStep > 6) {
    title = "Booking Completed Successfully!";
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
