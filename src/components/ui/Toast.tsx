import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="animate-slide-up" style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      background: 'rgba(15, 23, 42, 0.95)',
      backdropFilter: 'blur(8px)',
      border: '1px solid var(--card-border)',
      padding: '16px 20px',
      borderRadius: '12px',
      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.5)',
      zIndex: 9999,
      color: 'white',
      minWidth: '300px'
    }}>
      {type === 'success' && <CheckCircle size={20} color="var(--success)" />}
      {type === 'error' && <XCircle size={20} color="var(--danger)" />}
      {type === 'info' && <CheckCircle size={20} color="var(--primary)" />}
      
      <span style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>{message}</span>
      
      <button 
        onClick={onClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          display: 'flex',
          padding: '4px'
        }}
      >
        <X size={16} />
      </button>

      <style>{`
        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Toast;
