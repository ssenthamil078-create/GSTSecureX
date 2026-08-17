import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import { detectBlink } from '../livenessCheck';
import { euclideanDistance, isVerified, DISTANCE_THRESHOLD } from '../compareEmbeddings';

function FaceScan({ referenceEmbedding, onVerificationResult, onNoCameraFallback }) {
  const [hasCamera, setHasCamera] = useState(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [livenessStatus, setLivenessStatus] = useState('idle');
  const [verifyStatus, setVerifyStatus] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    checkCamera();
    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkCamera = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((d) => d.kind === 'videoinput');
      if (cameras.length === 0) {
        setHasCamera(false);
        if (onNoCameraFallback) onNoCameraFallback();
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      setHasCamera(true);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      console.warn('Camera not available:', err.message);
      setHasCamera(false);
      setError('Camera access denied or unavailable.');
      if (onNoCameraFallback) onNoCameraFallback();
    }
  };

  const runLivenessCheck = async () => {
    setLivenessStatus('checking');
    const video = videoRef.current;
    if (!video) return;
    const blinkFound = await detectBlink(video, 7000);
    setLivenessStatus(blinkFound ? 'passed' : 'failed');
  };

  const skipLiveness = () => {
    console.log('Liveness skipped (demo mode)');
    setLivenessStatus('passed');
  };

  const captureAndVerify = async () => {
    const video = videoRef.current;
    if (!video) return;
    setVerifyStatus('Generating live embedding...');

    try {
      const detection = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setVerifyStatus('No face detected during capture. Try again.');
        return;
      }

      const liveEmbedding = Array.from(detection.descriptor);

      if (!referenceEmbedding) {
        setVerifyStatus('No reference embedding available to compare against.');
        return;
      }

      const distance = euclideanDistance(liveEmbedding, referenceEmbedding);
      const verified = isVerified(distance);

      setVerifyStatus(
        (verified ? 'VERIFIED' : 'NOT VERIFIED') +
        ' — match distance: ' + distance.toFixed(4) +
        ' (threshold: ' + DISTANCE_THRESHOLD + ', lower = closer match)'
      );

      if (onVerificationResult) {
        onVerificationResult(verified, distance, liveEmbedding);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setVerifyStatus('Error: ' + err.message);
    }
  };

  if (hasCamera === null) {
    return <p style={{ textAlign: 'center' }}>Checking camera availability...</p>;
  }

  if (hasCamera === false) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontWeight: 'bold', color: '#b00' }}>No camera detected.</p>
        <p>{error}</p>
        <p>Falling back to Voice / CSC verification path.</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h3>Live Face Scan</h3>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{ width: '320px', borderRadius: '8px', border: '2px solid #333' }}
      />

      <div style={{ marginTop: '1rem' }}>
        {livenessStatus === 'idle' && (
          <>
            <p>Please blink naturally when you click below.</p>
            <button onClick={runLivenessCheck} style={{ padding: '0.5rem 1.5rem', fontSize: '1rem' }}>
              Start Liveness Check
            </button>
          </>
        )}

        {livenessStatus === 'checking' && (
          <p style={{ fontWeight: 'bold' }}>Checking... please blink now (up to 7 sec).</p>
        )}

        {livenessStatus === 'passed' && !verifyStatus && (
          <>
            <p style={{ fontWeight: 'bold', color: 'green' }}>Liveness confirmed!</p>
            <button onClick={captureAndVerify} style={{ padding: '0.5rem 1.5rem', fontSize: '1rem' }}>
              Capture & Verify
            </button>
          </>
        )}

        {livenessStatus === 'failed' && (
          <>
            <p style={{ fontWeight: 'bold', color: '#b00' }}>No blink detected. Try again in good lighting, facing the camera directly.</p>
            <button onClick={runLivenessCheck} style={{ padding: '0.5rem 1.5rem', marginRight: '0.5rem' }}>
              Retry Liveness Check
            </button>
            <button onClick={skipLiveness} style={{ padding: '0.5rem 1.5rem', backgroundColor: '#eee' }}>
              Skip Liveness (Demo Mode)
            </button>
          </>
        )}

        {verifyStatus && (
          <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{verifyStatus}</p>
        )}
      </div>
    </div>
  );
}

export default FaceScan;
