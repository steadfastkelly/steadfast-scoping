import React, { useEffect, useState } from 'react';
import { C } from '../theme';
import { desktopBridge, fetchBackendHealth } from '../services/desktopBridge';

function statusPillStyle(healthy) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderRadius: 999,
    border: `1px solid ${healthy ? '#2E9F6E' : '#B45309'}`,
    color: healthy ? '#2E9F6E' : '#B45309',
    fontWeight: 600,
    fontSize: 12,
  };
}

export default function BackendStatusCard() {
  const [serviceStatus, setServiceStatus] = useState({ status: 'unknown' });
  const [desktopStatus, setDesktopStatus] = useState({ running: false, pid: null });

  async function refreshStatus() {
    const [health, backend] = await Promise.all([
      fetchBackendHealth(),
      desktopBridge.backendStatus(),
    ]);

    setServiceStatus(health);
    setDesktopStatus(backend);
  }

  async function startBackend() {
    await desktopBridge.startBackend();
    await refreshStatus();
  }

  async function stopBackend() {
    await desktopBridge.stopBackend();
    await refreshStatus();
  }

  useEffect(() => {
    refreshStatus();
  }, []);

  const healthy = serviceStatus.status === 'ok';

  return (
    <section
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: 18,
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: '0 0 8px', fontSize: 18 }}>Data Engine Status</h2>
          <div style={statusPillStyle(healthy)}>{healthy ? 'Ready for reconciliation' : 'Service offline'}</div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={startBackend} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, cursor: 'pointer' }}>
            Start Service
          </button>
          <button type="button" onClick={stopBackend} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, cursor: 'pointer' }}>
            Stop Service
          </button>
          <button type="button" onClick={refreshStatus} style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${C.border}`, cursor: 'pointer' }}>
            Refresh
          </button>
        </div>
      </div>

      <div style={{ marginTop: 12, color: C.muted, fontSize: 14 }}>
        <div>Desktop process: {desktopStatus.running ? `Running (PID ${desktopStatus.pid || 'n/a'})` : 'Stopped'}</div>
        <div>API health: {serviceStatus.status || 'unknown'}</div>
        <div style={{ marginTop: 8 }}>
          Leadership note: Run reconciliation before reviewing profitability so finance and delivery numbers stay aligned.
        </div>
      </div>
    </section>
  );
}
