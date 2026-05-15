import { ShieldCheck } from 'lucide-react';

const PrivacyPolicy = () => (
  <div className="container" style={{ maxWidth: '800px' }}>
    <div className="card-light">
      <ShieldCheck size={48} color="var(--color-orange)" style={{ marginBottom: '24px' }} />
      <h1 style={{ marginBottom: '24px' }}>Privacy Policy</h1>
      
      <p style={{ lineHeight: '1.8', opacity: 0.8, marginBottom: '20px' }}>Last Updated: May 15, 2026</p>

      <ol style={{ paddingLeft: '20px', lineHeight: '2' }}>
        <li><strong>Data Minimization:</strong> We collect only the essential information required to provide triage and booking services.</li>
        <li><strong>Encryption Standards:</strong> All data in transit and at rest is secured using AES-256 encryption.</li>
        <li><strong>Purpose Limitation:</strong> Collected health information is used exclusively for specialist recommendation and appointment scheduling.</li>
        <li><strong>Third-Party Disclosure:</strong> We do not share your personal identification or medical data with advertisers or third-party marketing firms.</li>
        <li><strong>User Access:</strong> You may request a report of all data associated with your profile at any time.</li>
        <li><strong>Data Retention:</strong> We delete inactive account data after 12 months to ensure your information does not persist longer than necessary.</li>
        <li><strong>AI Model Privacy:</strong> Inputs provided for triage are sent to AI providers solely for classification and are not used to train external models.</li>
        <li><strong>Cookies and Tracking:</strong> We use strictly functional cookies to manage your session state; we do not employ cross-site tracking pixels.</li>
        <li><strong>Security Breach Notification:</strong> In the event of a data breach, we commit to notifying affected users within 48 hours.</li>
        <li><strong>International Transfers:</strong> By using our service, you acknowledge that your data may be processed on secure cloud servers located outside your home country.</li>
      </ol>
    </div>
  </div>
);

export default PrivacyPolicy;
