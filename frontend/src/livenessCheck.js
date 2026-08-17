import * as faceapi from 'face-api.js';

function calculateEAR(eyePoints) {
  const dist = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);
  const vertical1 = dist(eyePoints[1], eyePoints[5]);
  const vertical2 = dist(eyePoints[2], eyePoints[4]);
  const horizontal = dist(eyePoints[0], eyePoints[3]);
  return (vertical1 + vertical2) / (2.0 * horizontal);
}

export async function detectBlink(videoEl, durationMs = 7000) {
  return new Promise((resolve) => {
    const earHistory = [];
    let baseline = null;
    let blinkDetected = false;
    const startTime = Date.now();

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
      const avgEAR = (calculateEAR(leftEye) + calculateEAR(rightEye)) / 2.0;

      earHistory.push(avgEAR);

      // Establish baseline from first 5 readings (assume eyes open at start)
      if (baseline === null && earHistory.length >= 5) {
        baseline = earHistory.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
      }

      if (baseline !== null && earHistory.length >= 3) {
        const recent = earHistory.slice(-3);
        const dipThreshold = baseline * 0.75; // 25% relative drop = likely blink
        const dipped = recent[1] < dipThreshold;
        const recoveredAfter = recent[2] > dipThreshold;
        const wasOpenBefore = recent[0] > dipThreshold;

        if (wasOpenBefore && dipped && recoveredAfter) {
          blinkDetected = true;
        }
      }
    }, 150);
  });
}
