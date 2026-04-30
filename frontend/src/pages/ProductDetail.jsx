import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ShieldCheck, Truck, RotateCcw, ArrowLeft, Star, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';

export default function ProductDetail() {

  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  
  const [watch, setWatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);

  // Parse colors if available
  const availableColors = watch?.color ? watch.color.split(',').map(c => c.trim()).filter(c => c) : [];

  useEffect(() => {
    const fetchWatch = async () => {
      try {
        const { data } = await api.get(`/watches/${id}`);
        setWatch(data);
        if (data.color) {
            const colors = data.color.split(',').map(c => c.trim()).filter(c => c);
            if (colors.length > 0) {
                setSelectedColor(colors[0]);
            }
        }
      } catch (err) {
        console.error("Watch not found", err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetchWatch();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
        alert("Please select a color/finish.");
        return;
    }
    setAdding(true);
    const success = await addToCart(watch.id, quantity, selectedColor);
    setAdding(false);
    if (success) {
      alert("Added to your collection!");
    } else {
      alert("Failed to add to cart.");
    }
  };

  if (loading) return <div style={{ height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Refining Details...</div>;
  if (!watch) return null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <SEO 
        title={watch.name}
        description={watch.description || `Buy the ${watch.name} premium watch at TimeForge. Best prices for luxury timepieces.`}
        image={watch.image_url}
        url={window.location.href}
      />
      {/* Back Button */}

      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '24px', padding: '0', transition: '0.3s' }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
      >
        <ArrowLeft size={20} /> Back
      </button>

      {/* Breadcrumbs */}
      <nav style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
        <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Collection</Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-primary)' }}>{watch.name}</span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'clamp(20px, 5vw, 60px)', alignItems: 'start' }}>
        
        {/* Visual Gallery */}
        <div className="product-gallery">
          <div className="glass-panel" style={{ borderRadius: '24px', overflow: 'hidden', background: '#000', aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
            <img 
              src={watch.image_url} 
              alt={watch.name} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '16px' }}>
             {[1,2,3,4].map(i => (
                <div key={i} className="glass-panel" style={{ aspectRatio: '1', borderRadius: '12px', opacity: i === 1 ? 1 : 0.3, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    <img src={watch.image_url} style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                </div>
             ))}
          </div>
        </div>

        {/* Narrative & Acquisition */}
        <div>
          <div style={{ marginBottom: '24px' }}>
            {watch.badge && (
                <span style={{ display: 'inline-block', padding: '4px 12px', background: 'var(--accent-primary)', color: '#000', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '16px' }}>
                    {watch.badge}
                </span>
            )}
            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '16px' }}>{watch.name}</h1>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <div style={{ display: 'flex', color: 'var(--accent-primary)' }}>
                    {[1,2,3,4,5].map(i => <Star key={i} size={16} fill="currentColor" />)}
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>4.9/5 (128 Reviews)</span>
            </div>

            <div style={{ fontSize: '2rem', fontWeight: '300', color: 'var(--accent-primary)', marginBottom: '32px' }}>
              ${Number(watch.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: '1.7', marginBottom: '24px' }}>
              {watch.description || "A masterpiece of horological engineering. This precision instrument combines traditional craftsmanship with contemporary luxury aesthetics, designed for those who value time as their most precious asset."}
            </p>

            {availableColors.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Choose Color / Finish
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: '600' }}>
                        {selectedColor}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {availableColors.map((colorName, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setSelectedColor(colorName)}
                            style={{
                                padding: '10px 16px',
                                background: selectedColor === colorName ? 'rgba(212, 175, 55, 0.15)' : 'var(--bg-glass)',
                                border: `1px solid ${selectedColor === colorName ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                borderRadius: '8px',
                                color: selectedColor === colorName ? 'var(--accent-primary)' : 'var(--text-primary)',
                                fontWeight: '500',
                                cursor: 'pointer',
                                transition: 'var(--transition-smooth)'
                            }}
                        >
                            {colorName}
                        </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Configuration */}
          <div style={{ marginBottom: '40px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-glass)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '4px' }}>
                    <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer' }}>-</button>
                    <span style={{ width: '40px', textAlign: 'center', fontWeight: '600' }}>{quantity}</span>
                    <button onClick={() => setQuantity(q => q + 1)} style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer' }}>+</button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  disabled={adding || watch.stock === 0}
                  className="btn-primary" 
                  style={{ flex: 1, height: '50px', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                >
                   {watch.stock === 0 ? "Sold Out" : (
                       <>
                        <ShoppingCart size={20} />
                        {adding ? "Adding..." : "Accquire Now"}
                       </>
                   )}
                </button>
             </div>
             {watch.stock < 5 && watch.stock > 0 && (
                 <p style={{ color: 'var(--error)', fontSize: '0.875rem', marginTop: '12px', fontWeight: '500' }}>
                    Only {watch.stock} units remaining in collection.
                 </p>
             )}
          </div>

          {/* Trust Value Propositions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(212, 175, 55, 0.1)', color: 'var(--accent-primary)' }}>
                    <ShieldCheck size={20} />
                </div>
                <div>
                   <h4 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>2-Year Warranty</h4>
                   <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Full protection for your timepiece.</p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                    <Truck size={20} />
                </div>
                <div>
                   <h4 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>Complimentary Shipping</h4>
                   <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Secure insured express delivery.</p>
                </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'start' }}>
                <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>
                    <RotateCcw size={20} />
                </div>
                <div>
                   <h4 style={{ fontSize: '0.9rem', marginBottom: '4px' }}>30-Day Returns</h4>
                   <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Satisfaction guaranteed.</p>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
