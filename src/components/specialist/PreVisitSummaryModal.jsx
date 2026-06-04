import { X } from 'lucide-react';

const PreVisitSummaryModal = ({ activeSummary, onClose, t }) => {
  if (!activeSummary) return null;

  return (
    <div className="previsit-modal-overlay">
      <div className="card-light" style={{ maxWidth: '640px', width: '100%', padding: '32px', position: 'relative', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <button 
          type="button"
          onClick={onClose} 
          style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', cursor: 'pointer' }}
          aria-label="Close pre-visit summary"
        >
          <X size={20} />
        </button>
        <h3 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', borderBottom: '1px solid var(--color-cream-dark)', paddingBottom: '12px' }}>{t('previsit_case_summary_title')}</h3>
        
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', opacity: 0.5, textTransform: 'uppercase' }}>{t('patient_name_col')}</label>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>{activeSummary.patientName}</div>
            </div>

            <div>
              <label style={{ fontSize: '12px', opacity: 0.5, textTransform: 'uppercase' }}>{t('patient_contact_label')}</label>
              <div style={{ fontSize: '14px' }}>{activeSummary.patientEmail}</div>
            </div>

            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ fontSize: '12px', opacity: 0.5, textTransform: 'uppercase' }}>{t('appointment_details_label')}</label>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>
                {activeSummary.date} at {activeSummary.time} ({activeSummary.appointmentMode})
              </div>
            </div>
          </div>

          {activeSummary.triageUrgency && (() => {
            const u = activeSummary.triageUrgency;
            const config = {
              Urgent: { bgColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', text: 'Urgent — Attention Recommended' },
              Soon: { bgColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', text: 'Soon — Within Days' },
              Routine: { bgColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', text: 'Routine — Standard Visit' }
            }[u] || { bgColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', text: 'Routine' };

            return (
              <div>
                <label style={{ fontSize: '12px', opacity: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>{t('urgency_level_label')}</label>
                <div 
                  className="triage-urgency-badge"
                  style={{
                    backgroundColor: config.bgColor,
                    color: config.color,
                    border: `1.5px solid ${config.color}`
                  }}
                >
                  {config.text}
                </div>
              </div>
            );
          })()}

          <div>
            <label style={{ fontSize: '12px', opacity: 0.5, textTransform: 'uppercase' }}>{t('primary_symptoms_label')}</label>
            <div style={{
              padding: '12px', background: 'var(--color-cream)', borderRadius: '8px', 
              fontSize: '14px', lineHeight: '1.5', fontStyle: 'italic', marginTop: '4px'
            }}>
              {activeSummary.symptoms ? `"${activeSummary.symptoms}"` : (activeSummary.rejectionReasonOther ? `"${activeSummary.rejectionReasonOther}"` : 'No symptom description provided.')}
            </div>
          </div>

          {activeSummary.triageExplanation && (
            <div>
              <label style={{ fontSize: '12px', opacity: 0.5, textTransform: 'uppercase' }}>{t('ai_triage_rec_label')}</label>
              <div style={{
                padding: '12px', background: 'rgba(237, 184, 32, 0.05)', border: '1px solid rgba(237, 184, 32, 0.2)', borderRadius: '8px',
                fontSize: '14px', lineHeight: '1.5', marginTop: '4px'
              }}>
                {activeSummary.triageExplanation}
              </div>
            </div>
          )}

          {activeSummary.triageKeywords && activeSummary.triageKeywords.length > 0 && (
            <div>
              <label style={{ fontSize: '12px', opacity: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>{t('detected_symptoms_markers_label')}</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {activeSummary.triageKeywords.map(keyword => (
                  <span key={keyword} style={{
                    backgroundColor: 'var(--color-cream)',
                    color: 'var(--color-dark)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: '700'
                  }}>
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeSummary.triageHistory && activeSummary.triageHistory.length > 0 && (
            <div>
              <label style={{ fontSize: '12px', opacity: 0.5, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>{t('triage_history_label')}</label>
              <div className="triage-history-container">
                {activeSummary.triageHistory.map((msg, i) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div 
                      key={`triage-msg-${msg.role}-${i}`} 
                      className="triage-chat-bubble"
                      style={{
                        alignSelf: isUser ? 'flex-end' : 'flex-start',
                        backgroundColor: isUser ? 'var(--color-orange)' : 'var(--color-white)',
                        color: isUser ? 'var(--color-white)' : 'var(--color-dark)',
                        borderRadius: isUser ? '14px 14px 0 14px' : '14px 14px 14px 0'
                      }}
                    >
                      {msg.content}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <button type="button" onClick={onClose} className="btn-primary w-full" style={{ marginTop: '20px', padding: '14px' }}>
          {t('close_summary_btn')}
        </button>
      </div>
    </div>
  );
};

export default PreVisitSummaryModal;
