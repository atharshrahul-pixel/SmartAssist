import { useState, useContext, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import Stepper from '../components/Stepper';
import { Star, Clock, ChevronRight, Search, Filter } from 'lucide-react';

const BACKEND_URL = 'https://akeno7594-internship-project-backend.hf.space/api';

const HelpTooltip = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <span style={{ display: 'inline-block', position: 'relative', marginLeft: '6px' }}>
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        style={{
          width: '16px', height: '16px', borderRadius: '50%',
          background: 'rgba(0,0,0,0.06)', display: 'inline-flex',
          alignItems: 'center', justifyContent: 'center', fontSize: '11px',
          fontWeight: 'bold', color: 'var(--color-dark)', border: 'none',
          outline: 'none', cursor: 'pointer', verticalAlign: 'middle'
        }}
      >
        ?
      </button>
      {show && (
        <span style={{
          position: 'absolute', bottom: '24px', left: '50%',
          transform: 'translateX(-50%)', width: '220px',
          background: 'var(--color-dark)', color: 'var(--color-white)',
          padding: '10px 12px', borderRadius: '8px', fontSize: '11px',
          lineHeight: '1.4', zIndex: 100, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          pointerEvents: 'none', display: 'block', textTransform: 'none',
          fontWeight: 'normal', letterSpacing: 'normal'
        }}>
          {text}
          <span style={{
            position: 'absolute', top: '100%', left: '50%',
            transform: 'translateX(-50%)', width: '0', height: '0',
            borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
            borderTop: '6px solid var(--color-dark)', display: 'block'
          }} />
        </span>
      )}
    </span>
  );
};

const Screen4Specialists = () => {
  const { state, updateState } = useContext(AppContext);
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

  const categories = ['All', 'Dentist', 'Physiotherapist', 'Gym Trainer', 'Salon Specialist'];

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
          <span className="pill-tag mb-lg">CHOOSE YOUR PARTNER</span>
          <h1 style={{ fontSize: '48px', lineHeight: '1.1', marginBottom: 'var(--sp-md)' }}>
            The perfect <span className="accent-word" style={{ color: 'var(--color-orange)' }}>specialist</span> for you
          </h1>
          <p style={{ color: 'var(--color-dark)', opacity: 0.6, fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>
            Browse through our hand-picked experts. Each one is vetted for quality and professional excellence.
          </p>
        </header>

        <div className="listing-container">
          <aside className="listing-sidebar">
            <div className="filter-group">
              <label className="filter-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                Search Specialist
                <HelpTooltip text="Search by name or doctor bio to find a specific expert." />
              </label>
              <div style={{ position: 'relative', marginBottom: '24px' }}>
                <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Search by name..." 
                  style={{ paddingLeft: '44px' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <label className="filter-label">Categories</label>
              {categories.map(cat => (
                <div 
                  key={cat} 
                  className={`filter-option ${filter === cat ? 'active' : ''}`}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
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
                <h3>Loading specialists...</h3>
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
                        <span className="pill-tag" style={{ fontSize: '10px' }}>{specialist.category || specialist.specialization}</span>
                        <span className="experience-tag">{specialist.experience}</span>
                      </div>
                    </div>
                    <div className="rating-badge">
                      <Star size={14} fill="currentColor" />
                      {specialist.rating}
                      <span style={{ fontWeight: '400', opacity: 0.6, fontSize: '11px' }}>({specialist.reviews})</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '15px', lineHeight: '1.5', color: 'var(--color-dark)', opacity: 0.7, marginBottom: '20px', maxWidth: '500px' }}>
                    {specialist.bio}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                    <button 
                      className="btn-primary" 
                      style={{ marginLeft: 'auto', padding: '12px 24px' }}
                      onClick={() => handleSelect(specialist)}
                    >
                      Book Appointment
                      <ChevronRight size={16} style={{ marginLeft: '8px' }} />
                    </button>
                  </div>
                </div>
              </div>
            )) : (
              <div className="card-light text-center" style={{ padding: '64px' }}>
                <Search size={48} color="var(--color-muted)" style={{ marginBottom: '16px' }} />
                <h3>No specialists found</h3>
                <p style={{ opacity: 0.6 }}>Try adjusting your search or category filters.</p>
                <button className="btn-ghost mt-lg" onClick={() => {setFilter('All'); setSearchQuery('');}}>
                  Clear all filters
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
