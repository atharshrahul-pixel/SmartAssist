import { ShieldCheck } from 'lucide-react';

const PrivacyPolicy = () => (
  <div className="container" style={{ maxWidth: '800px' }}>
    <h1 style={{ marginBottom: '24px' }}>Privacy Policy</h1>
    <div className="card-light">
      <ShieldCheck size={48} color="var(--color-orange)" style={{ marginBottom: '16px' }} />
      <h3>Your Data, Protected</h3>
      <p style={{ lineHeight: '1.8', opacity: 0.8 }}>
        At SmartAssist, we prioritize your privacy. We use industry-standard encryption to protect your health data.
        We do not sell your personal information. Your triage data is used solely to recommend the most appropriate 
        specialist for your care.
      </p>
    </div>
  </div>
);

export default PrivacyPolicy;
