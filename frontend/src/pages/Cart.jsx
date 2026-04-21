import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import api from '../api/axios';

export default function Cart() {
  const { cartItems, loading, updateQuantity, removeFromCart, cartTotal, refreshCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const response = await api.post('/orders/place');
      
      if (response.data.order) {
        // Clear local state/refresh cart
        refreshCart?.();
        // Redirect to success
        navigate('/checkout-success', { state: { order: response.data.order } });
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/login', { state: { from: '/cart' } });
        return;
      }
      const message = error.response?.data?.message || 'Failed to place order. Please try again.';
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Syncing Collection...</div>;

  if (cartItems.length === 0) {
    return (
      <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--bg-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
          <ShoppingBag size={32} color="var(--text-secondary)" />
        </div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Your Collection is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '300px', marginBottom: '32px' }}>
          Discover excellence in our curated selection of luxury timepieces.
        </p>
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
          Explore Timepieces <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <button 
        onClick={() => navigate('/')} 
        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px', padding: '0' }}
      >
        <ArrowLeft size={20} /> Back to Store
      </button>
      <h1 style={{ fontSize: '2rem', marginBottom: '40px' }}>Your Selection</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', alignItems: 'start' }}>
        
        {/* Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cartItems.map((item) => (
            <div key={item.id} className="glass-panel cart-item">
              <div className="cart-item-image" style={{ width: '100px', height: '100px', borderRadius: '12px', background: '#000', overflow: 'hidden', flexShrink: 0 }}>
                <img src={item.watch.image_url} alt={item.watch.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              
              <div style={{ flex: 1, width: '100%' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>{item.watch.name}</h3>
                <p style={{ color: 'var(--accent-primary)', fontWeight: '500', marginBottom: '12px' }}>
                  ${Number(item.watch.price).toLocaleString()}
                </p>
                
                <div className="cart-item-controls" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <button 
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      style={{ padding: '4px 10px', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer' }}
                    >
                      <Minus size={14} />
                    </button>
                    <span style={{ minWidth: '30px', textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{ padding: '4px 10px', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer' }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="cart-item-total" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>
                  ${(item.watch.price * item.quantity).toLocaleString()}
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem', padding: '0' }}
                >
                  <Trash2 size={16} /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Side */}
        <div className="glass-panel" style={{ padding: '32px', position: 'sticky', top: '100px' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '24px' }}>Order Summary</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span>${cartTotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
              <span>Shipping</span>
              <span style={{ color: '#22c55e' }}>Complimentary</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                <span>Insurance</span>
                <span style={{ color: '#22c55e' }}>Included</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: '700', marginBottom: '32px' }}>
            <span>Total</span>
            <span style={{ color: 'var(--accent-primary)' }}>${cartTotal.toLocaleString()}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              className="btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
            >
              {isProcessing ? 'Processing...' : (
                <>
                  Complete Purchase <ArrowRight size={18} />
                </>
              )}
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
              <ShieldCheck size={16} color="#22c55e" />
              <span>Manual/Reserve Payment Enabled</span>
            </div>
          </div>
          
          <div style={{ marginTop: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Secure Encrypted Transaction. <br /> New payment methods integrating soon.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
