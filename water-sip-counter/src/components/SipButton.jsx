import React, { useState } from 'react'

const primaryButton = {
  padding: '10px 14px',
  borderRadius: 8,
  border: 'none',
  cursor: 'pointer',
  background: '#2563eb',
  color: 'white',
  fontWeight: 600
}
const ghostButton = {
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #e6e9ee',
  background: 'white',
  color: '#0f172a',
  cursor: 'pointer'
}

export default function SipButton({ onTap, onToggleTimer, isTiming }) {
  const [interval, setIntervalSec] = useState(5)
  return (
    <div>
      <button onClick={onTap} style={{ ...primaryButton, width: '100%', padding: 18, fontSize: 20, borderRadius: 12 }}>Tap — Log Sip 💧</button>

      <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ fontSize: 13, color: '#475569' }}>Auto-timer (sec):</label>
        <input
          type="number"
          value={interval}
          onChange={e => setIntervalSec(Number(e.target.value || 0))}
          style={{ width: 80, padding: 6, borderRadius: 6, border: '1px solid #e6e9ee' }}
        />
        <button onClick={() => onToggleTimer(interval)} style={{ ...ghostButton, padding: '8px 10px' }}>{isTiming ? 'Stop' : 'Start'}</button>
      </div>
    </div>
  )
}
