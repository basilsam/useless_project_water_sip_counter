

# Water Sip Counter 🎯

**Team Name:** MUNGIKKAPPAL
**Team Lead:** Basil Sam Abraham — CUSAT

---

## Project Description

A fun web app that **counts how many sips you take to finish a glass/bottle of water**.
It works in three modes:

1. **Manual mode** — tap a button each time you sip.
2. **Timer mode** — log sips automatically at set intervals.
3. **Camera mode** — detects when you move a bottle/glass to your mouth and logs a sip automatically.

Your sip history is displayed in a chart, stored locally, and can be exported as CSV.

---

## Problem

Nobody actually *needs* to know how many sips they take… but what if you could?
We solve the world’s most unnecessary hydration mystery.

---

## Solution

We track each sip in real-time and show patterns over time.
We even use **MediaPipe + TensorFlow object detection** to spot when you’re drinking, no button press required.

---

## Technologies / Components Used

### Software

* **Languages:** JavaScript (ES2022)
* **Frameworks:** React (Vite)
* **Libraries:**

  * MediaPipe Hands + FaceMesh
  * TensorFlow\.js + COCO-SSD (object detection)
  * Recharts (charts)
  * Tailwind CSS (styling)
* **Tools:** Node.js, npm, Vite

### Hardware

* Laptop/PC with webcam

---

## Project Structure

```
water-sip-counter/
├─ public/
│  ├─ index.html
│  ├─ screenshots/
│  │  ├─ main-ui.png
│  │  ├─ camera-detection.png
│  │  └─ chart.png
│  └─ diagrams/workflow.png
├─ src/
│  ├─ components/
│  │  ├─ SipButton.jsx
│  │  ├─ SipList.jsx
│  │  ├─ SipChart.jsx
│  │  ├─ CameraSipDetector.jsx
│  │  └─ ToggleSwitch.jsx
│  ├─ utils/
│  │  ├─ calculateDistance.js
│  │  └─ calculateTilt.js
│  ├─ App.jsx
│  ├─ main.jsx
│  └─ index.css
├─ package.json
├─ vite.config.js
└─ README.md
```

---

## Installation

```bash
git clone https://github.com/<yourusername>/water-sip-counter.git
cd water-sip-counter
npm install
```

---

## Run

```bash
npm run dev

```

---

## How to Use

1. **Manual mode** — Click the "Log Sip" button.
2. **Timer mode** — Enter seconds, click "Start".
3. **Camera mode** — Toggle camera on:

   * Detects **glass/bottle in hand** + **movement toward mouth**.
   * Logs a sip when conditions match.
4. Export history via **"Export CSV"**.

---

## Implementation

* **Detection**:

  * COCO-SSD runs every **10 frames** to detect a bottle/cup.
  * MediaPipe Hands tracks hand position.
  * When the object is near mouth landmarks (FaceMesh), it counts as a sip.
* **Cooldown**: 2 seconds between sips to avoid duplicates.
* **Storage**: Sips are saved in `localStorage`.

---

## Screenshots

![Main UI](public/screenshots/main-ui.png)


---



---

## Team Contributions

* **Basil Sam Abraham** — UI, camera detection logic, charting.

---

## Future Improvements

* Mobile PWA support
* Cloud sync
* Better object detection for transparent cups

---

## License

MIT License — free to use and modify.

---

If you want, I can now package **all source code for these components** exactly in this structure so you can run it right away in the hackathon.

Do you want me to go ahead and write **the full working code** for `CameraSipDetector.jsx` with bottle detection + movement toward mouth? That’s the most technical part.
