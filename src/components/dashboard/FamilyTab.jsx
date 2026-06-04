import { Trash2, Plus } from 'lucide-react';
import HelpTooltip from '../HelpTooltip';

const FamilyTab = ({
  familyProfiles,
  familyFields,
  otherRelationship,
  familyLoading,
  onAddFamilyMember,
  onDeleteFamilyMember,
  onFieldChange,
  onOtherRelationshipChange,
  t
}) => {
  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>{t('family_profiles')}</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
        {/* List */}
        <div>
          <div style={{ display: 'grid', gap: '12px' }}>
            {(!familyProfiles || familyProfiles.length === 0) ? (
              <p style={{ opacity: 0.6 }}>{t('no_family')}</p>
            ) : (
              familyProfiles.map(member => (
                <div key={member._id} className="card-light" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '16px' }}>{member.name}</div>
                    <div style={{ fontSize: '13px', color: 'var(--color-orange)', fontWeight: '600' }}>{t(`rel_${member.relationship.toLowerCase()}`, { defaultValue: member.relationship })}</div>
                  </div>
                   <button type="button" onClick={() => onDeleteFamilyMember(member._id)} className="btn-danger" style={{ padding: '8px' }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Form */}
        <div>
          <form onSubmit={onAddFamilyMember} className="card-light" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>{t('add_family_member')}</h3>
            
            <div className="mb-md">
              <label htmlFor="family-name-input" className="form-label">
                {t('your_name')}
                <HelpTooltip text={t('tooltip_your_name')} />
              </label>
              <input 
                id="family-name-input"
                type="text" 
                className="input-field" 
                value={familyFields.name}
                onChange={e => onFieldChange('name', e.target.value)}
                placeholder={t('patient_name_placeholder')}
                required
              />
            </div>

            <div className="mb-lg">
              <label htmlFor="family-relationship-select" className="form-label">
                {t('relationship', { defaultValue: 'Relationship' })}
                <HelpTooltip text="Select how this person is related to you." />
              </label>
              <select 
                id="family-relationship-select"
                className="input-field"
                value={familyFields.relationship}
                onChange={e => onFieldChange('relationship', e.target.value)}
              >
                <option value="Child">{t('rel_child')}</option>
                <option value="Spouse">{t('rel_spouse')}</option>
                <option value="Parent">{t('rel_parent')}</option>
                <option value="Other">{t('rel_other')}</option>
              </select>
            </div>

            {familyFields.relationship === 'Other' && (
              <div className="mb-lg" style={{ animation: 'fadeInSlideUp 0.25s ease' }}>
                <label htmlFor="family-relationship-other" className="form-label">
                  {t('specify_relationship')}
                  <HelpTooltip text="Tell us how you are related to this person (e.g. Sibling, Cousin, Friend)." />
                </label>
                <input
                  id="family-relationship-other"
                  type="text"
                  className="input-field"
                  value={otherRelationship}
                  onChange={e => onOtherRelationshipChange(e.target.value)}
                  placeholder="e.g. Sibling, Aunt, Friend"
                  required
                />
              </div>
            )}

            <button type="submit" className="btn-primary w-full" disabled={familyLoading}>
              <Plus size={16} style={{ marginRight: '6px' }} /> {t('add_member_btn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FamilyTab;
