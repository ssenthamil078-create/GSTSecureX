import { useEffect, useState } from 'react';
import { loadModels } from './testModels';
import UploadAadhaar from './components/UploadAadhaar';
import FaceScan from './components/FaceScan';

function App() {
  const [stage, setStage] = useState('upload'); // upload -> scan

  useEffect(() => {
    loadModels();
  }, []);

  const handleEmbeddingGenerated = (embedding) => {
    console.log('Reference embedding ready, length:', embedding.length);
    setStage('scan'); // move to live verification stage
  };

  const handleCapture = (capturedDataUrl, videoEl) => {
    console.log('Live frame captured:', capturedDataUrl.slice(0, 50) + '...');
    // Hour 12-14 (liveness check) and Hour 16-18 (live embedding) build on this
  };

  const handleNoCameraFallback = () => {
    console.log('No camera - route to Voice/CSC path');
  };

  return (
    <div>
      {stage === 'upload' && (
        <UploadAadhaar onEmbeddingGenerated={handleEmbeddingGenerated} />
      )}
      {stage === 'scan' && (
        <FaceScan onCapture={handleCapture} onNoCameraFallback={handleNoCameraFallback} />
      )}
    </div>
  );
}

export default App;
