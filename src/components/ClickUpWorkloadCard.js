import React, { useMemo, useState } from 'react';
import useIsCompact from '../hooks/useIsCompact';
import { C } from '../theme';

const DEFAULT_FORM = {
  teamId: '',
  listIds: '',
  horizonDays: 14,
  token: '',
};

function getBaseUrl() {
  return process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8765';
}

function parseListIds(raw) {
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function ClickUpWorkloadCard({ onSummaryLoaded }) {
  const isCompact = useIsCompact();
  const [form, setForm] = useState(DEFAULT_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const atRiskAssignees = useMemo(() => {
    if (!result?.assignees) return [];
    return result.assignees.filter((row) => row.overdue_tasks > 0 || row.open_tasks >= 8);
  }, [result]);

  async function loadFromClickUp() {
    setLoading(true);
    setError('');

    const payload = {
      team_id: form.teamId,
      list_ids: parseListIds(form.listIds),
      horizon_days: Number(form.horizonDays || 14),
      token: form.token || undefined,
    };

    try {
      const response = await fetch(`${getBaseUrl()}/workload/clickup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.detail || 'Unable to load ClickUp workload');
      }

      setResult(body);
      onSummaryLoaded?.(body);
    } catch (requestError) {
      setError(requestError.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        marginTop: 16,
        padding: isCompact ? 14 : 18,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        background: C.card,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 6, fontSize: isCompact ? 20 : 22 }}>ClickUp Workload Sync</h3>
      <p style={{ color: C.muted, marginTop: 0, marginBottom: 14, lineHeight: 1.45 }}>
        Pull live task pressure from ClickUp to anchor design-team workload decisions.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: isCompact ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          <span style={{ color: C.muted, fontSize: 13 }}>Team ID</span>
          <input
            value={form.teamId}
            onChange={(event) => setForm((prev) => ({ ...prev, teamId: event.target.value }))}
            placeholder="ClickUp team id"
            style={{ background: C.inp, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', minWidth: 0 }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          <span style={{ color: C.muted, fontSize: 13 }}>List IDs (comma-separated)</span>
          <input
            value={form.listIds}
            onChange={(event) => setForm((prev) => ({ ...prev, listIds: event.target.value }))}
            placeholder="123,456"
            style={{ background: C.inp, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', minWidth: 0 }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          <span style={{ color: C.muted, fontSize: 13 }}>Horizon days</span>
          <input
            type="number"
            min={1}
            max={90}
            value={form.horizonDays}
            onChange={(event) => setForm((prev) => ({ ...prev, horizonDays: event.target.value }))}
            style={{ background: C.inp, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', minWidth: 0 }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
          <span style={{ color: C.muted, fontSize: 13 }}>Token (optional if backend env var is set)</span>
          <input
            type="password"
            value={form.token}
            onChange={(event) => setForm((prev) => ({ ...prev, token: event.target.value }))}
            placeholder="pk_..."
            style={{ background: C.inp, color: C.text, border: `1px solid ${C.border}`, borderRadius: 8, padding: '8px 10px', minWidth: 0 }}
          />
        </label>
      </div>

      <button
        type="button"
        onClick={loadFromClickUp}
        disabled={loading || !form.teamId}
        style={{
          marginTop: 12,
          padding: '10px 14px',
          borderRadius: 8,
          border: `1px solid ${C.border}`,
          background: loading ? C.border : C.teal,
          color: loading ? C.muted : '#0b1218',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          width: isCompact ? '100%' : 'auto',
          textAlign: 'center',
        }}
      >
        {loading ? 'Syncing...' : 'Sync ClickUp Workload'}
      </button>

      {error && <p style={{ color: C.danger, marginTop: 10, marginBottom: 0 }}>{error}</p>}

      {result && (
        <div style={{ marginTop: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, flexDirection: isCompact ? 'column' : 'row' }}>
            <p style={{ margin: 0 }}><span style={{ color: C.muted }}>Open tasks:</span> <strong>{result.total_open_tasks}</strong></p>
            <p style={{ margin: 0 }}><span style={{ color: C.muted }}>Due soon:</span> <strong>{result.tasks_due_soon}</strong></p>
            <p style={{ margin: 0 }}><span style={{ color: C.muted }}>Overdue:</span> <strong style={{ color: result.tasks_overdue ? C.danger : C.green }}>{result.tasks_overdue}</strong></p>
          </div>

          <h4 style={{ marginBottom: 8 }}>At-risk assignees</h4>
          {atRiskAssignees.length ? (
            <ul style={{ margin: 0, paddingLeft: 18, wordBreak: 'break-word' }}>
              {atRiskAssignees.map((assignee) => (
                <li key={assignee.assignee_id} style={{ marginBottom: 6 }}>
                  {assignee.assignee_name}: {assignee.open_tasks} open / {assignee.overdue_tasks} overdue
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ margin: 0, color: C.green }}>No assignees currently flagged as overloaded.</p>
          )}

          {!!result.warnings?.length && (
            <ul style={{ marginTop: 10, paddingLeft: 18, color: C.gold, wordBreak: 'break-word' }}>
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
