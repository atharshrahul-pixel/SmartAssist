import { useState } from 'react';
import { Star } from 'lucide-react';

const RatingModal = ({ isOpen, specialist, onClose, onSubmitSuccess, token, backendUrl }) => {
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingLoading, setRatingLoading] = useState(false);

  if (!isOpen || !specialist) return null;

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setRatingLoading(true);
    try {
      const res = await fetch(`${backendUrl}/specialists/${specialist.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating: ratingValue })
      });
      const json = await res.json();
      if (json.success) {
        alert('Thank you for rating!');
        onClose();
        if (onSubmitSuccess) onSubmitSuccess();
      } else {
        alert('Rating failed: ' + json.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting rating.');
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="card-light page-transition" style={{ maxWidth: '400px', width: '100%', padding: '32px' }}>
        <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>Rate {specialist.name}</h3>
        
        <form onSubmit={handleSubmitRating}>
          <div className="mb-lg" style={{ textAlign: 'center' }}>
            <label className="form-label" style={{ marginBottom: '12px' }}>Rating (1 - 5 Stars)</label>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              {[1, 2, 3, 4, 5].map(val => (
                <button 
                  key={val} 
                  type="button"
                  onClick={() => setRatingValue(val)}
                  style={{ 
                    color: val <= ratingValue ? 'var(--color-accent)' : 'var(--color-muted)',
                    transform: val <= ratingValue ? 'scale(1.2)' : 'none',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Star size={36} fill={val <= ratingValue ? 'var(--color-accent)' : 'none'} />
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={onClose} className="btn-secondary w-full">Cancel</button>
            <button type="submit" className="btn-primary w-full" disabled={ratingLoading}>
              {ratingLoading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RatingModal;
