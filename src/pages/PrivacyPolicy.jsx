import { ShieldCheck } from 'lucide-react';

const PrivacyPolicy = () => (
  <div className="container" style={{ maxWidth: '800px' }}>
    <div className="card-light">
      <ShieldCheck size={48} color="var(--color-orange)" style={{ marginBottom: '24px' }} />
      <h1 style={{ marginBottom: '24px' }}>Privacy Policy</h1>
      
      <p style={{ lineHeight: '1.8', opacity: 0.8, marginBottom: '20px' }}>
        Last Updated: May 15, 2026
      </p>

      <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>1. Introduction</h3>
      <p style={{ lineHeight: '1.8', opacity: 0.8, marginBottom: '16px' }}>
        SmartAssist is committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your information when you use our triage and appointment booking services.
      </p>

      <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>2. Information We Collect</h3>
      <p style={{ lineHeight: '1.8', opacity: 0.8, marginBottom: '16px' }}>
        We collect information you voluntarily provide, including your name, health-related problem descriptions, and appointment preferences. This data is processed to provide you with accurate specialist recommendations.
      </p>

      <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>3. Data Usage and Protection</h3>
      <p style={{ lineHeight: '1.8', opacity: 0.8, marginBottom: '16px' }}>
        Your data is encrypted using industry-standard protocols. We do not sell your personal data to third parties. We use your input solely to improve our triage engine and facilitate your connection with health specialists.
      </p>

      <h3 style={{ marginTop: '24px', marginBottom: '12px' }}>4. Your Rights</h3>
      <p style={{ lineHeight: '1.8', opacity: 0.8, marginBottom: '16px' }}>
        You have the right to request deletion of your data at any time by contacting our support team.
      </p>
    </div>
  </div>
);

export default PrivacyPolicy;
