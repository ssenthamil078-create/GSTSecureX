import { useEffect, useState } from 'react';
import { loadModels } from './testModels';
import UploadAadhaar from './components/UploadAadhaar';
import FaceScan from './components/FaceScan';

function App() {
  const [stage, setStage] = useState('upload');
  const [referenceEmbedding, setReferenceEmbedding] = useState(null);

  useEffect(() => {
    loadModels();
  }, []);

  const handleEmbeddingGenerated = (embedding) => {
    console.log('Reference embedding ready, length:', embedding.length);
    setReferenceEmbedding(embedding);
    setStage('scan');
  };

  const handleVerificationResult = (verified, similarity, liveEmbedding) => {
    console.log('Verification result:', verified, 'similarity:', similarity);
    // Hour 18-20: wire this into Verified?/Freeze decision branch
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
        <FaceScan
          referenceEmbedding={referenceEmbedding}
          onVerificationResult={handleVerificationResult}
          onNoCameraFallback={handleNoCameraFallback}
        />
      )}
    </div>
  );
}

export default App;
