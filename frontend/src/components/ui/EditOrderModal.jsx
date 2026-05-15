import { useState } from 'react';
import { FiX, FiAlertCircle, FiSave } from 'react-icons/fi';
import { orderService } from '../../services/orderService';
import toast from 'react-hot-toast';
import Button from './Button';

export default function EditOrderModal({ order, onClose, onSaved }) {
  const [deliveryAddress, setDeliveryAddress] = useState(order.deliveryAddress || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!deliveryAddress.trim()) {
      toast.error('Delivery address cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await orderService.update(order.id, { deliveryAddress: deliveryAddress.trim() });
      toast.success('Order updated successfully.');
      onSaved?.();
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to update order.';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 'var(--z-modal-overlay, 999)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      padding: 20,
    }}>
      <div style={{
        background: 'var(--surface-primary)',
        width: '100%', maxWidth: 480,
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--surface-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Edit Order #{order.id}</h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text-secondary)', display: 'flex' }}
          >
            <FiX />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {/* Warning Banner */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: 'rgba(var(--warning-rgb, 245,158,11),0.1)',
            border: '1px solid rgba(var(--warning-rgb, 245,158,11),0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            marginBottom: 20,
          }}>
            <FiAlertCircle size={16} style={{ color: 'var(--warning, #f59e0b)', flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Orders can be edited within 24 hours of placement
            </p>
          </div>

          {/* Delivery Address Field */}
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
            Delivery Address
          </label>
          <textarea
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            rows={4}
            placeholder="Enter updated delivery address..."
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--surface-border)',
              background: 'var(--surface-secondary)',
              color: 'var(--text-primary)',
              fontSize: 14,
              resize: 'vertical',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--surface-border)',
          display: 'flex', justifyContent: 'flex-end', gap: 10,
        }}>
          <Button variant="outline" size="sm" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" icon={FiSave} onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
