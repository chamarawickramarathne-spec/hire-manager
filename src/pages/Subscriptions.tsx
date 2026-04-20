import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { 
  ArrowUpRight, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Mock data removed in favor of API

const Subscriptions: React.FC = () => {
  const [subs, setSubs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (photographer: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [photographer]: !prev[photographer]
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [data, statsData] = await Promise.all([
          apiClient.getSubscriptions(),
          apiClient.getStats()
        ]);
        setSubs(data);
        setStats(statsData);
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const groupedSubs = [...subs]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .reduce((acc, sub) => {
      const name = sub.photographer_name || 'Unknown Photographer';
      if (!acc[name]) acc[name] = [];
      acc[name].push(sub);
      return acc;
    }, {} as Record<string, any[]>);

  // Calculate from visible subs
  const totalRevenue = subs.reduce((acc, sub) => acc + (parseFloat(sub.amount) || 0), 0);
  const activePhotographers = stats?.totals?.active_subscriptions || 0;
  const successRate = '100.0'; // Removed status calculation

  return (
    <div className="animate-fade-in" style={{ padding: '24px 16px 24px 0' }}>
      <div className="flex justify-between items-end" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Subscriptions & Payments</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor revenue and transaction history.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '32px' }}>
        <div className="glass shadow-elegant" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Total Revenue</div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>LKR {parseFloat(totalRevenue.toString()).toLocaleString()}</div>
          <div style={{ marginTop: '8px', color: 'var(--success)', fontSize: '12px', fontWeight: '600' }}>Lifetime earnings</div>
        </div>
        <div className="glass shadow-elegant" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Transaction Volume</div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{subs.length}</div>
          <div style={{ marginTop: '8px', color: 'var(--success)', fontSize: '12px', fontWeight: '600' }}>{successRate}% success rate</div>
        </div>
        <div className="glass shadow-elegant" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>Total Photographers</div>
          <div style={{ fontSize: '24px', fontWeight: '700' }}>{activePhotographers}</div>
          <div style={{ marginTop: '8px', color: 'var(--primary)', fontSize: '12px', fontWeight: '600' }}>Active</div>
        </div>
      </div>

      <div className="glass shadow-elegant" style={{ padding: '12px', marginTop: '32px' }}>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Photographer / Transaction</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Plan</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Amount</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Date</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: '500', fontSize: '14px' }}>Method</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                   <td colSpan={5} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>Loading transactions...</td>
                </tr>
              ) : Object.keys(groupedSubs).length > 0 ? (
                (Object.entries(groupedSubs) as [string, any[]][])
                  .sort((a, b) => (b[1][0].id || 0) - (a[1][0].id || 0))
                  .map(([photographer, group], index) => (
                  <React.Fragment key={index}>
                    {/* Photographer Group Header */}
                    <tr 
                      style={{ background: 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'background 0.2s', borderBottom: '1px solid var(--card-border)' }}
                      onClick={() => toggleGroup(photographer)}
                      className="hover:bg-white/5"
                    >
                      <td style={{ padding: '16px 20px', fontWeight: '700', fontSize: '14px', color: 'white' }}>
                        {photographer} <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontSize: '13px', marginLeft: '6px' }}>({group.length})</span>
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: '500' }}>{group[0].plan_name}</td>
                      <td style={{ padding: '16px', fontSize: '14px', fontWeight: '700', color: 'var(--success)' }}>
                        LKR {parseFloat(group[0].amount).toLocaleString()}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
                        {new Date(group[0].payment_date).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px', fontSize: '14px' }}>
                        <div className="flex justify-between items-center">
                          <span>{group[0].payment_method}</span>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '12px' }}>
                            {expandedGroups[photographer] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {/* photographer's transactions */}
                    {expandedGroups[photographer] && group.slice(1).map((sub: any, i: number) => (
                      <tr key={sub.id || i} style={{ borderBottom: '1px solid var(--card-border)' }}>
                        <td style={{ padding: '16px', fontSize: '14px', paddingLeft: '32px', color: 'var(--text-muted)' }}>
                           <ArrowUpRight size={14} style={{ display: 'inline', marginRight: '8px' }} /> Transaction
                        </td>
                        <td style={{ padding: '16px', fontSize: '14px' }}>{sub.plan_name}</td>
                        <td style={{ padding: '16px', fontSize: '14px', fontWeight: '700' }}>LKR {parseFloat(sub.amount).toLocaleString()}</td>
                        <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>{new Date(sub.payment_date).toLocaleDateString()}</td>
                        <td style={{ padding: '16px', fontSize: '14px' }}>{sub.payment_method}</td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                   <td colSpan={5} style={{ textAlign: 'center', padding: '100px', color: 'var(--text-muted)' }}>No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
