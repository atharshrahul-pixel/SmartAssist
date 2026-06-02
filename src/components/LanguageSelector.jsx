import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
    { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
    { code: 'te', label: 'Telugu', native: 'తెలుగు' },
    { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
    { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' }
  ];

  const currentLang = languages.find(l => l.code === i18n.language) || languages[0];

  const handleLanguageChange = (code) => {
    i18n.changeLanguage(code);
    localStorage.setItem('language', code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '6px 12px',
          borderRadius: 'var(--r-pill)',
          color: 'var(--color-white)',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          height: '36px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.24)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          }
        }}
      >
        <Globe size={14} style={{ color: 'var(--color-accent)' }} />
        <span>{currentLang.native}</span>
        <ChevronDown size={14} style={{ opacity: 0.6, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          right: 0,
          backgroundColor: 'rgba(36, 21, 8, 0.98)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 'var(--r-lg)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
          padding: '6px',
          minWidth: '150px',
          zIndex: 1100,
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          backdropFilter: 'blur(12px)',
          animation: 'fadeInSlideUp 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          {languages.map((lang) => {
            const isSelected = lang.code === currentLang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--r-sm)',
                  color: isSelected ? 'var(--color-accent)' : 'var(--color-white)',
                  fontSize: '13px',
                  fontWeight: isSelected ? '700' : '500',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  if (!isSelected) e.currentTarget.style.color = 'var(--color-white)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  if (!isSelected) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '13px' }}>{lang.native}</span>
                  <span style={{ fontSize: '10px', opacity: 0.5, fontWeight: '400' }}>{lang.label}</span>
                </div>
                {isSelected && <Check size={14} style={{ color: 'var(--color-accent)', marginLeft: '8px' }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;