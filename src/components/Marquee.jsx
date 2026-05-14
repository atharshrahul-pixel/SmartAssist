const Marquee = ({ text }) => {
  return (
    <div style={{
      backgroundColor: 'var(--color-dark)',
      color: 'var(--color-accent)',
      height: '44px',
      lineHeight: '44px',
      fontSize: '13px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      width: '100%',
      position: 'relative'
    }}>
      <div style={{
        display: 'inline-block',
        animation: 'marquee 20s linear infinite',
        paddingLeft: '100%'
      }}>
        {text}
      </div>
    </div>
  );
};

export default Marquee;
