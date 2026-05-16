import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { apiClient } from '../api/client';
import { 
  Search, 
  MoreVertical, 
  Shield, 
  Eye, 
  CheckCircle2, 
  XCircle,
  Calendar,
  Filter
} from 'lucide-react';

// Mock data removed in favor of API

const PlanBadge = ({ plan }: { plan: string }) => {
  const colors: any = {
    'Free': { bg: 'rgba(148, 163, 184, 0.1)', text: '#94a3b8' },
    'Pro': { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366f1' },
    'Premium': { bg: 'rgba(236, 72, 153, 0.1)', text: '#ec4899' },
    'Unlimited': { bg: 'rgba(245, 158, 11, 0.1)', text: '#f59e0b' },
  };
  const style = colors[plan] || colors['Free'];
  return (
    <span style={{ 
      padding: '4px 10px', 
      borderRadius: '20px', 
      fontSize: '12px', 
      fontWeight: '600',
      background: style.bg,
      color: style.text
    }}>{plan}</span>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const isGood = status === 'Active';
  const isBad = status === 'Expired' || status === 'Inactive';
  
  return (
    <span style={{ 
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      fontSize: '12px', 
      fontWeight: '500',
      color: isGood ? 'var(--success)' : (isBad ? 'var(--danger)' : 'var(--text-muted)')
    }}>
      {isGood ? <CheckCircle2 size={14} /> : (isBad ? <XCircle size={14} /> : null)}
      {status}
    </span>
  );
};

import { useAppContext } from '../context/AppContext';

const Photographers: React.FC = () => {
  const { currentApp } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [photographers, setPhotographers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [accessLevels, setAccessLevels] = useState<any[]>([]);
  
  // Form State
  const [planType, setPlanType] = useState('');
  const [status, setStatus] = useState('Active');
  const [expireDate, setExpireDate] = useState('');
  const [activationDate, setActivationDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('1'); // months
  const [amount, setAmount] = useState('0');
  const [transactionId, setTransactionId] = useState('');
  const [transactionMethod, setTransactionMethod] = useState('Manual Override');
  const [isSaving, setIsSaving] = useState(false);
  
  // Details Modal State
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (isModalOpen || isDetailsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isModalOpen, isDetailsOpen]);

  // Effect to automatically calculate expiry date when duration or activation updates
  useEffect(() => {
    if (planType !== '1' && activationDate && duration !== 'custom') {
      const actDate = new Date(activationDate);
      if (!isNaN(actDate.getTime())) {
        actDate.setMonth(actDate.getMonth() + parseInt(duration));
        setExpireDate(actDate.toISOString().split('T')[0]);
      }
    }
  }, [activationDate, duration, planType]);

  // Effect to automatically calculate amount when plan or duration changes
  useEffect(() => {
    if (planType && planType !== '1' && accessLevels.length > 0) {
      const selectedPlan = accessLevels.find(al => al.id.toString() === planType);
      if (selectedPlan) {
        const basePrice = parseFloat(selectedPlan.package_price) || 0;
        const discount = parseFloat(selectedPlan.discount_percentage) || 0;
        const monthlyPrice = basePrice * (1 - (discount / 100));
        
        let multiplier = 1;
        if (duration !== 'custom') {
          multiplier = parseInt(duration) || 1;
        }
        
        setAmount((monthlyPrice * multiplier).toString());
      }
    } else if (planType === '1') {
      setAmount('0');
    }
  }, [planType, duration, accessLevels]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersData, levelsData] = await Promise.all([
          apiClient.getPhotographers(searchTerm, currentApp),
          apiClient.getAccessLevels(currentApp)
        ]);
        setPhotographers(usersData);
        setAccessLevels(levelsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    const timeout = setTimeout(fetchData, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm, currentApp]);

    const handleOpenModal = (user: any) => {
    setSelectedUser(user);
    setPlanType(user.access_level_id.toString());
    setExpireDate(user.expire_date || '');
    setStatus(user.is_active === 2 ? 'Suspended' : (user.is_active === 1 ? 'Active' : 'Inactive'));
    setDuration('custom');
    setTransactionId('');
    setTransactionMethod('Manual Override');
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    // Validation
    if (!planType || !status) {
      alert("Please select a Plan Type and Status.");
      return;
    }
    
    if (planType !== '1') {
      if (!amount || amount.toString().trim() === '') {
        alert("Please enter a Payment Amount.");
        return;
      }
      if (!activationDate) {
        alert("Please select an Activation Date.");
        return;
      }
      if (!expireDate) {
        alert("Please select an Expire Date (or choose a Duration).");
        return;
      }
    }

    setIsSaving(true);
    try {
      await apiClient.updatePhotographerPlan({
        id: selectedUser.id,
        level_id: parseInt(planType),
        expire_date: planType === '1' ? '' : expireDate,
        status: status,
        activation_date: planType === '1' ? '' : activationDate,
        amount: parseFloat(amount) || 0,
        transaction_id: transactionId,
        payment_method: transactionMethod,
        app: currentApp
      });
      // Refresh data
      const data = await apiClient.getPhotographers(searchTerm, currentApp);
      setPhotographers(data);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Update failed:", error);
      alert("Failed to update plan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewDetails = async (user: any) => {
    setDetailsLoading(true);
    setIsDetailsOpen(true);
    try {
      const data = await apiClient.getUserDetails(user.id, currentApp);
      setUserDetails(data);
    } catch (error) {
      console.error("Failed to fetch details:", error);
      alert("Failed to load user details.");
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '24px 16px 24px 0' }}>
      <div className="flex justify-between items-end" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Photographer Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage access levels and monitor photographer activity.</p>
        </div>
      </div>

      <div className="glass shadow-elegant" style={{ padding: '12px' }}>
        <div className="table-controls flex justify-between items-center" style={{ padding: '16px' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Filter by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 10px 10px 40px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--card-border)',
                borderRadius: '10px',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
          <div className="flex gap-3">
            <button className="glass flex items-center gap-2" style={{ padding: '10px 16px', fontSize: '14px', color: 'var(--text-muted)' }}>
              <Filter size={16} /> Filter
            </button>
            <button className="glass flex items-center gap-2" style={{ padding: '10px 16px', fontSize: '14px', color: 'var(--text-muted)' }}>
              <Calendar size={16} /> Date Range
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Photographer</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Plan</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Status</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Activation Date</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Expiry Date</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Joined</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
                    Loading photographers...
                  </td>
                </tr>
              ) : photographers.length > 0 ? (
                photographers.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '16px' }}>
                      <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)', fontSize: '14px', flexShrink: 0 }}>
                          {user.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>{user.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}><PlanBadge plan={user.al_name || 'Free'} /></td>
                    <td style={{ padding: '16px' }}><StatusBadge status={user.status} /></td>
                    <td style={{ padding: '16px', fontSize: '14px' }}>{user.activation_date ? new Date(user.activation_date).toLocaleDateString() : 'N/A'}</td>
                    <td style={{ padding: '16px', fontSize: '14px' }}>{user.expire_date || 'N/A'}</td>
                    <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>{new Date(user.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          style={{ background: 'transparent', color: 'var(--text-muted)', padding: '6px', borderRadius: '8px', cursor: 'pointer' }} 
                          title="Change Plan"
                        >
                          <Shield size={18} />
                        </button>
                        <button 
                          onClick={() => handleViewDetails(user)}
                          style={{ background: 'transparent', color: 'var(--text-muted)', padding: '6px', borderRadius: '8px', cursor: 'pointer' }} 
                          title="View details"
                        >
                          <Eye size={18} />
                        </button>
                        <button style={{ background: 'transparent', color: 'var(--text-muted)', padding: '6px', borderRadius: '8px' }} title="More"><MoreVertical size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>
                    No photographers found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Showing {photographers.length} photographers</div>
          <div className="flex gap-2">
            <button className="glass" style={{ padding: '6px 12px', fontSize: '13px' }}>Previous</button>
            <button className="glass" style={{ padding: '6px 12px', background: 'var(--primary)', color: 'white', fontSize: '13px' }}>1</button>
            <button className="glass" style={{ padding: '6px 12px', fontSize: '13px' }}>2</button>
            <button className="glass" style={{ padding: '6px 12px', fontSize: '13px' }}>3</button>
            <button className="glass" style={{ padding: '6px 12px', fontSize: '13px' }}>Next</button>
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {isDetailsOpen && ReactDOM.createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px 20px 8vh 20px'
        }} className="animate-fade-in">
          <div className="glass shadow-elegant" style={{
            width: '100%',
            maxWidth: '900px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px 24px 32px 24px',
            position: 'relative',
            background: 'rgba(15, 23, 42, 0.98)',
            border: '1px solid var(--card-border)',
            borderRadius: '24px'
          }}>
            <button 
              onClick={() => setIsDetailsOpen(false)}
              style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10, background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
            ><XCircle size={24} /></button>

            {detailsLoading ? (
              <div style={{ padding: '100px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading detailed analytics...</div>
            ) : userDetails ? (
              <div style={{ paddingTop: '12px' }}>
                <div className="flex justify-between items-start" style={{ marginBottom: '20px', paddingRight: '24px' }}>
                  <div className="flex items-center gap-4">
                    <div style={{ minWidth: '48px', width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', color: 'white' }}>
                      {userDetails.user.name[0]}
                    </div>
                    <div>
                      <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '2px' }}>{userDetails.user.name}</h2>
                      <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{userDetails.user.email} • Joined {new Date(userDetails.user.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <PlanBadge plan={userDetails.user.level_name} />
                    <div style={{ marginTop: '4px' }}>
                      <StatusBadge status={userDetails.user.status || (userDetails.user.is_active ? 'Active' : 'Inactive')} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3" style={{ marginBottom: '16px', gap: '12px' }}>
                  <div className="glass" style={{ padding: '12px 16px' }}>
                     <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>Storage Usage</div>
                     <div style={{ fontSize: '16px', fontWeight: '700' }}>{userDetails.user.current_storage_gb} / {userDetails.user.max_storage_gb} GB</div>
                     <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${Math.min((userDetails.user.current_storage_gb / userDetails.user.max_storage_gb) * 100, 100)}%`, 
                          height: '100%', 
                          background: 'var(--primary)' 
                        }}></div>
                     </div>
                  </div>
                  <div className="glass" style={{ padding: '12px 16px' }}>
                     <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>Client Limit</div>
                     <div style={{ fontSize: '16px', fontWeight: '700' }}>{userDetails.user.current_clients} / {userDetails.user.max_clients || '∞'}</div>
                     <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${userDetails.user.max_clients ? (userDetails.user.current_clients / userDetails.user.max_clients * 100) : 10}%`, 
                          height: '100%', 
                          background: '#6366f1' 
                        }}></div>
                     </div>
                  </div>
                  <div className="glass" style={{ padding: '12px 16px' }}>
                     <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '4px' }}>Booking Limit</div>
                     <div style={{ fontSize: '16px', fontWeight: '700' }}>{userDetails.user.current_bookings} / {userDetails.user.max_bookings || '∞'}</div>
                     <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginTop: '8px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${userDetails.user.max_bookings ? (userDetails.user.current_bookings / userDetails.user.max_bookings * 100) : 10}%`, 
                          height: '100%', 
                          background: '#ec4899' 
                        }}></div>
                     </div>
                  </div>
                </div>

                <div style={{ marginBottom: '0' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>Payment History</h3>
                  <div className="glass" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--card-border)' }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)' }}>Date</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)' }}>Plan</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)' }}>Amount</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)' }}>Method</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userDetails.payment_history.map((pay: any, i: number) => (
                          <tr key={i} style={{ borderBottom: '1px solid var(--card-border)' }}>
                            <td style={{ padding: '8px 16px', fontSize: '11px' }}>{new Date(pay.payment_date).toLocaleDateString()}</td>
                            <td style={{ padding: '8px 16px', fontSize: '11px' }}>{pay.plan_name}</td>
                            <td style={{ padding: '8px 16px', fontSize: '12px', fontWeight: '600' }}>LKR {parseFloat(pay.amount).toLocaleString()}</td>
                            <td style={{ padding: '8px 16px', fontSize: '11px' }}>{pay.payment_method}</td>
                            <td style={{ padding: '8px 16px' }}>
                              <span style={{ 
                                padding: '2px 8px', 
                                borderRadius: '6px', 
                                background: pay.status === 'Completed' || pay.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                color: pay.status === 'Completed' || pay.status === 'active' ? 'var(--success)' : 'var(--danger)',
                                fontSize: '11px',
                                fontWeight: '700'
                              }}>{pay.status}</span>
                            </td>
                          </tr>
                        ))}
                        {userDetails.payment_history.length === 0 && (
                          <tr>
                            <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No payment records found.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      , document.body)}

      {/* Change Plan Modal */}
      {isModalOpen && ReactDOM.createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px',
          overflowY: 'auto'
        }} className="animate-fade-in">
          <div className="glass shadow-elegant" style={{
            width: '100%',
            maxWidth: '500px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid var(--card-border)',
            borderRadius: '24px',
            overflow: 'hidden'
          }}>
            {/* Fixed Header */}
            <div style={{ padding: '24px 24px 0 24px', flexShrink: 0 }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Update Photographer Plan</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
                Updating plan for <span style={{ color: 'white', fontWeight: '600' }}>{selectedUser?.name}</span>
              </p>
            </div>

            {/* Scrollable Fields */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '0 24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Plan Type</label>
                <select 
                  value={planType}
                  onChange={(e) => setPlanType(e.target.value)}
                  style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    color: 'white',
                    outline: 'none'
                  }}
                >
                  {accessLevels.map(al => (
                    <option key={al.id} value={al.id} style={{ background: '#0f172a' }}>{al.level_name}</option>
                  ))}
                </select>
              </div>

              {planType !== '1' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Payment Amount (LKR) <span style={{ fontWeight: '400' }}>(Auto-calculated)</span></label>
                  <input 
                    type="number" 
                    value={amount}
                    readOnly
                    placeholder="Enter amount paid"
                    style={{
                      padding: '10px 12px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '12px',
                      color: 'var(--text-muted)',
                      outline: 'none',
                      cursor: 'not-allowed'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Status</label>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  style={{
                    padding: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    color: 'white',
                    outline: 'none'
                  }}
                >
                  <option value="Active" style={{ background: '#0f172a' }}>Active</option>
                  <option value="Inactive" style={{ background: '#0f172a' }}>Inactive</option>
                  <option value="Suspended" style={{ background: '#0f172a' }}>Suspended</option>
                </select>
              </div>

              {planType !== '1' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Activation Date</label>
                    <input 
                      type="date" 
                      value={activationDate}
                      onChange={(e) => setActivationDate(e.target.value)}
                      style={{
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '12px',
                        color: 'white',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Duration</label>
                    <select 
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      style={{
                        padding: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '12px',
                        color: 'white',
                        outline: 'none'
                      }}
                    >
                      <option value="1" style={{ background: '#0f172a' }}>1 Month</option>
                      <option value="3" style={{ background: '#0f172a' }}>3 Months</option>
                      <option value="6" style={{ background: '#0f172a' }}>6 Months</option>
                      <option value="12" style={{ background: '#0f172a' }}>1 Year</option>
                      <option value="custom" style={{ background: '#0f172a' }}>Custom</option>
                    </select>
                  </div>
                </div>
              )}

              {planType !== '1' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Expire Date</label>
                  <input 
                    type="date" 
                    value={expireDate}
                    onChange={(e) => {
                      setExpireDate(e.target.value);
                      setDuration('custom');
                    }}
                    style={{
                      padding: '10px 12px',
                      background: duration !== 'custom' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                      border: '1px solid var(--card-border)',
                      borderRadius: '12px',
                      color: duration !== 'custom' ? 'var(--text-muted)' : 'white',
                      outline: 'none'
                    }}
                  />
                </div>
              )}

              {planType !== '1' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Transaction ID</label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g. TXN-001"
                      style={{
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '12px',
                        color: 'white',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Payment Method</label>
                    <select
                      value={transactionMethod}
                      onChange={(e) => setTransactionMethod(e.target.value)}
                      style={{
                        padding: '10px 12px',
                        background: 'rgba(15,23,42,0.9)',
                        border: '1px solid var(--card-border)',
                        borderRadius: '12px',
                        color: 'white',
                        outline: 'none'
                      }}
                    >
                      <option value="Manual Override">Manual Override</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Online">Online</option>
                    </select>
                  </div>
                </div>
              )}
            </div>{/* end inner form fields */}
            </div>{/* end scrollable fields */}

            {/* Fixed Footer Buttons */}
            <div style={{ padding: '16px 24px 24px 24px', flexShrink: 0, borderTop: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '14px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >Cancel</button>
                <button 
                  onClick={handleUpdate}
                  disabled={isSaving}
                  style={{
                    flex: 2,
                    padding: '14px',
                    background: 'var(--primary)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontWeight: '700',
                    cursor: 'pointer',
                    opacity: isSaving ? 0.7 : 1
                  }}
                >{isSaving ? 'Saving Changes...' : 'Update Plan & Status'}</button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
};

export default Photographers;
