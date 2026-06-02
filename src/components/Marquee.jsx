const Marquee = ({ text }) => {
  return (
    <div className="marquee-container">
      <div className="marquee-content">
        {text}
      </div>
    </div>
  );
};

export default Marquee;
