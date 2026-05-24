import { useState } from 'react';

const HelpTooltip = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <span style={{ display: 'inline-block', position: 'relative', marginLeft: '6px' }}>
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        style={{
          width: '16px', height: '16px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.06)', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '11px',
          fontWeight: 'bold', color: 'var(--color-dark)', border: 'none',
          outline: 'none', cursor: 'pointer', verticalAlign: 'middle'
        }}
      >
        ?
      </button>
      {show && (
        <span style={{
          position: 'absolute', bottom: '24px', left: '50%',
          transform: 'translateX(-50%)', width: '220px',
          background: 'var(--color-dark)', color: 'var(--color-white)',
          padding: '10px 12px', borderRadius: '8px', fontSize: '11px',
          lineHeight: '1.4', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          pointerEvents: 'none', display: 'block', textTransform: 'none',
          fontWeight: 'normal', letterSpacing: 'normal'
        }}>
          {text}
          <span style={{
            position: 'absolute', top: '100%', left: '50%',
            transform: 'translateX(-50%)', width: '0', height: '0',
            borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
            borderTop: '6px solid var(--color-dark)', display: 'block'
          }} />
        </span>
      )}
    </span>
  );
};

export default HelpTooltip;
