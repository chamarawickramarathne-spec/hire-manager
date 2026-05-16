import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Users,
  LayoutDashboard,
  CreditCard,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Camera,
  Briefcase,
  Calculator,
  History
} from "lucide-react";
import { useAppContext, type AppType } from "../../context/AppContext";

interface SidebarProps {
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const { currentApp, setCurrentApp, appTitle } = useAppContext();
  const [showAppSelector, setShowAppSelector] = useState(false);

  const handleAppChange = (appId: AppType) => {
    setCurrentApp(appId);
    setShowAppSelector(false);
    
    // Automatic navigation based on selected app
    if (appId === 'calculator') {
      navigate('/access-logs');
    } else {
      navigate('/');
    }
  };

  const apps: { id: AppType; name: string; icon: React.ReactNode; color: string }[] = [
    { id: 'lens_manager', name: 'Lens Booking Pro', icon: <Camera size={18} />, color: '#6366f1' },
    { id: 'workshop', name: 'Workshop Manager', icon: <Briefcase size={18} />, color: '#ec4899' },
    { id: 'calculator', name: 'Lens Calculator', icon: <Calculator size={18} />, color: '#10b981' }
  ];

  const getMenuItems = () => {
    if (currentApp === 'calculator') {
      return [
        { name: "Access Logs", icon: <History size={20} />, path: "/access-logs" },
      ];
    }

    return [
      { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/" },
      {
        name: "Photographers",
        icon: <Users size={20} />,
        path: "/photographers",
      },
      {
        name: "Subscriptions",
        icon: <CreditCard size={20} />,
        path: "/subscriptions",
      },
      {
        name: "Access Levels",
        icon: <ShieldCheck size={20} />,
        path: "/access-levels",
      },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div
      className="sidebar glass"
      style={{
        width: "280px",
        height: "calc(100vh - 32px)",
        margin: "16px",
        display: "flex",
        flexDirection: "column",
        padding: "24px 16px",
        position: "sticky",
        top: "16px",
        zIndex: 100,
      }}
    >
      <div
        className="brand"
        style={{
          padding: "0 8px 24px 8px",
          borderBottom: "1px solid var(--card-border)",
          marginBottom: "24px",
        }}
      >
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowAppSelector(!showAppSelector)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--card-border)',
              borderRadius: '12px',
              cursor: 'pointer',
              color: 'white',
              transition: 'all 0.3s'
            }}
            className="app-selector-btn"
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: apps.find(a => a.id === currentApp)?.color || "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
              }}
            >
              {apps.find(a => a.id === currentApp)?.icon}
            </div>
            <div style={{ textAlign: 'left', flex: 1 }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '500', lineHeight: 1 }}>Manage App</div>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>{appTitle}</div>
            </div>
            <ChevronDown size={16} style={{ transform: showAppSelector ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
          </button>

          {showAppSelector && (
            <div className="glass shadow-elegant" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '8px',
              padding: '8px',
              borderRadius: '12px',
              zIndex: 1000,
              border: '1px solid var(--card-border)',
              background: 'var(--bg-dark)'
            }}>
              {apps.map(app => (
                <button
                  key={app.id}
                  onClick={() => handleAppChange(app.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    background: currentApp === app.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: currentApp === app.id ? 'white' : 'var(--text-muted)',
                    textAlign: 'left',
                    transition: '0.2s'
                  }}
                  className="app-option"
                >
                  <div style={{ color: app.color }}>{app.icon}</div>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{app.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}
      >
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              borderRadius: "12px",
              transition: "all 0.2s ease",
              color: isActive ? "white" : "var(--text-muted)",
              background: isActive
                ? "linear-gradient(90deg, var(--primary) 0%, transparent 100%)"
                : "transparent",
              borderLeft: isActive
                ? "3px solid var(--primary)"
                : "3px solid transparent",
            })}
          >
            {item.icon}
            <span style={{ fontWeight: "500" }}>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div
        className="sidebar-footer"
        style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          paddingTop: "24px",
          borderTop: "1px solid var(--card-border)",
        }}
      >
        <button
          className="nav-link"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "12px",
            width: "100%",
            color: "var(--text-muted)",
            background: "transparent",
            textAlign: "left",
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Settings size={20} />
          <span style={{ fontWeight: "500" }}>Settings</span>
        </button>
        <button
          className="nav-link"
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            padding: "12px 16px",
            borderRadius: "12px",
            width: "100%",
            color: "var(--danger)",
            background: "transparent",
            textAlign: "left",
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <LogOut size={20} />
          <span style={{ fontWeight: "500" }}>Logout</span>
        </button>
      </div>

      <style>{`
        .app-selector-btn:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        .app-option:hover {
          background: rgba(255, 255, 255, 0.08) !important;
          color: white !important;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
