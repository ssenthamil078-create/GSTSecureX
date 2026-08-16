import { useState, useEffect } from 'react';

function Dashboard({ registrationStatus, verificationHistory }) {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/alerts');
      if (response.ok) {
        const data = await response.json();
        setAlerts(data);
      }
    } catch (err) {
      console.warn('Backend not reachable yet, showing demo data:', err.message);
      // Fallback demo data so the dashboard isn't empty during dev/demo
      setAlerts([
        { id: 1, gstin: '29ABCDE1234F1Z5', status: 'verified', time: '2 min ago' },
        { id: 2, gstin: '27XYZAB5678K1Z2', status: 'frozen', time: '10 min ago' },
        { id: 3, gstin: '19PQRSK9012L1Z9', status: 'pending', time: '25 min ago' },
      ]);
    }
  };

  const statusColor = (status) => {
    if (status === 'verified') return '#0a7d34';
    if (status === 'frozen') return '#b00020';
    return '#a67c00';
  };

  const statusBg = (status) => {
    if (status === 'verified') return '#e6f9ec';
    if (status === 'frozen') return '#fdeaea';
    return '#fff8e1';
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>PanWatch Dashboard</h2>

      <div style={{
        display: 'flex',
        justifyContent: 'space-around',
        margin: '1.5rem 0',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '10px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{alerts.length}</div>
          <div>Total Cases</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0a7d34' }}>
            {alerts.filter((a) => a.status === 'verified').length}
          </div>
          <div>Verified</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#b00020' }}>
            {alerts.filter((a) => a.status === 'frozen').length}
          </div>
          <div>Frozen</div>
        </div>
      </div>

      <h3>Recent Alerts</h3>
      <div>
        {alerts.map((alert) => (
          <div
            key={alert.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              marginBottom: '0.5rem',
              borderRadius: '8px',
              backgroundColor: statusBg(alert.status),
              border: '1px solid ' + statusColor(alert.status),
            }}
          >
            <div>
              <div style={{ fontWeight: 'bold' }}>{alert.gstin}</div>
              <div style={{ fontSize: '0.85rem', color: '#555' }}>{alert.time}</div>
            </div>
            <div style={{
              fontWeight: 'bold',
              color: statusColor(alert.status),
              textTransform: 'uppercase',
              fontSize: '0.85rem'
            }}>
              {alert.status}
            </div>
          </div>
        ))}
      </div>

      {registrationStatus && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#eef', borderRadius: '8px' }}>
          <strong>Your last registration:</strong> {registrationStatus}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
