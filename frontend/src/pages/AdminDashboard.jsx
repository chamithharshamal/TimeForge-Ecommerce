import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../api/axios';
import { LayoutDashboard, Users, Watch, Settings, Plus, Edit2, Trash2, X, Image as ImageIcon, Upload, Menu, DollarSign } from 'lucide-react';

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'products', 'users'
  const [watches, setWatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null means adding new
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    badge: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch watches on load
  const loadWatches = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/watches');
      setWatches(data);
    } catch (err) {
      console.error("Failed to load watches", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stats (Admin Only)
  const loadStats = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/admin/stats');
      setStats(data);
    } catch (err) {
      console.error("Failed to load stats", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch users (Admin Only)
  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get('/admin/users');
      setUsersList(data);
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      if (activeTab === 'products') loadWatches();
      if (activeTab === 'dashboard') loadStats();
      if (activeTab === 'users') loadUsers();
    }
  }, [user, activeTab]);

  const handleDeleteUser = async (id, name) => {
    if (id === user.id) return alert("You cannot delete yourself.");
    if (!window.confirm(`Permanently remove user: ${name}?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsersList(usersList.filter(u => u.id !== id));
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  if (authLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />;

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', stock: '', badge: '' });
    setImageFile(null);
    setPreviewSrc(null);
    setIsModalOpen(true);
  };

  const openEditModal = (watch) => {
    setEditingId(watch.id);
    setFormData({
      name: watch.name,
      description: watch.description || '',
      price: watch.price,
      stock: watch.stock,
      badge: watch.badge || ''
    });
    setImageFile(null);
    setPreviewSrc(watch.image_url);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  // Image Upload Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewSrc(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Setup FormData for multipart/form-data upload
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('description', formData.description);
    payload.append('price', formData.price);
    payload.append('stock', formData.stock);
    if(formData.badge) payload.append('badge', formData.badge);
    
    // When updating, we might not send a new file
    if (imageFile) {
      payload.append('image', imageFile);
    }

    // In Laravel, PUT requests via FormData can be tricky. We use POST and append _method='PUT'
    try {
      if (editingId) {
        payload.append('_method', 'PUT');
        await api.post(`/watches/${editingId}`, payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/watches', payload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      await loadWatches();
      closeModal();
    } catch (err) {
      console.error("Submission failed", err);
      alert(err.response?.data?.message || "Failed to save watch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to completely delete ${name}?`)) return;
    try {
      await api.delete(`/watches/${id}`);
      setWatches(watches.filter(w => w.id !== id));
    } catch (err) {
      console.error("Deletion failed", err);
      alert("Failed to delete the watch.");
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', position: 'relative' }}>
      
      {/* Mobile Header Bar (Only visible on small screens) */}
      <div style={{ 
        display: 'none', 
        '@media (max-width: 768px)': { display: 'flex' } 
      }} className="mobile-admin-header">
        <button 
          onClick={() => setIsSidebarOpen(true)}
          style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}
        >
          <Menu size={24} />
        </button>
        <span style={{ fontSize: '1rem', fontWeight: '600' }}>Admin Panel</span>
      </div>

      {/* Sidebar Overlay (Mobile Only) */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998, backdropFilter: 'blur(2px)' }}
        />
      )}

      {/* Sidebar */}
      <aside style={{ 
        width: '250px', 
        background: 'var(--bg-surface)', 
        borderRight: '1px solid var(--border-color)', 
        padding: '24px 16px',
        transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: 999,
      }} className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        
        {/* Mobile Close Button */}
        <div style={{ display: 'none', justifyContent: 'flex-end', marginBottom: '16px' }} className="mobile-only">
          <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)' }}>
            <X size={24} />
          </button>
        </div>

        <h3 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px', paddingLeft: '12px' }}>
          Management
        </h3>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => { setActiveTab('dashboard'); setIsSidebarOpen(false); }} 
            style={{ width: '100%', textAlign: 'left', border: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', color: activeTab === 'dashboard' ? 'var(--accent-primary)' : 'var(--text-primary)', background: activeTab === 'dashboard' ? 'var(--bg-glass)' : 'transparent', cursor: 'pointer', transition: '0.3s' }}
          >
            <LayoutDashboard size={18} /> Overview
          </button>
          <button 
            onClick={() => { setActiveTab('products'); setIsSidebarOpen(false); }} 
            style={{ width: '100%', textAlign: 'left', border: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', color: activeTab === 'products' ? 'var(--accent-primary)' : 'var(--text-primary)', background: activeTab === 'products' ? 'var(--bg-glass)' : 'transparent', cursor: 'pointer', transition: '0.3s' }}
          >
            <Watch size={18} /> Inventory
          </button>
          <button 
            onClick={() => { setActiveTab('users'); setIsSidebarOpen(false); }} 
            style={{ width: '100%', textAlign: 'left', border: 'none', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', color: activeTab === 'users' ? 'var(--accent-primary)' : 'var(--text-primary)', background: activeTab === 'users' ? 'var(--bg-glass)' : 'transparent', cursor: 'pointer', transition: '0.3s' }}
          >
            <Users size={18} /> Customers
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px' }}>
        {activeTab === 'dashboard' && (
          <>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Business Intelligence</h1>
              <p>Key performance indicators and platform overview.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px' }}>Active Inventory</p>
                <h2 style={{ fontSize: '2rem', color: 'var(--accent-primary)' }}>{stats?.total_watches || 0}</h2>
                <p style={{ fontSize: '0.75rem', marginTop: '12px', color: 'var(--text-secondary)' }}>Luxury Timepieces</p>
              </div>
              <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px' }}>Total Customers</p>
                <h2 style={{ fontSize: '2rem' }}>{stats?.total_users || 0}</h2>
                <p style={{ fontSize: '0.75rem', marginTop: '12px', color: 'var(--text-secondary)' }}>Registered Accounts</p>
              </div>
              <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px' }}>Inventory Value</p>
                <h2 style={{ fontSize: '2rem' }}>${Number(stats?.total_stock_value || 0).toLocaleString()}</h2>
                <p style={{ fontSize: '0.75rem', marginTop: '12px', color: 'rgba(34, 197, 94, 0.8)' }}>Active Asset Worth</p>
              </div>
              <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color)', background: 'rgba(212, 175, 55, 0.05)' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px' }}>Total Revenue</p>
                <h2 style={{ fontSize: '2rem', color: 'var(--accent-primary)' }}>${Number(stats?.total_revenue || 0).toLocaleString()}</h2>
                <p style={{ fontSize: '0.75rem', marginTop: '12px', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <DollarSign size={12} /> Cash Inflow
                </p>
              </div>
              <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color)', background: stats?.out_of_stock > 0 ? 'rgba(239, 68, 68, 0.05)' : 'transparent' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px' }}>Stock Alerts</p>
                <h2 style={{ fontSize: '2rem', color: stats?.out_of_stock > 0 ? 'var(--error)' : 'inherit' }}>{stats?.out_of_stock || 0}</h2>
                <p style={{ fontSize: '0.75rem', marginTop: '12px', color: 'var(--text-secondary)' }}>Out of Stock Items</p>
              </div>
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Inventory Management</h1>
                <p>Manage your luxury timepieces, stock levels, and product identities.</p>
              </div>
              <button onClick={openAddModal} className="btn-primary">
                <Plus size={18} /> Add New Watch
              </button>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              {isLoading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>Loading Database...</div>
              ) : watches.length === 0 ? (
                <div style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No watches in inventory. Click "Add New Watch" to begin.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                    <tr>
                      <th style={{ padding: '16px 20px', fontWeight: '500', color: 'var(--text-secondary)' }}>Product</th>
                      <th style={{ padding: '16px 20px', fontWeight: '500', color: 'var(--text-secondary)' }}>Price</th>
                      <th style={{ padding: '16px 20px', fontWeight: '500', color: 'var(--text-secondary)' }}>Stock</th>
                      <th style={{ padding: '16px 20px', fontWeight: '500', color: 'var(--text-secondary)' }}>Badge</th>
                      <th style={{ padding: '16px 20px', fontWeight: '500', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {watches.map(watch => (
                      <tr key={watch.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ width: '48px', height: '48px', borderRadius: '8px', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                            <img src={watch.image_url} alt={watch.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ fontWeight: '500' }}>{watch.name}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>${Number(watch.price).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ color: watch.stock === 0 ? 'var(--error)' : 'inherit', fontWeight: watch.stock === 0 ? '600' : 'normal' }}>
                            {watch.stock} Units
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          {watch.badge ? <span style={{ padding: '4px 8px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', textTransform: 'uppercase' }}>{watch.badge}</span> : '-'}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <button onClick={() => openEditModal(watch)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '8px', marginRight: '8px' }} title="Edit">
                            <Edit2 size={18} />
                          </button>
                          <button onClick={() => handleDelete(watch.id, watch.name)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', padding: '8px' }} title="Delete">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ fontSize: '2rem', marginBottom: '8px' }}>Customer Directory</h1>
              <p>Manage registered accounts and verify authorization levels.</p>
            </div>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
              {isLoading ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>Synchronizing Users...</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                    <tr>
                      <th style={{ padding: '16px 20px', fontWeight: '500', color: 'var(--text-secondary)' }}>User</th>
                      <th style={{ padding: '16px 20px', fontWeight: '500', color: 'var(--text-secondary)' }}>Email</th>
                      <th style={{ padding: '16px 20px', fontWeight: '500', color: 'var(--text-secondary)' }}>Role</th>
                      <th style={{ padding: '16px 20px', fontWeight: '500', color: 'var(--text-secondary)' }}>Joined</th>
                      <th style={{ padding: '16px 20px', fontWeight: '500', color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersList.map(u => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '16px 20px', fontWeight: '500' }}>{u.name}</td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ padding: '4px 8px', background: u.role === 'admin' ? 'rgba(212, 175, 55, 0.1)' : 'rgba(255,255,255,0.05)', color: u.role === 'admin' ? 'var(--accent-primary)' : 'inherit', border: '1px solid var(--border-color)', borderRadius: '4px', fontSize: '0.75rem', fontWeight: u.role === 'admin' ? '600' : '400' }}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                          <button 
                            disabled={u.id === user.id}
                            onClick={() => handleDeleteUser(u.id, u.name)} 
                            style={{ background: 'transparent', border: 'none', color: u.id === user.id ? '#333' : 'var(--error)', cursor: u.id === user.id ? 'not-allowed' : 'pointer', padding: '8px' }}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </main>

      {/* CRUD Modal Overlay */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--bg-surface)' }}>
            
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-surface)', zIndex: 10 }}>
              <h2 style={{ fontSize: '1.25rem' }}>{editingId ? 'Edit Timepiece' : 'Add New Timepiece'}</h2>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
              
              {/* Image Uploader */}
              <div style={{ marginBottom: '24px' }}>
                <label className="input-label">Product Image (Drop or Browse)</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: '100%', height: '200px', border: '2px dashed var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', background: previewSrc ? '#000' : 'rgba(255,255,255,0.02)', overflow: 'hidden', position: 'relative' }}
                >
                  {previewSrc ? (
                    <>
                      <img src={previewSrc} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', ':hover': { opacity: 1 } }} onMouseEnter={(e) => e.currentTarget.style.opacity = 1} onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
                        <div style={{ background: 'var(--bg-glass)', padding: '8px 16px', borderRadius: '20px', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Upload size={16} /> Replace Image
                        </div>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                      <ImageIcon size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                      <p>Click to browse files or drag and drop</p>
                      <p style={{ fontSize: '0.75rem', marginTop: '8px', opacity: 0.7 }}>High-Quality PNG/JPG up to 4MB</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Watch Name</label>
                  <input type="text" className="input-field" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Chronos Masterpiece" />
                </div>
                
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Description (Optional)</label>
                  <textarea className="input-field" rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Detailed luxurious narrative..." />
                </div>

                <div className="form-group">
                  <label className="input-label">Price (USD)</label>
                  <input type="number" step="0.01" min="0" className="input-field" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="1500.00" />
                </div>

                <div className="form-group">
                  <label className="input-label">Stock Quantity</label>
                  <input type="number" min="0" className="input-field" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} placeholder="10" />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="input-label">Badge Overlay (Optional)</label>
                  <div style={{ position: 'relative' }}>
                    <select 
                      className="input-field" 
                      value={formData.badge} 
                      onChange={e => setFormData({...formData, badge: e.target.value})} 
                      style={{ 
                        appearance: 'none', 
                        cursor: 'pointer', 
                        background: 'var(--bg-surface)', 
                        color: 'var(--text-primary)' 
                      }}
                    >
                      <option value="" style={{ background: '#111', color: '#fff' }}>None</option>
                      <option value="New Arrival" style={{ background: '#111', color: '#fff' }}>New Arrival</option>
                      <option value="Best Seller" style={{ background: '#111', color: '#fff' }}>Best Seller</option>
                      <option value="Low Stock" style={{ background: '#111', color: '#fff' }}>Low Stock</option>
                      <option value="Sold Out" style={{ background: '#111', color: '#fff' }}>Sold Out</option>
                      <option value="Limited Edition" style={{ background: '#111', color: '#fff' }}>Limited Edition</option>
                    </select>
                    <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-secondary)' }}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '20px' }}>
                <button type="button" onClick={closeModal} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingId ? 'Save Changes' : 'Create Watch')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
