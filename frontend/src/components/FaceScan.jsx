import { useState, useRef, useEffect } from 'react';
import { detectBlink } from '../livenessCheck';

function FaceScan({ onCapture, onNoCameraFallback }) {
  const [hasCamera, setHasCamera] = useState(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [livenessStatus, setLivenessStatus] = useState('idle'); // idle -> checking -> passed -> failed
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

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
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

    const blinkFound = await detectBlink(video, 5000);

    if (blinkFound) {
      setLivenessStatus('passed');
    } else {
      setLivenessStatus('failed');
    }
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const capturedDataUrl = canvas.toDataURL('image/jpeg');

    if (onCapture) {
      onCapture(capturedDataUrl, video);
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
          <p style={{ fontWeight: 'bold' }}>Checking... please blink now.</p>
        )}

        {livenessStatus === 'passed' && (
          <>
            <p style={{ fontWeight: 'bold', color: 'green' }}>Liveness confirmed!</p>
            <button onClick={captureFrame} style={{ padding: '0.5rem 1.5rem', fontSize: '1rem' }}>
              Capture
            </button>
          </>
        )}

        {livenessStatus === 'failed' && (
          <>
            <p style={{ fontWeight: 'bold', color: '#b00' }}>No blink detected. Try again.</p>
            <button onClick={runLivenessCheck} style={{ padding: '0.5rem 1.5rem', fontSize: '1rem' }}>
              Retry Liveness Check
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default FaceScan;
