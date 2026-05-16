import React, { useEffect, useState } from 'react';
import { History, Search, RefreshCw, Clock, Globe, User, ChevronRight, ChevronDown, Monitor } from 'lucide-react';
import { apiClient } from '../api/client';
import { useAppContext } from '../context/AppContext';

interface AccessLog {
  id: number;
  ip_address: string;
  user_agent: string;
  accessed_at: string;
  request_uri?: string;
  user_id?: number;
}

const AccessLogs: React.FC = () => {
  const { currentApp } = useAppContext();
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIps, setExpandedIps] = useState<Record<string, boolean>>({});

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getAccessLogs(currentApp);
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentApp]);

  const toggleIp = (ip: string) => {
    setExpandedIps(prev => ({
      ...prev,
      [ip]: !prev[ip]
    }));
  };

  const filteredLogs = logs.filter(log => 
    log.ip_address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_agent.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.request_uri && log.request_uri.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const groupedLogs = filteredLogs.reduce((acc, log) => {
    if (!acc[log.ip_address]) {
      acc[log.ip_address] = [];
    }
    acc[log.ip_address].push(log);
    return acc;
  }, {} as Record<string, AccessLog[]>);

  // Sort IPs by the most recent hit
  const sortedIps = Object.keys(groupedLogs).sort((a, b) => {
    const lastA = new Date(groupedLogs[a][0].accessed_at).getTime();
    const lastB = new Date(groupedLogs[b][0].accessed_at).getTime();
    return lastB - lastA;
  });

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '4px' }}>Access Logs</h1>
          <p style={{ color: 'var(--text-muted)' }}>Grouped by visitor IP address</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="glass"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '10px 16px', 
            borderRadius: '10px',
            color: 'white',
            cursor: 'pointer',
            border: '1px solid var(--card-border)'
          }}
        >
          <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      <div className="glass" style={{ padding: '24px', borderRadius: '16px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search by IP, URI or User Agent..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--card-border)',
              borderRadius: '10px',
              color: 'white',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div className="glass" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--card-border)' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600' }}>IP Address / Visitor Info</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600' }}>Last Activity</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-muted)', fontWeight: '600', textAlign: 'right' }}>Total Hits</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--card-border)' }}>
                    <td colSpan={3} style={{ padding: '24px', textAlign: 'center' }}>
                      <div className="skeleton" style={{ height: '40px', width: '100%', borderRadius: '4px' }}></div>
                    </td>
                  </tr>
                ))
              ) : sortedIps.length > 0 ? (
                sortedIps.map((ip) => (
                  <React.Fragment key={ip}>
                    <tr 
                      onClick={() => toggleIp(ip)}
                      style={{ 
                        borderBottom: '1px solid var(--card-border)', 
                        transition: '0.2s', 
                        cursor: 'pointer',
                        background: expandedIps[ip] ? 'rgba(255, 255, 255, 0.05)' : 'transparent' 
                      }} 
                      className="table-row-hover"
                    >
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ color: 'var(--text-muted)' }}>
                            {expandedIps[ip] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Globe size={18} color="var(--secondary)" />
                            <code style={{ fontSize: '15px', fontWeight: '700', color: 'white' }}>{ip}</code>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '14px' }}>
                          <Clock size={14} />
                          {new Date(groupedLogs[ip][0].accessed_at).toLocaleString()}
                        </div>
                      </td>
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <span style={{ 
                          background: 'rgba(99, 102, 241, 0.1)', 
                          color: 'var(--primary)', 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontSize: '13px', 
                          fontWeight: '700' 
                        }}>
                          {groupedLogs[ip].length} hits
                        </span>
                      </td>
                    </tr>
                    
                    {expandedIps[ip] && (
                      <tr style={{ background: 'rgba(0, 0, 0, 0.2)' }}>
                        <td colSpan={3} style={{ padding: '0 24px 24px 64px' }}>
                          <div style={{ 
                            borderLeft: '2px solid var(--card-border)', 
                            paddingLeft: '24px', 
                            marginTop: '12px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                          }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase', marginBottom: '4px' }}>Hit History</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {groupedLogs[ip].map((log) => (
                                <div key={log.id} style={{ 
                                  display: 'grid', 
                                  gridTemplateColumns: '180px 1fr 2fr', 
                                  gap: '16px',
                                  padding: '12px',
                                  background: 'rgba(255, 255, 255, 0.03)',
                                  borderRadius: '8px',
                                  fontSize: '13px'
                                }}>
                                  <div style={{ color: 'var(--text-muted)' }}>
                                    {new Date(log.accessed_at).toLocaleTimeString()}
                                  </div>
                                  <div style={{ fontWeight: '600', color: 'var(--primary)' }}>
                                    {log.request_uri || '/'}
                                  </div>
                                  <div style={{ 
                                    color: 'var(--text-muted)', 
                                    fontSize: '11px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '6px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                  }}>
                                    <Monitor size={12} />
                                    {log.user_agent}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <tr>
                  <td colSpan={3} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <History size={48} style={{ marginBottom: '16px', opacity: 0.2 }} />
                    <p>No access logs found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .table-row-hover:hover {
          background: rgba(255, 255, 255, 0.02);
        }
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

export default AccessLogs;
