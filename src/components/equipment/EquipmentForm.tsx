import React, { useState, useEffect } from 'react';
import { X, Check, Star } from 'lucide-react';
import { apiClient } from '../../api/client';

interface EquipmentFormProps {
  equipment?: any;
  categories: any[];
  onClose: () => void;
  onSave: () => void;
  onError: (msg: string) => void;
}

const TYPES = [
  "Battery", "Continuous Light", "DSLR", "Flashs", "Gimbal", 
  "Light Modifier", "Mics", "Mirrorless", "Monopod", "Other", 
  "Prime Lens", "Remote/Trigger", "Slider", "Storage", "Strobe", 
  "Telephoto Lens", "Tripod", "Video Camera"
];

const EquipmentForm: React.FC<EquipmentFormProps> = ({ equipment, categories, onClose, onSave, onError }) => {
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Simple validation
    if (!formData.category_id || !formData.type || !formData.name || !formData.model) {
      onError('Please fill in all required fields marked with *');
      return;
    }

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
      onError('Failed to save equipment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', zIndex: 1000,
      paddingTop: '3vh', paddingBottom: '3vh', overflowY: 'auto'
    }}>
      <div className="glass shadow-elegant" style={{
        width: '100%', maxWidth: '1100px', borderRadius: '24px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        position: 'relative', overflow: 'hidden', margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Star size={16} />
            </div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', margin: 0 }}>
              {equipment ? 'Edit Gear' : 'Add New Gear'}
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '50%',
            width: '36px', height: '36px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer', transition: '0.2s'
          }} className="hover-bg-white-20">
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '20px 24px 32px 24px', flex: 1, minHeight: 0 }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '24px', height: '100%' }}>
            
            {/* Column 1: Categories */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>1</div>
                <h3 style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '1px', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Category <span style={{ color: '#ef4444' }}>*</span></h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '55vh', paddingRight: '8px' }} className="custom-scrollbar">
                {categories.map(c => (
                  <button type="button" key={c.id} onClick={() => setFormData({...formData, category_id: c.id})}
                    style={{
                      padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'left',
                      border: formData.category_id == c.id ? '1px solid var(--primary)' : '1px solid var(--card-border)',
                      background: formData.category_id == c.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                      color: formData.category_id == c.id ? 'white' : 'var(--text-muted)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Column 2: Types */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>2</div>
                <h3 style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '1px', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Type <span style={{ color: '#ef4444' }}>*</span></h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '55vh', paddingRight: '8px' }} className="custom-scrollbar">
                {TYPES.map(t => (
                  <button type="button" key={t} onClick={() => setFormData({...formData, type: t})}
                    style={{
                      padding: '12px 16px', borderRadius: '12px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', textAlign: 'left',
                      border: formData.type === t ? '1px solid var(--primary)' : '1px solid var(--card-border)',
                      background: formData.type === t ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
                      color: formData.type === t ? 'white' : 'var(--text-muted)',
                      transition: 'all 0.2s'
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Column 3: Fields */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>3</div>
                <h3 style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '1px', color: 'var(--text-muted)', textTransform: 'uppercase', margin: 0 }}>Gear Details</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', maxHeight: '55vh', paddingRight: '8px' }} className="custom-scrollbar">
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>Name <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    type="text" required value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Canon EF 50mm"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)',
                      color: 'white', outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>Model / Brand <span style={{ color: '#ef4444' }}>*</span></label>
                  <input 
                    type="text" required value={formData.model}
                    onChange={e => setFormData({...formData, model: e.target.value})}
                    placeholder="e.g. Sony / Canon / Nikon"
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)',
                      color: 'white', outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>Rental Price (LKR) <span style={{ color: '#ef4444' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '700' }}>LKR</span>
                    <input 
                      type="number" required value={formData.value || ''}
                      onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})}
                      style={{
                        width: '100%', padding: '12px 16px 12px 56px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.02)', border: '1px solid var(--card-border)',
                        color: 'white', outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '600' }}>Status</label>
                  <select 
                      value={formData.is_active}
                      onChange={e => setFormData({...formData, is_active: parseInt(e.target.value)})}
                      style={{
                        width: '100%', padding: '12px 16px', borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)',
                        color: 'white', outline: 'none'
                      }}
                    >
                      <option value={1} style={{ background: '#0f172a' }}>Active</option>
                      <option value={0} style={{ background: '#0f172a' }}>Inactive</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" onClick={() => handleSubmit()} disabled={isSubmitting} style={{
                    flex: 1, padding: '10px 16px', borderRadius: '10px', background: 'var(--primary)',
                    color: 'white', border: 'none', fontWeight: '700', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isSubmitting ? 0.7 : 1
                  }}>
                    {isSubmitting ? 'Saving...' : (
                      <>
                        <Check size={18} />
                        Save
                      </>
                    )}
                  </button>
                  <button type="button" onClick={onClose} style={{
                    flex: 1, padding: '10px 16px', borderRadius: '10px', background: 'transparent',
                    color: 'white', border: '1px solid var(--card-border)', fontWeight: '700', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    Cancel
                  </button>
                </div>

              </div>
            </div>
          </form>
        </div>

        <style>{`
          .hover-bg-white-20:hover { background: rgba(255,255,255,0.2) !important; color: white !important; }
        `}</style>
      </div>
    </div>
  );
};

export default EquipmentForm;
