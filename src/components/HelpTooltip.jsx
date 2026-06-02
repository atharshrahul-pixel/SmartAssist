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
          <span className="help-tooltip-arrow" />
        </span>
      )}
    </span>
  );
};

export default HelpTooltip;
