import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, User, MessageSquare, Loader2 } from 'lucide-react';

const AdminNotification = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [message, setMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch all appointments to get the list of children
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        // FIXED: URL updated to match the latest backend index.js
        const res = await axios.get('http://localhost:5000/api/admin/appointments');
        setAppointments(res.data);
      } catch (err) {
        console.error("Error fetching notification list:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // 2. Send the message to the parent via MongoDB
  const handleSend = async () => {
    if (!selectedApp || !message) {
      alert("Please select a child and enter a message.");
      return;
    }

    try {
      // Use childName or name (safety fallback for your schema)
      const targetChild = selectedApp.childName || selectedApp.name;

      await axios.post('http://localhost:5000/api/admin/send-notif', {
        parentEmail: selectedApp.parentEmail,
        childName: targetChild,
        message: message
      });

      setShowToast(true);
      setMessage("");
      setTimeout(() => setShowToast(false), 4000); 
    } catch (err) {
      console.error("Failed to send notification:", err);
      alert("Error sending notification. Check backend connection.");
    }
  };

  if (loading) return (
    <div style={{textAlign:'center', padding:'30px'}}>
      <Loader2 className="animate-spin" style={{margin:'0 auto'}} color="#1a237e" />
      <p>Updating children list...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Send Reminder Message</h2>
      
      <div style={styles.formGroup}>
        <label style={styles.label}><User size={16} /> Select Child Name:</label>
        <select 
          style={styles.select} 
          onChange={(e) => setSelectedApp(appointments[e.target.value])}
          defaultValue=""
        >
          <option value="" disabled>-- Choose a Child --</option>
          {appointments.length > 0 ? (
            appointments.map((app, index) => (
              <option key={app._id || index} value={index}>
                {/* Checks both childName and name fields */}
                {app.childName || app.name} (Parent: {app.parentName || app.parentEmail})
              </option>
            ))
          ) : (
            <option disabled>No children found. Try booking an appointment first.</option>
          )}
        </select>
      </div>

      <div style={styles.formGroup}>
        <label style={styles.label}><MessageSquare size={16} /> Your Message:</label>
        <textarea 
          style={styles.textarea}
          placeholder="Type your reminder message for the parent here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      <button style={styles.sendBtn} onClick={handleSend}>
        <Send size={18} /> Send Reminder
      </button>

      {/* --- SUCCESS TOAST --- */}
      {showToast && (
        <div style={styles.toast}>
          ✅ Reminder sent successfully to {selectedApp?.childName || selectedApp?.name}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '30px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  title: { color: '#1a237e', marginBottom: '25px', textAlign: 'center', fontWeight: 'bold' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', marginBottom: '8px', color: '#475569' },
  select: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', backgroundColor: '#fff' },
  textarea: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '120px', fontSize: '16px', resize: 'none' },
  sendBtn: { width: '100%', padding: '14px', backgroundColor: '#1a237e', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' },
  toast: { position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#059669', color: 'white', padding: '15px 35px', borderRadius: '50px', boxShadow: '0 10px 25px rgba(5, 150, 105, 0.3)', zIndex: 9999, fontSize: '16px', fontWeight: '500' }
};

export default AdminNotification;