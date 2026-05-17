import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { apiClient } from '../../api/client';

interface EquipmentFormProps {
  equipment?: any;
  categories: any[];
  onClose: () => void;
  onSave: () => void;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ equipment, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    id: equipment?.id || '',
    category_id: equipment?.category_id || '',
    type: equipment?.type || '',
    model: equipment?.model || '',
    name: equipment?.name || '',
    value: equipment?.value || 0,
    description: equipment?.description || '',
    is_active: equipment !== undefined ? equipment.is_active : 1,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill name if model or type changes
  useEffect(() => {
    if (!equipment) {
      setFormData(prev => ({
        ...prev,
        name: `${prev.type} ${prev.model}`.trim()
      }));
    }
  }, [formData.type, formData.model, equipment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (equipment) {
        await apiClient.updateEquipment(formData);
      } else {
        await apiClient.createEquipment(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving equipment:', error);
      alert('Failed to save equipment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div className="glass shadow-elegant" style={{
        width: '100%', maxWidth: '600px', padding: '32px', borderRadius: '24px',
        maxHeight: '90vh', overflowY: 'auto', position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '24px', right: '24px',
          background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
          width: '36px', height: '36px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'white', cursor: 'pointer', transition: '0.2s'
        }} className="hover-bg-white-20">
          <X size={20} />
        </button>

        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '24px' }}>
          {equipment ? 'Edit Equipment' : 'Add New Equipment'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>Category</label>
              <select 
                required
                value={formData.category_id}
                onChange={e => setFormData({...formData, category_id: e.target.value})}
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px',
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)',
                  color: 'white', outline: 'none'
                }}
              >
                <option value="" disabled>Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>Status</label>
              <select 
                value={formData.is_active}
                onChange={e => setFormData({...formData, is_active: parseInt(e.target.value)})}
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px',
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)',
                  color: 'white', outline: 'none'
                }}
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>Brand / Type</label>
              <input 
                type="text" 
                required
                value={formData.type}
                onChange={e => setFormData({...formData, type: e.target.value})}
                placeholder="e.g. Sony, Canon"
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px',
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)',
                  color: 'white', outline: 'none'
                }}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>Model</label>
              <input 
                type="text" 
                required
                value={formData.model}
                onChange={e => setFormData({...formData, model: e.target.value})}
                placeholder="e.g. A7 III, 24-70mm"
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px',
                  background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)',
                  color: 'white', outline: 'none'
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>Full Name (Auto-generated)</label>
            <input 
              type="text" 
              required
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)',
                color: 'white', outline: 'none'
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>Value ($)</label>
            <input 
              type="number" 
              step="0.01"
              value={formData.value}
              onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)',
                color: 'white', outline: 'none'
              }}
            />
          </div>

          <div className="form-group">
            <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '600' }}>Description (Optional)</label>
            <textarea 
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                background: 'rgba(0,0,0,0.2)', border: '1px solid var(--card-border)',
                color: 'white', outline: 'none', resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
            <button type="button" onClick={onClose} style={{
              padding: '12px 24px', borderRadius: '12px', background: 'transparent',
              color: 'white', border: '1px solid var(--card-border)', fontWeight: '600', cursor: 'pointer'
            }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} style={{
              padding: '12px 24px', borderRadius: '12px', background: 'var(--primary)',
              color: 'white', border: 'none', fontWeight: '600', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', opacity: isSubmitting ? 0.7 : 1
            }}>
              {isSubmitting ? 'Saving...' : (
                <>
                  <Check size={18} />
                  Save Equipment
                </>
              )}
            </button>
          </div>
        </form>

        <style>{`
          .hover-bg-white-20:hover { background: rgba(255,255,255,0.2) !important; }
        `}</style>
      </div>
    </div>
  );
};

export default EquipmentForm;
