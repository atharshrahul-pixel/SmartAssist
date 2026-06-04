import { Star } from 'lucide-react';

const RatingModal = ({
  ratingSpecialist,
  ratingValue,
  ratingLoading,
  onRatingValueChange,
  onSubmitRating,
  onClose,
  t
}) => {
  return (
    // react-doctor-disable-next-line react-doctor/no-static-element-interactions
    // react-doctor-disable-next-line react-doctor/click-events-have-key-events
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content-card page-transition" onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Rate {ratingSpecialist.name}</h3>
        
        <form onSubmit={onSubmitRating}>
          <div className="mb-lg" style={{ textAlign: 'center' }}>
            <span className="form-label" style={{ display: 'block', marginBottom: '12px' }}>Rating (1 - 5 Stars)</span>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {[1, 2, 3, 4, 5].map(val => (
                <button 
                  key={val}
                  type="button" 
                  onClick={() => onRatingValueChange(val)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                >
                  <Star 
                    size={28} 
                    fill={val <= ratingValue ? 'var(--color-orange)' : 'none'} 
                    color={val <= ratingValue ? 'var(--color-orange)' : 'var(--color-muted)'} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              {t('cancel_btn')}
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={ratingLoading}
              style={{ padding: '8px 16px' }}
            >
              {ratingLoading ? t('submitting') : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
