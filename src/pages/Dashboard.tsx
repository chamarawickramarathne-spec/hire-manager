import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { 
  Users, 
  DollarSign, 
  CreditCard, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Area,
  AreaChart,
  ResponsiveContainer
} from 'recharts';

// Mock data removed in favor of API history

const StatCard = ({ title, value, icon, trend, trendValue }: any) => (
  <div className="glass shadow-elegant" style={{ padding: '24px' }}>
    <div className="flex justify-between" style={{ marginBottom: '16px' }}>
      <div style={{ 
        background: 'rgba(99, 102, 241, 0.1)', 
        padding: '12px', 
        borderRadius: '12px',
        color: 'var(--primary)'
      }}>
        {icon}
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '4px',
        color: trend === 'up' ? 'var(--success)' : 'var(--danger)',
        fontSize: '14px',
        fontWeight: '600',
        padding: '4px 8px',
        background: trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        borderRadius: '20px',
        height: 'fit-content'
      }}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {trendValue}
      </div>
    </div>
    <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '4px' }}>{title}</div>
    <div style={{ fontSize: '28px', fontWeight: '700' }}>{value}</div>
  </div>
);

import { useAppContext } from '../context/AppContext';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentApp } = useAppContext();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7days');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getStats(period, currentApp);
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [period, currentApp]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', paddingTop: '100px' }}>
        <div style={{ fontSize: '18px', color: 'var(--text-muted)' }}>Loading real-time data...</div>
      </div>
    );
  }

  const totals = stats?.totals || { photographers: 0, monthly_revenue: 0, active_subscriptions: 0 };
  const recentSignups = stats?.recent_signups || [];
  const history = stats?.revenue_history || [];

  return (
    <div className="animate-fade-in" style={{ padding: '24px 16px 24px 0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Admin Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back! Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '32px' }}>
        <StatCard 
          title="Total Photographers" 
          value={totals.photographers.toLocaleString()} 
          icon={<Users size={24} />} 
          trend="up" 
          trendValue="+0%" 
        />
        <StatCard 
          title="Monthly Revenue" 
          value={`LKR ${Number(totals.monthly_revenue).toLocaleString()}`} 
          icon={<DollarSign size={24} />} 
          trend="up" 
          trendValue="+0%" 
        />
        <StatCard 
          title="Active Subscriptions" 
          value={totals.active_subscriptions.toString()} 
          icon={<CreditCard size={24} />} 
          trend="up" 
          trendValue="+0%" 
        />
        <StatCard 
          title="Retention Rate" 
          value="100%" 
          icon={<TrendingUp size={24} />} 
          trend="up" 
          trendValue="+0%" 
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="glass shadow-elegant" style={{ gridColumn: 'span 2', padding: '24px' }}>
          <div className="flex justify-between items-center" style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Revenue Analytics</h3>
            <select 
              className="glass" 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{ 
                padding: '8px 16px', 
                fontSize: '14px', 
                color: 'var(--text-muted)',
                border: '1px solid var(--card-border)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="12months">Last 12 Months</option>
            </select>
          </div>
          <div style={{ width: '100%', height: '320px' }}>
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'white', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'white', fontSize: 12 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--bg-dark)', 
                    borderColor: 'var(--card-border)',
                    borderRadius: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="var(--primary)" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass shadow-elegant" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>Recent Signups</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {recentSignups.map((usr: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '10px', 
                  background: `hsla(${(i+1) * 60}, 70%, 50%, 0.1)`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: `hsla(${(i+1) * 60}, 70%, 50%, 1)`,
                  fontWeight: 'bold'
                }}>
                  {(usr.name || 'User').split(' ').map((n: string) => n ? n[0] : '').join('').toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>
                    {usr.name || 'User'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {new Date(usr.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '11px', 
                  padding: '2px 8px', 
                  borderRadius: '10px', 
                  background: 'rgba(99, 102, 241, 0.1)',
                  color: 'var(--primary)',
                  fontWeight: '600'
                }}>
                  {usr.plan || 'Free'}
                </div>
              </div>
            ))}
            {recentSignups.length === 0 && (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', padding: '20px' }}>
                No recent signups found.
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate('/photographers')}
            style={{ 
              width: '100%', 
              padding: '12px', 
              marginTop: '24px', 
              borderRadius: '12px', 
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontWeight: '600',
              fontSize: '14px',
              border: '1px solid var(--card-border)',
              cursor: 'pointer'
            }}
          >View All Users</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
