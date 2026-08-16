import { useEffect } from 'react';
import { loadModels } from './testModels';
import UploadAadhaar from './components/UploadAadhaar';

function App() {
  useEffect(() => {
    loadModels();
  }, []);

  const handleFaceDetected = (croppedFaceDataUrl, detection) => {
    console.log('Face detected, cropped image ready:', croppedFaceDataUrl.slice(0, 50) + '...');
  };

  return (
    <div>
      <UploadAadhaar onFaceDetected={handleFaceDetected} />
    </div>
  );
}

export default App;
