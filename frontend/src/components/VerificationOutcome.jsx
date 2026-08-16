import { useState } from 'react';

function VerificationOutcome({ verified, similarity, onRestart }) {
  const [reportStatus, setReportStatus] = useState('');

  const notifyBackend = async () => {
    setReportStatus('Sending outcome to backend...');
    try {
      const response = await fetch('http://localhost:5000/api/verification-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified, similarity }),
      });

      if (response.ok) {
        setReportStatus('Backend notified successfully.');
      } else {
        setReportStatus('Backend responded with an error.');
      }
    } catch (err) {
      console.warn('Backend not reachable:', err.message);
      setReportStatus('Backend not connected yet (result logged locally).');
    }
  };

  if (verified) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{
          display: 'inline-block',
          padding: '1.5rem 2.5rem',
          borderRadius: '12px',
          backgroundColor: '#e6f9ec',
          border: '2px solid green'
        }}>
          <h2 style={{ color: 'green', margin: 0 }}>Registration Continues</h2>
          <p>Identity verified — similarity: {similarity.toFixed(4)}</p>
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <button onClick={notifyBackend} style={{ padding: '0.5rem 1.5rem' }}>
            Confirm & Notify Backend
          </button>
        </div>
        {reportStatus && <p style={{ marginTop: '1rem' }}>{reportStatus}</p>}
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div style={{
        display: 'inline-block',
        padding: '1.5rem 2.5rem',
        borderRadius: '12px',
        backgroundColor: '#fdeaea',
        border: '2px solid #b00'
      }}>
        <h2 style={{ color: '#b00', margin: 0 }}>Registration Frozen</h2>
        <p>Suspicious activity — similarity: {similarity.toFixed(4)}</p>
        <p>A complaint will be auto-drafted and routed to authorities.</p>
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <button onClick={notifyBackend} style={{ padding: '0.5rem 1.5rem' }}>
          Confirm Freeze & Notify Backend
        </button>
        <button onClick={onRestart} style={{ padding: '0.5rem 1.5rem', marginLeft: '1rem' }}>
          Retry Verification
        </button>
      </div>
      {reportStatus && <p style={{ marginTop: '1rem' }}>{reportStatus}</p>}
    </div>
  );
}

export default VerificationOutcome;
