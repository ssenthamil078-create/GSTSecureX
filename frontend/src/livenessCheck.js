import * as faceapi from 'face-api.js';

// Calculate Eye Aspect Ratio (EAR) from 6 eye landmark points
function calculateEAR(eyePoints) {
  const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

  const vertical1 = dist(eyePoints[1], eyePoints[5]);
  const vertical2 = dist(eyePoints[2], eyePoints[4]);
  const horizontal = dist(eyePoints[0], eyePoints[3]);

  return (vertical1 + vertical2) / (2.0 * horizontal);
}

export async function detectBlink(videoEl, durationMs = 4000) {
  return new Promise((resolve) => {
    const earHistory = [];
    let blinkDetected = false;
    const startTime = Date.now();
    const EAR_THRESHOLD = 0.25; // below this = eyes likely closed

    const interval = setInterval(async () => {
      if (Date.now() - startTime > durationMs || blinkDetected) {
        clearInterval(interval);
        resolve(blinkDetected);
        return;
      }

      const result = await faceapi
        .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (!result) return;

      const leftEye = result.landmarks.getLeftEye();
      const rightEye = result.landmarks.getRightEye();

      const leftEAR = calculateEAR(leftEye);
      const rightEAR = calculateEAR(rightEye);
      const avgEAR = (leftEAR + rightEAR) / 2.0;

      earHistory.push(avgEAR);

      // Need a dip below threshold followed by a rise back up = a blink
      if (earHistory.length >= 3) {
        const recent = earHistory.slice(-3);
        const dipped = recent[1] < EAR_THRESHOLD;
        const recoveredAfter = recent[2] > EAR_THRESHOLD;
        const wasOpenBefore = recent[0] > EAR_THRESHOLD;

        if (wasOpenBefore && dipped && recoveredAfter) {
          blinkDetected = true;
        }
      }
    }, 200); // check every 200ms
  });
}
