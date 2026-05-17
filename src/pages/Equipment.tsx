import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit2, Trash2, Camera, RefreshCw } from 'lucide-react';
import { apiClient } from '../api/client';
import EquipmentForm from '../components/equipment/EquipmentForm';
import Toast from '../components/ui/Toast';
import type { ToastType } from '../components/ui/Toast';

interface EquipmentItem {
  id: number;
  category_id: number;
  category_name?: string;
  type: string;
  model: string;
  name: string;
  value: number;
  description: string;
  is_active: number;
  created_at: string;
}

const Equipment: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | undefined>();
  
  const [toast, setToast] = useState<{message: string, type: ToastType} | null>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [equipData, catData] = await Promise.all([
        apiClient.getEquipment(),
        apiClient.getEquipmentCategories()
      ]);
      setEquipmentList(equipData);
      setCategories(catData);
    } catch (error) {
      console.error('Error fetching equipment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (isFormOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isFormOpen]);

  const handleAdd = () => {
    setSelectedEquipment(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (item: EquipmentItem) => {
    setSelectedEquipment(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      try {
        await apiClient.deleteEquipment(id);
        showToast('Equipment deleted successfully', 'success');
        fetchData();
      } catch (error) {
        console.error('Error deleting equipment:', error);
        showToast('Failed to delete equipment', 'error');
      }
    }
  };

  const handleSave = () => {
    setIsFormOpen(false);
    showToast('Equipment saved successfully', 'success');
    fetchData();
  };

  const filteredEquipment = equipmentList.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.category_name && item.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>Equipment Details</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your lens calculator equipment catalog</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={fetchData}
            className="glass"
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '10px 16px', borderRadius: '10px',
              color: 'white', cursor: 'pointer', border: '1px solid var(--card-border)'
            }}
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={handleAdd}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', 
              padding: '10px 16px', borderRadius: '10px',
              color: 'white', background: 'var(--primary)',
              cursor: 'pointer', border: 'none', fontWeight: '600'
            }}
            className="shadow-elegant"
          >
            <Plus size={18} />
            Add Equipment
          </button>
        </div>
      </div>

      <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search equipment..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '12px 12px 12px 40px',
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--card-border)',
              borderRadius: '10px', color: 'white', outline: 'none'
            }}
          />
        </div>
      </div>

      <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--card-border)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600' }}>Name</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600' }}>Category</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600' }}>Value</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td colSpan={5} style={{ padding: '24px', textAlign: 'center' }}>
                      <div className="skeleton" style={{ height: '40px', width: '100%', borderRadius: '4px' }}></div>
                    </td>
                  </tr>
                ))
              ) : filteredEquipment.length > 0 ? (
                filteredEquipment.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--card-border)', transition: '0.2s' }} className="table-row-hover">
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.05)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'
                        }}>
                          <Camera size={20} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: 'white', marginBottom: '4px' }}>{item.name}</div>
                          <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.type} • {item.model}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px 24px', color: 'var(--text-muted)' }}>
                      <span style={{ 
                        padding: '4px 10px', background: 'rgba(255,255,255,0.05)', 
                        borderRadius: '20px', fontSize: '13px', fontWeight: '500' 
                      }}>
                        {item.category_name || 'Unknown'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', fontWeight: '600' }}>
                      ${Number(item.value).toFixed(2)}
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{
                        padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: '600',
                        background: item.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: item.is_active ? '#10b981' : '#ef4444'
                      }}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          onClick={() => handleEdit(item)}
                          className="action-btn edit-btn"
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            border: 'none', background: 'rgba(255,255,255,0.05)',
                            color: 'var(--text-muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="action-btn delete-btn"
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            border: 'none', background: 'rgba(255,255,255,0.05)',
                            color: 'var(--text-muted)', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Camera size={48} style={{ marginBottom: '16px', opacity: 0.2, margin: '0 auto' }} />
                    <p style={{ fontSize: '16px', fontWeight: '500' }}>No equipment found</p>
                    <p style={{ fontSize: '14px', marginTop: '8px' }}>Click "Add Equipment" to add your first item.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isFormOpen && (
        <EquipmentForm 
          equipment={selectedEquipment} 
          categories={categories}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
          onError={(msg) => showToast(msg, 'error')}
        />
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      <style>{`
        .table-row-hover:hover { background: rgba(255, 255, 255, 0.02); }
        .action-btn.edit-btn:hover { background: rgba(99, 102, 241, 0.2) !important; color: var(--primary) !important; }
        .action-btn.delete-btn:hover { background: rgba(239, 68, 68, 0.2) !important; color: #ef4444 !important; }
        .skeleton {
          background: linear-gradient(90deg, rgba(255, 255, 255, 0.05) 25%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.05) 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s infinite;
        }
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default Equipment;
