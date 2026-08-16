import { useState } from 'react';

function UploadAadhaar({ onImageSelected }) {
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);

    if (onImageSelected) {
      onImageSelected(file, imageUrl);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h3>Upload Aadhaar Photo</h3>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {preview && (
        <div style={{ marginTop: '1rem' }}>
          <img
            src={preview}
            alt="Aadhaar preview"
            style={{ maxWidth: '300px', borderRadius: '8px' }}
          />
        </div>
      )}
    </div>
  );
}

export default UploadAadhaar;
