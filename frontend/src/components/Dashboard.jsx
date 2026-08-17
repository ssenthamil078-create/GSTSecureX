import { useState, useEffect } from 'react';
import { Users, ClipboardCheck, Lock, Clock, AlertTriangle, Plus, Search, Bell, MessageCircle } from 'lucide-react';

function Donut({ verified, frozen, inProgress, total }) {
  const r = 60, cx = 70, cy = 70, circumference = 2 * Math.PI * r;
  const vPct = verified / total, fPct = frozen / total, iPct = inProgress / total;
  const vLen = vPct * circumference, fLen = fPct * circumference, iLen = iPct * circumference;

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="16" />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--blue)" strokeWidth="16"
        strokeDasharray={iLen + ' ' + (circumference - iLen)} strokeDashoffset="0" transform={'rotate(-90 ' + cx + ' ' + cy + ')'} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--green)" strokeWidth="16"
        strokeDasharray={vLen + ' ' + (circumference - vLen)} strokeDashoffset={-iLen} transform={'rotate(-90 ' + cx + ' ' + cy + ')'} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--red)" strokeWidth="16"
        strokeDasharray={fLen + ' ' + (circumference - fLen)} strokeDashoffset={-(iLen + vLen)} transform={'rotate(-90 ' + cx + ' ' + cy + ')'} />
      <text x={cx} y={cy - 4} textAnchor="middle" fontFamily="var(--font-display)" fontWeight="700" fontSize="20" fill="var(--ink)">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="var(--ink-soft)">Total Cases</text>
    </svg>
  );
}

function Dashboard({ registrationStatus, onNavigate, onNewRegistration }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/alerts');
      if (response.ok) { setAlerts(await response.json()); return; }
      throw new Error('no backend');
    } catch (err) {
      setAlerts([
        { id: 1, severity: 'high', text: 'High risk registration detected', gstin: '27ABCDE1234F1Z5', time: '2 min ago' },
        { id: 2, severity: 'medium', text: 'Unusual location registration', gstin: '29XYZAB5676C1Z2', time: '15 min ago' },
        { id: 3, severity: 'high', text: 'Multiple registration attempt', gstin: '33LMNOP9876D1Z9', time: '28 min ago' },
        { id: 4, severity: 'low', text: 'New registration received', gstin: '07QRSTU4567E1Z1', time: '1 hr ago' },
      ]);
    }
  };

  const total = 128, verified = 42, frozen = 18, inProgress = 68;

  return (
    <div>
      <div className="pw-page-header-row">
        <div>
          <div className="pw-page-title">Dashboard</div>
          <div className="pw-page-subtitle">Real-time overview of registrations and alerts</div>
        </div>
        <button className="pw-btn pw-btn-outline" onClick={onNewRegistration}><Plus size={16} /> New Registration</button>
      </div>

      <div className="pw-stat-grid">
        <div className="pw-stat-card">
          <div className="pw-stat-icon" style={{ background: 'var(--blue-soft)' }}><Users size={18} color="var(--blue)" /></div>
          <div>
            <div className="pw-stat-value">{total}</div>
            <div className="pw-stat-label">Total Cases</div>
            <div className="pw-stat-delta" style={{ color: 'var(--blue)' }}>+12 today</div>
          </div>
        </div>
        <div className="pw-stat-card">
          <div className="pw-stat-icon" style={{ background: 'var(--green-soft)' }}><ClipboardCheck size={18} color="var(--green)" /></div>
          <div>
            <div className="pw-stat-value">{verified}</div>
            <div className="pw-stat-label">Verified</div>
            <div className="pw-stat-delta" style={{ color: 'var(--green)' }}>+7 today</div>
          </div>
        </div>
        <div className="pw-stat-card">
          <div className="pw-stat-icon" style={{ background: 'var(--red-soft)' }}><Lock size={18} color="var(--red)" /></div>
          <div>
            <div className="pw-stat-value">{frozen}</div>
            <div className="pw-stat-label">Frozen</div>
            <div className="pw-stat-delta" style={{ color: 'var(--red)' }}>+3 today</div>
          </div>
        </div>
        <div className="pw-stat-card">
          <div className="pw-stat-icon" style={{ background: 'var(--blue-soft)' }}><Clock size={18} color="var(--blue)" /></div>
          <div>
            <div className="pw-stat-value">{inProgress}</div>
            <div className="pw-stat-label">In Progress</div>
            <div className="pw-stat-delta" style={{ color: 'var(--blue)' }}>+5 today</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="pw-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <strong style={{ fontSize: '0.95rem' }}>Recent Alerts</strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--green)', cursor: 'pointer' }}>View All</span>
          </div>
          {alerts.map((a) => (
            <div className="pw-alert-row" key={a.id}>
              <span className={'pw-sev-badge pw-sev-' + a.severity}>{a.severity}</span>
              <div className="pw-alert-text">
                {a.text}
                <div className="pw-alert-gstin">GSTIN: {a.gstin}</div>
              </div>
              <span className="pw-alert-time">{a.time}</span>
            </div>
          ))}
        </div>

        <div className="pw-card" style={{ textAlign: 'center' }}>
          <strong style={{ fontSize: '0.95rem', alignSelf: 'flex-start' }}>Case Status Distribution</strong>
          <div style={{ display: 'flex', justifyContent: 'center', margin: '0.75rem 0' }}>
            <Donut verified={verified} frozen={frozen} inProgress={inProgress} total={total} />
          </div>
          <div style={{ textAlign: 'left', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span><span style={{ color: 'var(--green)' }}>●</span> Verified</span><span>{verified} ({(verified/total*100).toFixed(1)}%)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span><span style={{ color: 'var(--red)' }}>●</span> Frozen</span><span>{frozen} ({(frozen/total*100).toFixed(1)}%)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><span style={{ color: 'var(--blue)' }}>●</span> In Progress</span><span>{inProgress} ({(inProgress/total*100).toFixed(1)}%)</span>
            </div>
          </div>
        </div>
      </div>

      <strong style={{ fontSize: '0.9rem' }}>Quick Actions</strong>
      <div className="pw-quick-grid" style={{ marginTop: '0.6rem' }}>
        <div className="pw-quick-btn" onClick={onNewRegistration}><Plus size={18} color="var(--green)" /> New Registration</div>
        <div className="pw-quick-btn" onClick={() => onNavigate && onNavigate('tracking')}><Search size={18} color="var(--blue)" /> Track Case</div>
        <div className="pw-quick-btn"><Bell size={18} color="var(--red)" /> View Alerts</div>
        <div className="pw-quick-btn" onClick={() => onNavigate && onNavigate('chatbot')}><MessageCircle size={18} color="var(--purple)" /> Assistant</div>
      </div>

      {registrationStatus && (
        <div className="pw-banner pw-banner-info" style={{ marginTop: '1.5rem' }}>
          <AlertTriangle size={18} />
          <span>Your last registration: {registrationStatus}</span>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
