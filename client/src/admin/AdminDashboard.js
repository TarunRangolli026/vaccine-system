import React, { useState } from 'react';
import { ClipboardList, Bell, CalendarCheck, LogOut, Hospital } from 'lucide-react';
import PatientHistory from './PatientHistory';
import AdminNotification from './AdminNotification'; 
import AppointmentStatus from './AppointmentStatus'; // Linked the new file here

const AdminDashboard = ({ onLogout }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('menu');

  return (
    <div style={styles.dashboardContainer}>
      {/* --- TOP NAVIGATION --- */}
      <nav style={styles.navBar}>
        <div 
          onClick={() => setActiveTab('menu')} 
          style={{ ...styles.brand, cursor: 'pointer' }}
        >
          <Hospital color="#1a237e" size={28} />
          <span style={styles.brandText}>VacciCare Pro</span>
        </div>

        {/* Profile Trigger */}
        <div style={styles.profileTrigger} onClick={() => setShowProfile(!showProfile)}>
          <div style={styles.profileText}>
            <span style={styles.drName}>Dr. Sharan Angadi</span>
            <span style={styles.drSub}>MBBS, MD (Gen. Med)</span>
          </div>
          <div style={styles.avatar}>SA</div>
        </div>
      </nav>

      {/* --- AESTHETIC PROFILE POPUP --- */}
      {showProfile && (
        <div style={styles.profilePopup}>
          <div style={styles.popupHeader}>
            <div style={styles.largeAvatar}>SA</div>
            <h3 style={{ margin: '5px 0', textAlign: 'center' }}>Dr. Sharan Angadi</h3>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px', textAlign: 'center' }}>
              MBBS, MD in General Medicine
            </p>
          </div>
          <div style={styles.hospitalInfo}>
            <Hospital size={16} color="#1a237e" />
            <span>Malaprabha Multispeciality Hospital, Bailhongal</span>
          </div>
          
          <button style={styles.logoutBtn} onClick={onLogout}>
            <LogOut size={18} /> Logout
          </button>
        </div>
      )}

      {/* --- MAIN CONTENT --- */}
      <div style={styles.mainContent}>
        {activeTab === 'menu' ? (
          <>
            <header style={{ marginBottom: '40px' }}>
              <h1 style={styles.welcomeText}>Medical Administration Panel</h1>
              <p style={styles.subText}>Malaprabha Multispeciality Systems | Oversight Dashboard</p>
            </header>

            <div style={styles.cardGrid}>
              {/* Option 1: Patient History */}
              <div style={styles.actionCard} onClick={() => setActiveTab('history')}>
                <div style={{ ...styles.iconCircle, backgroundColor: '#e3f2fd' }}>
                  <ClipboardList color="#1e88e5" size={32} />
                </div>
                <h3>Patient Records</h3>
                <p>View parent lists and child vaccination history.</p>
              </div>

              {/* Option 2: Notifications */}
              <div style={styles.actionCard} onClick={() => setActiveTab('notifications')}>
                <div style={{ ...styles.iconCircle, backgroundColor: '#fff3e0' }}>
                  <Bell color="#fb8c00" size={32} />
                </div>
                <h3>Notifications</h3>
                <p>Broadcast alerts and vaccine reminders to parents.</p>
              </div>

              {/* Merged Option 3: Appointment Status */}
              <div style={styles.actionCard} onClick={() => setActiveTab('appointments')}>
                <div style={{ ...styles.iconCircle, backgroundColor: '#e8f5e9' }}>
                  <CalendarCheck color="#43a047" size={32} />
                </div>
                <h3>Appointment Status</h3>
                <p>Manage daily schedules and vaccination progress.</p>
              </div>
            </div>
          </>
        ) : (
          /* Render Selected View based on activeTab */
          <div>
            <button 
              onClick={() => setActiveTab('menu')} 
              style={styles.backButton}
            >
              ← Back to Dashboard
            </button>
            
            {activeTab === 'history' && <PatientHistory />}
            {activeTab === 'notifications' && <AdminNotification />}
            
            {/* The Placeholder is replaced with the real AppointmentStatus component */}
            {activeTab === 'appointments' && <AppointmentStatus />}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  dashboardContainer: { minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'sans-serif', position: 'relative' },
  navBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 60px', backgroundColor: '#fff', boxShadow: '0 2px 15px rgba(0,0,0,0.05)' },
  brand: { display: 'flex', alignItems: 'center', gap: '12px' },
  brandText: { fontSize: '22px', fontWeight: 'bold', color: '#1a237e' },
  profileTrigger: { display: 'flex', alignItems: 'center', gap: '15px', cursor: 'pointer' },
  profileText: { textAlign: 'right' },
  drName: { display: 'block', fontWeight: 'bold', fontSize: '15px' },
  drSub: { fontSize: '12px', color: '#777' },
  avatar: { width: '45px', height: '45px', backgroundColor: '#1a237e', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  
  profilePopup: { position: 'absolute', top: '80px', right: '60px', width: '320px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 15px 50px rgba(0,0,0,0.15)', padding: '30px', zIndex: 100 },
  largeAvatar: { width: '80px', height: '80px', backgroundColor: '#1a237e', color: 'white', borderRadius: '50%', margin: '0 auto 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' },
  hospitalInfo: { backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', color: '#444', textAlign: 'left' },
  logoutBtn: { width: '100%', marginTop: '20px', padding: '12px', border: 'none', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },

  mainContent: { padding: '60px 100px' },
  welcomeText: { fontSize: '32px', color: '#1e293b', fontWeight: 'bold' },
  subText: { color: '#64748b', fontSize: '16px' },
  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginTop: '40px' }, 
  actionCard: { backgroundColor: '#fff', padding: '40px 30px', borderRadius: '25px', textAlign: 'center', cursor: 'pointer', border: '1px solid #e2e8f0', transition: '0.3s' },
  iconCircle: { width: '80px', height: '80px', borderRadius: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 25px' },
  backButton: { marginBottom: '20px', background: 'none', border: 'none', color: '#1a237e', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }
};

export default AdminDashboard;