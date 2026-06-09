import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageSquare, Send, X } from 'lucide-react';

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
      const handle = requestAnimationFrame(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
      return () => cancelAnimationFrame(handle);
    }
  }, [messages, isTyping]);

  const handleSend = (text) => {
    if (!text.trim()) return;

    // Add user message
    const displayMessage = text.startsWith('faq_') ? t(text) : text;
    setMessages(prev => [...prev, { role: 'user', content: displayMessage }]);
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
    <div className="support-widget-container">
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
        <div className="card-light support-chat-window">
          {/* Header */}
          <div className="support-chat-header">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '15px' }}>{t('support_assistant')}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ color: 'var(--color-dark)', opacity: 0.8 }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="support-chat-messages">
            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              const isLatest = i === messages.length - 1;
              const showChips = !isUser && isLatest && !isTyping;
              return (
                <div key={`support-msg-${msg.role}-${i}`} className={`support-message-wrapper ${isUser ? 'user' : 'assistant'}`}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '85%' }}>
                    <div className={`support-message ${isUser ? 'support-message-user' : 'support-message-bot'}`}>
                      {msg.content}
                    </div>
                    {showChips && (
                      <div className="support-chips-wrapper">
                        {['faq_how_to_book', 'faq_about_waitlists', 'faq_consultation_modes', 'faq_contact_support'].map(key => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleSend(key)}
                            className="support-chip-btn"
                          >
                            {t(key)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            
            {isTyping && (
              <div className="support-message-wrapper assistant">
                <div className="support-message support-message-bot" style={{ color: 'var(--color-muted)', fontStyle: 'italic' }}>
                  {t('typing')}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="support-widget-input-form"
          >
            <input
              type="text"
              placeholder={t('ask_question')}
              value={input}
              onChange={e => setInput(e.target.value)}
              className="support-widget-input"
              aria-label={t('ask_question')}
            />
            <button
              type="submit"
              className="support-widget-send-btn"
              disabled={!input.trim()}
              aria-label={t('send', { defaultValue: 'Send' })}
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
