import { useState } from 'react';

function VerificationOutcome({ verified, similarity, onRestart }) {
  const [reportStatus, setReportStatus] = useState('');

  const notifyBackend = async () => {
    setReportStatus('Sending outcome to backend...');
    try {
      const response = await fetch('http://localhost:5000/api/verification-result', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified, distance: similarity }),
      });
      setReportStatus(response.ok ? 'Backend notified successfully.' : 'Backend responded with an error.');
    } catch (err) {
      console.warn('Backend not reachable:', err.message);
      setReportStatus('Backend not connected yet (result logged locally).');
    }
  };

  if (verified) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{
          display: 'inline-block', padding: '1.5rem 2.5rem', borderRadius: '12px',
          backgroundColor: '#e6f9ec', border: '2px solid green'
        }}>
          <h2 style={{ color: 'green', margin: 0 }}>Registration Continues</h2>
          <p>Identity verified — match distance: {similarity.toFixed(4)}</p>
        </div>
        <div style={{ marginTop: '1.5rem' }}>
          <button onClick={notifyBackend} style={{ padding: '0.5rem 1.5rem' }}>Confirm & Notify Backend</button>
          <button onClick={onRestart} style={{ padding: '0.5rem 1.5rem', marginLeft: '1rem' }}>Start New Registration</button>
        </div>
        {reportStatus && <p style={{ marginTop: '1rem' }}>{reportStatus}</p>}
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div style={{
        display: 'inline-block', padding: '1.5rem 2.5rem', borderRadius: '12px',
        backgroundColor: '#fdeaea', border: '2px solid #b00'
      }}>
        <h2 style={{ color: '#b00', margin: 0 }}>Registration Frozen</h2>
        <p>Suspicious activity — match distance: {similarity.toFixed(4)}</p>
        <p style={{ fontWeight: 'bold' }}>A complaint has been auto-drafted and routed to authorities for investigation.</p>
      </div>
      <div style={{ marginTop: '1.5rem' }}>
        <button onClick={notifyBackend} style={{ padding: '0.5rem 1.5rem' }}>Confirm Freeze & Notify Backend</button>
        <button onClick={onRestart} style={{ padding: '0.5rem 1.5rem', marginLeft: '1rem' }}>Start New Registration</button>
      </div>
      {reportStatus && <p style={{ marginTop: '1rem' }}>{reportStatus}</p>}
    </div>
  );
}

export default VerificationOutcome;
