// Calculates head pitch angle from MediaPipe face landmarks
export function calculateTilt(landmarks) {
  if (!landmarks || landmarks.length === 0) return 0;

  // Nose tip = index 1 in MediaPipe FaceMesh
  const nose = landmarks[1];
  // Left ear landmark (for horizontal reference) — index 234
  const leftEar = landmarks[234];
  // Right ear landmark — index 454
  const rightEar = landmarks[454];

  // Average ear position for "side reference"
  const earMidZ = (leftEar.z + rightEar.z) / 2;

  // Positive tilt means head leaning back
  const tilt = nose.z - earMidZ;

  return tilt; // ~0.02 normal, >0.06 leaning back
}
