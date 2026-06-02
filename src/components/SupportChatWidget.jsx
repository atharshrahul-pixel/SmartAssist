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
        type="button"
        className="support-fab"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={20} />}
        <span>{t('need_help')}</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="card-light page-transition support-chat-window">
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
            <button type="button" onClick={() => setIsOpen(false)} style={{ color: '#FFFFFF', opacity: 0.8 }}><X size={18} /></button>
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
                  <div className={`support-message ${isUser ? 'support-message-user' : 'support-message-bot'}`}>
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

          {/* FAQ Quick suggestions */}
          <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', overflowX: 'auto', background: '#FAFAF9', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
            {['faq_how_to_book', 'faq_about_waitlists', 'faq_consultation_modes', 'faq_contact_support'].map(key => (
              <button
                key={key}
                type="button"
                onClick={() => handleSend(key)}
                className="support-widget-faq-btn"
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
              className="support-widget-input"
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
