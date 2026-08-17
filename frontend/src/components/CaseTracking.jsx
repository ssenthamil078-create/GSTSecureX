import { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

const STATUS_STEPS = [
  { key: 'registered', label: 'Registration Submitted' },
  { key: 'alerted', label: 'Alert Sent to PAN Holder' },
  { key: 'verifying', label: 'Identity Verification' },
  { key: 'verified', label: 'Verified' },
  { key: 'frozen', label: 'Frozen (Suspicious)' },
  { key: 'complaint_filed', label: 'Complaint Filed' },
];

function CaseTracking({ localResult }) {
  const [caseId, setCaseId] = useState('');
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const pollRef = useRef(null);

  useEffect(() => {
    if (localResult) {
      setCaseData({
        id: 'LOCAL-SESSION',
        status: localResult.verified ? 'verified' : 'frozen',
        similarity: localResult.similarity,
        lastUpdated: new Date().toLocaleTimeString(),
      });
    }
  }, [localResult]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const fetchCaseStatus = async (id) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/case-status/' + id);
      if (!response.ok) throw new Error('Case not found');
      setCaseData(await response.json());
    } catch (err) {
      setError('Could not fetch live case data (backend not connected, or invalid case ID).');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = () => {
    if (!caseId.trim()) return;
    fetchCaseStatus(caseId.trim());
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => fetchCaseStatus(caseId.trim()), 5000);
  };

  const handleKeyPress = (e) => { if (e.key === 'Enter') handleTrack(); };

  const currentStepIndex = caseData ? STATUS_STEPS.findIndex((s) => s.key === caseData.status) : -1;

  const plainSummary = caseData
    ? (caseData.status === 'verified'
        ? 'Your identity was confirmed. Registration is proceeding normally.'
        : caseData.status === 'frozen'
        ? 'Your registration is on hold due to a face-match issue. A complaint has been filed for investigation.'
        : 'Your case is still being processed.')
    : null;

  return (
    <div>
      <div className="pw-page-title">Track Your Case</div>
      <div className="pw-page-subtitle">Enter your case ID to see real-time status of your registration</div>

      <div className="pw-track-search">
        <input
          type="text"
          className="pw-track-input"
          value={caseId}
          onChange={(e) => setCaseId(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter Case ID (e.g. CASE-12345)"
        />
        <button className="pw-btn pw-btn-primary" onClick={handleTrack}>
          Track <ArrowRight size={16} />
        </button>
      </div>

      {loading && <p style={{ color: 'var(--ink-soft)', fontSize: '0.85rem' }}>Fetching latest status...</p>}
      {error && <p style={{ color: 'var(--amber)', fontSize: '0.85rem' }}>{error}</p>}

      {caseData && (
        <div className="pw-card">
          <p style={{
            fontWeight: 700, fontSize: '1rem', margin: '0 0 0.75rem',
            color: caseData.status === 'frozen' ? 'var(--red)' : 'var(--green)'
          }}>
            {plainSummary}
          </p>
          <p style={{ fontSize: '0.85rem', margin: '0.2rem 0' }}><strong>Case ID:</strong> {caseData.id}</p>
          <p style={{ fontSize: '0.85rem', margin: '0.2rem 0' }}><strong>Last updated:</strong> {caseData.lastUpdated}</p>
          {caseData.similarity !== undefined && (
            <p style={{ fontSize: '0.85rem', margin: '0.2rem 0' }}>
              <strong>Match distance:</strong> {caseData.similarity.toFixed(4)} (lower = closer match)
            </p>
          )}

          <div style={{ marginTop: '1rem' }}>
            {STATUS_STEPS.map((step, idx) => {
              const isPast = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.key} style={{
                  display: 'flex', alignItems: 'center', marginBottom: '0.5rem',
                  padding: isCurrent ? '0.4rem 0.6rem' : '0',
                  backgroundColor: isCurrent ? 'var(--amber-soft)' : 'transparent',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    width: '12px', height: '12px', borderRadius: '50%',
                    backgroundColor: isPast ? (step.key === 'frozen' ? 'var(--red)' : 'var(--green)') : 'var(--border)',
                    marginRight: '0.7rem', flexShrink: 0,
                  }} />
                  <span style={{ fontSize: '0.85rem', fontWeight: isCurrent ? 700 : 400 }}>{step.label}</span>
                  {isCurrent && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: 'var(--amber)' }}>← current</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!caseData && !loading && (
        <p style={{ textAlign: 'center', color: 'var(--ink-soft)', fontSize: '0.85rem', marginTop: '1.5rem' }}>
          Enter a case ID above, or complete a registration to see your live status here.
        </p>
      )}
    </div>
  );
}

export default CaseTracking;
