import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const RecoveryTimeline = ({ feedbackBookings }) => {
  const { t } = useTranslation();
  const [hoveredPoint, setHoveredPoint] = useState(null);
  
  if (feedbackBookings.length === 0) {
    return (
      <div className="card-light" style={{ padding: '32px', textAlign: 'center', marginBottom: '24px', border: '1px dashed rgba(0,0,0,0.15)' }}>
        <p style={{ opacity: 0.6, fontSize: '14px' }}>{t('recovery_timeline_empty')}</p>
      </div>
    );
  }

  const width = 600;
  const height = 200;
  const paddingX = 60;
  const paddingY = 35;

  const getSymptomLabel = (val) => {
    return t(`symptom_level_${val}`);
  };

  // Memoize point coordinates calculation
  const points = useMemo(() => {
    return feedbackBookings.map((b, i) => {
      const x = feedbackBookings.length === 1 
        ? width / 2 
        : paddingX + (i * (width - 2 * paddingX)) / (feedbackBookings.length - 1);
      
      const val = b.postVisitFeedback.symptomImprovement;
      const y = height - paddingY - ((val - 1) * (height - 2 * paddingY)) / 4;
      
      return { x, y, booking: b };
    });
  }, [feedbackBookings, width, height, paddingX, paddingY]);

  // Memoize SVG path strings
  const { pathD, areaD } = useMemo(() => {
    if (points.length === 0) return { pathD: '', areaD: '' };
    const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const area = `${path} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;
    return { pathD: path, areaD: area };
  }, [points, height, paddingY]);

  return (
    <div className="card-light page-transition" style={{ padding: '24px', marginBottom: '24px', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-orange)' }}></span>
          {t('recovery_timeline_title')}
        </h3>
        <span style={{ fontSize: '11px', opacity: 0.6 }}>{t('recovery_timeline_tooltip')}</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} style={{ overflow: 'visible' }}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-orange)" stopOpacity="0.2" />
              <stop offset="100%" stopColor="var(--color-orange)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[1, 2, 3, 4, 5].map(level => {
            const y = height - paddingY - ((level - 1) * (height - 2 * paddingY)) / 4;
            return (
              <g key={level}>
                <line 
                  x1={paddingX} 
                  y1={y} 
                  x2={width - paddingX} 
                  y2={y} 
                  stroke="rgba(0,0,0,0.06)" 
                  strokeDasharray="4,4" 
                />
                <text 
                  x={paddingX - 8} 
                  y={y + 3} 
                  textAnchor="end" 
                  style={{ fontSize: '9px', fill: 'var(--color-dark)', opacity: 0.6, fontWeight: '600' }}
                >
                  {getSymptomLabel(level)}
                </text>
              </g>
            );
          })}

          {/* Connected path */}
          {points.length > 1 && (
            <>
              <path d={areaD} fill="url(#chartGrad)" />
              <path d={pathD} fill="none" stroke="var(--color-orange)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </>
          )}

          {/* Data Points */}
          {points.map((p, i) => (
            <g 
              key={p.booking.receiptId} 
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={p.x} cy={p.y} r="8" fill="var(--color-orange)" opacity="0.1" />
              <circle cx={p.x} cy={p.y} r="4" fill="var(--color-orange)" stroke="#FFFFFF" strokeWidth="2" />
              
              {/* X Axis Label */}
              <text 
                x={p.x} 
                y={height - 8} 
                textAnchor="middle" 
                style={{ fontSize: '8.5px', fill: 'var(--color-dark)', opacity: 0.7, fontWeight: '700' }}
              >
                {p.booking.bookingDate.split(',')[0]}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Interactive Tooltip Card */}
      {hoveredPoint && (
        <div style={{
          position: 'absolute',
          top: hoveredPoint.y - 85 > 0 ? hoveredPoint.y - 85 : 10,
          left: hoveredPoint.x - 100 > 10 ? hoveredPoint.x - 100 : 10,
          background: 'var(--color-dark)',
          color: 'var(--color-white)',
          padding: '12px 16px',
          borderRadius: 'var(--r-md)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 10,
          width: '200px',
          pointerEvents: 'none',
          animation: 'popIn 0.15s ease'
        }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--color-accent)', marginBottom: '4px' }}>
            {hoveredPoint.booking.specialistName}
          </div>
          <div style={{ fontSize: '9px', opacity: 0.6, marginBottom: '6px' }}>
            {hoveredPoint.booking.bookingDate} @ {hoveredPoint.booking.bookingTime}
          </div>
          <div style={{ fontSize: '10px', fontWeight: '600' }}>
            Improvement: <span style={{ color: 'var(--color-orange)' }}>{getSymptomLabel(hoveredPoint.booking.postVisitFeedback.symptomImprovement)}</span>
          </div>
          {hoveredPoint.booking.postVisitFeedback.newSymptomsOrConcerns && (
            <div style={{ fontSize: '9px', opacity: 0.8, marginTop: '4px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '4px', wordBreak: 'break-word' }}>
              "{hoveredPoint.booking.postVisitFeedback.newSymptomsOrConcerns}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecoveryTimeline;
