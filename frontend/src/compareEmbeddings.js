export function euclideanDistance(vecA, vecB) {
  let sum = 0;
  for (let i = 0; i < vecA.length; i++) {
    const diff = vecA[i] - vecB[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

// Standard face-api.js threshold is ~0.6; lower = same person, higher = different
export const DISTANCE_THRESHOLD = 0.55;

export function isVerified(distance) {
  return distance <= DISTANCE_THRESHOLD;
}
