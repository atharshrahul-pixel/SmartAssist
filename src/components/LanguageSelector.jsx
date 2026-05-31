import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Globe size={16} style={{ color: 'var(--color-dark)', opacity: 0.6 }} />
      <select 
        value={i18n.language} 
        onChange={handleLanguageChange}
        className="input-field"
        style={{ padding: '4px 8px', width: 'auto', margin: 0, height: '36px', fontSize: '14px' }}
      >
        <option value="en">English</option>
        <option value="hi">हिन्दी</option>
        <option value="ta">தமிழ்</option>
        <option value="te">తెలుగు</option>
        <option value="ml">മലയാളം</option>
        <option value="kn">ಕನ್ನಡ</option>
      </select>
    </div>
  );
};

export default LanguageSelector;