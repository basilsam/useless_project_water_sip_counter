import React, { useMemo } from 'react'

export default function SipChart({ sips }) {
  const data = useMemo(() => {
    const map = new Map()
    for (const s of sips) {
      const key = new Date(s.timestamp)
      key.setMinutes(0, 0, 0)
      const k = key.toISOString()
      map.set(k, (map.get(k) || 0) + 1)
    }
    const arr = Array.from(map.entries()).map(([k, v]) => ({
      time: new Date(k).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sips: v
    }))
    return arr.sort((a, b) => new Date('1970-01-01T' + a.time) - new Date('1970-01-01T' + b.time)).slice(-24)
  }, [sips])

  const max = Math.max(1, ...data.map(d => d.sips))

  return (
    <div style={{ width: '100%', height: 140, padding: 8, background: '#fbfdff', borderRadius: 8, border: '1px solid #eef2ff' }}>
      {data.length === 0 ? (
        <div style={{ color: '#94a3b8', padding: 20 }}>No data yet — logs will appear here.</div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'end', height: 100, gap: 6 }}>
          {data.map((d, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div title={`${d.time}: ${d.sips} sips`} style={{ height: Math.max(6, (d.sips / max) * 100) + '%', background: '#60a5fa', borderRadius: 4, marginBottom: 6 }} />
              <div style={{ fontSize: 10, color: '#475569' }}>{d.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
