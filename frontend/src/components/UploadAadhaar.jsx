import { useState, useRef } from 'react';
import * as faceapi from 'face-api.js';

function UploadAadhaar({ onFaceDetected }) {
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');
  const [croppedFace, setCroppedFace] = useState(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
    setCroppedFace(null);
    setStatus('Image loaded, detecting face...');
  };

  const handleImageLoad = async () => {
    const img = imgRef.current;
    if (!img) return;

    try {
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks();

      if (!detection) {
        setStatus('No face detected. Try a clearer photo.');
        return;
      }

      setStatus('Face detected!');

      const box = detection.detection.box;
      const canvas = canvasRef.current;
      canvas.width = box.width;
      canvas.height = box.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(
        img,
        box.x, box.y, box.width, box.height,
        0, 0, box.width, box.height
      );

      const croppedDataUrl = canvas.toDataURL('image/jpeg');
      setCroppedFace(croppedDataUrl);

      if (onFaceDetected) {
        onFaceDetected(croppedDataUrl, detection);
      }
    } catch (err) {
      console.error('Detection error:', err);
      setStatus('Error during detection: ' + err.message);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h3>Upload Aadhaar Photo</h3>
      <input type="file" accept="image/*" onChange={handleFileChange} />

      {status && <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>{status}</p>}

      {preview && (
        <div style={{ marginTop: '1rem' }}>
          <img
            ref={imgRef}
            src={preview}
            alt="Aadhaar preview"
            onLoad={handleImageLoad}
            style={{ maxWidth: '300px', borderRadius: '8px' }}
            crossOrigin="anonymous"
          />
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {croppedFace && (
        <div style={{ marginTop: '1rem' }}>
          <p>Cropped face:</p>
          <img
            src={croppedFace}
            alt="Cropped face"
            style={{ width: '150px', border: '2px solid green', borderRadius: '8px' }}
          />
        </div>
      )}
    </div>
  );
}

export default UploadAadhaar;
