import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { loadModels } from './testModels';
import UploadAadhaar from './components/UploadAadhaar';
import FaceScan from './components/FaceScan';
import VerificationOutcome from './components/VerificationOutcome';
import Dashboard from './components/Dashboard';
import Chatbot from './components/Chatbot';
import CaseTracking from './components/CaseTracking';
import Footer from './components/Footer';
import './theme.css';

const STEPS = [
  { key: 'upload', num: 1, label: 'ENROLL', sub: 'Upload Aadhaar Photo' },
  { key: 'scan', num: 2, label: 'VERIFY', sub: 'Identity Verification' },
  { key: 'outcome', num: 3, label: 'OUTCOME', sub: 'Registration Outcome' },
];

function App() {
  const [modelsReady, setModelsReady] = useState(false);
  const [view, setView] = useState('flow');
  const [stage, setStage] = useState('upload');
  const [referenceEmbedding, setReferenceEmbedding] = useState(null);
  const [result, setResult] = useState(null);
  const [chatContext, setChatContext] = useState(null);

  useEffect(() => { loadModels().then(() => setModelsReady(true)); }, []);

  const handleEmbeddingGenerated = (embedding) => {
    setReferenceEmbedding(embedding);
    setStage('scan');
  };

  const handleVerificationResult = (verified, distance) => {
    setResult({ verified, similarity: distance });
    setStage('outcome');
    setChatContext({ verified, similarity: distance, justUpdated: true });
  };

  const handleNoCameraFallback = () => console.log('No camera - route to Voice/CSC path');

  const handleFullReset = () => {
    setStage('upload');
    setReferenceEmbedding(null);
    setResult(null);
    setView('flow');
  };

  const registrationStatusText = result
    ? (result.verified ? 'Verified (' + result.similarity.toFixed(4) + ')' : 'Frozen (' + result.similarity.toFixed(4) + ')')
    : null;

  const currentStepIdx = STEPS.findIndex((s) => s.key === stage);

  return (
    <div>
      <header className="pw-header">
        <div className="pw-brand">
          <div className="pw-brand-icon"><ShieldCheck size={20} color="white" /></div>
          <div className="pw-brand-text">
            <div className="pw-wordmark">GSTSecureX</div>
            <div className="pw-tagline">GST Fraud Monitor</div>
          </div>
        </div>
        <nav className="pw-nav">
          <button className={view === 'flow' ? 'active' : ''} onClick={() => setView('flow')}>Registration Flow</button>
          <button className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>Dashboard</button>
          <button className={view === 'chatbot' ? 'active' : ''} onClick={() => setView('chatbot')}>Assistant</button>
          <button className={view === 'tracking' ? 'active' : ''} onClick={() => setView('tracking')}>Track Case</button>
          <button className="pw-new-btn" onClick={handleFullReset}>+ New Registration</button>
        </nav>
      </header>

      {!modelsReady && (
        <div className="pw-loading">
          <div className="pw-spinner" />
          <span>LOADING_FACE_MODELS...</span>
        </div>
      )}

      {modelsReady && (
        <>
          {view === 'flow' && (
            <>
              <div className="pw-stepper">
                {STEPS.map((s, idx) => (
                  <div key={s.key} style={{ display: 'flex', alignItems: 'flex-start' }}>
                    <div className="pw-step-item">
                      <div className={'pw-step-circle ' + (idx < currentStepIdx ? 'done' : idx === currentStepIdx ? 'current' : '')}>
                        {s.num}
                      </div>
                      <div className="pw-step-label">{s.label}</div>
                      <div className="pw-step-sublabel">{s.sub}</div>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={'pw-step-connector ' + (idx < currentStepIdx ? 'done' : '')} />
                    )}
                  </div>
                ))}
              </div>

              <div className="pw-page">
                {stage === 'upload' && <UploadAadhaar onEmbeddingGenerated={handleEmbeddingGenerated} />}
                {stage === 'scan' && (
                  <FaceScan
                    referenceEmbedding={referenceEmbedding}
                    onVerificationResult={handleVerificationResult}
                    onNoCameraFallback={handleNoCameraFallback}
                  />
                )}
                {stage === 'outcome' && result && (
                  <VerificationOutcome verified={result.verified} similarity={result.similarity} onRestart={handleFullReset} />
                )}
              </div>
            </>
          )}

          {view === 'dashboard' && (
            <div className="pw-page pw-page-wide">
              <Dashboard registrationStatus={registrationStatusText} onNavigate={setView} onNewRegistration={handleFullReset} />
            </div>
          )}
          {view === 'chatbot' && <div className="pw-page"><Chatbot caseContext={chatContext} /></div>}
          {view === 'tracking' && <div className="pw-page"><CaseTracking localResult={result} /></div>}
        </>
      )}

      <Footer />
    </div>
  );
}

export default App;
