import React from 'react';

const HomePage = ({ children: childProfiles = [], profileData, vaccineRoadmap, onSelectChild, onAddChild, AlertCarousel }) => {
  return (
    <div style={styles.pageWrapper}>
      <div style={styles.heroCard}>
        <div>
          <h1 style={styles.heroTitle}>Welcome back, {profileData.fullName || 'Family'}</h1>
          <p style={styles.heroSubtitle}>
            Manage your child profiles, view vaccination milestones, and schedule appointments with ease.
          </p>
          <button style={styles.heroButton} onClick={onAddChild}>Add / Edit Child Profiles</button>
        </div>
        <div style={styles.heroBadge}>
          <span style={styles.badgeIcon}>🩺</span>
          <div>
            <div style={styles.badgeTitle}>Trusted care for Bailhongal</div>
            <div style={styles.badgeText}>Personalized schedules for every child.</div>
          </div>
        </div>
      </div>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Child Profiles</h2>
            <p style={styles.sectionSubtitle}>Tap a child to view appointments, roadmap, and reminders.</p>
          </div>
          <button style={styles.smallButton} onClick={onAddChild}>Manage Profiles</button>
        </div>

        {childProfiles.length > 0 ? (
          <div style={styles.childGrid}>
            {childProfiles.map((child) => (
              <button key={child._id || child.id || child.name} style={styles.childCard} onClick={() => onSelectChild(child)}>
                <div style={styles.childAvatar}>{child.name ? child.name[0].toUpperCase() : '?'}</div>
                <div>
                  <div style={styles.childName}>{child.name || 'Unnamed Child'}</div>
                  <div style={styles.childMeta}>{child.age || 'Age not set'}</div>
                  <div style={styles.childMeta}>{child.gender || 'Gender not set'}</div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No child profiles are saved yet.</p>
            <p style={styles.emptySubtext}>Create a profile so we can track vaccinations and appointments.</p>
          </div>
        )}
      </section>

      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Vaccination Roadmap</h2>
            <p style={styles.sectionSubtitle}>Recommended next milestones by age.</p>
          </div>
        </div>
        <AlertCarousel children={childProfiles} roadmap={vaccineRoadmap} />
      </section>
    </div>
  );
};

const styles = {
  pageWrapper: { width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '30px' },
  heroCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: '35px', borderRadius: '30px', boxShadow: '0 15px 35px rgba(80, 45, 125, 0.08)' },
  heroTitle: { fontSize: '36px', margin: 0, color: '#4A148C' },
  heroSubtitle: { marginTop: '12px', fontSize: '16px', color: '#555' },
  heroButton: { marginTop: '22px', padding: '14px 26px', backgroundColor: '#6A1B9A', color: '#fff', border: 'none', borderRadius: '14px', cursor: 'pointer', fontWeight: '700' },
  heroBadge: { display: 'flex', gap: '18px', alignItems: 'center', padding: '20px 25px', borderRadius: '25px', backgroundColor: '#F3E5F5', minWidth: '280px' },
  badgeIcon: { width: '48px', height: '48px', borderRadius: '15px', display: 'grid', placeItems: 'center', fontSize: '24px', backgroundColor: '#6A1B9A', color: '#fff' },
  badgeTitle: { fontWeight: '700', color: '#4A148C' },
  badgeText: { color: '#555', fontSize: '13px', marginTop: '5px' },
  section: { backgroundColor: '#fff', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(74, 20, 140, 0.08)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  sectionTitle: { margin: 0, color: '#4A148C' },
  sectionSubtitle: { margin: '6px 0 0', color: '#666', fontSize: '14px' },
  smallButton: { padding: '10px 18px', borderRadius: '12px', backgroundColor: '#4A148C', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '700' },
  childGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' },
  childCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', backgroundColor: '#f8f5ff', borderRadius: '20px', border: '1px solid #eee', cursor: 'pointer', textAlign: 'left' },
  childAvatar: { width: '55px', height: '55px', borderRadius: '18px', backgroundColor: '#6A1B9A', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '22px' },
  childName: { fontSize: '18px', fontWeight: '700', color: '#32125B' },
  childMeta: { fontSize: '13px', color: '#666', marginTop: '4px' },
  emptyState: { border: '1px dashed #D1C4E9', padding: '40px', borderRadius: '22px', textAlign: 'center', color: '#6A1B9A' },
  emptyText: { fontSize: '18px', fontWeight: '700', margin: 0 },
  emptySubtext: { marginTop: '10px', color: '#555' }
};

export default HomePage;
