import { useState, useRef } from 'react';
import * as faceapi from 'face-api.js';
import { UploadCloud, ShieldCheck, Lock, BellRing, Radar } from 'lucide-react';

function UploadAadhaar({ onEmbeddingGenerated }) {
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState('');
  const [croppedFace, setCroppedFace] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
    setCroppedFace(null);
    setStatus('Image loaded, detecting face...');
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    processFile(e.dataTransfer.files[0]);
  };

  const handleImageLoad = async () => {
    const img = imgRef.current;
    if (!img) return;
    try {
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus('No face detected. Try a clearer photo.');
        return;
      }

      setStatus('Face detected. Generating embedding...');
      const box = detection.detection.box;
      const canvas = canvasRef.current;
      canvas.width = box.width;
      canvas.height = box.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, box.x, box.y, box.width, box.height, 0, 0, box.width, box.height);
      setCroppedFace(canvas.toDataURL('image/jpeg'));

      const embedding = Array.from(detection.descriptor);
      setStatus('Reference embedding generated.');

      URL.revokeObjectURL(preview);
      setPreview(null);

      if (onEmbeddingGenerated) onEmbeddingGenerated(embedding);
    } catch (err) {
      console.error('Detection error:', err);
      setStatus('Error: ' + err.message);
    }
  };

  return (
    <div>
      <div className="pw-card">
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', margin: '0 0 0.3rem' }}>
          Enroll — Upload Aadhaar Photo
        </h2>
        <p style={{ color: 'var(--ink-soft)', fontSize: '0.88rem', marginTop: 0 }}>
          Upload a clear Aadhaar card photo. Used once to generate a reference pattern, then discarded for your privacy.
        </p>

        <div
          className={'pw-dropzone' + (dragActive ? ' drag-active' : '')}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: 'pointer' }}
        >
          <div className="pw-dropzone-icon"><UploadCloud size={34} /></div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Drag & drop your file here</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--ink-soft)', margin: '0.3rem 0' }}>or</div>
          <button type="button" className="pw-btn pw-btn-primary" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            Choose File
          </button>
          <div className="pw-dropzone-sub">JPG, PNG up to 5MB</div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {status && (
          <div className="pw-console" style={{ marginTop: '1rem' }}>
            <div className="pw-console-label">STATUS</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{status}</div>
          </div>
        )}

        {preview && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <img
              ref={imgRef}
              src={preview}
              alt="Aadhaar preview"
              onLoad={handleImageLoad}
              className="pw-preview-img"
              style={{ maxWidth: '240px' }}
              crossOrigin="anonymous"
            />
          </div>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {croppedFace && (
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--ink-soft)' }}>Detected face</p>
            <img src={croppedFace} alt="Cropped face" className="pw-preview-img" style={{ width: '110px', border: '2px solid var(--green)' }} />
          </div>
        )}

        <div className="pw-banner pw-banner-info" style={{ marginTop: '1.25rem' }}>
          <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
          <span>Your data is safe with us. We store only encrypted embeddings, never the raw image.</span>
        </div>
      </div>

      <div className="pw-feature-grid">
        <div className="pw-feature">
          <div className="pw-feature-icon" style={{ background: 'var(--green-soft)' }}><ShieldCheck size={20} color="var(--green)" /></div>
          <div className="pw-feature-title">Secure & Encrypted</div>
          <div className="pw-feature-sub">Data protection by design</div>
        </div>
        <div className="pw-feature">
          <div className="pw-feature-icon" style={{ background: 'var(--blue-soft)' }}><Lock size={20} color="var(--blue)" /></div>
          <div className="pw-feature-title">Privacy First</div>
          <div className="pw-feature-sub">No raw images are stored</div>
        </div>
        <div className="pw-feature">
          <div className="pw-feature-icon" style={{ background: 'var(--amber-soft)' }}><BellRing size={20} color="var(--amber)" /></div>
          <div className="pw-feature-title">Instant Alerts</div>
          <div className="pw-feature-sub">Real-time fraud monitoring</div>
        </div>
        <div className="pw-feature">
          <div className="pw-feature-icon" style={{ background: 'var(--purple-soft)' }}><Radar size={20} color="var(--purple)" /></div>
          <div className="pw-feature-title">End-to-End Tracking</div>
          <div className="pw-feature-sub">Track every step of your case</div>
        </div>
      </div>
    </div>
  );
}

export default UploadAadhaar;
