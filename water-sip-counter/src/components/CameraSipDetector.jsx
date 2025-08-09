import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

const CameraSipDetector = ({ onSipDetected }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [model, setModel] = useState(null);
  const [lastSipTime, setLastSipTime] = useState(0);
  const [isEnabled, setIsEnabled] = useState(false);
  const sipCooldown = 2000; // Minimum time between sips (2 seconds)

  useEffect(() => {
    const loadModel = async () => {
      await tf.ready();
      const loadedModel = await cocoSsd.load();
      setModel(loadedModel);
    };

    loadModel();
  }, []);

  useEffect(() => {
    const setupCamera = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error("getUserMedia is not supported in this browser");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            detectFrame();
          };
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };

    const detectFrame = async () => {
      if (videoRef.current && model) {
        const predictions = await model.detect(videoRef.current);
        renderPredictions(predictions);
        requestAnimationFrame(detectFrame);
      }
    };

    const renderPredictions = (predictions) => {
      if (!canvasRef.current) return;

      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      // Set canvas dimensions to match video
      ctx.canvas.width = videoRef.current.videoWidth;
      ctx.canvas.height = videoRef.current.videoHeight;

      for (let i = 0; i < predictions.length; i++) {
        const { class: className, score, bbox } = predictions[i];
        const [x, y, width, height] = bbox;

        if (className === "bottle" && score > 0.6) {
          // Draw bounding box.
          ctx.strokeStyle = "#00FF00";
          ctx.lineWidth = 2;
          ctx.strokeRect(x, y, width, height);

          // Draw label background.
          ctx.fillStyle = "#00FF00";
          ctx.fillRect(x, y - 20, width, 20);

          // Draw label text.
          ctx.font = "12px Arial";
          ctx.fillStyle = "#000000";
          ctx.fillText(`${className} (${(score * 100).toFixed(1)}%)`, x, y - 5);

          // Basic sip detection logic (check if bottle is close to the top of the frame)
          if (y < ctx.canvas.height / 3) {
            const now = Date.now();
            if (now - lastSipTime > sipCooldown) {
              onSipDetected("camera", 30); // Call the onSipDetected function
              setLastSipTime(now);
            }
          }
        }
      }
    };

    if (model) {
      setupCamera();
    }
  }, [model, onSipDetected, lastSipTime]);

  const toggleCamera = () => {
    setIsEnabled(!isEnabled);
  };

  return (
    <div style={{ marginTop: 20 }}>
      <button
        onClick={toggleCamera}
        style={{
          padding: "8px 16px",
          background: isEnabled ? "#ef4444" : "#22c55e",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}
      >
        {isEnabled ? "Disable" : "Enable"} Camera Detection
      </button>
      {isEnabled && (
        <div style={{ marginTop: 10, position: "relative" }}>
          <video
            ref={videoRef}
            style={{ width: "100%", maxWidth: 640, borderRadius: 8 }}
            autoPlay
            muted
          />
          <canvas
            ref={canvasRef}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CameraSipDetector;
