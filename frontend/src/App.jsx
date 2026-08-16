import { useEffect, useState } from 'react';
import { loadModels } from './testModels';
import UploadAadhaar from './components/UploadAadhaar';
import FaceScan from './components/FaceScan';
import VerificationOutcome from './components/VerificationOutcome';
import Dashboard from './components/Dashboard';

function App() {
  const [view, setView] = useState('flow'); // flow | dashboard
  const [stage, setStage] = useState('upload'); // upload -> scan -> outcome
  const [referenceEmbedding, setReferenceEmbedding] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadModels();
  }, []);

  const handleEmbeddingGenerated = (embedding) => {
    setReferenceEmbedding(embedding);
    setStage('scan');
  };

  const handleVerificationResult = (verified, similarity) => {
    setResult({ verified, similarity });
    setStage('outcome');
  };

  const handleNoCameraFallback = () => {
    console.log('No camera - route to Voice/CSC path');
  };

  const handleRestart = () => {
    setStage('scan');
    setResult(null);
  };

  const registrationStatusText = result
    ? (result.verified ? 'Verified (' + result.similarity.toFixed(4) + ')' : 'Frozen (' + result.similarity.toFixed(4) + ')')
    : null;

  return (
    <div>
      <nav style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        padding: '1rem',
        borderBottom: '1px solid #ddd'
      }}>
        <button onClick={() => setView('flow')} style={{ fontWeight: view === 'flow' ? 'bold' : 'normal' }}>
          Registration Flow
        </button>
        <button onClick={() => setView('dashboard')} style={{ fontWeight: view === 'dashboard' ? 'bold' : 'normal' }}>
          Dashboard
        </button>
      </nav>

      {view === 'flow' && (
        <>
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
          {stage === 'outcome' && result && (
            <VerificationOutcome
              verified={result.verified}
              similarity={result.similarity}
              onRestart={handleRestart}
            />
          )}
        </>
      )}

      {view === 'dashboard' && (
        <Dashboard registrationStatus={registrationStatusText} verificationHistory={[]} />
      )}
    </div>
  );
}

export default App;
