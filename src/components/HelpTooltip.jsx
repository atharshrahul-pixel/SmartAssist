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
        className="help-tooltip-btn"
      >
        ?
      </button>
      {show && (
        <span className="help-tooltip-content">
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
