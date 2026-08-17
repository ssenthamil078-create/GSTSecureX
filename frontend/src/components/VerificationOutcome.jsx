import { useState } from 'react';
import { DISTANCE_THRESHOLD } from '../compareEmbeddings';

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
      setReportStatus('Backend not connected yet (result logged locally).');
    }
  };

  // Meter: 0 distance = far left (great match), threshold = midpoint marker, cap display at 1.0
  const meterPct = Math.min((similarity / 1.0) * 100, 100);
  const thresholdPct = (DISTANCE_THRESHOLD / 1.0) * 100;
  const meterColor = verified ? 'var(--confirm)' : 'var(--alert)';

  return (
    <div className="pw-card pw-card-center">
      <div className={'pw-banner ' + (verified ? 'pw-banner-verified' : 'pw-banner-frozen')}>
        <h2>{verified ? 'Registration Continues' : 'Registration Frozen'}</h2>
        <p>{verified ? 'Identity verified against reference.' : 'Suspicious activity detected.'}</p>
        {!verified && <p style={{ fontWeight: 600 }}>A complaint has been auto-drafted and routed to authorities.</p>}
      </div>

      <div className="pw-console">
        <div className="pw-console-label">MATCH_DISTANCE</div>
        <div className="pw-console-score">{similarity.toFixed(4)}</div>
        <div className="pw-console-meter">
          <div
            className="pw-console-meter-fill"
            style={{ width: meterPct + '%', background: meterColor }}
          />
          <div className="pw-console-threshold" style={{ left: thresholdPct + '%' }} />
        </div>
        <div className="pw-console-caption">
          threshold {DISTANCE_THRESHOLD.toFixed(2)} — lower distance = closer match
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="pw-btn pw-btn-primary" onClick={notifyBackend}>
          {verified ? 'Confirm & Notify Backend' : 'Confirm Freeze & Notify Backend'}
        </button>
        <button className="pw-btn pw-btn-ghost" onClick={onRestart}>Start New Registration</button>
      </div>

      {reportStatus && <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>{reportStatus}</p>}
    </div>
  );
}

export default VerificationOutcome;
