import React from 'react'

export default function SipList({ sips }) {
  return (
    <div style={{ marginTop: 16 }}>
      <h4 style={{ margin: 0, fontSize: 15 }}>Recent sips</h4>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 10, borderTop: '1px solid #f1f5f9' }}>
        {sips.slice().reverse().map(s => (
          <li key={s.id} style={{ padding: '10px 0', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
            <div>
              <div style={{ fontSize: 13, color: '#0f172a' }}>{new Date(s.timestamp).toLocaleString()}</div>
              <div style={{ fontSize: 12, color: '#94a3b8' }}>{s.method} • ~{s.volumeEstimate}ml</div>
            </div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{new Date(s.timestamp).toLocaleTimeString()}</div>
          </li>
        ))}
        {sips.length === 0 && <li style={{ padding: 12, color: '#94a3b8' }}>No sips yet — tap to start!</li>}
      </ul>
    </div>
  )
}
