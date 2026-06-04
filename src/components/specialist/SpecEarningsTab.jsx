import { DollarSign, CheckCircle } from 'lucide-react';

const SpecEarningsTab = ({ earnings, t }) => {
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>{t('earnings_tab')}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        <div className="card-light" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="earnings-icon-wrapper">
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', opacity: 0.6 }}>{t('total_accumulated_earnings')}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-dark)' }}>₹{earnings.totalEarnings}</div>
          </div>
        </div>

        <div className="card-light" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="earnings-icon-wrapper">
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '13px', opacity: 0.6 }}>{t('settled_consultations')}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--color-dark)' }}>{earnings.earningsList?.length || 0}</div>
          </div>
        </div>
      </div>

      <div className="card-light" style={{ padding: '0', overflowX: 'auto', borderRadius: 'var(--r-lg)' }}>
        <table className="w-full" style={{ borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-cream-dark)', backgroundColor: 'rgba(237, 184, 32, 0.05)' }}>
              <th style={{ padding: '16px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>{t('date_time_col')}</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>{t('patient_name_col')}</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>{t('mode_col')}</th>
              <th style={{ padding: '16px 20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--color-muted)' }}>{t('earnings_col')}</th>
            </tr>
          </thead>
          <tbody>
            {earnings.earningsList && earnings.earningsList.map(e => (
              <tr key={e.id || e.bookingId} style={{ borderBottom: '1px solid #f0edeb' }}>
                <td style={{ padding: '16px 20px', fontSize: '14px' }}>{e.date}</td>
                <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '700' }}>{e.patientName}</td>
                <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                  <span className="pill-tag" style={{ fontSize: '12px' }}>{e.appointmentMode}</span>
                </td>
                <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '800', color: 'var(--color-orange)' }}>₹{e.amount}</td>
              </tr>
            ))}
            {(!earnings.earningsList || earnings.earningsList.length === 0) && (
              <tr>
                <td colSpan="4" style={{ padding: '32px', textAlign: 'center', opacity: 0.5 }}>{t('no_payouts')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SpecEarningsTab;
