import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { apiClient } from '../api/client';
import { 
  Users, 
  Calendar, 
  Database,
  Edit3,
  Plus,
  X,
  Save,
  Tag,
  Percent
} from 'lucide-react';

const planColors: any = {
  'Free': '#94a3b8',
  'Pro': '#6366f1',
  'Premium': '#ec4899',
  'Unlimited': '#f59e0b'
};

import { useAppContext } from '../context/AppContext';

const AccessLevels: React.FC = () => {
  const { currentApp } = useAppContext();
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [editingLevel, setEditingLevel] = useState<any>(null);
  const [editClients, setEditClients] = useState('');
  const [editBookings, setEditBookings] = useState('');
  const [editStorage, setEditStorage] = useState('');
  const [editPackagePrice, setEditPackagePrice] = useState('');
  const [editDiscountPercentage, setEditDiscountPercentage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Create Modal State
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newClients, setNewClients] = useState('');
  const [newBookings, setNewBookings] = useState('');
  const [newStorage, setNewStorage] = useState('');
  const [newPackagePrice, setNewPackagePrice] = useState('');
  const [newDiscountPercentage, setNewDiscountPercentage] = useState('');
  const [isCreatingSaving, setIsCreatingSaving] = useState(false);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getAccessLevels(currentApp);
      setLevels(data);
    } catch (error) {
      console.error("Error fetching access levels:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, [currentApp]);

  const openEdit = (level: any) => {
    setEditingLevel(level);
    setEditClients(level.max_clients?.toString() || '');
    setEditBookings(level.max_bookings?.toString() || '');
    setEditStorage(level.max_storage_gb?.toString() || '');
    setEditPackagePrice(level.package_price?.toString() || '0');
    setEditDiscountPercentage(level.discount_percentage?.toString() || '0');
  };

  const handleSave = async () => {
    if (!editingLevel) return;
    setIsSaving(true);
    try {
      await apiClient.updateAccessLevel({
        id: editingLevel.id,
        max_clients: editClients ? parseInt(editClients) : null,
        max_bookings: editBookings ? parseInt(editBookings) : null,
        max_storage_gb: parseFloat(editStorage) || 0,
        package_price: parseFloat(editPackagePrice) || 0,
        discount_percentage: parseFloat(editDiscountPercentage) || 0,
      }, currentApp);
      setEditingLevel(null);
      await fetchLevels();
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update access level.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      alert("Please enter a level name.");
      return;
    }
    setIsCreatingSaving(true);
    try {
      await apiClient.createAccessLevel({
        level_name: newName.trim(),
        max_clients: newClients ? parseInt(newClients) : null,
        max_bookings: newBookings ? parseInt(newBookings) : null,
        max_storage_gb: parseFloat(newStorage) || 0,
        package_price: parseFloat(newPackagePrice) || 0,
        discount_percentage: parseFloat(newDiscountPercentage) || 0,
      }, currentApp);
      setIsCreating(false);
      setNewName(''); setNewClients(''); setNewBookings(''); setNewStorage('');
      setNewPackagePrice(''); setNewDiscountPercentage('');
      await fetchLevels();
    } catch (error) {
      console.error("Create failed:", error);
      alert("Failed to create access level.");
    } finally {
      setIsCreatingSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    padding: '10px 12px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid var(--card-border)',
    borderRadius: '12px',
    color: 'white',
    outline: 'none',
    width: '100%',
    fontSize: '14px'
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px 16px 24px 0' }}>
      <div className="flex justify-between items-end" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Access Levels &amp; Limits</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure resource limitations for different subscription tiers.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="glass flex items-center gap-2"
          style={{ 
            padding: '12px 24px', 
            background: 'var(--primary)', 
            color: 'white', 
            fontWeight: '600',
            borderRadius: '12px',
            cursor: 'pointer',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={18} /> Add New Level
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {loading ? (
          <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
            Loading access levels...
          </div>
        ) : levels.map((level) => (
          <div key={level.id} className="glass shadow-elegant" style={{ padding: '24px', position: 'relative' }}>
            {/* Color bar */}
            <div style={{ 
              width: '100%', 
              height: '4px', 
              background: planColors[level.level_name] || '#6366f1', 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              borderTopLeftRadius: '16px', 
              borderTopRightRadius: '16px' 
            }}></div>
            
            <div className="flex justify-between items-start" style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '20px', fontWeight: '700' }}>{level.level_name}</div>
              <button 
                onClick={() => openEdit(level)}
                title="Edit limits"
                style={{ 
                  color: 'var(--text-muted)', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid var(--card-border)',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Edit3 size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="flex items-center gap-3">
                <Users size={16} color="var(--text-muted)" />
                <div style={{ fontSize: '14px' }}>
                  <span style={{ fontWeight: '600' }}>{level.max_clients || 'Unlimited'}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>Max Clients</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} color="var(--text-muted)" />
                <div style={{ fontSize: '14px' }}>
                  <span style={{ fontWeight: '600' }}>{level.max_bookings || 'Unlimited'}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>Max Bookings</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Database size={16} color="var(--text-muted)" />
                <div style={{ fontSize: '14px' }}>
                  <span style={{ fontWeight: '600' }}>{level.max_storage_gb} GB</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>Max Storage</span>
                </div>
              </div>
              
              {/* Added Price and Discount Rows */}
              <div className="flex items-center gap-3">
                <Tag size={16} color="var(--text-muted)" />
                <div style={{ fontSize: '14px' }}>
                  <span style={{ fontWeight: '600' }}>LKR {parseFloat(level.package_price || '0').toLocaleString()}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>Package Price</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Percent size={16} color="var(--success)" />
                <div style={{ fontSize: '14px' }}>
                  <span style={{ fontWeight: '600', color: 'var(--success)' }}>{parseFloat(level.discount_percentage || '0')}%</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>Discount</span>
                </div>
              </div>
            </div>

            <div style={{ 
              marginTop: '24px',  
              paddingTop: '16px', 
              borderTop: '1px solid var(--card-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Level Priority</div>
              <div style={{ fontSize: '16px', fontWeight: '700' }}>{level.id}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal via Portal */}
      {editingLevel && ReactDOM.createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} className="animate-fade-in">
          <div className="glass shadow-elegant" style={{
            width: '100%',
            maxWidth: '420px',
            background: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid var(--card-border)',
            borderRadius: '24px',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ 
              padding: '24px 24px 0 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>
                  Edit — {editingLevel.level_name}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                  Update resource limits for this plan
                </p>
              </div>
              <button 
                onClick={() => setEditingLevel(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Color accent bar inside card */}
            <div style={{ 
              height: '3px', 
              background: planColors[editingLevel.level_name] || '#6366f1',
              margin: '0 24px 20px 24px',
              borderRadius: '4px'
            }}></div>

            {/* Form */}
            <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
                  Max Clients <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(0 = Unlimited)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={editClients}
                  onChange={(e) => setEditClients(e.target.value)}
                  placeholder="e.g. 50"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
                  Max Bookings <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(0 = Unlimited)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={editBookings}
                  onChange={(e) => setEditBookings(e.target.value)}
                  placeholder="e.g. 100"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
                  Max Storage (GB)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={editStorage}
                  onChange={(e) => setEditStorage(e.target.value)}
                  placeholder="e.g. 5"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Package Price (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={editPackagePrice}
                    onChange={(e) => setEditPackagePrice(e.target.value)}
                    placeholder="e.g. 1500"
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={editDiscountPercentage}
                    onChange={(e) => setEditDiscountPercentage(e.target.value)}
                    placeholder="e.g. 10"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ padding: '20px 24px 24px', marginTop: '8px', borderTop: '1px solid var(--card-border)', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setEditingLevel(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--card-border)',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >Cancel</button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  flex: 2,
                  padding: '12px',
                  background: 'var(--primary)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '700',
                  cursor: 'pointer',
                  opacity: isSaving ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      , document.body)}
      {/* Create New Level Modal via Portal */}
      {isCreating && ReactDOM.createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }} className="animate-fade-in">
          <div className="glass shadow-elegant" style={{
            width: '100%',
            maxWidth: '420px',
            background: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid var(--card-border)',
            borderRadius: '24px',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ padding: '24px 24px 0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>New Access Level</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Define a new subscription tier and its limits</p>
              </div>
              <button onClick={() => setIsCreating(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            {/* Form */}
            <div style={{ padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Level Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Enterprise"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Max Clients <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(empty = Unlimited)</span></label>
                <input
                  type="number"
                  min="0"
                  value={newClients}
                  onChange={(e) => setNewClients(e.target.value)}
                  placeholder="e.g. 100"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Max Bookings <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>(empty = Unlimited)</span></label>
                <input
                  type="number"
                  min="0"
                  value={newBookings}
                  onChange={(e) => setNewBookings(e.target.value)}
                  placeholder="e.g. 200"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Max Storage (GB)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={newStorage}
                  onChange={(e) => setNewStorage(e.target.value)}
                  placeholder="e.g. 20"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Package Price (LKR)</label>
                  <input
                    type="number"
                    min="0"
                    value={newPackagePrice}
                    onChange={(e) => setNewPackagePrice(e.target.value)}
                    placeholder="e.g. 1500"
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newDiscountPercentage}
                    onChange={(e) => setNewDiscountPercentage(e.target.value)}
                    placeholder="e.g. 10"
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '20px 24px 24px', marginTop: '16px', borderTop: '1px solid var(--card-border)', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setIsCreating(false)}
                style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)', borderRadius: '12px', color: 'white', fontWeight: '600', cursor: 'pointer' }}
              >Cancel</button>
              <button
                onClick={handleCreate}
                disabled={isCreatingSaving}
                style={{ flex: 2, padding: '12px', background: 'var(--primary)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '700', cursor: 'pointer', opacity: isCreatingSaving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Plus size={16} />
                {isCreatingSaving ? 'Creating...' : 'Create Level'}
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default AccessLevels;
