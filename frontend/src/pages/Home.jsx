import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import { ShoppingCart, ShieldCheck, Truck, RotateCcw, Star, Clock, ArrowRight, Eye } from 'lucide-react';
import SEO from '../components/SEO';

export default function Home() {

  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [watches, setWatches] = useState([]);
  const [loadingWatches, setLoadingWatches] = useState(true);

  // Fake Flash Sale Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 23, seconds: 59 });

  useEffect(() => {
    const fetchWatches = async () => {
      try {
        const response = await api.get('/watches');
        setWatches(response.data);
      } catch (err) {
        console.error("Failed to load watches", err);
      } finally {
        setLoadingWatches(false);
      }
    };
    fetchWatches();
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else {
          seconds = 59;
          if (minutes > 0) minutes--;
          else { minutes = 59; hours--; }
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddToCart = async (watch) => {
    if (watch.stock === 0) return;
    if (!user) {
      navigate('/login', { state: { message: "Please log in to claim your exclusive timepiece." } });
      return;
    }
    const success = await addToCart(watch.id);
    if (success) {
      alert(`The ${watch.name} has been added to your collection.`);
    } else {
      alert("Encountered an issue securing this piece.");
    }
  };

  return (
    <div style={{ background: 'var(--bg-color)' }}>
      <SEO 
        title="Forge Your Destiny" 
        description="TimeForge - Exclusive, limited-edition automated timepieces engineered for the relentless. Shop the collection."
      />

      {/* Promo Banner / Trust Signals */}
      <div style={{ background: 'var(--accent-primary)', color: '#000', padding: '10px', textAlign: 'center', fontSize: '0.875rem', fontWeight: '600', letterSpacing: '0.5px' }}>
        FREE EXPEDITED SHIPPING ON ORDERS OVER $500 • 30-DAY SECURE RETURNS
      </div>

      {/* Hero Section */}
      <section style={{ 
        position: 'relative', 
        height: '85vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Cinematic Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?q=80&w=2000&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.4,
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, var(--bg-color) 0%, transparent 100%)',
          zIndex: 1
        }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', padding: '0 20px', maxWidth: '800px' }}>
          <span style={{ color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '4px', fontSize: '0.875rem', fontWeight: '600', marginBottom: '16px', display: 'block' }}>
            The TimeForge Legacy
          </span>
          <h1 style={{ fontSize: 'clamp(3rem, 6vw, 5rem)', fontWeight: '700', lineHeight: 1.1, marginBottom: '24px', textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}>
            Forge Your Destiny. <br />Master Your Time.
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
            Exclusive, limited-edition automated timepieces engineered for the relentless. 
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem', flex: '1 1 200px', maxWidth: '300px' }}>
              Shop Limited Edition
            </button>
            <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', padding: '16px 32px', fontSize: '1.1rem', flex: '1 1 200px', maxWidth: '300px' }}>
              View Lookbook
            </button>
          </div>
        </div>
      </section>

      {/* Trust Signals Strip */}
      <section style={{ borderBottom: '1px solid var(--border-color)', padding: '40px 20px' }}>
        <div className="trust-signals-grid" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { icon: ShieldCheck, title: "Secure Checkout", desc: "256-bit encryption" },
            { icon: Truck, title: "Insured Delivery", desc: "Signature required" },
            { icon: RotateCcw, title: "30-Day Returns", desc: "No questions asked" },
            { icon: Star, title: "Swiss Quality", desc: "Lifetime warranty" }
          ].map((signal, idx) => (
            <div key={idx} className="trust-signal-item" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                <signal.icon size={24} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600' }}>{signal.title}</h4>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{signal.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Urgency / Flash Sale */}
      <section style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ flex: '1 1 300px' }}>
            <h2 style={{ fontSize: 'clamp(2rem, 5vw, 2.5rem)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              Vault Drops <span style={{ color: 'var(--error)' }}>⚡</span>
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>Extremely limited quantities. Once they're gone, they're gone.</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--bg-surface)', padding: '12px 24px', borderRadius: '8px', border: '1px solid var(--border-color)', width: 'fit-content' }}>
            <Clock size={20} color="var(--error)" />
            <div style={{ display: 'flex', gap: '8px', fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: '700' }}>
              <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
              <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
              <span style={{ color: 'var(--error)' }}>{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {loadingWatches ? (
            <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1/-1', color: 'var(--text-secondary)' }}>Loading Vault Drops...</div>
          ) : watches.map((watch) => (
            <div key={watch.id} className="product-card" style={{ position: 'relative', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', transition: 'var(--transition-smooth)' }}>
              
              {/* Badges */}
              <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {watch.badge && (
                  <span style={{ background: watch.badge === 'Sold Out' ? 'var(--bg-glass)' : 'var(--accent-primary)', color: watch.badge === 'Sold Out' ? '#fff' : '#000', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', backdropFilter: 'blur(8px)' }}>
                    {watch.badge}
                  </span>
                )}
                {watch.stock > 0 && watch.stock < 10 && (
                  <span style={{ background: 'var(--error)', color: '#fff', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase', animation: 'pulse 2s infinite' }}>
                    Only {watch.stock} Left!
                  </span>
                )}
              </div>

              {/* Image */}
              <div style={{ position: 'relative', height: '320px', overflow: 'hidden', background: '#000' }}>
                <img src={watch.image_url} alt={watch.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease', opacity: watch.stock === 0 ? 0.5 : 1 }} className="watch-img" />
                
                {/* Frictionless Quick Actions on Hover */}
                <div className="quick-actions" style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', display: 'flex', gap: '8px', opacity: 0, transform: 'translateY(20px)', transition: 'all 0.3s ease' }}>
                  <button 
                    onClick={() => navigate(`/product/${watch.id}`)}
                    style={{ flex: 1, padding: '12px', background: 'var(--bg-glass)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(12px)', cursor: 'pointer' }}
                  >
                    <Eye size={18} />
                  </button>
                  <button 
                    onClick={() => handleAddToCart(watch)} 
                    disabled={watch.stock === 0}
                    style={{ flex: 3, padding: '12px', background: 'var(--accent-primary)', border: 'none', color: '#000', borderRadius: '8px', fontWeight: '600', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: watch.stock === 0 ? 'not-allowed' : 'pointer' }}
                  >
                    <ShoppingCart size={18} /> {watch.stock === 0 ? 'Out of Stock' : 'Quick Add'}
                  </button>
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '500' }}>{watch.name}</h3>
                </div>
                {/* Format Price */}
                <p style={{ fontSize: '1.25rem', color: 'var(--accent-primary)', fontWeight: '700' }}>
                  ${Number(watch.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Proof Mini */}
      <section style={{ background: 'var(--bg-surface)', padding: '80px 20px', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', color: 'var(--accent-primary)', marginBottom: '24px' }}>
            <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" /> <Star fill="currentColor" />
          </div>
          <h3 style={{ fontSize: '2rem', fontStyle: 'italic', marginBottom: '24px', fontWeight: '300' }}>
            "The Chronos Elite didn't just meet my expectations, it completely shattered them. A masterpiece of horology that turns heads in every boardroom."
          </h3>
          <p style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.875rem' }}>— Marcus V., Verified Buyer</p>
        </div>
      </section>
      
      {/* Footer minimal */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>&copy; 2026 TimeForge. Master Your Time.</p>
      </footer>

    </div>
  );
}
