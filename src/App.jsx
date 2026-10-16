import React, { useState, useEffect } from 'react';
import {
  Search, Bell, Plus, MapPin, Calendar, Tag, CheckCircle,
  AlertCircle, Trash2, X, Shield, Package, HelpCircle,
  User, LogIn, LogOut, UserPlus, CheckSquare, Edit3, ExternalLink, Facebook, Instagram, Mail, Phone, Lock, FileText, Upload, Link as LinkIcon
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
    postedBy: 'Anonymous',
    ownerId: 'anon-1',
    authorProfile: {
      name: 'Anonymous Student',
      email: 'hidden@university.edu',
      phone: 'N/A',
      address: 'Campus Grounds',
      facebook: 'facebook.com',
      instagram: 'instagram.com'
    }
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
    postedBy: 'Gyan Magmanlac',
    ownerId: 'user-gyan',
    authorProfile: {
      name: 'Gyan Magmanlac',
      email: 'gyan@university.edu',
      phone: '+63 912 345 6789',
      address: 'IT Department, University of Batangas',
      facebook: 'facebook.com/gyan.magmanlac',
      instagram: 'instagram.com/gyan_m'
    }
  },
  {
    id: '3',
    title: 'Scientific Calculator (Casio fx-991ES)',
    category: 'Electronics',
    type: 'lost',
    location: 'Engineering Building Room 402',
    date: '2026-10-13',
    description: 'Name written with a label maker at the back. Essential for upcoming midterms.',
    status: 'returned',
    image: 'https://images.unsplash.com/photo-1594980598776-8fd73aeb7614?auto=format&fit=crop&w=600&q=80',
    postedBy: 'Gyan Magmanlac',
    ownerId: 'user-gyan',
    authorProfile: {
      name: 'Gyan Magmanlac',
      email: 'gyan@university.edu',
      phone: '+63 912 345 6789',
      address: 'IT Department, University of Batangas',
      facebook: 'facebook.com/gyan.magmanlac',
      instagram: 'instagram.com/gyan_m'
    }
  }
];

const CATEGORIES = ['All', 'Electronics', 'IDs & Cards', 'Books', 'Clothing', 'Accessories', 'Others'];

export default function App() {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('lostify_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('lostify_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Unique session ID for anonymous users so their "My Reports" don't bleed across logouts
  const [anonSessionId] = useState(() => {
    let sid = sessionStorage.getItem('lostify_anon_sid');
    if (!sid) {
      sid = 'anon-' + Date.now();
      sessionStorage.setItem('lostify_anon_sid', sid);
    }
    return sid;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'lost', 'found', 'resolved', 'mine'
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null); // Author profile modal view
  const [authMode, setAuthMode] = useState('login'); 
  const [selectedItem, setSelectedItem] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // Auth Form State
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Editable Profile State
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '+63 900 000 0000',
    address: 'Campus Dormitory / Building',
    facebook: 'facebook.com/student',
    instagram: 'instagram.com/student'
  });

  // Sync profileForm when currentUser changes or loads
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        phone: currentUser.profile?.phone || '+63 912 345 6789',
        address: currentUser.profile?.address || 'University Campus',
        facebook: currentUser.profile?.facebook || '',
        instagram: currentUser.profile?.instagram || ''
      });
    }
  }, [currentUser]);

  // Item Form State
  const [formType, setFormType] = useState('lost');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Electronics');
  const [formLocation, setFormLocation] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState('');
  
  // Image handling state (supports url or file upload)
  const [imageInputType, setImageInputType] = useState('url'); // 'url' or 'file'
  const [formImage, setFormImage] = useState('');

  useEffect(() => {
    localStorage.setItem('lostify_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('lostify_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('lostify_user');
    }
  }, [currentUser]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    
    if (!termsAccepted) {
      showToast('You must agree to the Private Data Collection Terms & Conditions.');
      return;
    }

    // Retrieve users database from localStorage
    let usersDb = JSON.parse(localStorage.getItem('lostify_users_db') || '[]');

    if (authMode === 'register') {
      if (!authName || !authEmail) return;
      
      const existing = usersDb.find(u => u.email.toLowerCase() === authEmail.toLowerCase());
      if (existing) {
        showToast('Account with this email already exists! Please login.');
        setAuthMode('login');
        return;
      }

      const newUser = { 
        id: 'user-' + Date.now(),
        name: authName, 
        email: authEmail,
        profile: {
          name: authName,
          email: authEmail,
          phone: '+63 912 345 6789',
          address: 'University Campus',
          facebook: 'facebook.com/' + authName.toLowerCase().replace(/\s+/g, ''),
          instagram: 'instagram.com/' + authName.toLowerCase().replace(/\s+/g, '')
        }
      };

      usersDb.push(newUser);
      localStorage.setItem('lostify_users_db', JSON.stringify(usersDb));
      setCurrentUser(newUser);
      showToast(`Welcome to Lostify, ${authName}!`);
    } else {
      if (!authEmail) return;

      // STRICT VALIDATION: Cannot login unless an account is registered first
      let foundUser = usersDb.find(u => u.email.toLowerCase() === authEmail.toLowerCase());

      if (!foundUser) {
        showToast('Account not found! Please create an account first.');
        setAuthMode('register');
        return;
      }

      setCurrentUser(foundUser);
      showToast(`Welcome back, ${foundUser.name}!`);
    }

    setIsAuthModalOpen(false);
    setAuthName('');
    setAuthEmail('');
    setAuthPassword('');
    setTermsAccepted(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsProfileModalOpen(false);
    showToast('Logged out successfully. Switched to Anonymous mode.');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const updatedUser = {
      ...currentUser,
      name: profileForm.name || currentUser.name,
      profile: {
        ...currentUser.profile,
        name: profileForm.name || currentUser.name,
        phone: profileForm.phone,
        address: profileForm.address,
        facebook: profileForm.facebook,
        instagram: profileForm.instagram
      }
    };

    setCurrentUser(updatedUser);

    let usersDb = JSON.parse(localStorage.getItem('lostify_users_db') || '[]');
    usersDb = usersDb.map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem('lostify_users_db', JSON.stringify(usersDb));

    const updatedItems = items.map(item => {
      if (item.ownerId === updatedUser.id) {
        return {
          ...item,
          postedBy: updatedUser.name,
          authorProfile: updatedUser.profile
        };
      }
      return item;
    });
    setItems(updatedItems);

    setIsProfileModalOpen(false);
    showToast('Profile information updated & saved successfully!');
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormImage(reader.result); // Base64 string for uploaded file preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateReport = (e) => {
    e.preventDefault();
    if (!formTitle || !formLocation) return;

    const activeOwnerId = currentUser ? currentUser.id : anonSessionId;
    const posterName = currentUser ? currentUser.name : 'Anonymous User';
    const authorProf = currentUser ? currentUser.profile : {
      name: 'Anonymous User',
      email: 'Hidden for privacy',
      phone: 'Not provided',
      address: 'Anonymous Session',
      facebook: '#',
      instagram: '#'
    };

    const newItem = {
      id: Date.now().toString(),
      title: formTitle,
      category: formCategory,
      type: formType,
      location: formLocation,
      date: formDate,
      description: formDescription || 'No additional details provided.',
      status: formType === 'lost' ? 'looking' : 'available',
      image: formImage || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80',
      postedBy: posterName,
      ownerId: activeOwnerId,
      authorProfile: authorProf
    };

    setItems([newItem, ...items]);
    setIsModalOpen(false);
    resetForm();
    showToast(currentUser ? 'Report published under your account!' : 'Report published anonymously!');
  };

  const resetForm = () => {
    setFormTitle('');
    setFormLocation('');
    setFormDescription('');
    setFormImage('');
    setFormType('lost');
    setImageInputType('url');
  };

  const handleDelete = (id, itemOwnerId) => {
    const activeOwnerId = currentUser ? currentUser.id : anonSessionId;
    if (itemOwnerId !== activeOwnerId) {
      showToast('Error: You can only delete posts created by your active session or account.');
      return;
    }
    setItems(items.filter(i => i.id !== id));
    setSelectedItem(null);
    showToast('Report deleted successfully.');
  };

  const handleToggleStatus = (id, itemOwnerId) => {
    const activeOwnerId = currentUser ? currentUser.id : anonSessionId;
    if (itemOwnerId !== activeOwnerId) {
      showToast('Note: Only the original author can modify the status of this item.');
      return;
    }
    setItems(items.map(i => {
      if (i.id === id) {
        const isResolved = i.status === 'returned';
        const nextStatus = isResolved ? (i.type === 'lost' ? 'looking' : 'available') : 'returned';
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

    const activeOwnerId = currentUser ? currentUser.id : anonSessionId;

    let matchesTab = true;
    if (activeTab === 'lost') matchesTab = item.type === 'lost' && item.status !== 'returned';
    if (activeTab === 'found') matchesTab = item.type === 'found' && item.status !== 'returned';
    if (activeTab === 'resolved') matchesTab = item.status === 'returned';
    if (activeTab === 'mine') matchesTab = item.ownerId === activeOwnerId;

    return matchesSearch && matchesCategory && matchesTab;
  });

  const activeOwnerId = currentUser ? currentUser.id : anonSessionId;

  const stats = {
    total: items.length,
    lost: items.filter(i => i.type === 'lost' && i.status !== 'returned').length,
    found: items.filter(i => i.type === 'found' && i.status !== 'returned').length,
    resolved: items.filter(i => i.status === 'returned').length,
    mine: items.filter(i => i.ownerId === activeOwnerId).length,
  };

  return (
    <div className="app-shell">
      {/* Header / Topbar */}
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <Shield size={28} />
          </div>
          <div>
            <strong>Lostify</strong>
            <small>Lost and Identify</small>
          </div>
        </div>

        <div className="top-search">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search missing items, locations, or descriptions..." 
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
          {currentUser ? (
            <div className="user-profile-badge interactive" onClick={() => setIsProfileModalOpen(true)} title="Click to view/edit profile">
              <div className="user-avatar">{currentUser.name.charAt(0).toUpperCase()}</div>
              <div className="user-label">
                <strong>{currentUser.name}</strong>
                <span>My Profile</span>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="secondary-button" onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); setTermsAccepted(false); }}>
                <LogIn size={15} /> Login
              </button>
              <button className="primary-button compact" onClick={() => { setAuthMode('register'); setIsAuthModalOpen(true); setTermsAccepted(false); }}>
                <UserPlus size={15} /> Sign Up
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <div className="layout">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <span className="nav-label">DISCOVER</span>
          <nav>
            <button className={`nav-link ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
              <Package size={17} /> All Listings <span className="nav-count">{stats.total}</span>
            </button>
            <button className={`nav-link ${activeTab === 'lost' ? 'active' : ''}`} onClick={() => setActiveTab('lost')}>
              <AlertCircle size={17} /> Lost Items <span className="nav-count blue-bg">{stats.lost}</span>
            </button>
            <button className={`nav-link ${activeTab === 'found' ? 'active' : ''}`} onClick={() => setActiveTab('found')}>
              <CheckCircle size={17} /> Found Items <span className="nav-count green-bg">{stats.found}</span>
            </button>
            <button className={`nav-link ${activeTab === 'resolved' ? 'active' : ''}`} onClick={() => setActiveTab('resolved')}>
              <CheckSquare size={17} /> Resolved Issues <span className="nav-count purple-bg">{stats.resolved}</span>
            </button>
            <button className={`nav-link ${activeTab === 'mine' ? 'active' : ''}`} onClick={() => setActiveTab('mine')}>
              <Tag size={17} /> My Reports <span className="nav-count orange-bg">{stats.mine}</span>
            </button>
          </nav>

          <div className="sidebar-help">
            <div className="help-art">
              <HelpCircle size={32} />
            </div>
            <strong>Need Assistance?</strong>
            <span>Visit campus security or help desk for physical item claims.</span>
            <button onClick={() => showToast('Campus Helpdesk: Room 102, Student Center')}>Contact Helpdesk</button>
          </div>

          <div className="sidebar-footer">
            <span className="online-dot"></span>
            <span>Lostify Network Active</span>
            <span>v1.5</span>
          </div>
        </aside>

        {/* Content Area */}
        <main className="main-content">
          <section className="hero">
            <div className="hero-copy">
              <span className="eyebrow"><Shield size={12} /> LOST AND IDENTIFY PORTAL</span>
              <h1>Lost something? <em>Lostify helps you find it.</em></h1>
              <p>Post reports anonymously or log in to track your items and connect with campus peers instantly.</p>
              <button onClick={() => setIsModalOpen(true)}>
                <Plus size={16} /> Report Missing or Found Item
              </button>
            </div>
          </section>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue"><Package size={20} /></div>
              <div>
                <span>Total Items</span>
                <strong>{stats.total}</strong>
              </div>
              <div className="stat-note">Tracked on campus</div>
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
              <div className="stat-icon green"><CheckSquare size={20} /></div>
              <div>
                <span>Resolved / Returned</span>
                <strong>{stats.resolved}</strong>
              </div>
              <div className="stat-note">Successfully identified</div>
            </div>
          </div>

          {/* Categories & Segmented Filters */}
          <div className="section-heading">
            <div>
              <h2>{activeTab === 'resolved' ? 'Resolved & Returned Items' : activeTab === 'mine' ? 'My Personal Reports' : 'Recent Campus Listings'}</h2>
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
              <button className={activeTab === 'all' ? 'chosen' : ''} onClick={() => setActiveTab('all')}>All</button>
              <button className={activeTab === 'lost' ? 'chosen' : ''} onClick={() => setActiveTab('lost')}>Lost</button>
              <button className={activeTab === 'found' ? 'chosen' : ''} onClick={() => setActiveTab('found')}>Found</button>
              <button className={activeTab === 'resolved' ? 'chosen' : ''} onClick={() => setActiveTab('resolved')}>Resolved</button>
              <button className={activeTab === 'mine' ? 'chosen' : ''} onClick={() => setActiveTab('mine')}>My Reports</button>
            </div>
            <span className="results-count">Showing {filteredItems.length} items</span>
          </div>

          {/* Item Grid */}
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <div><Package size={24} /></div>
              <h3>No items found</h3>
              <p>Try adjusting your search filters or create a new post.</p>
              <button onClick={() => setIsModalOpen(true)}>Create a Post</button>
            </div>
          ) : (
            <div className="listing-grid">
              {filteredItems.map(item => (
                <div className={`item-card ${item.status === 'returned' ? 'resolved-card' : ''}`} key={item.id}>
                  <button className="item-image" onClick={() => setSelectedItem(item)}>
                    <img src={item.image} alt={item.title} />
                    <span className={`type-badge ${item.status === 'returned' ? 'resolved' : item.type}`}>
                      {item.status === 'returned' ? 'RESOLVED' : item.type.toUpperCase()}
                    </span>
                  </button>
                  <div className="item-body">
                    <div className="item-title-row">
                      <h3>{item.title}</h3>
                    </div>
                    <div className="poster-info clickable" onClick={() => setViewingProfile(item.authorProfile)} title="View author profile & contacts">
                      <User size={12} /> Posted by: <strong className="author-link">{item.postedBy}</strong>
                    </div>
                    <div className="item-description">{item.description}</div>
                    <div className="item-meta">
                      <span><MapPin size={13} /> {item.location}</span>
                      <span><Calendar size={13} /> {item.date}</span>
                    </div>
                    <div className="item-bottom">
                      <span className={`status-pill ${item.status}`}>
                        <span></span> {item.status === 'returned' ? 'RESOLVED' : item.status.toUpperCase()}
                      </span>
                      <button className="details-button" onClick={() => setSelectedItem(item)}>
                        Details &rarr;
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <footer className="main-footer">
            <span>Lostify — Campus Lost & Identify &copy; 2026</span>
            <span className="footer-heart">Built with React & Vite & Animation UI</span>
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
                <h3>Lost or Found Item?</h3>
                <p>Broadcast your item to campus peers. Post logged in or anonymously!</p>
              </div>
            </div>
            <button className="primary-button" onClick={() => setIsModalOpen(true)}>
              Create New Post
            </button>
          </div>

          <div className="community-card">
            <div className="community-icon">
              <Shield size={20} />
            </div>
            <h3>Connect & Identify</h3>
            <p>Click on any poster's name to view their Facebook, Instagram, and contact info to return items safely!</p>
          </div>
        </aside>
      </div>

      {/* Auth Modal (Login / Sign Up) with Terms & Private Data Consent */}
      {isAuthModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAuthModalOpen(false)}>
          <div className="modal form-modal auth-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="modal-eyebrow">ACCOUNT ACCESS & PRIVACY CONSENT</span>
                <h2>{authMode === 'login' ? 'Login to Lostify' : 'Create an Account'}</h2>
                <p>{authMode === 'login' ? 'You must create an account first to log in.' : 'Register to manage your posts and display your contact links.'}</p>
              </div>
              <button className="close-button icon-button" onClick={() => setIsAuthModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAuthSubmit}>
              {authMode === 'register' && (
                <label>
                  Full Name *
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Gyan Magmanlac" 
                    value={authName}
                    onChange={e => setAuthName(e.target.value)}
                  />
                </label>
              )}

              <label>
                Email Address *
                <input 
                  type="email" 
                  required 
                  placeholder="student@university.edu" 
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                />
              </label>

              <label>
                Password *
                <input 
                  type="password" 
                  required 
                  placeholder="••••••••" 
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                />
              </label>

              {/* Terms and Conditions & Private Data Disclosure Box */}
              <div className="terms-container" style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                padding: '14px',
                fontSize: '11px',
                color: '#475569',
                display: 'grid',
                gap: '8px',
                marginTop: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', color: '#1e3a8a' }}>
                  <FileText size={14} /> Terms & Private Data Collection Consent
                </div>
                <p style={{ margin: 0, lineHeight: '1.5' }}>
                  By continuing, you authorize Lostify to collect, process, and store your private profile data (including your name, email address, phone number, campus location, and social media handles) in local storage for campus lost and found tracking and peer communication.
                </p>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer', fontWeight: '600', color: '#0f172a', marginTop: '4px' }}>
                  <input 
                    type="checkbox" 
                    required
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    style={{ width: '16px', height: '16px', marginTop: '1px', accentColor: '#2563eb', cursor: 'pointer' }}
                  />
                  <span>I agree to the Terms of Service and consent to the collection and storage of my private profile data. *</span>
                </label>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="secondary-button" 
                  onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setTermsAccepted(false); }}
                >
                  {authMode === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Login'}
                </button>
                <button type="submit" className="primary-button">
                  {authMode === 'login' ? 'Login' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile & Settings Modal */}
      {isProfileModalOpen && currentUser && (
        <div className="modal-backdrop" onClick={() => setIsProfileModalOpen(false)}>
          <div className="modal form-modal profile-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="modal-eyebrow">USER PROFILE & SETTINGS</span>
                <h2>{currentUser.name}'s Account</h2>
                <p>Manage your contact links and profile info for easy peer communication.</p>
              </div>
              <button className="close-button icon-button" onClick={() => setIsProfileModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <label>
                Display Name
                <input 
                  type="text" 
                  value={profileForm.name}
                  onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                />
              </label>

              <div className="form-grid">
                <label>
                  Phone Number
                  <input 
                    type="text" 
                    placeholder="+63 9..."
                    value={profileForm.phone}
                    onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                  />
                </label>
                <label>
                  Campus Address / Dept
                  <input 
                    type="text" 
                    placeholder="e.g. BSIT Dept"
                    value={profileForm.address}
                    onChange={e => setProfileForm({...profileForm, address: e.target.value})}
                  />
                </label>
              </div>

              <label>
                <Facebook size={14} style={{display: 'inline', marginRight: '5px', color: '#1877F2'}} /> Facebook Profile Link
                <input 
                  type="text" 
                  placeholder="facebook.com/username"
                  value={profileForm.facebook}
                  onChange={e => setProfileForm({...profileForm, facebook: e.target.value})}
                />
              </label>

              <label>
                <Instagram size={14} style={{display: 'inline', marginRight: '5px', color: '#E4405F'}} /> Instagram Profile Link
                <input 
                  type="text" 
                  placeholder="instagram.com/username"
                  value={profileForm.instagram}
                  onChange={e => setProfileForm({...profileForm, instagram: e.target.value})}
                />
              </label>

              <div className="modal-actions profile-footer-actions">
                <button type="button" className="secondary-button logout-btn-modal" onClick={handleLogout}>
                  <LogOut size={15} /> Logout Account
                </button>
                <button type="submit" className="primary-button">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Author / Peer Profile Popup Modal */}
      {viewingProfile && (
        <div className="modal-backdrop" onClick={() => setViewingProfile(null)}>
          <div className="modal profile-card-modal animate-pop" onClick={e => e.stopPropagation()}>
            <button className="detail-close icon-button" onClick={() => setViewingProfile(null)}>
              <X size={18} />
            </button>
            <div className="profile-header-card">
              <div className="profile-big-avatar">
                {viewingProfile.name ? viewingProfile.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h2>{viewingProfile.name}</h2>
              <span className="profile-badge-tag">Verified Campus User</span>
            </div>

            <div className="profile-body-card">
              <div className="contact-row">
                <Mail size={16} />
                <div>
                  <small>Email Address</small>
                  <strong>{viewingProfile.email || 'Not shared'}</strong>
                </div>
              </div>
              <div className="contact-row">
                <Phone size={16} />
                <div>
                  <small>Phone Number</small>
                  <strong>{viewingProfile.phone || 'Not provided'}</strong>
                </div>
              </div>
              <div className="contact-row">
                <MapPin size={16} />
                <div>
                  <small>Campus Location / Dept</small>
                  <strong>{viewingProfile.address || 'University of Batangas'}</strong>
                </div>
              </div>

              <div className="social-links-box">
                <p>Social Contact Links:</p>
                <div className="social-btns">
                  <a href={`https://${viewingProfile.facebook}`} target="_blank" rel="noreferrer" className="social-pill fb">
                    <Facebook size={15} /> Facebook <ExternalLink size={12} />
                  </a>
                  <a href={`https://${viewingProfile.instagram}`} target="_blank" rel="noreferrer" className="social-pill ig">
                    <Instagram size={15} /> Instagram <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>

            <button className="primary-button full-button" style={{marginTop: '15px'}} onClick={() => setViewingProfile(null)}>
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* Item Submission Modal */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal form-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-heading">
              <div>
                <span className="modal-eyebrow">NEW LISTING</span>
                <h2>Report an Item</h2>
                <p>
                  Posting as: <strong>{currentUser ? currentUser.name : 'Anonymous User'}</strong>
                </p>
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
                  placeholder="e.g. Blue Water Bottle, Hydro Flask" 
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
                  Date
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
                  placeholder="e.g. Science Building 2nd Floor" 
                  value={formLocation}
                  onChange={e => setFormLocation(e.target.value)}
                />
              </label>

              <label>
                Description & Identifying Marks
                <textarea 
                  placeholder="Include color, stickers, unique features..."
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                />
              </label>

              {/* Two Options for Image: Upload Photo or Image URL */}
              <div style={{ display: 'grid', gap: '8px' }}>
                <label style={{ margin: 0 }}>Item Image (Choose Option)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    className={`secondary-button ${imageInputType === 'url' ? 'primary-button' : ''}`} 
                    style={{ flex: 1, padding: '8px', fontSize: '11px' }}
                    onClick={() => setImageInputType('url')}
                  >
                    <LinkIcon size={13} style={{ display: 'inline', marginRight: '4px' }} /> Image URL
                  </button>
                  <button 
                    type="button" 
                    className={`secondary-button ${imageInputType === 'file' ? 'primary-button' : ''}`} 
                    style={{ flex: 1, padding: '8px', fontSize: '11px' }}
                    onClick={() => setImageInputType('file')}
                  >
                    <Upload size={13} style={{ display: 'inline', marginRight: '4px' }} /> Upload Photo
                  </button>
                </div>

                {imageInputType === 'url' ? (
                  <input 
                    type="url" 
                    placeholder="https://example.com/image.jpg" 
                    value={formImage.startsWith('data:') ? '' : formImage}
                    onChange={e => setFormImage(e.target.value)}
                  />
                ) : (
                  <div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageFileChange}
                      style={{ padding: '8px', background: '#f8fafc', fontSize: '12px' }}
                    />
                    {formImage.startsWith('data:') && (
                      <small style={{ color: '#10b981', fontWeight: '700', marginTop: '4px', display: 'block' }}>
                        ✓ Photo loaded successfully!
                      </small>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="modal-backdrop" onClick={() => setSelectedItem(null)}>
          <div className="modal detail-modal" onClick={e => e.stopPropagation()}>
            <button className="detail-close icon-button" onClick={() => setSelectedItem(null)}>
              <X size={18} />
            </button>
            <div className="detail-image">
              <img src={selectedItem.image} alt={selectedItem.title} />
              <span className={`type-badge ${selectedItem.status === 'returned' ? 'resolved' : selectedItem.type}`}>
                {selectedItem.status === 'returned' ? 'RESOLVED' : selectedItem.type.toUpperCase()}
              </span>
            </div>
            <div className="detail-content">
              <h2>{selectedItem.title}</h2>
              <div className="poster-info-large clickable" onClick={() => { setViewingProfile(selectedItem.authorProfile); setSelectedItem(null); }}>
                <User size={14} /> Posted by: <strong className="author-link">{selectedItem.postedBy} (View Profile)</strong>
              </div>
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
                    <small>Date</small>
                    <strong>{selectedItem.date}</strong>
                  </div>
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '18px' }}>
                {selectedItem.ownerId === activeOwnerId && (
                  <button 
                    className="primary-button full-button" 
                    onClick={() => handleToggleStatus(selectedItem.id, selectedItem.ownerId)}
                  >
                    {selectedItem.status === 'returned' ? 'Reopen Issue' : 'Mark as Resolved / Returned'}
                  </button>
                )}
                {selectedItem.ownerId === activeOwnerId && (
                  <button 
                    className="secondary-button danger-button" 
                    onClick={() => handleDelete(selectedItem.id, selectedItem.ownerId)}
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Banner */}
      {toastMessage && (
        <div className="toast animate-bounce">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}