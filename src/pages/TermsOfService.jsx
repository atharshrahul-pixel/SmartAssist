import { FileText } from 'lucide-react';

const TermsOfService = () => (
  <div className="container" style={{ maxWidth: '800px' }}>
    <h1 style={{ marginBottom: '24px' }}>Terms of Service</h1>
    <div className="card-light">
      <FileText size={48} color="var(--color-orange)" style={{ marginBottom: '16px' }} />
      <h3>Acceptance of Terms</h3>
      <p style={{ lineHeight: '1.8', opacity: 0.8 }}>
        By using SmartAssist, you agree to these terms. SmartAssist is a triage tool, not a medical professional. 
        In case of emergencies, please contact your local emergency services immediately.
      </p>
    </div>
  </div>
);

export default TermsOfService;
