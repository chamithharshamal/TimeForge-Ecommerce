import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Watch, LogOut, User as UserIcon, ShoppingBag } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-primary)' }}>
        <Watch color="var(--accent-primary)" size={28} />
        <span style={{ fontSize: '1.25rem', fontWeight: '700', letterSpacing: '1px' }}>TimeForge</span>
      </Link>

      <div className="nav-actions">
        {user && user.role === 'user' && (
          <Link to="/cart" style={{ position: 'relative', color: 'var(--text-primary)', display: 'flex', alignItems: 'center' }}>
            <ShoppingBag size={24} />
            {cartCount > 0 && (
              <span style={{ 
                position: 'absolute', 
                top: '-8px', 
                right: '-10px', 
                background: 'var(--accent-primary)', 
                color: '#000', 
                fontSize: '0.7rem', 
                fontWeight: '800', 
                padding: '2px 6px', 
                borderRadius: '10px',
                minWidth: '18px',
                textAlign: 'center',
                boxShadow: '0 2px 8px rgba(212, 175, 55, 0.4)'
              }}>
                {cartCount}
              </span>
            )}
          </Link>
        )}

        {user ? (
          <>
            <Link 
              to="/profile" 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                color: 'var(--text-primary)', 
                textDecoration: 'none',
                padding: '4px 12px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                transition: 'all 0.2s'
              }}
              className="hover-glow"
            >
              <UserIcon size={18} color="var(--accent-primary)" />
              <span className="nav-label" style={{ fontWeight: '600' }}>{user.name}</span>
            </Link>
            <button onClick={handleLogout} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '6px 12px' }}>
              <LogOut size={16} /> <span className="nav-label">Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: '500' }}>Login</Link>
            <Link to="/signup" className="btn-primary" style={{ textDecoration: 'none' }}>
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
