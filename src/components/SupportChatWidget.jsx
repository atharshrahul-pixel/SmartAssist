import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { HelpCircle, MessageSquare, Send, X, Phone, Mail } from 'lucide-react';

const SupportChatWidget = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: t('support_greeting')
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const faqResponses = {
    'faq_how_to_book': t('support_how_to_book'),
    'faq_about_waitlists': t('support_waitlists'),
    'faq_consultation_modes': t('support_modes'),
    'faq_contact_support': t('support_contact')
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const key = text.trim();
      let response = t('support_misunderstand');

      if (faqResponses[key]) {
        response = faqResponses[key];
      } else {
        const query = text.toLowerCase();
        if (query.includes('book')) response = faqResponses['faq_how_to_book'];
        else if (query.includes('wait')) response = faqResponses['faq_about_waitlists'];
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 800);
  };

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, fontFamily: 'sans-serif' }}>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          height: '56px',
          borderRadius: '28px',
          background: 'var(--color-orange, #E05830)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '0 20px',
          boxShadow: '0 8px 24px rgba(224, 88, 48, 0.35)',
          border: 'none',
          cursor: 'pointer',
          outline: 'none',
          fontWeight: 'bold',
          fontSize: '15px',
          transition: 'transform 0.2s ease-in-out'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
        <span>{t('need_help')}</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="card-light page-transition" style={{
          position: 'absolute', bottom: '72px', right: '0',
          width: '340px', height: '450px',
          display: 'flex', flexDirection: 'column',
          borderRadius: '16px', boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
          border: '1px solid rgba(0,0,0,0.08)',
          background: '#FFFFFF', overflow: 'hidden'
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 20px',
            background: 'var(--color-dark, #1C1008)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
              <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{t('support_assistant')}</span>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ color: '#FFFFFF', opacity: 0.8 }}><X size={18} /></button>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, padding: '16px', overflowY: 'auto',
            background: '#FAF9F6', display: 'flex', flexDirection: 'column', gap: '12px'
          }}>
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              return (
                <div key={i} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%', padding: '10px 14px', borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    background: isUser ? 'var(--color-orange, #E05830)' : '#FFFFFF',
                    color: isUser ? '#FFFFFF' : 'var(--color-dark, #1C1008)',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    fontSize: '13px', lineHeight: '1.4', whiteSpace: 'pre-line',
                    border: isUser ? 'none' : '1px solid rgba(0,0,0,0.05)'
                  }}>
                    {msg.content}
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '10px 14px', borderRadius: '12px 12px 12px 2px',
                  background: '#FFFFFF', color: 'var(--color-muted)',
                  fontSize: '13px', border: '1px solid rgba(0,0,0,0.05)'
                }}>
                  {t('typing')}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick FAQ Chips */}
          <div style={{ padding: '8px 12px', background: '#F5F5F4', display: 'flex', gap: '6px', overflowX: 'auto', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            {['faq_how_to_book', 'faq_about_waitlists', 'faq_consultation_modes', 'faq_contact_support'].map(key => (
              <button
                key={key}
                onClick={() => handleSend(key)}
                style={{
                  padding: '6px 12px', borderRadius: '14px', background: '#FFFFFF',
                  border: '1.5px solid var(--color-orange)', color: 'var(--color-orange)',
                  fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', cursor: 'pointer'
                }}
              >
                {t(key)}
              </button>
            ))}
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            style={{ padding: '12px 16px', display: 'flex', gap: '8px', borderTop: '1px solid rgba(0,0,0,0.06)', background: '#FFFFFF' }}
          >
            <input
              type="text"
              placeholder={t('ask_question')}
              value={input}
              onChange={e => setInput(e.target.value)}
              style={{
                flex: 1, padding: '10px 12px', borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.1)', outline: 'none', fontSize: '13px'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px', borderRadius: '8px', background: 'var(--color-orange, #E05830)',
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SupportChatWidget;
