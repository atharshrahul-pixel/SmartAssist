import { useState, use, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppContext } from '../context/AppContext';
import Stepper from '../components/Stepper';
import HelpTooltip from '../components/HelpTooltip';
import { Star, ChevronRight, Search, Laptop, MapPin, ArrowLeft } from 'lucide-react';
import { SafeTitle } from '../utils/titleRenderer';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || (window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : 'https://p01--smart-assist-backend--qnbs82bxhg66.code.run/api');

const CATEGORIES = ['All', 'Dentist', 'Gym', 'Physiotherapist', 'General practitioner', 'Therapist'];

const resolveRecommendationCategory = (rec) => {
  if (!rec) return 'All';
  const normalized = rec.toLowerCase().trim();
  if (normalized === 'gym trainer' || normalized === 'gym') return 'Gym';
  if (normalized === 'general practitioner') return 'General practitioner';
  if (normalized === 'dentist') return 'Dentist';
  if (normalized === 'physiotherapist') return 'Physiotherapist';
  if (normalized === 'therapist') return 'Therapist';
  return 'All';
};

// react-doctor-disable-next-line react-doctor/prefer-useReducer
const Screen4Specialists = () => {
  const { t } = useTranslation();
  const { state, updateState } = use(AppContext);
  const navigate = useNavigate();
  const [specialistsData, setSpecialistsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const mainContentRef = useRef(null);
  
  const initialFilter = useMemo(() => {
    return resolveRecommendationCategory(state.recommendedSpecialist);
  }, [state.recommendedSpecialist]);

  const [filter, setFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [activePanel, setActivePanel] = useState(null); // 'website' | 'nearyou' | null
  const [panelType, setPanelType] = useState(null); // 'website' | 'nearyou' | null

  const displayedCategories = useMemo(() => {
    if (panelType === 'nearyou' && state.recommendedSpecialist && state.recommendedSpecialist !== 'All') {
      return [resolveRecommendationCategory(state.recommendedSpecialist)];
    }
    return CATEGORIES;
  }, [panelType, state.recommendedSpecialist]);



  // react-doctor-disable-next-line react-doctor/no-fetch-in-effect
  useEffect(() => {
    if (state.accepted === null) {
      navigate('/');
      return;
    }
    let active = true;

    const queryParams = new URLSearchParams();
    if (state.lat && state.lng) {
      queryParams.append('lat', state.lat);
      queryParams.append('lng', state.lng);
    }

    fetch(`${BACKEND_URL}/specialists?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (!active) return;
        if (data.success) setSpecialistsData(data.specialists);
      })
      .catch(err => {
        if (active) console.error("Error fetching specialists:", err);
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
          window.scrollTo(0, 0);
          if (mainContentRef.current) {
            mainContentRef.current.scrollTop = 0;
          }
        }
      });
    return () => {
      active = false;
    };
  }, [state.accepted, navigate, state.lat, state.lng]);

  const filteredData = useMemo(() => {
    return specialistsData.filter(s => {
      // If panel is 'website', show only website specialists (not isExternal)
      if (panelType === 'website' && s.isExternal) {
        return false;
      }
      // If panel is 'nearyou', show only external/nearby specialists (isExternal)
      if (panelType === 'nearyou' && !s.isExternal) {
        return false;
      }
      const categoryMatch = s.category || s.specialization;
      const matchesFilter = filter === 'All' || categoryMatch === filter;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.bio && s.bio.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery, specialistsData, panelType]);

  const handleSelect = (specialist) => {
    updateState({ finalSpecialist: specialist });
    navigate('/book');
  };

  return (
    <div className="page-transition" style={{ minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stepper currentStep={4} />
      
      <div className="container" style={{ paddingTop: '0' }}>
        {activePanel ? (
          <header className="sticky-header text-center" style={{ paddingTop: '8px', paddingBottom: '8px', marginBottom: '12px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: 0 }}>
              {activePanel === 'nearyou' 
                ? t('specialists_near_you', { defaultValue: 'Specialists Near You' }) 
                : t('on_smart_assist', { defaultValue: 'On Smart Assist' })}
            </h2>
          </header>
        ) : (
          <header className="sticky-header text-center" style={{ paddingTop: '48px' }}>
            <span className="pill-tag mb-lg">{t('choose_partner')}</span>
            <h1 style={{ fontSize: '48px', lineHeight: '1.1', marginBottom: 'var(--sp-md)' }}>
              <SafeTitle text={t('perfect_specialist_title')} />
            </h1>
            <p style={{ color: 'var(--color-dark)', opacity: 0.6, fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
              {t('perfect_specialist_desc')}
            </p>
          </header>
        )}

        <div className="discovery-slide-container">
          {/* Card Selection View */}
          <div className={`discovery-slide-page page-categories ${activePanel ? 'hidden' : ''}`}>
            <div className="discovery-menu-grid">
              <button 
                type="button"
                className="discovery-menu-card"
                onClick={() => {
                  setPanelType('website');
                  setFilter(resolveRecommendationCategory(state.recommendedSpecialist));
                  setActivePanel('website');
                  window.scrollTo(0, 0);
                  if (mainContentRef.current) {
                    mainContentRef.current.scrollTop = 0;
                  }
                }}
              >
                <div className="discovery-menu-card-icon">
                  <Laptop size={40} />
                </div>
                <h2>On Smart Assist</h2>
                <p>Browse verified professional specialists registered directly on our website.</p>
                <span className="discovery-menu-card-btn">
                  Explore Specialists <ChevronRight size={16} />
                </span>
              </button>

              <button 
                type="button"
                className="discovery-menu-card"
                onClick={() => {
                  setPanelType('nearyou');
                  setFilter(resolveRecommendationCategory(state.recommendedSpecialist));
                  setActivePanel('nearyou');
                  window.scrollTo(0, 0);
                  if (mainContentRef.current) {
                    mainContentRef.current.scrollTop = 0;
                  }
                }}
              >
                <div className="discovery-menu-card-icon">
                  <MapPin size={40} />
                </div>
                <h2>Near You</h2>
                <p>Find specialists close to your current location with distance estimates.</p>
                <span className="discovery-menu-card-btn">
                  Find Nearby <ChevronRight size={16} />
                </span>
              </button>
            </div>
          </div>

          {/* Slide Panel View */}
          <div className={`discovery-slide-page page-panel ${activePanel ? 'active' : ''}`}>
            <div className="listing-container">
              <aside className="listing-sidebar">
                <div className="back-btn-container" style={{ marginBottom: '24px' }}>
                  <button 
                    type="button" 
                    className="discovery-back-btn"
                    onClick={() => {
                      setActivePanel(null);
                    }}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <ArrowLeft size={16} /> Back to Categories
                  </button>
                </div>

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

                  <span className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {t('categories')}
                    <HelpTooltip text={t('specialization_tooltip')} />
                  </span>
                  {displayedCategories.map(cat => (
                    <button 
                      key={cat} 
                      type="button"
                      className={`filter-option ${filter === cat ? 'active' : ''}`}
                      onClick={() => {
                        setFilter(cat);
                        if (mainContentRef.current) {
                          mainContentRef.current.scrollTop = 0;
                        }
                      }}
                      style={{ border: 'none', background: 'transparent', textAlign: 'left', cursor: 'pointer', width: '100%' }}
                    >
                      {cat === 'All' ? t('all') : t(`category_${cat}`, { defaultValue: cat })}
                      <span style={{ fontSize: '12px', opacity: 0.5 }}>
                        {cat === 'All' 
                          ? specialistsData.filter(s => panelType === 'website' ? !s.isExternal : s.isExternal).length 
                          : specialistsData.filter(s => (s.category || s.specialization) === cat && (panelType === 'website' ? !s.isExternal : s.isExternal)).length}
                      </span>
                    </button>
                  ))}
                </div>
              </aside>

              <main className="listing-main" ref={mainContentRef}>
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
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <span className="pill-tag">{t(`category_${specialist.category || specialist.specialization}`, { defaultValue: specialist.category || specialist.specialization })}</span>
                            <span className="experience-tag">{specialist.experience}</span>
                            {panelType === 'nearyou' && (
                              <span className="distance-tag">
                                📍 {specialist.distance ? `${specialist.distance.toFixed(1)} km away` : `${((index + 1) * 0.4 + 1.1).toFixed(1)} km away`}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="rating-badge">
                          <Star size={14} fill="currentColor" />
                          {specialist.rating}
                          <span style={{ fontWeight: '400', opacity: 0.6, fontSize: '12px' }}>({specialist.reviews})</span>
                        </div>
                      </div>

                      <p style={{ fontSize: '15px', lineHeight: '1.5', color: 'var(--color-dark)', opacity: 0.7, marginBottom: '12px', maxWidth: '500px' }}>
                        {specialist.bio}
                      </p>

                      {specialist.address && (
                        <p style={{ fontSize: '13px', color: 'var(--color-dark)', opacity: 0.6, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={14} /> {specialist.address}
                        </p>
                      )}

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
                    <button type="button" className="btn-ghost mt-lg" onClick={() => {
                      setFilter('All');
                      setSearchQuery('');
                      if (mainContentRef.current) {
                        mainContentRef.current.scrollTop = 0;
                      }
                    }}>
                      {t('clear_filters')}
                    </button>
                  </div>
                )}
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Screen4Specialists;
