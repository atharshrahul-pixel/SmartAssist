import { Search, BarChart3 } from 'lucide-react';

const AIReportCard = ({
  state,
  barWidth,
  detectedKeywords,
}) => {
  return (
    <div className="analysis-card mb-lg">
      <div className="report-card-header">
        <Search size={20} color="var(--color-orange)" />
        <h3 style={{ fontSize: '18px', fontWeight: '700' }}>AI Analysis Report</h3>
      </div>
      
      <p style={{ fontSize: '15px', lineHeight: '1.6', color: 'var(--color-dark)', opacity: 0.8, marginBottom: '24px' }}>
        Our triage engine analyzed your description and detected key medical markers that strongly correlate with{' '}
        <strong>
          {(state.idealCategory || state.recommendedSpecialist).toLowerCase().includes('evaluation')
            ? (state.idealCategory || state.recommendedSpecialist)
            : `${state.idealCategory || state.recommendedSpecialist} expertise`}
        </strong>.
      </p>

      {state.suspectedCondition && (
        <div className="suspected-condition-box">
          <span className="suspected-condition-label">Suspected Condition</span>
          <strong className="suspected-condition-value">{state.suspectedCondition}</strong>
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <div className="confidence-label">
          <BarChart3 size={16} />
          Match confidence
        </div>
        <div className="confidence-bar-bg">
          <div
            className="confidence-bar-fill"
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <div className="confidence-percent">
          {barWidth}% Match
        </div>
      </div>

      <div>
        <div className="keywords-label">Detected Keywords</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
          {detectedKeywords.length > 0 ? detectedKeywords.map(word => (
            <span key={word} className="tag-highlight">{word}</span>
          )) : <span className="keywords-fallback">Contextual markers detected</span>}
        </div>
      </div>
    </div>
  );
};

export default AIReportCard;
