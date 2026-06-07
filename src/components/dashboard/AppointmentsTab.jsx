import { Calendar, Clock, Star } from 'lucide-react';

const AppointmentsTab = ({ bookings, hasLoaded, onRateSpecialist, onCancelBooking, onDeleteBooking, cancellingIds = [], onBookNow, t }) => {
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>{t('your_appointments')}</h2>
      {!hasLoaded ? (
        <p style={{ opacity: 0.6 }}>{t('loading')}...</p>
      ) : bookings.length === 0 ? (
        <div className="card-light" style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ opacity: 0.6, marginBottom: '16px' }}>{t('no_appointments')}</p>
          <button type="button" onClick={onBookNow} className="btn-primary">{t('book_now')}</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {bookings.map(b => {
            const isCancelling = cancellingIds.includes(b._id);
            const cardClass = `card-light ${b.status === 'cancelled' ? 'booking-card-cancelled' : ''} ${isCancelling ? 'booking-card-cancelling' : ''}`;
            
            return (
              <div key={b.receiptId} className={cardClass} style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700' }}>{b.specialistName}</h3>
                    <span className="pill-tag">{t(`category_${b.specialistCategory}`, { defaultValue: b.specialistCategory })}</span>
                    {b.status === 'cancelled' && (
                      <span className="pill-tag" style={{ background: '#fee2e2', color: '#b91c1c', fontWeight: '700' }}>
                        {t('cancelled')}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '14px', opacity: 0.8, marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} /> {b.bookingDate}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {b.bookingTime}</span>
                  </div>
                  <p style={{ fontSize: '13px', opacity: 0.6 }}>{t('patient_label')}: <strong>{b.bookedFor || b.userName}</strong> ({t('receipt_id')}: {b.receiptId})</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    onClick={() => onRateSpecialist({ id: b.specialistId, name: b.specialistName })} 
                    className="btn-ghost" 
                    style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <Star size={16} /> {t('rate_specialist')}
                  </button>
                  {b.status !== 'cancelled' && (
                    <button 
                      type="button"
                      onClick={() => onCancelBooking(b._id)} 
                      className="btn-danger" 
                      disabled={isCancelling}
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                      {isCancelling ? t('cancelling') : t('cancel_appointment')}
                    </button>
                  )}
                  <button 
                    type="button"
                    onClick={() => onDeleteBooking(b._id)} 
                    className="btn-secondary" 
                    style={{ padding: '8px 16px', fontSize: '12px' }}
                  >
                    {t('delete_appointment')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AppointmentsTab;
