import * as faceapi from 'face-api.js';

export async function loadModels() {
  const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
  await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  console.log('✅ Models loaded successfully');
}
