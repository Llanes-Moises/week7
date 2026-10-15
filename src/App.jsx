import React, { useState, useEffect } from 'react';
import {
  Search, Bell, Plus, MapPin, Calendar, Tag, Filter,
  CheckCircle, AlertCircle, Trash2, Edit3, Menu, X, Shield, Heart, Package, HelpCircle
} from 'lucide-react';

const INITIAL_ITEMS = [
  {
    id: '1',
    title: 'MacBook Air M1 (Space Gray)',
    category: 'Electronics',
    type: 'lost',
    location: 'University Library 2nd Floor',
    date: '2026-10-14',
    description: 'Left near the study cubicles. Has stickers on the lid including an institutional logo.',
    status: 'looking',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    isMine: false,
  },
  {
    id: '2',
    title: 'Student ID & Brown Leather Wallet',
    category: 'IDs & Cards',
    type: 'found',
    location: 'Near Campus Cafeteria',
    date: '2026-10-15',
    description: 'Leather wallet containing a student ID and cards. Turned into the security desk.',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    isMine: false,
  },
  {
    id: '3',
    title: 'Scientific Calculator (Casio fx-991ES)',
    category: 'Electronics',
    type: 'lost',
    location: 'Engineering Building Room 402',
    date: '2026-10-13',
    description: 'Name written with a label maker at the back. Essential for upcoming midterms.',
    status: 'looking',
    image: 'https://images.unsplash.com/photo-1594980598776-8fd73aeb7614?auto=format&fit=crop&w=600&q=80',
    isMine: true,
  }
];

const CATEGORIES = ['All', 'Electronics', 'IDs & Cards', 'Books', 'Clothing', 'Accessories', 'Others'];

export default function App() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('findit_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'lost', 'found', 'mine'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Form state for new report
  const [formType, setFormType] = useState('lost');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formLocation, setFormLocation] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState('');
  const [formImage, setFormImage] = useState('');

  useEffect(() => {
    localStorage.setItem('findit_items', JSON.stringify(items));
  }, [items]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleCreateReport = (e) => {
    e.preventDefault();
    if (!formTitle || !formLocation) return;

    const newItem = {
      id: Date.now().toString(),
      title: formTitle,
      category: formCategory,
      type: formType,
      location: formLocation,
      date: formDate,
      description: formDescription || 'No additional description provided.',
      status: formType === 'lost' ? 'looking' : 'available',
      image: formImage || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80',
      isMine: true,
    };

    setItems([newItem, ...items]);
    setIsModalOpen(false);
    resetForm();
    showToast('Report successfully published!');
  };

  const resetForm = () => {
    setFormTitle('');
    setFormLocation('');
    setFormDescription('');
    setFormImage('');
    setFormType('lost');
  };

  const handleDelete = (id) => {
    setItems(items.filter(i => i.id !== id));
    setSelectedItem(null);
    showToast('Report deleted successfully.');
  };

  const handleToggleStatus = (id) => {
    setItems(items.map(i => {
      if (i.id === id) {
        const nextStatus = i.status === 'returned' ? (i.type === 'lost' ? 'looking' : 'available') : 'returned';
        return { ...i, status: nextStatus };
      }
      return i;
    }));
    showToast('Item status updated.');
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    let matchesTab = true;
    if (activeTab === 'lost') matchesTab = item.type === 'lost';
    if (activeTab === 'found') matchesTab = item.type === 'found';
    if (activeTab === 'mine') matchesTab = item.isMine;

    return matchesSearch && matchesCategory && matchesTab;
  });

  const stats = {
    total: items.length,
    lost: items.filter(i => i.type === 'lost').length,
    found: items.filter(i => i.type === 'found').length,
  };

  return (
    <div className="app-shell">
      {/* Top Bar */}
      <header className="topbar">
        <button className="mobile-menu icon-button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu size={20} />
        </button>
        <div className="brand">
          <div className="brand-mark">
            <Shield size={28} />
          </div>
          <div>
            <strong>FindIt</strong>
            <small>Campus Lost & Found</small>
          </div>
        </div>

        <div className="top-search">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search items, locations, or descriptions..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="top-actions">
          <div className="notification icon-button">
            <Bell size={20} />
            <i></i>
          </div>
          <div className="user-avatar">G</div>
          <div className="user-label">
            <strong>Gyan S.</strong>
            <span>BSIT Student</span>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="layout">
        {/* Sidebar */}
        <aside className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
          <span className="nav-label">DISCOVER</span>
          <nav>
            <button className={`nav-link ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              <Package size={17} /> All Listings <span className="nav-count">{stats.total}</span>
            </button>
            <button className={`nav-link ${activeTab === 'lost' ? 'active' : ''}`} onClick={() => setActiveTab('lost')}>
              <AlertCircle size={17} /> Lost Items <span className="nav-count" style={{background: '#286ed4'}}>{stats.lost}</span>
            </button>
            <button className={`nav-link ${activeTab === 'found' ? 'active' : ''}`} onClick={() => setActiveTab('found')}>
              <CheckCircle size={17} /> Found Items <span className="nav-count" style={{background: '#169364'}}>{stats.found}</span>
            </button>
            <button className={`nav-link ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
              <Tag size={17} /> My Reports
            </button>
          </nav>

          <div className="sidebar-help">
            <div className="help-art">
              <HelpCircle size={32} />
            </div>
            <strong>Need Assistance?</strong>
            <span>Visit the campus security office or campus help desk for physical claims.</span>
            <button onClick={() => showToast('Help desk info: Room 102, Main Hall')}>Contact Office</button>
          </div>

          <div className="sidebar-footer">
            <span className="online-dot"></span>
            <span>Campus Network Online</span>
            <span>v1.0</span>
          </div>
        </aside>

        {/* Content Area */}
        <main className="main-content">
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow"><Shield size={12} /> CAMPUS COMMUNITY PORTAL</span>
              <h1>Lost something? <em>We're here to help.</em></h1>
              <p>Browse active reports or broadcast a missing item across campus networks instantly.</p>
              <button onClick={() => setIsModalOpen(true)}>
                <Plus size={16} /> Report Missing or Found Item
              </button>
            </div>
          </section>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue"><Package size={20} /></div>
              <div>
                <span>Total Active</span>
                <strong>{stats.total}</strong>
              </div>
              <div className="stat-note">Tracked this term</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><AlertCircle size={20} /></div>
              <div>
                <span>Lost Reports</span>
                <strong>{stats.lost}</strong>
              </div>
              <div className="stat-note">Pending recovery</div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><CheckCircle size={20} /></div>
              <div>
                <span>Found Items</span>
                <strong>{stats.found}</strong>
              </div>
              <div className="stat-note">Ready for claim</div>
            </div>
          </div>

          {/* Filters & Categories */}
          <div className="section-heading">
            <div>
              <h2>Recent Campus Reports</h2>
              <p>Filter items by category or status below</p>
            </div>
          </div>

          <div className="filter-row">
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                className={`category-chip ${selectedCategory === cat ? 'selected' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="type-filters">
            <div className="segmented">
              <button className={activeTab === 'all' ? 'chosen' : ''} onClick={() => setActiveTab('all')}>All Items</button>
              <button className={activeTab === 'lost' ? 'chosen' : ''} onClick={() => setActiveTab('lost')}>Lost Only</button>
              <button className={activeTab === 'found' ? 'chosen' : ''} onClick={() => setActiveTab('found')}>Found Only</button>
            </div>
            <span className="results-count">Showing {filteredItems.length} items</span>
          </div>

          {/* Item Grid */}
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <div><Package size={24} /></div>
              <h3>No items found</h3>
              <p>Try adjusting your search query, category filter, or create a new report.</p>
              <button onClick={() => setIsModalOpen(true)}>Report an Item</button>
            </div>
          ) : (
            <div className="listing-grid">
              {filteredItems.map(item => (
                <div className="item-card" key={item.id}>
                  <button className="item-image" onClick={() => setSelectedItem(item)}>
                    <img src={item.image} alt={item.title} />
                    <span className={`type-badge ${item.type}`}>
                      {item.type.toUpperCase()}
                    </span>
                  </button>
                  <div className="item-body">
                    <div className="item-title-row">
                      <h3>{item.title}</h3>
                      {item.isMine && <span className="mine-label">My Post</span>}
                    </div>
                    <div className="item-description">{item.description}</div>
                    <div className="item-meta">
                      <span><MapPin size={13} /> {item.location}</span>
                      <span><Calendar size={13} /> {item.date}</span>
                    </div>
                    <div className="item-bottom">
                      <span className={`status-pill ${item.status}`}>
                        <span></span> {item.status.toUpperCase()}
                      </span>
                      <button className="details-button" onClick={() => setSelectedItem(item)}>
                        View Details &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <footer className="main-footer">
            <span>FindIt Campus Portal &copy; 2026</span>
            <span className="footer-heart">Built with React & Vite</span>
          </footer>
        </main>

        {/* Right Panel */}
        <aside className="right-panel">
          <div className="report-card">
            <div className="report-card-top">
              <div className="report-symbol">
                <Plus size={22} />
              </div>
              <div>
                <h3>Lost Something?</h3>
                <p>File a report immediately so campus peers can assist in finding it.</p>
              </div>
            </div>
            <button className="primary-button" onClick={() => setIsModalOpen(true)}>
              Create New Report
            </button>
          </div>

          <div className="community-card">
            <div className="community-icon">
              <Shield size={20} />
            </div>
            <h3>Community Guidelines</h3>
            <p>Meet in safe public areas like the main library or security station when handing over lost items.</p>
            <button onClick={() => showToast('Safety first: Always verify student IDs!')}>Read Safety Tips</button>
          </div>
        </aside>
      </div>

      {/* Report Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="modal-eyebrow">NEW SUBMISSION</span>
                <h2>Report an Item</h2>
                <p>Provide accurate details to help locate or return the item.</p>
              </div>
              <button className="close-button icon-button" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateReport}>
              <div className="type-choice">
                <button 
                  type="button" 
                  className={`lost-choice ${formType === 'lost' ? 'active' : ''}`}
                  onClick={() => setFormType('lost')}
                >
                  <AlertCircle size={15} /> I Lost Something
                </button>
                <button 
                  type="button" 
                  className={`found-choice ${formType === 'found' ? 'active' : ''}`}
                  onClick={() => setFormType('found')}
                >
                  <CheckCircle size={15} /> I Found Something
                </button>
              </div>

              <label>
                Item Name / Title *
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Blue Hydro Flask, Calculus Book" 
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                />
              </label>

              <div className="form-grid">
                <label>
                  Category
                  <select value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                    {CATEGORIES.filter(c => c !== 'All').map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Date <span className="optional">(Approximate)</span>
                  <input 
                    type="date" 
                    value={formDate}
                    onChange={e => setFormDate(e.target.value)}
                  />
                </label>
              </div>

              <label>
                Location Last Seen / Found *
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. CBA Building 3rd Floor Hallway" 
                  value={formLocation}
                  onChange={e => setFormLocation(e.target.value)}
                />
              </label>

              <label>
                Description & Identifying Marks <span className="optional">(Optional)</span>
                <textarea 
                  placeholder="Include color, brand, stickers, or specific distinguishing features..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                />
              </label>

              <label>
                Image URL <span className="optional">(Optional)</span>
                <input 
                  type="url" 
                  placeholder="https://example.com/photo.jpg" 
                  value={formImage}
                  onChange={e => setFormImage(e.target.value)}
                />
              </label>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div className="modal detail-modal" onClick={e => e.stopPropagation()}>
            <button className="detail-close icon-button" onClick={() => setSelectedItem(null)}>
              <X size={18} />
            </button>
            <div className="detail-image">
              <img src={selectedItem.image} alt={selectedItem.title} />
              <span className={`type-badge ${selectedItem.type}`}>
                {selectedItem.type.toUpperCase()}
              </span>
            </div>
            <div className="detail-content">
              <h2>{selectedItem.title}</h2>
              <p className="detail-description">{selectedItem.description}</p>
              
              <div className="detail-facts">
                <span>
                  <MapPin size={15} />
                  <div>
                    <small>Location</small>
                    <strong>{selectedItem.location}</strong>
                  </div>
                </span>
                <span>
                  <Calendar size={15} />
                  <div>
                    <small>Date Reported</small>
                    <strong>{selectedItem.date}</strong>
                  </div>
                </span>
              </div>

              <div className="detail-status">
                <span className={`status-pill ${selectedItem.status}`}>
                  <span></span> Status: {selectedItem.status.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button 
                  className="primary-button full-button" 
                  onClick={() => handleToggleStatus(selectedItem.id)}
                >
                  {selectedItem.status === 'returned' ? 'Mark as Active' : 'Mark as Returned / Claimed'}
                </button>
                {selectedItem.isMine && (
                  <button 
                    className="secondary-button danger-button" 
                    onClick={() => handleDelete(selectedItem.id)}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </div>
              <p className="detail-disclaimer">Please verify ownership with valid university identification before handing over personal belongings.</p>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}