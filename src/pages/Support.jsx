import { HelpCircle } from 'lucide-react';

const Support = () => (
  <div className="container" style={{ maxWidth: '800px' }}>
    <h1 style={{ marginBottom: '24px' }}>Support</h1>
    <div className="card-light">
      <HelpCircle size={48} color="var(--color-orange)" style={{ marginBottom: '16px' }} />
      <h3>Need Assistance?</h3>
      <p style={{ lineHeight: '1.8', opacity: 0.8 }}>
        If you are experiencing issues with the app, please reach out to our team.
      </p>
      <a href="mailto:support@smartassist.com" className="btn-primary mt-md">Email Support</a>
    </div>
  </div>
);

export default Support;
