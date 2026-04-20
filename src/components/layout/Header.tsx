import React from 'react';
import { Bell, User } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="glass" style={{
      height: '72px',
      margin: '16px 16px 0 0',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: '16px',
      zIndex: 10
    }}>
      <div></div>

      <div className="header-actions" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
      }}>
        <button style={{
          background: 'rgba(255, 255, 255, 0.05)',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)'
        }}>
          <Bell size={20} />
        </button>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '4px 8px',
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: '12px',
          cursor: 'pointer'
        }}>
          <div style={{
            textAlign: 'right'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600' }}>Admin User</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>System Administrator</div>
          </div>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={20} color="white" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
