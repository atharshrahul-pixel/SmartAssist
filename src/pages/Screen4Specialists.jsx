import { useState, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App';
import Stepper from '../components/Stepper';
import { Star, Clock, MapPin, ChevronRight, Search, Filter } from 'lucide-react';

const specialistsData = [
  { 
    id: 1, 
    name: 'Dr. Arjun Mehta', 
    category: 'Dentist', 
    initials: 'AM', 
    rating: 4.9, 
    reviews: 124, 
    experience: '12 years',
    bio: 'Specializing in cosmetic dentistry and pain-free root canals with advanced laser technology.',
    slots: ['Mon 9am', 'Tue 2pm', 'Thu 4pm'] 
  },
  { 
    id: 2, 
    name: 'Dr. Priya Sharma', 
    category: 'Dentist', 
    initials: 'PS', 
    rating: 4.8, 
    reviews: 98, 
    experience: '8 years',
    bio: 'Expert in pediatric dentistry and orthodontic treatments for all age groups.',
    slots: ['Wed 10am', 'Fri 11am', 'Sat 9am'] 
  },
  { 
    id: 3, 
    name: 'Kavitha Nair', 
    category: 'Physiotherapist', 
    initials: 'KN', 
    rating: 4.9, 
    reviews: 210, 
    experience: '15 years',
    bio: 'Renowned sports physiotherapist helping athletes recover from ACL and joint injuries.',
    slots: ['Mon 2pm', 'Wed 9am', 'Fri 3pm'] 
  },
  { 
    id: 4, 
    name: 'Rajesh Kumar', 
    category: 'Physiotherapist', 
    initials: 'RK', 
    rating: 4.7, 
    reviews: 85, 
    experience: '6 years',
    bio: 'Focused on postural correction and chronic back pain management through manual therapy.',
    slots: ['Tue 10am', 'Thu 2pm', 'Sat 10am'] 
  },
  { 
    id: 5, 
    name: 'Sneha Pillai', 
    category: 'Gym Trainer', 
    initials: 'SP', 
    rating: 5.0, 
    reviews: 156, 
    experience: '10 years',
    bio: 'Certified strength coach specializing in sustainable weight loss and functional fitness.',
    slots: ['Mon 7am', 'Wed 7am', 'Fri 7am'] 
  },
  { 
    id: 6, 
    name: 'Amit Tiwari', 
    category: 'Salon Specialist', 
    initials: 'AT', 
    rating: 4.6, 
    reviews: 72, 
    experience: '5 years',
    bio: 'Award-winning stylist focusing on modern hair aesthetics and skin rejuvenation treatments.',
    slots: ['Tue 11am', 'Thu 11am', 'Sat 2pm'] 
  }
];

const Screen4Specialists = () => {
  const { state, updateState } = useContext(AppContext);
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Dentist', 'Physiotherapist', 'Gym Trainer', 'Salon Specialist'];

  const filteredData = useMemo(() => {
    return specialistsData.filter(s => {
      const matchesFilter = filter === 'All' || s.category === filter;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.bio.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery]);

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
                    {cat === 'All' ? specialistsData.length : specialistsData.filter(s => s.category === cat).length}
                  </span>
                </div>
              ))}
            </div>

            <div className="card-light" style={{ padding: '20px', background: 'rgba(237, 184, 32, 0.05)', borderStyle: 'dashed' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', color: 'var(--color-orange)' }}>
                <Filter size={16} />
                <span style={{ fontSize: '14px', fontWeight: '700' }}>Smart Filter</span>
              </div>
              <p style={{ fontSize: '12px', lineHeight: '1.5', opacity: 0.7 }}>
                Our AI recommended <strong>{state.recommendedSpecialist || 'Physiotherapist'}</strong> based on your input.
              </p>
            </div>
          </aside>

          <main className="listing-main">
            {filteredData.length > 0 ? filteredData.map((specialist, index) => (
              <div 
                key={`${filter}-${specialist.id}`} 
                className="specialist-card-h animate-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="specialist-avatar-lg">
                  {specialist.initials}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <h3 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '4px' }}>{specialist.name}</h3>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <span className="pill-tag" style={{ fontSize: '10px' }}>{specialist.category}</span>
                        <span className="experience-tag">{specialist.experience} exp.</span>
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
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', color: 'var(--color-muted)' }}>
                        Next Available
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {specialist.slots.slice(0, 2).map(slot => (
                          <span key={slot} style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-dark)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} color="var(--color-orange)" />
                            {slot}
                          </span>
                        ))}
                      </div>
                    </div>
                    
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
