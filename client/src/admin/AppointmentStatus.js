import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';

const AppointmentStatus = () => {
  const [viewMode, setViewMode] = useState('pending');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      // Ensure your backend server is running on port 5000
      const res = await axios.get('http://localhost:5000/api/admin/appointments');
      console.log("Data received from server:", res.data);
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleProceed = async (appointmentId) => {
    try {
      await axios.put(`http://localhost:5000/api/admin/update-appointment`, {
        appointmentId,
        status: 'completed'
      });

      // Local update to move the record from Pending to Completed instantly
      setAppointments(prev => prev.map(appt => 
        appt._id === appointmentId ? { ...appt, status: 'completed' } : appt
      ));
      
      alert("Vaccination Processed Successfully!");
    } catch (err) {
      alert("Error processing appointment. Check console.");
    }
  };

  /**
   * Helper to find name based on your Mongoose Schema.
   * Your schema uses 'name' inside the children array.
   */
  const getName = (appt) => {
    return appt.name || appt.childName || appt.child_name || "Unknown Child";
  };

  // Case-insensitive filtering to ensure 'Pending' and 'pending' both show up
  const pendingList = appointments.filter(a => a.status?.toLowerCase() === 'pending');
  const completedList = appointments.filter(a => a.status?.toLowerCase() === 'completed');

  if (loading) return (
    <div style={styles.empty}>
      <Loader2 className="animate-spin" size={32} color="#1a237e" />
      <p>Loading Appointments...</p>
    </div>
  );

  return (
    <div style={styles.statusContainer}>
      <div style={styles.tabHeader}>
        <button 
          style={{ 
            ...styles.tabBtn, 
            borderBottom: viewMode === 'pending' ? '3px solid #1a237e' : 'none', 
            color: viewMode === 'pending' ? '#1a237e' : '#666' 
          }}
          onClick={() => setViewMode('pending')}
        >
          <Clock size={18} /> Pending ({pendingList.length})
        </button>
        <button 
          style={{ 
            ...styles.tabBtn, 
            borderBottom: viewMode === 'completed' ? '3px solid #2e7d32' : 'none', 
            color: viewMode === 'completed' ? '#2e7d32' : '#666' 
          }}
          onClick={() => setViewMode('completed')}
        >
          <CheckCircle size={18} /> Completed ({completedList.length})
        </button>
      </div>

      <div style={styles.listWrapper}>
        {viewMode === 'pending' ? (
          pendingList.length > 0 ? pendingList.map(appt => (
            <div key={appt._id} style={styles.itemCard}>
              <div>
                <div style={styles.childName}>👶 {getName(appt)}</div>
                <div style={styles.details}>
                  <strong>Vaccine:</strong> {appt.vaccineName || appt.vaccine_name || "N/A"} <br/>
                  <strong>Schedule:</strong> {appt.appointmentDate} | {appt.timeSlot}
                </div>
              </div>
              <button style={styles.proceedBtn} onClick={() => handleProceed(appt._id)}>Proceed →</button>
            </div>
          )) : (
            <div style={styles.empty}>
              <p>No pending appointments found.</p>
              <button onClick={fetchAppointments} style={styles.refreshBtn}>Refresh Data</button>
            </div>
          )
        ) : (
          completedList.length > 0 ? completedList.map(appt => (
            <div key={appt._id} style={{...styles.itemCard, borderLeft: '5px solid #2e7d32'}}>
              <div>
                <div style={styles.childName}>✅ {getName(appt)}</div>
                <div style={styles.details}>
                  <strong>Vaccine:</strong> {appt.vaccineName || "N/A"} <br/>
                  <strong>Completed on:</strong> {appt.appointmentDate}
                </div>
              </div>
              <span style={styles.doneBadge}>Done</span>
            </div>
          )) : <p style={styles.empty}>No completed records found.</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  statusContainer: { backgroundColor: '#fff', borderRadius: '25px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  tabHeader: { display: 'flex', gap: '30px', borderBottom: '1px solid #eee', marginBottom: '20px' },
  tabBtn: { padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' },
  listWrapper: { marginTop: '10px' },
  itemCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid #f0f0f0', borderRadius: '15px', marginBottom: '15px', backgroundColor: '#fafafa' },
  childName: { fontSize: '18px', fontWeight: 'bold', color: '#1e293b' },
  details: { fontSize: '14px', color: '#64748b', marginTop: '6px', lineHeight: '1.5' },
  proceedBtn: { backgroundColor: '#1a237e', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' },
  doneBadge: { color: '#2e7d32', fontWeight: 'bold', padding: '5px 15px', backgroundColor: '#e8f5e9', borderRadius: '20px', fontSize: '13px' },
  empty: { textAlign: 'center', color: '#94a3b8', padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  refreshBtn: { color: '#1a237e', cursor: 'pointer', background: 'none', border: '1px solid #1a237e', padding: '8px 16px', borderRadius: '8px', marginTop: '10px', fontWeight: 'bold' }
};

export default AppointmentStatus;