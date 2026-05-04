import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Package, 
  LogOut, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [user, setUser] = useState(null);
  const { logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchOrders();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user');
      setUser(response.data);
      setFormData({ name: response.data.name, email: response.data.email });
    } catch (err) {
      if (err.response?.status === 401) navigate('/login');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setMessage(null);
    try {
      const response = await api.post('/profile/update', formData);
      setUser(response.data.user);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'order-status-paid';
      case 'pending': return 'order-status-pending';
      case 'cancelled': return 'order-status-cancelled';
      default: return '';
    }
  };

  if (loading && !user) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#D4AF37]"></div>
    </div>
  );

  return (
    <div className="profile-container pt-24 pb-12">
      <header className="profile-header">
        <h1 className="text-4xl font-bold text-white mb-2">My Account</h1>
        <p>Manage your orders and personal information</p>
      </header>

      <div className="profile-grid">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-sidebar-card">
            <div className="profile-avatar-circle">
              {user?.name?.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-white">{user?.name}</h3>
            <p className="text-sm">{user?.email}</p>

            <div className="profile-nav-list">
              <button 
                onClick={() => setActiveTab('orders')}
                className={`profile-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              >
                <Package size={20} />
                <span>My Orders</span>
              </button>
              <button 
                onClick={() => setActiveTab('details')}
                className={`profile-nav-item ${activeTab === 'details' ? 'active' : ''}`}
              >
                <User size={20} />
                <span>Account Details</span>
              </button>
              <button 
                onClick={async () => {
                  await logout();
                  navigate('/login');
                }}
                className="profile-nav-item logout"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <div className="profile-content">
          {activeTab === 'orders' ? (
            <div className="orders-section">
              <h2 className="profile-section-title">
                <Package size={24} color="var(--accent-primary)" />
                Order History
              </h2>
              
              {orders.length === 0 ? (
                <div className="glass-panel" style={{ padding: '60px', textAlign: 'center' }}>
                  <p className="mb-6">You haven't placed any orders yet.</p>
                  <button 
                    onClick={() => navigate('/')}
                    className="btn-primary"
                  >
                    Start Shopping <ChevronRight size={18} />
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order.id} className="order-card">
                      <div className="order-card-header">
                        <div className="order-meta-item">
                          <p>Order ID</p>
                          <p>#{order.id.toString().padStart(6, '0')}</p>
                        </div>
                        <div className="order-meta-item">
                          <p>Date</p>
                          <p>{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="order-meta-item">
                          <p>Total</p>
                          <p style={{ color: 'var(--accent-primary)' }}>${order.total_amount}</p>
                        </div>
                        <div className={`order-status-badge ${getStatusClass(order.status)}`}>
                          <span className="dot"></span>
                          {order.status}
                        </div>
                      </div>

                      <div className="order-items-list">
                        {order.items.map((item) => (
                          <div key={item.id} className="order-item-row">
                            <img 
                              src={item.watch.image_url} 
                              alt={item.watch.name}
                              className="order-item-img"
                            />
                            <div style={{ flex: 1 }}>
                              <h4 className="text-white" style={{ fontSize: '1rem', marginBottom: '4px' }}>{item.watch.name}</h4>
                              {item.color && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                  Color: <span style={{ color: 'var(--text-primary)' }}>{item.color}</span>
                                </p>
                              )}
                              <p className="text-sm">Qty: {item.quantity} × ${item.price}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="details-section" style={{ maxWidth: '600px' }}>
              <h2 className="profile-section-title">
                <User size={24} color="var(--accent-primary)" />
                Account Settings
              </h2>

              <form onSubmit={handleUpdateProfile} className="account-form">
                {message && (
                  <div className={`glass-panel mb-6`} style={{ 
                    padding: '16px', 
                    color: message.type === 'success' ? '#10b981' : '#f43f5e',
                    borderColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <p style={{ fontWeight: 600 }}>{message.text}</p>
                  </div>
                )}

                <div className="form-group">
                  <label className="input-label">Full Name</label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Email Address</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <button 
                  disabled={updating}
                  className="btn-primary"
                  style={{ marginTop: '12px' }}
                >
                  {updating ? 'Saving...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
