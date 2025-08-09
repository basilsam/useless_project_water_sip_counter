import React, { useEffect, useMemo, useRef, useState } from 'react'
import { FaceMesh } from "@mediapipe/face_mesh"
import { Camera } from "@mediapipe/camera_utils"
import CameraSipDetector from './components/CameraSipDetector'
import SipList from './components/SipList'

// Simple head tilt calculation
function calculateTilt(landmarks) {
  if (!landmarks || landmarks.length === 0) return 0;
  const nose = landmarks[1];       // Nose tip
  const leftEar = landmarks[234];  // Left ear landmark
  const rightEar = landmarks[454]; // Right ear landmark
  const earMidZ = (leftEar.z + rightEar.z) / 2;
  return nose.z - earMidZ; // positive = leaning back
}

export default function App() {
  const [sips, setSips] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sips') || '[]') } catch (e) { return [] }
  })
  const [isTiming, setIsTiming] = useState(false)
  const [cameraEnabled, setCameraEnabled] = useState(true)

  const timerRef = useRef(null)
  const videoRef = useRef(null)
  const lastSipTime = useRef(0)

  // Save sips in localStorage
  useEffect(() => {
    localStorage.setItem('sips', JSON.stringify(sips))
  }, [sips])

  // Cleanup on unmount
  useEffect(() => {
    return () => { 
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // Camera detection setup
  useEffect(() => {
    if (!cameraEnabled) return;

    const faceMesh = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });
    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      if (!results.multiFaceLandmarks[0]) return;
      const tilt = calculateTilt(results.multiFaceLandmarks[0]);
      const now = Date.now();
      if (tilt > 0.06 && now - lastSipTime.current > 2000) {
        lastSipTime.current = now;
        logSip('camera');
      }
    });

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        await faceMesh.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });

    camera.start();

    return () => {
      camera.stop();
    };
  }, [cameraEnabled]);

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
      <video 
        ref={videoRef}
        style={{ display: 'none' }}
        width="640"
        height="480"
      />
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
            <CameraSipDetector onSipDetected={logSip} />

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
  buttonChartContainer: { display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' },
  buttonContainer: { flex: 1, minWidth: 260 },
  exportClearContainer: { marginTop: 12, display: 'flex', gap: 10 },
  chartContainer: { width: 360, minWidth: 240 },
  chartHeading: { margin: 0, fontSize: 16 },
  chart: { marginTop: 8 },
  footer: { marginTop: 12, color: '#64748b' },
}
