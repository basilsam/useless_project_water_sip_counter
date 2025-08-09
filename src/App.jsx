

import React, { useEffect, useMemo, useRef, useState } from 'react'

export default function App() {
  const [sips, setSips] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sips') || '[]') } catch (e) { return [] }
  })
  const [isTiming, setIsTiming] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    localStorage.setItem('sips', JSON.stringify(sips))
  }, [sips])

  useEffect(() => {
    return () => { 
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  function logSip(method = 'tap', volume = 30){
    const entry = { id: Date.now() + Math.random(), timestamp: Date.now(), method, volumeEstimate: volume }
    setSips(prev => [...prev, entry])
  }

  function clearAll(){ if (typeof window !== 'undefined' && confirm('Clear all sip history?')) setSips([]) }

  function toggleTimer(intervalSec = 5){
    const sec = Number(intervalSec) || 5
    if (isTiming){
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
      setIsTiming(false)
    } else {
      timerRef.current = setInterval(() => logSip('timer'), sec * 1000)
      setIsTiming(true)
    }
  }

  function exportCSV(){
    const csv = ['id,timestamp,iso,method,volumeEstimate', ...sips.map(s => `${s.id},${s.timestamp},${new Date(s.timestamp).toISOString()},${s.method},${s.volumeEstimate}`)].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'sips.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={styles.container}>
      <div style={styles.innerContainer}>
        <header style={styles.header}>
          <h1 style={styles.heading}>Water Glass Fill & Sip Counter</h1>
          <p style={styles.subHeading}>Track sips by tap or timer — visualize hydration over time.</p>
        </header>

        <main style={styles.main}>
          <div style={styles.mainContent}>

            <div style={styles.buttonChartContainer}>
              <div style={styles.buttonContainer}>
                <SipButton
                  onTap={() => logSip('tap')}
                  onToggleTimer={toggleTimer}
                  isTiming={isTiming}
                />

                <div style={styles.exportClearContainer}>
                  <button onClick={exportCSV} style={primaryButton}>Export CSV</button>
                  <button onClick={clearAll} style={ghostButton}>Clear</button>
                </div>
              </div>

              <div style={styles.chartContainer}>
                <h3 style={styles.chartHeading}>Hydration Pattern</h3>
                <div style={styles.chart}>
                  <SipChart sips={sips} />
                </div>
              </div>
            </div>

            <div>
              <SipList sips={sips} />
            </div>

          </div>
        </main>

        <footer style={styles.footer}>MVP: tap to log, timer to auto-log, chart + export. Longer route: cloud sync, auth, reminders.</footer>
      </div>
    </div>
  )
}

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

function SipButton({ onTap, onToggleTimer, isTiming }){
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

function SipList({ sips }){
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

function SipChart({ sips }){
  const data = useMemo(() => {
    const map = new Map()
    for (const s of sips){
      const key = new Date(s.timestamp)
      key.setMinutes(0,0,0)
      const k = key.toISOString()
      map.set(k, (map.get(k) || 0) + 1)
    }
    const arr = Array.from(map.entries()).map(([k, v]) => ({ time: new Date(k).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), sips: v }))
    return arr.sort((a,b) => new Date('1970-01-01T' + a.time) - new Date('1970-01-01T' + b.time)).slice(-24)
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


const styles = {
  container: { fontFamily: 'Inter, system-ui, Arial', padding: 20, background: '#f8fafc', minHeight: '100vh' },
  innerContainer: { maxWidth: 920, margin: '0 auto' },
  header: { marginBottom: 18 },
  heading: { fontSize: 28, margin: 0 },
  subHeading: { marginTop: 6, color: '#475569' },
  main: { background: '#fff', borderRadius: 12, padding: 18, boxShadow: '0 6px 20px rgba(15,23,42,0.06)' },
  mainContent: { display: 'flex', gap: 20, flexDirection: 'column' },
  buttonChartContainer: {
    display: 'flex',
    gap: 20,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    '@media (max-width: 768px)': { 
      flexDirection: 'column',
    },
  },
  buttonContainer: { flex: 1, minWidth: 260 },
  exportClearContainer: { marginTop: 12, display: 'flex', gap: 10 },
  chartContainer: {
    width: 360,
    minWidth: 240,
    '@media (max-width: 768px)': { 
      width: '100%',
    },
  },
  chartHeading: { margin: 0, fontSize: 16 },
  chart: { marginTop: 8 },
  footer: { marginTop: 12, color: '#64748b' },
}
