import { useState, useEffect } from 'react';

const WaitlistHoldTimer = ({ notifiedAt, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const notifiedTime = new Date(notifiedAt).getTime();
      const diffSinceNotification = Date.now() - notifiedTime;
      const isDevHold = diffSinceNotification < 60 * 1000 && (notifiedTime + 60 * 1000 - Date.now() > 0);
      const holdDuration = isDevHold ? 60 * 1000 : 10 * 60 * 1000;
      const difference = notifiedTime + holdDuration - Date.now();

      if (difference <= 0) {
        setTimeLeft('Expired');
        if (onExpire) onExpire();
        return;
      }

      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      setTimeLeft(`${minutes}m ${seconds}s left`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [notifiedAt, onExpire]);

  return (
    <span style={{ fontSize: '12px', color: 'var(--color-orange)', fontWeight: 'bold' }}>
      ({timeLeft})
    </span>
  );
};

export default WaitlistHoldTimer;
