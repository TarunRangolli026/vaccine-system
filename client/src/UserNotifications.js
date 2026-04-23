import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCircle, X } from 'lucide-react';

const UserNotifications = ({ userEmail }) => {
  const [notifications, setNotifications] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [activeMsg, setActiveMsg] = useState(null);

  // 1. Fetch messages for this specific parent (e.g., Tarun)
  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/user/notifications/${userEmail}`);
      setNotifications(res.data);

      // Check for a 'unread' message to show the pop-up
      const newMsg = res.data.find(n => n.status === 'unread');
      if (newMsg) {
        setActiveMsg(newMsg);
        setShowPopup(true);
      }
    } catch (err) {
      console.error("Error loading messages", err);
    }
  };

  useEffect(() => {
    if (userEmail) fetchMessages();
  }, [userEmail]);

  // 2. Mark as read when "Understood" is clicked
  const handleMarkRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/user/mark-read/${id}`);
      setShowPopup(false);
      fetchMessages(); // Refresh to move it to history
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  return (
    <div style={styles.container}>
      {/* --- POPUP MODAL --- */}
      {showPopup && activeMsg && (
        <div style={styles.overlay}>
          <div style={styles.popup}>
            <div style={styles.popupHeader}>
              <Bell color="#1a237e" size={24} />
              <h3 style={{margin:0}}>Message from Dr. Sharan Angadi</h3>
              <X style={{cursor:'pointer'}} onClick={() => setShowPopup(false)} />
            </div>
            <p style={styles.popupText}>"{activeMsg.message}"</p>
            <p style={styles.popupHospital}>From: VacciCare (Malaprabha Hospital)</p>
            <button style={styles.ackBtn} onClick={() => handleMarkRead(activeMsg._id)}>
              Got it, thanks!
            </button>
          </div>
        </div>
      )}

      {/* --- HISTORY LIST --- */}
      <h2 style={styles.title}>Reminder History</h2>
      <div style={styles.historyList}>
        {notifications.length === 0 ? (
          <p style={{textAlign:'center', color:'#94a3b8'}}>No past reminders.</p>
        ) : (
          notifications.map((n) => (
            <div key={n._id} style={n.status === 'unread' ? styles.unreadItem : styles.readItem}>
              <div style={styles.cardInfo}>
                <span style={styles.childName}>Child: {n.childName}</span>
                <span style={styles.time}>{new Date(n.createdAt).toLocaleDateString()}</span>
              </div>
              <p style={styles.msgBody}>{n.message}</p>
              {n.status === 'read' && (
                <div style={styles.readBadge}><CheckCircle size={14} /> Viewed</div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px' },
  title: { color: '#1a237e', fontSize: '24px', marginBottom: '20px' },
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
  popup: { backgroundColor: 'white', padding: '30px', borderRadius: '15px', width: '90%', maxWidth: '450px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' },
  popupHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  popupText: { fontSize: '18px', color: '#1e293b', fontStyle: 'italic', marginBottom: '10px' },
  popupHospital: { fontSize: '14px', color: '#64748b', marginBottom: '25px' },
  ackBtn: { width: '100%', padding: '14px', background: '#1a237e', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  historyList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  readItem: { padding: '15px', backgroundColor: '#f1f5f9', borderRadius: '10px', borderLeft: '5px solid #cbd5e1' },
  unreadItem: { padding: '15px', backgroundColor: '#fff', borderRadius: '10px', borderLeft: '5px solid #1a237e', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  cardInfo: { display: 'flex', justifyContent: 'space-between', marginBottom: '5px' },
  childName: { fontWeight: 'bold', color: '#1e293b' },
  time: { fontSize: '12px', color: '#94a3b8' },
  msgBody: { fontSize: '14px', color: '#475569' },
  readBadge: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#059669', marginTop: '10px' }
};

export default UserNotifications;