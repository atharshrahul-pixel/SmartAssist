import { useState, useEffect, useRef } from 'react';
import { HelpCircle, MessageSquare, Send, X, Phone, Mail } from 'lucide-react';

const SupportChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi there! 👋 I am your support helper. How can I assist you with your booking today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const faqResponses = {
    'how to book': 'To book an appointment:\n1. Describe symptoms in plain language on the main screen.\n2. View the AI specialist recommendation.\n3. Pick an expert doctor.\n4. Select a date, time, and consultation mode.\n5. Click Confirm!',
    'about waitlists': 'When a time slot is fully booked, you can join the waitlist. If the slot becomes free, you will get a notification and a 10-minute hold to claim it in your Dashboard.',
    'consultation modes': 'We offer three modes:\n1. In-Person: Visit the doctor at the clinic.\n2. Video Call: Speak via live video.\n3. Chat Consult: Send text messages for minor issues.',
    'contact support': 'Need to talk to us?\n📞 Phone: +91 98765 43210\n✉️ Email: support@smartassist.ai'
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

    // Simulate typing and response
    setTimeout(() => {
      setIsTyping(false);
      const query = text.toLowerCase().trim();
      let response = "I'm sorry, I didn't quite get that. Try clicking one of the quick options below or contact our team!";

      // Match queries
      if (query.includes('book') || query.includes('how to')) {
        response = faqResponses['how to book'];
      } else if (query.includes('waitlist') || query.includes('hold') || query.includes('reallocate')) {
        response = faqResponses['about waitlists'];
      } else if (query.includes('mode') || query.includes('video') || query.includes('phone') || query.includes('chat')) {
        response = faqResponses['consultation modes'];
      } else if (query.includes('contact') || query.includes('support') || query.includes('phone') || query.includes('email')) {
        response = faqResponses['contact support'];
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
        <span>Need Help?</span>
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
              <span style={{ fontWeight: 'bold', fontSize: '15px' }}>Support Assistant</span>
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
                  Typing...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick FAQ Chips */}
          <div style={{ padding: '8px 12px', background: '#F5F5F4', display: 'flex', gap: '6px', overflowX: 'auto', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            {['How to book', 'About waitlists', 'Consultation modes', 'Contact support'].map(faq => (
              <button
                key={faq}
                onClick={() => handleSend(faq)}
                style={{
                  padding: '6px 12px', borderRadius: '14px', background: '#FFFFFF',
                  border: '1.5px solid var(--color-orange)', color: 'var(--color-orange)',
                  fontSize: '11px', fontWeight: 'bold', whiteSpace: 'nowrap', cursor: 'pointer'
                }}
              >
                {faq}
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
              placeholder="Ask a question..."
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
