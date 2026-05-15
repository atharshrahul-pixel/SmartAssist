import { FileText } from 'lucide-react';

const TermsOfService = () => (
  <div className="container" style={{ maxWidth: '800px' }}>
    <div className="card-light">
      <FileText size={48} color="var(--color-orange)" style={{ marginBottom: '24px' }} />
      <h1 style={{ marginBottom: '24px' }}>Terms of Service</h1>
      
      <p style={{ lineHeight: '1.8', opacity: 0.8, marginBottom: '20px' }}>Last Updated: May 15, 2026</p>

      <ol style={{ paddingLeft: '20px', lineHeight: '2' }}>
        <li><strong>Non-Medical Disclaimer:</strong> SmartAssist is an informational tool and does not provide professional medical diagnosis or clinical treatment.</li>
        <li><strong>Emergency Protocol:</strong> Users experiencing medical emergencies must bypass this tool and contact local emergency services immediately.</li>
        <li><strong>Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your credentials and all activities occurring under your account.</li>
        <li><strong>Prohibited Use:</strong> Users may not attempt to reverse-engineer our AI models, overwhelm the service with automated requests, or scrape our specialist directory.</li>
        <li><strong>Service Availability:</strong> We do not guarantee 100% uptime and reserve the right to perform maintenance or modify features without prior notice.</li>
        <li><strong>Intellectual Property:</strong> All software, interface designs, and algorithms proprietary to SmartAssist remain the exclusive property of our organization.</li>
        <li><strong>Third-Party Links:</strong> We are not responsible for the content or privacy practices of external websites linked within our platform.</li>
        <li><strong>Modification of Terms:</strong> We may update these terms periodically; continued use of the platform after updates constitutes acceptance of the new terms.</li>
        <li><strong>Termination:</strong> We reserve the right to suspend accounts that violate our terms or engage in abusive behavior toward our staff or providers.</li>
        <li><strong>Governing Law:</strong> These terms are governed by the laws of the jurisdiction where SmartAssist is registered, without regard to conflict of law principles.</li>
      </ol>
    </div>
  </div>
);

export default TermsOfService;
