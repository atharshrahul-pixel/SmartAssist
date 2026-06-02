import { useState, use, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import Stepper from '../components/Stepper';
import HelpTooltip from '../components/HelpTooltip';
import { Star, Clock, ChevronRight, Search, Filter } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://p01--smart-assist-backend--qnbs82bxhg66.code.run/api');

const Screen4Specialists = () => {
  const { t } = useTranslation();
  const { state, updateState } = use(AppContext);
  const navigate = useNavigate();
  const [specialistsData, setSpecialistsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState(state.recommendedSpecialist || 'All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (state.accepted === null) {
      navigate('/');
      return;
    }
    fetch(`${BACKEND_URL}/specialists`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setSpecialistsData(data.specialists);
      })
      .catch(err => console.error("Error fetching specialists:", err))
      .finally(() => setIsLoading(false));
  }, [state.accepted, navigate]);

  const categories = useMemo(() => {
    const catsSet = new Set(specialistsData.flatMap(s => {
      const cat = s.category || s.specialization;
      return cat ? [cat] : [];
    }));
    if (state.recommendedSpecialist) {
      catsSet.add(state.recommendedSpecialist);
    }
    return ['All', ...Array.from(catsSet).sort()];
  }, [specialistsData, state.recommendedSpecialist]);

  const filteredData = useMemo(() => {
    return specialistsData.filter(s => {
      const categoryMatch = s.category || s.specialization;
      const matchesFilter = filter === 'All' || categoryMatch === filter;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.bio && s.bio.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery, specialistsData]);

  const handleSelect = (specialist) => {
    updateState({ finalSpecialist: specialist });
    navigate('/book');
  };

  return (
    <div className="page-transition" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stepper currentStep={4} />
      
      <div className="container" style={{ paddingTop: '0' }}>
        <header className="sticky-header text-center" style={{ paddingTop: '48px' }}>
          <span className="pill-tag mb-lg">{t('choose_partner')}</span>
          <h1 
            style={{ fontSize: '48px', lineHeight: '1.1', marginBottom: 'var(--sp-md)' }}
            dangerouslySetInnerHTML={{ __html: t('perfect_specialist_title') }}
          />
          <p style={{ color: 'var(--color-dark)', opacity: 0.6, fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
            {t('perfect_specialist_desc')}
          </p>
        </header>

        <div className="listing-container">
          <aside className="listing-sidebar">
            <div className="filter-group">
              <label htmlFor="specialist-search-input" className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                {t('search_specialist')}
                <HelpTooltip text={t('search_placeholder')} />
              </label>
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                <input 
                  id="specialist-search-input"
                  type="text" 
                  className="input-field" 
                  placeholder={t('search_placeholder')} 
                  style={{ paddingLeft: '44px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {t('categories')}
                <HelpTooltip text={t('specialization_tooltip')} />
              </label>
              {categories.map(cat => (
                <div 
                  key={cat} 
                  className={`filter-option ${filter === cat ? 'active' : ''}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat === 'All' ? t('all') : t(`category_${cat}`, { defaultValue: cat })}
                  <span style={{ fontSize: '12px', opacity: 0.5 }}>
                    {cat === 'All' ? specialistsData.length : specialistsData.filter(s => (s.category || s.specialization) === cat).length}
                  </span>
                </div>
              ))}
            </div>
          </aside>

          <main className="listing-main">
            {isLoading ? (
              <div className="card-light text-center" style={{ padding: '64px' }}>
                <h3>{t('loading_specialists')}</h3>
              </div>
            ) : filteredData.length > 0 ? filteredData.map((specialist, index) => (
              <div 
                key={specialist.id} 
                className="specialist-card-h animate-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="specialist-avatar-lg">
                  {specialist.initials || specialist.name.substring(0, 2).toUpperCase()}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>{specialist.name}</h3>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span className="pill-tag">{t(`category_${specialist.category || specialist.specialization}`, { defaultValue: specialist.category || specialist.specialization })}</span>
                        <span className="experience-tag">{specialist.experience}</span>
                      </div>
                    </div>
                    <div className="rating-badge">
                      <Star size={14} fill="currentColor" />
                      {specialist.rating}
                      <span style={{ fontWeight: '400', opacity: 0.6, fontSize: '12px' }}>({specialist.reviews})</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '15px', lineHeight: '1.5', color: 'var(--color-dark)', opacity: 0.7, marginBottom: '20px', maxWidth: '500px' }}>
                    {specialist.bio}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                    <button 
                      type="button"
                      className="btn-primary" 
                      style={{ marginLeft: 'auto', padding: '12px 24px' }}
                      onClick={() => handleSelect(specialist)}
                    >
                      {t('book_appointment')}
                      <ChevronRight size={16} style={{ marginLeft: '8px' }} />
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="card-light text-center" style={{ padding: '64px' }}>
                <Search size={48} color="var(--color-muted)" style={{ marginBottom: '16px' }} />
                <h3>{t('no_specialists_found')}</h3>
                <p style={{ opacity: 0.6 }}>{t('adjust_filters')}</p>
                <button type="button" className="btn-ghost mt-lg" onClick={() => {setFilter('All'); setSearchQuery('');}}>
                  {t('clear_filters')}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Screen4Specialists;
