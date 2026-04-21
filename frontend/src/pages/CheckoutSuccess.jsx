import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Calendar } from 'lucide-react';

export default function CheckoutSuccess() {
  const location = useLocation();
  const order = location.state?.order;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
      <div style={{ 
        width: '100px', 
        height: '100px', 
        borderRadius: '50%', 
        background: 'rgba(34, 197, 94, 0.1)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        margin: '0 auto 32px',
        color: '#22c55e'
      }}>
        <CheckCircle size={56} />
      </div>

      <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '16px' }}>Order Confirmed</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '48px', maxWidth: '500px', margin: '0 auto 48px' }}>
        Thank you for choosing TimeForge. Your request for excellence has been received and is being processed by our master horologists.
      </p>

      <div className="glass-panel" style={{ padding: '40px', textAlign: 'left', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>Order Details</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={16} /> Order Number
            </div>
            <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>#TF-{order.id.toString().padStart(6, '0')}</div>
          </div>
          
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={16} /> Date
            </div>
            <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}</div>
          </div>

          <div>
             <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '8px' }}>Amount Paid</div>
             <div style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--accent-primary)' }}>${Number(order.total_amount).toLocaleString()}</div>
          </div>
        </div>

        <div style={{ marginTop: '32px', padding: '24px', background: 'rgba(212, 175, 55, 0.05)', borderRadius: '12px', border: '1px solid rgba(212, 175, 55, 0.1)' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: 0 }}>
            <strong>Next Step:</strong> You will receive a confirmation email shortly. Our white-glove delivery team will contact you once your timepiece has cleared final inspection.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <Link to="/" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 32px' }}>
          Back to Collection <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
