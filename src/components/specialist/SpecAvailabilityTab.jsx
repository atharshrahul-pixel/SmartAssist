import { Plus, X } from 'lucide-react';

const SpecAvailabilityTab = ({
  modesConfig,
  slotsList,
  newSlot,
  saveLoading,
  onModesConfigChange,
  onNewSlotChange,
  onAddSlot,
  onRemoveSlot,
  onSaveAvailability,
  t
}) => {
  return (
    <div className="card-light" style={{ padding: '32px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '24px' }}>{t('slots_pricing')}</h2>
      
      {/* Mode Pricing Settings */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase' }}>{t('configure_modes')}</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          {[
            { key: 'inPerson', label: t('in_person') },
            { key: 'video', label: t('video_call') },
            { key: 'chat', label: t('chat_consult') }
          ].map(mode => (
            <div key={mode.key} style={{ padding: '16px', border: '1px solid var(--color-cream-dark)', borderRadius: '8px' }}>
              <label htmlFor={`mode-enabled-${mode.key}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '14px', marginBottom: '12px' }}>
                <input 
                  id={`mode-enabled-${mode.key}`}
                  type="checkbox" 
                  checked={modesConfig[mode.key]?.enabled || false} 
                  onChange={e => onModesConfigChange(mode.key, 'enabled', e.target.checked)}
                />
                {mode.label}
              </label>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <label htmlFor={`mode-price-${mode.key}`} style={{ fontSize: '12px', opacity: 0.6 }}>{t('earnings_col')} (₹)</label>
                  <input 
                    id={`mode-price-${mode.key}`}
                    type="number" 
                    className="input-field" 
                    value={modesConfig[mode.key]?.price || 0}
                    onChange={e => onModesConfigChange(mode.key, 'price', Number(e.target.value))}
                    disabled={!modesConfig[mode.key]?.enabled}
                    aria-label={`${mode.label} price`}
                    style={{ padding: '6px 8px', marginTop: '2px' }}
                  />
                </div>
                <div>
                  <label htmlFor={`mode-duration-${mode.key}`} style={{ fontSize: '12px', opacity: 0.6 }}>{t('duration', { defaultValue: 'Duration' })}</label>
                  <input 
                    id={`mode-duration-${mode.key}`}
                    type="text" 
                    className="input-field" 
                    value={modesConfig[mode.key]?.duration || ''}
                    onChange={e => onModesConfigChange(mode.key, 'duration', e.target.value)}
                    disabled={!modesConfig[mode.key]?.enabled}
                    aria-label={`${mode.label} duration`}
                    style={{ padding: '6px 8px', marginTop: '2px' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Available Slots Config */}
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '16px', textTransform: 'uppercase' }}>{t('manage_availability')}</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="e.g. 10:30 AM" 
            aria-label="Add availability slot"
            value={newSlot}
            onChange={e => onNewSlotChange(e.target.value)}
            style={{ maxWidth: '200px' }}
          />
          <button type="button" onClick={onAddSlot} className="btn-primary" style={{ padding: '0 20px', display: 'flex', alignItems: 'center' }}>
            <Plus size={16} /> {t('add_slot_btn')}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {slotsList.length === 0 ? (
            <p style={{ opacity: 0.5, fontSize: '13px' }}>No availability slots defined. Please add slots above.</p>
          ) : (
            slotsList.map(slot => (
              <div key={slot} className="slot-chip">
                {slot}
                <button 
                  type="button" 
                  onClick={() => onRemoveSlot(slot)} 
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}
                  aria-label={`Remove slot ${slot}`}
                >
                  <X size={14} color="#ef4444" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <button type="button" onClick={onSaveAvailability} className="btn-primary" disabled={saveLoading} style={{ padding: '12px 24px' }}>
        {saveLoading ? t('saving_settings') : t('save_availability_pricing')}
      </button>
    </div>
  );
};

export default SpecAvailabilityTab;
