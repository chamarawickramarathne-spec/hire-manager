import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  LayoutDashboard, 
  CreditCard, 
  Settings, 
  LogOut,
  ShieldCheck,
  BarChart3
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Photographers', icon: <Users size={20} />, path: '/photographers' },
    { name: 'Subscriptions', icon: <CreditCard size={20} />, path: '/subscriptions' },
    { name: 'Access Levels', icon: <ShieldCheck size={20} />, path: '/access-levels' }
  ];

  return (
    <div className="sidebar glass" style={{
      width: '280px',
      height: 'calc(100vh - 32px)',
      margin: '16px',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
      position: 'sticky',
      top: '16px'
    }}>
      <div className="brand" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '0 8px 32px 8px',
        borderBottom: '1px solid var(--card-border)',
        marginBottom: '24px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '20px'
        }}>H</div>
        <div style={{ fontWeight: '700', fontSize: '18px', letterSpacing: '-0.5px' }}>
          Hire Artist <span style={{ color: 'var(--text-muted)', fontWeight: '400' }}>Manager</span>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              transition: 'all 0.2s ease',
              color: isActive ? 'white' : 'var(--text-muted)',
              background: isActive ? 'linear-gradient(90deg, var(--primary) 0%, transparent 100%)' : 'transparent',
              borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent'
            })}
          >
            {item.icon}
            <span style={{ fontWeight: '500' }}>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer" style={{
        marginTop: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        paddingTop: '24px',
        borderTop: '1px solid var(--card-border)'
      }}>
        <button className="nav-link" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px 16px',
          borderRadius: '12px',
          width: '100%',
          color: 'var(--text-muted)',
          background: 'transparent',
          textAlign: 'left'
        }}>
          <Settings size={20} />
          <span style={{ fontWeight: '500' }}>Settings</span>
        </button>
        <button 
          className="nav-link" 
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            borderRadius: '12px',
            width: '100%',
            color: 'var(--danger)',
            background: 'transparent',
            textAlign: 'left'
          }}
        >
          <LogOut size={20} />
          <span style={{ fontWeight: '500' }}>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
