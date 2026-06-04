import { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WaitlistHoldTimer = ({ notifiedAt, onExpire }) => {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState('');
  
  useEffect(() => {
    const holdDuration = 10 * 60 * 1000; // 10 minutes
    const notifyTime = new Date(notifiedAt).getTime();
    const expiryTime = notifyTime + holdDuration;

    const updateTimer = () => {
      const now = Date.now();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setTimeLeft(t('expired'));
        onExpire();
        return false;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      return true;
    };

    const hasTime = updateTimer();
    if (!hasTime) return;

    const interval = setInterval(() => {
      const active = updateTimer();
      if (!active) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [notifiedAt, onExpire, t]);

  return (
    <span style={{ fontSize: '12px', color: 'var(--color-orange)', fontWeight: 'bold' }}>
      ({timeLeft})
    </span>
  );
};

const WaitlistsTab = ({ waitlistAppointments, onClaimAndBook, onExpire, t }) => {
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>{t('waitlist_notifications')}</h2>
      <div style={{ display: 'grid', gap: '16px' }}>
        {(!waitlistAppointments || waitlistAppointments.length === 0) ? (
          <p style={{ opacity: 0.6 }}>{t('no_waitlist')}</p>
        ) : (
          waitlistAppointments.map(entry => (
            <div 
              key={entry._id} 
              className="card-light" 
              style={{ 
                padding: '20px 24px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderLeft: entry.status === 'notified' ? '4px solid var(--color-orange)' : '1px solid var(--color-cream-dark)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{entry.specialistName}</h3>
                  <span 
                    className="pill-tag"
                    style={{ 
                      background: entry.status === 'notified' ? 'var(--color-orange)' : entry.status === 'claimed' ? 'green' : 'var(--color-accent)',
                      color: 'var(--color-white)'
                    }}
                  >
                    {t(`status_${entry.status}`, { defaultValue: entry.status })}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '20px', fontSize: '14px', opacity: 0.8, alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {entry.bookingDate}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {entry.bookingTime}</span>
                  {entry.status === 'notified' && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-orange)' }}>
                      <Clock size={12} />
                      <WaitlistHoldTimer notifiedAt={entry.notifiedAt} onExpire={onExpire} />
                    </span>
                  )}
                </div>
              </div>

              {entry.status === 'notified' && (
                <div>
                   <button 
                    type="button"
                    onClick={() => onClaimAndBook(entry)} 
                    className="btn-primary claim-pulse-btn"
                  >
                    {t('claim_slot')}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WaitlistsTab;
