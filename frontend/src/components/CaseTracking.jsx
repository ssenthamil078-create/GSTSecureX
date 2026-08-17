import { useState, useEffect, useRef } from 'react';

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
      const data = await response.json();
      setCaseData(data);
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

  const currentStepIndex = caseData ? STATUS_STEPS.findIndex((s) => s.key === caseData.status) : -1;

  const plainSummary = caseData
    ? (caseData.status === 'verified'
        ? 'Your identity was confirmed. Registration is proceeding normally.'
        : caseData.status === 'frozen'
        ? 'Your registration is on hold due to a face-match issue. A complaint has been filed for investigation.'
        : 'Your case is still being processed.')
    : null;

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', padding: '1.5rem' }}>
      <h2 style={{ textAlign: 'center' }}>Track Your Case</h2>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <input
          type="text" value={caseId} onChange={(e) => setCaseId(e.target.value)}
          placeholder="Enter Case ID (e.g. CASE-12345)"
          style={{ flex: 1, padding: '0.6rem', border: '1px solid #ccc', borderRadius: '6px' }}
        />
        <button onClick={handleTrack} style={{ padding: '0.6rem 1.2rem' }}>Track</button>
      </div>

      {loading && <p style={{ textAlign: 'center' }}>Fetching latest status...</p>}
      {error && <p style={{ textAlign: 'center', color: '#a67c00' }}>{error}</p>}

      {caseData && (
        <div style={{ padding: '1rem', border: '1px solid #ddd', borderRadius: '10px' }}>
          <p style={{
            fontWeight: 'bold', fontSize: '1.1rem',
            color: caseData.status === 'frozen' ? '#b00020' : '#0a7d34'
          }}>
            {plainSummary}
          </p>
          <p><strong>Case ID:</strong> {caseData.id}</p>
          <p><strong>Last updated:</strong> {caseData.lastUpdated}</p>
          {caseData.similarity !== undefined && (
            <p><strong>Match distance:</strong> {caseData.similarity.toFixed(4)} (lower = closer match)</p>
          )}

          <div style={{ marginTop: '1rem' }}>
            {STATUS_STEPS.map((step, idx) => {
              const isPast = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={step.key} style={{
                  display: 'flex', alignItems: 'center', marginBottom: '0.5rem',
                  padding: isCurrent ? '0.4rem 0.6rem' : '0',
                  backgroundColor: isCurrent ? '#fff8e1' : 'transparent',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '50%',
                    backgroundColor: isPast ? (step.key === 'frozen' ? '#b00020' : '#0a7d34') : '#ccc',
                    marginRight: '0.75rem', flexShrink: 0,
                  }} />
                  <span style={{ fontWeight: isCurrent ? 'bold' : 'normal' }}>{step.label}</span>
                  {isCurrent && <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#a67c00' }}>← current</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!caseData && !loading && (
        <p style={{ textAlign: 'center', color: '#777' }}>
          Enter a case ID above, or complete a registration to see your live status here.
        </p>
      )}
    </div>
  );
}

export default CaseTracking;
