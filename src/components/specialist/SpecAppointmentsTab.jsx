import { Calendar, Clock, CheckCircle, Eye } from 'lucide-react';

const SpecAppointmentsTab = ({ appointments, summaryLoading, onFetchPrevisitSummary, t }) => {
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>{t('upcoming_appointments')}</h2>
      <div style={{ display: 'grid', gap: '16px' }}>
        {appointments.length === 0 ? (
          <div className="card-light text-center" style={{ padding: '48px' }}>
            <p style={{ opacity: 0.5 }}>{t('no_appointments_scheduled')}</p>
          </div>
        ) : (
          appointments.map(b => (
            <div key={b._id} className="card-light" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '4px' }}>{b.bookedFor || b.userName}</h3>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px', opacity: 0.7, marginTop: '8px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={13} /> {b.bookingDate}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={13} /> {b.bookingTime}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={13} /> {b.appointmentMode}</span>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => onFetchPrevisitSummary(b._id)} 
                className="btn-secondary"
                disabled={summaryLoading}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <Eye size={14} /> {summaryLoading ? `${t('loading')}...` : t('view_previsit_summary')}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SpecAppointmentsTab;
