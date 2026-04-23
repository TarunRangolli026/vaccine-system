import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import History from './History'; 
import UserNotifications from './UserNotifications';


// --- NEW HELPER COMPONENT: ALERT CAROUSEL ---
const AlertCarousel = ({ children, roadmap }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (children.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % children.length);
      }, 5000);
      return () => clearInterval(timer);
    }
  }, [children.length]);

  const getNextVaccineInfo = (dob) => {
    if (!dob) return null;
    const birth = new Date(dob);
    const today = new Date();
    const diffMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    const next = roadmap.find(v => v.months > diffMonths);
    if (!next) return { vaccine: "Completed!", days: 0, icon: "🎉" };
    const dueDate = new Date(birth);
    dueDate.setMonth(dueDate.getMonth() + next.months);
    const daysLeft = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return { vaccine: next.age, days: daysLeft, icon: next.icon };
  };

  if (children.length === 0) return null;

  return (
    <div style={carouselStyles.wrapper}>
      <div style={{...carouselStyles.inner, transform: `translateX(-${currentSlide * 100}%)`}}>
        {children.map((child, idx) => {
          const info = getNextVaccineInfo(child.dob);
          return (
            <div key={child._id || child.id || idx} style={carouselStyles.slide}>
              <div style={carouselStyles.content}>
                <div>
                  <span style={carouselStyles.badge}>Upcoming Milestone</span>
                  <h2 style={carouselStyles.title}>{child.name || "Child"}: {info?.vaccine}</h2>
                  <div style={carouselStyles.timer}><strong>{info?.days}</strong> Days Remaining</div>
                </div>
                <div style={carouselStyles.bigIcon}>{info?.icon}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Dashboard = ({ user, onLogout }) => {
  const userEmail = typeof user === 'object' ? user?.email : user;

  const [activeTab, setActiveTab] = useState('main'); 
  const [selectedChild, setSelectedChild] = useState(null); 
  const [viewMode, setViewMode] = useState('menu'); 
  const [updateSubTab, setUpdateSubTab] = useState('bookings');
  const [showDropdown, setShowDropdown] = useState(false);

  const [adminNotifications, setAdminNotifications] = useState([]);

  const [showBooking, setShowBooking] = useState(false);
  const [bookingData, setBookingData] = useState({ date: '', selectedDate: '', slot: '' });
  const [availableDates, setAvailableDates] = useState([]);
  const [bookingStatus, setBookingStatus] = useState(null); 
  const [isRescheduling, setIsRescheduling] = useState(false);

  const [profileData, setProfileData] = useState({ 
    fullName: user?.fullName || '', 
    email: userEmail || '', 
    phone: user?.phone || '' 
  });

  const [children, setChildren] = useState([]);
  
  const lastChildRef = useRef(null);
  const today = new Date();
  const maxDateLimit = today.toISOString().split('T')[0];
  
  const sixteenYearsAgo = new Date();
  sixteenYearsAgo.setFullYear(today.getFullYear() - 16);
  const minDateLimit = sixteenYearsAgo.toISOString().split('T')[0];

  const vaccineRoadmap = [
    { age: "At Birth", months: 0, vaccines: ["BCG", "OPV (0)", "Hep-B (1)"], prices: ["₹500", "Free", "₹450"], icon: "🍼" },
    { age: "6 Weeks", months: 1.5, vaccines: ["DPT-1", "Polio-1", "Rotavirus-1", "Hib-1"], prices: ["₹1200", "₹300", "₹1500", "₹800"], icon: "👶" },
    { age: "10 Weeks", months: 2.5, vaccines: ["DPT-2", "Polio-2", "Rotavirus-2"], prices: ["₹1200", "₹300", "₹1500"], icon: "👶" },
    { age: "14 Weeks", months: 3.5, vaccines: ["DPT-3", "Polio-3"], prices: ["₹1200", "₹300"], icon: "👶" },
    { age: "9 Months", months: 9, vaccines: ["Measles / MMR-1"], prices: ["₹950"], icon: "💉" },
    { age: "15 Months", months: 15, vaccines: ["MMR-2", "PCV Booster"], prices: ["₹950", "₹3800"], icon: "🏥" },
    { age: "2 Years", months: 24, vaccines: ["DPT Booster-1", "Polio Booster"], prices: ["₹1100", "₹400"], icon: "🧒" },
    { age: "5 Years", months: 60, vaccines: ["DPT Booster-2"], prices: ["₹1100"], icon: "🎒" },
    { age: "10-16 Years", months: 120, vaccines: ["Tetanus", "HPV (for girls)"], prices: ["₹350", "₹2800"], icon: "🧑" }
  ];

  const handleDateSelection = (baseDate) => {
    if (!baseDate) return;
    const dates = [];
    for (let i = 0; i < 4; i++) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + i);
      dates.push({
        full: d.toISOString().split('T')[0],
        display: d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
      });
    }
    setAvailableDates(dates);
    setBookingData({ ...bookingData, date: baseDate, selectedDate: '' }); 
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/get-profile/${userEmail}`);
        if (res.data) {
          setProfileData({ 
            fullName: res.data.fullName || '', 
            email: res.data.email || userEmail, 
            phone: res.data.phone || '' 
          });
          if (res.data.children) setChildren(res.data.children);
        }
      } catch (err) { console.log("Profile load error"); }
    };
    if (userEmail) fetchUserData();
  }, [userEmail]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/user/notifications/${userEmail}`);
        setAdminNotifications(res.data);
      } catch (err) { console.error("Error fetching notifications:", err); }
    };
    if (userEmail) fetchNotifications();
  }, [userEmail]);

  const markAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/user/mark-read/${id}`);
      setAdminNotifications(prev => 
        prev.map(n => n._id === id ? { ...n, status: 'read' } : n)
      );
    } catch (err) { console.error("Failed to mark as read"); }
  };

  useEffect(() => {
    if (selectedChild && selectedChild.pendingAppointment) {
      const apptDate = new Date(selectedChild.pendingAppointment.date);
      const todayOnly = new Date();
      todayOnly.setHours(0, 0, 0, 0);
      setIsRescheduling(apptDate < todayOnly && selectedChild.pendingAppointment.status !== 'completed');
    } else {
      setIsRescheduling(false);
    }
  }, [selectedChild]);

  useEffect(() => {
    if (activeTab === 'children' && lastChildRef.current) {
      lastChildRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [children.length, activeTab]);

  const getBookingEligibility = (dob) => {
    if (isRescheduling) return { canBook: true, vaccine: selectedChild.pendingAppointment.vaccineName };
    if (!dob) return { canBook: false };
    const birth = new Date(dob);
    const diffMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    const nextVaccine = vaccineRoadmap.find(v => v.months > diffMonths);
    if (!nextVaccine) return { canBook: false, message: "All vaccinations completed!" };
    const monthsUntilNext = nextVaccine.months - diffMonths;
    if (monthsUntilNext > 1) {
      return { 
        canBook: false, 
        message: `Next vaccination (${nextVaccine.age}) is too early. Book within 1 month of the milestone.` 
      };
    }
    return { canBook: true, vaccine: nextVaccine.age };
  };

  const handleBooking = async () => {
    const eligibility = getBookingEligibility(selectedChild.dob);
    if (!bookingData.selectedDate || !bookingData.slot) {
      setBookingStatus("⚠️ Please select a specific date and timing.");
      return;
    }
    try {
      const endpoint = isRescheduling ? '/api/reschedule-appointment' : '/api/book-appointment';
      await axios.post(`http://localhost:5000${endpoint}`, {
        parentEmail: userEmail,
        childName: selectedChild.name,
        vaccineName: eligibility.vaccine, 
        appointmentDate: bookingData.selectedDate,
        timeSlot: bookingData.slot
      });

      const updatedAppt = {
        vaccineName: eligibility.vaccine,
        date: bookingData.selectedDate,
        timeSlot: bookingData.slot,
        status: 'pending'
      };

      setSelectedChild(prev => ({ ...prev, pendingAppointment: updatedAppt }));
      setChildren(prev => prev.map(c => (c.name === selectedChild.name ? { ...c, pendingAppointment: updatedAppt } : c)));

      setBookingStatus("success");
      setTimeout(() => {
        setBookingStatus(null);
        setShowBooking(false);
        setIsRescheduling(false);
        setBookingData({ date: '', selectedDate: '', slot: '' });
        setAvailableDates([]);
      }, 3000);
    } catch (err) {
      setBookingStatus("Error booking appointment.");
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) { years--; months += 12; }
    if (years < 0 || years > 16) return "Invalid Age";
    return years > 0 ? `${years}y ${months}m` : `${months}m`;
  };

  const getMilestoneStatus = (childDob, milestoneMonths) => {
    if (!childDob) return 'upcoming';
    const birth = new Date(childDob);
    const diffMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    return diffMonths >= milestoneMonths ? 'completed' : 'upcoming';
  };

  const isFormInvalid = () => {
    if (children.length === 0) return false;
    return children.some(child => 
      !child.name || !child.dob || !child.gender || !child.weight || 
      parseFloat(child.weight) <= 0 || parseFloat(child.weight) > 20 || 
      child.age === "Invalid Age"
    );
  };

  // Helper to check if the phone number is valid
  const isPhoneInvalid = () => {
    const rawNum = profileData.phone.replace(/^\+91|^\+1/, "");
    return !/^[6-9]\d{9}$/.test(rawNum);
  };

  const handleChildChange = (id, field, value) => {
    setChildren(prev => prev.map(child => {
      if (child.id === id || child._id === id) {
        const updatedChild = { ...child, [field]: value };
        if (field === 'dob') updatedChild.age = calculateAge(value);
        return updatedChild;
      }
      return child;
    }));
  };

  const saveToMongo = async (type) => {
    try {
      await axios.post('http://localhost:5000/api/update-profile', {
        email: profileData.email, 
        fullName: profileData.fullName, 
        phone: profileData.phone,
        numChildren: children.length, 
        children: children 
      });
      alert(type === 'parent' ? "✅ Parent Profile Updated!" : "✅ Child Profiles Updated!");
      setActiveTab('main');
    } catch (err) { alert("Error saving information."); }
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div style={styles.logoText} onClick={() => {setSelectedChild(null); setActiveTab('main'); setViewMode('menu');}}>Vacci_Care</div>
        <div style={styles.profileBtn} onClick={() => setShowDropdown(!showDropdown)}>
            <div style={styles.avatarCircle}>{profileData.fullName ? profileData.fullName[0].toUpperCase() : "U"}</div>
            <span>{String(profileData.fullName || profileData.email || "User")} ▾</span>
            {showDropdown && (
                <div style={styles.dropdown}>
                    <div style={styles.dropItem} onClick={() => {setActiveTab('profile'); setShowDropdown(false);}}>👤 Profile</div>
                    <div style={styles.dropItem} onClick={() => {setActiveTab('children'); setShowDropdown(false);}}>👶 Children</div>
                    <div style={{...styles.dropItem, color: 'red'}} onClick={onLogout}>🚪 Logout</div>
                </div>
            )}
        </div>
      </nav>

      <main style={styles.mainContent}>
        {activeTab === 'main' && !selectedChild && (
          <div style={{width: '100%', maxWidth: '900px'}}>
             {children.length === 0 ? (
                 <div style={styles.heroSection}>
                    <div style={styles.heroOverlay}>
                        <h1 style={styles.heroTitle}>Your Child's Health, <br/>Our Priority.</h1>
                        <button style={styles.heroBtn} onClick={() => setActiveTab('children')}>🚀 Add Child Profile</button>
                    </div>
                    <div style={styles.heroGraphic}>🏥</div>
                 </div>
             ) : (
                <div style={{marginTop:'20px'}}>
                    <AlertCarousel children={children} roadmap={vaccineRoadmap} />
                    <h2 style={{color: '#4A148C', marginBottom:'25px'}}>👋 Welcome Back</h2>
                    {children.map((child) => (
                        <div key={child._id || child.id} style={styles.childBar} onClick={() => {setSelectedChild(child); setViewMode('menu');}}>
                            <div style={styles.childBarLeft}>
                                <div style={styles.miniAvatar}>{child.name ? child.name[0] : "?"}</div>
                                <div>
                                    <div style={styles.barName}>{child.name} ({child.gender})</div>
                                    <div style={styles.barAge}>Age: {child.age} | Weight: {child.weight}kg</div>
                                </div>
                            </div>
                            <span style={{color:'#6A1B9A', fontWeight:'bold'}}>Manage ›</span>
                        </div>
                    ))}
                </div>
             )}
          </div>
        )}

        {selectedChild && viewMode === 'menu' && (
            <div style={{width: '100%', maxWidth: '600px'}}>
                <button onClick={() => setSelectedChild(null)} style={styles.backLink}>← Back to Dashboard</button>
                <div style={styles.glassCard}>
                    <div style={{...styles.miniAvatar, width:'80px', height:'80px', margin:'0 auto 15px', fontSize:'35px', backgroundColor:'#6A1B9A', color:'#fff'}}>{selectedChild.name ? selectedChild.name[0] : "?"}</div>
                    <h2 style={{textAlign:'center', margin:0}}>{selectedChild.name}</h2>
                    <p style={{textAlign:'center', color:'#666', marginBottom:'30px'}}>{selectedChild.age}</p>
                    <div style={styles.menuGrid}>
                        <div style={{...styles.menuItem, padding: '25px 5px'}} onClick={() => setViewMode('roadmap')}>
                            <div style={{fontSize:'35px'}}>🗺️</div>
                            <div style={{fontWeight:'bold', marginTop:'10px', fontSize:'12px'}}>Roadmap</div>
                        </div>
                        <div style={{...styles.menuItem, padding: '25px 5px', border: '2px solid #6A1B9A'}} onClick={() => setShowBooking(true)}>
                            <div style={{fontSize:'35px'}}>📅</div>
                            <div style={{fontWeight:'bold', marginTop:'10px', fontSize:'12px'}}>Appointment</div>
                        </div>
                        <div style={{...styles.menuItem, padding: '25px 5px'}} onClick={() => setViewMode('history')}>
                            <div style={{fontSize:'35px'}}>📜</div>
                            <div style={{fontWeight:'bold', marginTop:'10px', fontSize:'12px'}}>History</div>
                        </div>
                        <div style={{...styles.menuItem, padding: '25px 5px'}} onClick={() => setViewMode('updates')}>
                            <div style={{fontSize:'35px'}}>🔔</div>
                            <div style={{fontWeight:'bold', marginTop:'10px', fontSize:'12px'}}>Updates</div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {selectedChild && viewMode === 'history' && (
          <History selectedChild={selectedChild} vaccineRoadmap={vaccineRoadmap} onBack={() => setViewMode('menu')} />
        )}

        {selectedChild && viewMode === 'updates' && (
          <div style={{width: '100%', maxWidth: '600px'}}>
             <button onClick={() => setViewMode('menu')} style={styles.backLink}>← Back to Menu</button>
             <div style={styles.glassCard}>
                <div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
                  <button 
                    style={{flex: 1, padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: updateSubTab === 'bookings' ? '#6A1B9A' : '#f0f0f0', color: updateSubTab === 'bookings' ? '#fff' : '#666'}} 
                    onClick={() => setUpdateSubTab('bookings')}
                  >
                    Our Bookings
                  </button>
                  <button 
                    style={{flex: 1, padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: updateSubTab === 'notifications' ? '#6A1B9A' : '#f0f0f0', color: updateSubTab === 'notifications' ? '#fff' : '#666'}} 
                    onClick={() => setUpdateSubTab('notifications')}
                  >
                    Notifications
                  </button>
                </div>

                <div style={{marginTop: '20px'}}>
                  {updateSubTab === 'bookings' ? (
                    <div>
                      {selectedChild.pendingAppointment ? (
                        <div style={{display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '12px', marginBottom: '10px'}}>
                           <div style={{fontSize: '24px'}}>📍</div>
                           <div style={{flexGrow: 1}}>
                              <div style={{fontWeight: 'bold', color: '#4A148C'}}>{selectedChild.pendingAppointment.vaccineName}</div>
                              <div style={{fontSize: '14px', color: '#666'}}>{selectedChild.pendingAppointment.date} at {selectedChild.pendingAppointment.timeSlot}</div>
                           </div>
                        </div>
                      ) : (
                        <p style={{textAlign: 'center', color: '#999'}}>No upcoming appointments found.</p>
                      )}
                    </div>
                  ) : (
                    <div>
                      {adminNotifications.filter(n => n.childName === selectedChild.name).length > 0 ? (
                        adminNotifications.filter(n => n.childName === selectedChild.name).map((note) => (
                          <div 
                            key={note._id} 
                            onClick={() => markAsRead(note._id)}
                            style={{
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '15px', 
                              padding: '15px', 
                              backgroundColor: note.status === 'unread' ? '#E3F2FD' : '#f9f9f9', 
                              borderRadius: '12px', 
                              marginBottom: '10px',
                              borderLeft: note.status === 'unread' ? '5px solid #2196F3' : '1px solid #ddd',
                              cursor: 'pointer'
                            }}
                          >
                             <div style={{fontSize: '24px'}}>📢</div>
                             <div style={{flexGrow: 1}}>
                                <div style={{fontWeight: 'bold', color: note.status === 'unread' ? '#0D47A1' : '#333'}}>Admin Message</div>
                                <div style={{fontSize: '14px', color: '#666'}}>{note.message}</div>
                             </div>
                             {note.status === 'unread' && <div style={{width: '10px', height: '10px', backgroundColor: '#2196F3', borderRadius: '50%'}} />}
                          </div>
                        ))
                      ) : null}

                      {selectedChild.notifications && selectedChild.notifications.length > 0 ? (
                        selectedChild.notifications.map((note, i) => (
                          <div key={i} style={{display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '12px', marginBottom: '10px', border: '1px solid #eee'}}>
                             <div style={{fontSize: '24px'}}>🔔</div>
                             <div>
                                <div style={{fontWeight: 'bold'}}>{note.title}</div>
                                <div style={{fontSize: '14px', color: '#666'}}>{note.message}</div>
                             </div>
                          </div>
                        ))
                      ) : null}

                      {adminNotifications.filter(n => n.childName === selectedChild.name).length === 0 && (!selectedChild.notifications || selectedChild.notifications.length === 0) && (
                        <p style={{textAlign: 'center', color: '#999'}}>No notifications for {selectedChild.name}.</p>
                      )}
                    </div>
                  )}
                </div>
             </div>
          </div>
        )}

        {showBooking && (
          <div style={styles.modalOverlay}>
            <div style={{...styles.glassCard, width: '500px', padding: '40px'}}>
              <h2 style={{color: isRescheduling ? '#C62828' : '#4A148C', marginTop:0, textAlign:'center'}}>
                {isRescheduling ? '⚠️ Reschedule Missed Visit' : '🗓️ Schedule Visit'}
              </h2>
              
              {bookingStatus === "success" && (
                <div style={{backgroundColor: '#C8E6C9', color: '#2E7D32', padding: '15px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px', fontWeight: 'bold'}}>
                  ✅ Booking Confirmed Successfully!
                </div>
              )}

              {(() => {
                const eligibility = getBookingEligibility(selectedChild.dob);
                if (!eligibility.canBook) {
                  return (
                    <div style={{textAlign:'center', padding:'20px', backgroundColor:'#FFF9C4', borderRadius:'15px', color:'#F57F17'}}>
                      <div style={{fontSize:'40px'}}>⏳</div>
                      <p style={{fontWeight:'bold', lineHeight:'1.5'}}>{eligibility.message}</p>
                      <button style={{...styles.heroBtn, marginTop:'15px'}} onClick={() => setShowBooking(false)}>Close Window</button>
                    </div>
                  );
                }
                return (
                  <div>
                    {isRescheduling && (
                      <div style={{backgroundColor: '#FFEBEE', padding: '15px', borderRadius: '12px', color: '#C62828', fontSize: '14px', fontWeight: 'bold', marginBottom: '20px', textAlign: 'center', border: '1px solid #FFCDD2'}}>
                        You missed your previous appointment date. Please select a new scheduled date.
                      </div>
                    )}
                    <div style={{backgroundColor: '#F3E5F5', padding: '18px', borderRadius: '15px', marginBottom: '20px', border:'1px solid #E1BEE7', textAlign:'center'}}>
                      <label style={styles.label}>Vaccination Milestone:</label>
                      <div style={{fontWeight: 'bold', color: '#4A148C', fontSize: '18px'}}>📍 {eligibility.vaccine}</div>
                    </div>
                    
                    <label style={styles.label}>1. Select Start Date</label>
                    <input 
                      type="date" 
                      style={{...styles.input, marginBottom: '20px'}} 
                      min="2026-04-05" 
                      max="2026-06-15" 
                      onChange={(e) => handleDateSelection(e.target.value)} 
                    />

                    {availableDates.length > 0 && (
                      <>
                        <label style={styles.label}>2. Choose a Day</label>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px'}}>
                          {availableDates.map(d => (
                            <button key={d.full} onClick={() => setBookingData({...bookingData, selectedDate: d.full})} style={{padding:'10px', borderRadius:'10px', border:'1px solid #6A1B9A', cursor:'pointer', backgroundColor: bookingData.selectedDate === d.full ? '#6A1B9A' : '#fff', color: bookingData.selectedDate === d.full ? '#fff' : '#6A1B9A'}}>
                              {d.display}
                            </button>
                          ))}
                        </div>
                        <label style={styles.label}>3. Select Time Slot</label>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'20px'}}>
                            {["09:00 AM", "10:30 AM", "12:00 PM", "02:30 PM", "04:00 PM"].map(slot => (
                                <button key={slot} style={{padding:'10px', borderRadius:'10px', border:'1px solid #6A1B9A', cursor:'pointer', backgroundColor: bookingData.slot === slot ? '#6A1B9A' : '#fff', color: bookingData.slot === slot ? '#fff' : '#6A1B9A'}} onClick={() => setBookingData({...bookingData, slot: slot})}>
                                    {slot}
                                </button>
                            ))}
                        </div>
                      </>
                    )}

                    {bookingStatus && bookingStatus !== "success" && (
                      <div style={{color: 'red', textAlign: 'center', marginBottom: '10px', fontSize: '14px'}}>{bookingStatus}</div>
                    )}

                    <div style={{display:'flex', gap:'15px', marginTop:'30px'}}>
                      <button style={{...styles.saveBtn, backgroundColor:'#f5f5f5', color:'#666'}} onClick={() => {setShowBooking(false); setIsRescheduling(false); setBookingStatus(null);}}>Cancel</button>
                      <button style={{...styles.saveBtn, backgroundColor: isRescheduling ? '#D32F2F' : '#6A1B9A'}} onClick={handleBooking}>Confirm</button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {selectedChild && viewMode === 'roadmap' && (
            <div style={{width: '100%', maxWidth: '800px'}}>
                <button onClick={() => setViewMode('menu')} style={styles.backLink}>← Back to {selectedChild.name}</button>
                <div style={styles.roadmapHeader}>
                    <h1 style={{color:'#4A148C', margin:0}}>Vaccination Roadmap</h1>
                </div>
                <div style={styles.timelineContainer}>
                    {vaccineRoadmap.map((item, idx) => {
                        const status = getMilestoneStatus(selectedChild.dob, item.months);
                        return (
                            <div key={idx} style={{...styles.timelineItem, opacity: status === 'completed' ? 1 : 0.7}}>
                                <div style={styles.timelineLeft}>
                                    <div style={{...styles.timelineIcon, border: status === 'completed' ? '3px solid #4CAF50' : '2px solid #ddd'}}>{status === 'completed' ? "✅" : item.icon}</div>
                                    <div style={{...styles.timelineLine, backgroundColor: status === 'completed' ? '#4CAF50' : '#E1BEE7'}}></div>
                                </div>
                                <div style={{...styles.timelineContent, borderLeft: status === 'completed' ? '5px solid #4CAF50' : '1px solid #f0f0f0'}}>
                                    <h3 style={{margin:0, color: status === 'completed' ? '#2E7D32' : '#6A1B9A'}}>{item.age}</h3>
                                    <div style={{display:'flex', flexWrap:'wrap', gap:'8px', marginTop:'10px'}}>
                                        {item.vaccines.map((v, i) => (
                                          <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                                            <span style={{...styles.vaccineTag, backgroundColor: status === 'completed' ? '#C8E6C9' : '#F3E5F5'}}>{v}</span>
                                            <span style={{fontSize: '10px', color: '#888', marginTop: '2px', fontWeight: 'bold'}}>{item.prices[i]}</span>
                                          </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {activeTab === 'children' && (
            <div style={{width:'100%', maxWidth:'600px'}}>
                <button onClick={() => setActiveTab('main')} style={styles.backLink}>← Back to Dashboard</button>
                <button style={styles.addBtn} onClick={() => setChildren([...children, {id: `temp-${Date.now()}`, name:'', dob:'', gender:'', weight:'', age:''}])}>➕ Add Child Profile</button>
                {children.map((child, index) => (
                    <div key={child._id || child.id} style={styles.glassCard} ref={index === children.length - 1 ? lastChildRef : null}>
                        <div style={{display:'flex', justifyContent:'space-between'}}>
                            <h3 style={{color:'#4A148C'}}>👶 Child Profile #{index+1}</h3>
                            <button onClick={() => setChildren(children.filter(c => (c._id || c.id) !== (child._id || child.id)))} style={{color:'red', border:'none', background:'none', cursor:'pointer'}}>Remove</button>
                        </div>
                        <label style={styles.label}>Full Name</label>
                        <input style={styles.input} value={child.name} onChange={(e)=>handleChildChange(child._id || child.id, 'name', e.target.value)} />
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                            <div>
                                <label style={styles.label}>Date of Birth</label>
                                <input style={styles.input} type="date" min={minDateLimit} max={maxDateLimit} value={child.dob} onChange={(e)=>handleChildChange(child._id || child.id, 'dob', e.target.value)} />
                            </div>
                            <div>
                                <label style={styles.label}>Gender</label>
                                <select style={styles.input} value={child.gender} onChange={(e)=>handleChildChange(child._id || child.id, 'gender', e.target.value)}>
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>
                            </div>
                        </div>
                        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px', marginTop:'15px'}}>
                            <div>
                                <label style={styles.label}>Weight (kg)</label>
                                <input style={{...styles.input, borderColor: (parseFloat(child.weight) > 20) ? 'red' : '#ddd'}} type="number" value={child.weight} onChange={(e)=>handleChildChange(child._id || child.id, 'weight', e.target.value)} />
                            </div>
                            <div>
                                <label style={styles.label}>Calculated Age</label>
                                <input style={styles.input} value={child.age} readOnly />
                            </div>
                        </div>
                    </div>
                ))}
                <button style={{...styles.saveBtn, opacity: isFormInvalid() ? 0.5 : 1}} onClick={() => saveToMongo('children')} disabled={isFormInvalid()}>💾 Save Information</button>
            </div>
        )}

        {activeTab === 'profile' && (
            <div style={{width:'100%', maxWidth:'600px'}}>
                <button onClick={() => setActiveTab('main')} style={styles.backLink}>← Back to Dashboard</button>
                <div style={styles.glassCard}>
                    <h3 style={{color:'#4A148C', textAlign:'center'}}>Parent Profile</h3>
                    <label style={styles.label}>Full Name</label>
                    <input style={styles.input} value={profileData.fullName} onChange={(e)=>setProfileData({...profileData, fullName:e.target.value})} />
                    
                    <label style={{...styles.label, marginTop:'15px'}}>Phone Number</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        style={{ padding: '10px', borderRadius: '10px', border: '1px solid #ddd', backgroundColor: '#f8f9fa', fontWeight: 'bold' }}
                        value={profileData.phone.startsWith("+1") ? "+1" : "+91"}
                        onChange={(e) => {
                          const code = e.target.value;
                          const num = profileData.phone.replace(/^\+91|^\+1/, "");
                          setProfileData({...profileData, phone: code + num});
                        }}
                      >
                        <option value="+91">+91 (IND)</option>
                        <option value="+1">+1 (USA)</option>
                      </select>
                      <input 
                        style={styles.input} 
                        placeholder="10 digits starting with 6-9"
                        maxLength="10"
                        value={profileData.phone.replace(/^\+91|^\+1/, "")} 
                        onChange={(e)=>{
                          const val = e.target.value.replace(/\D/g, '');
                          const code = profileData.phone.startsWith("+1") ? "+1" : "+91";
                          setProfileData({...profileData, phone: code + val});
                        }} 
                      />
                    </div>
                    {profileData.phone.length > 3 && isPhoneInvalid() && (
                      <span style={{color: 'red', fontSize: '11px'}}>Must start with 6,7,8,9 and be 10 digits</span>
                    )}

                    <button 
                      style={{...styles.saveBtn, marginTop:'20px', opacity: isPhoneInvalid() ? 0.5 : 1}} 
                      onClick={() => saveToMongo('parent')}
                      disabled={isPhoneInvalid()}
                    >
                      Save Profile
                    </button>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};

// --- STYLES ---
const carouselStyles = {
  wrapper: { width: '100%', overflow: 'hidden', borderRadius: '25px', marginBottom: '30px', boxShadow: '0 10px 20px rgba(74, 20, 140, 0.1)' },
  inner: { display: 'flex', transition: 'transform 0.6s ease-in-out' },
  slide: { minWidth: '100%', background: 'linear-gradient(135deg, #6A1B9A 0%, #4A148C 100%)', padding: '30px', color: 'white', boxSizing: 'border-box' },
  content: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  badge: { backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px' },
  title: { fontSize: '28px', margin: '10px 0' },
  timer: { backgroundColor: '#FFC107', color: '#4A148C', padding: '8px 16px', borderRadius: '10px', display: 'inline-block', fontWeight: 'bold' },
  bigIcon: { fontSize: '80px', opacity: 0.8 }
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f4f7fe', fontFamily: '"Segoe UI", sans-serif' },
  navbar: { display: 'flex', justifyContent: 'space-between', padding: '15px 60px', backgroundColor: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', alignItems:'center', position:'sticky', top:0, zIndex:100 },
  logoText: { fontSize: '24px', fontWeight: 'bold', color: '#6A1B9A', cursor: 'pointer' },
  profileBtn: { display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', position: 'relative', padding:'5px 15px', borderRadius:'20px', border:'1px solid #eee' },
  avatarCircle: { width: '35px', height: '35px', borderRadius: '50%', backgroundColor: '#6A1B9A', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' },
  dropdown: { position: 'absolute', top: '45px', right: 0, backgroundColor: '#fff', width: '180px', boxShadow: '0 5px 15px rgba(0,0,0,0.1)', borderRadius: '8px', zIndex: 10, padding:'10px 0' },
  dropItem: { padding: '10px 20px', cursor:'pointer' },
  mainContent: { padding: '40px', display: 'flex', justifyContent: 'center' },
  heroSection: { backgroundColor: '#6A1B9A', borderRadius: '30px', padding: '60px', color: 'white', display: 'flex', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' },
  heroOverlay: { zIndex: 2, maxWidth: '60%' },
  heroTitle: { fontSize: '42px', margin: 0 },
  heroBtn: { backgroundColor: '#FFC107', color: '#4A148C', border: 'none', padding: '15px 30px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' },
  heroGraphic: { fontSize: '150px', opacity: 0.2, position: 'absolute', right: '30px', transform: 'rotate(15deg)' },
  childBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 30px', backgroundColor: '#fff', borderRadius: '20px', marginBottom: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border:'1px solid #f0f0f0' },
  childBarLeft: { display: 'flex', gap: '20px', alignItems: 'center' },
  miniAvatar: { width: '50px', height: '50px', backgroundColor: '#F3E5F5', color: '#6A1B9A', borderRadius: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold', fontSize:'20px' },
  barName: { fontWeight: 'bold', fontSize: '18px' },
  barAge: { color: '#888', fontSize: '14px' },
  glassCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', marginBottom:'20px' },
  backLink: { background: 'none', border: 'none', color: '#6A1B9A', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px', display: 'block' },
  label: { fontSize:'12px', fontWeight:'bold', color:'#888', display:'block', marginBottom:'5px' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', boxSizing:'border-box' },
  menuGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginTop: '20px' },
  menuItem: { padding: '20px 10px', border: '1px solid #f0f0f0', borderRadius: '15px', cursor: 'pointer', textAlign:'center' },
  timelineContainer: { paddingLeft: '20px' },
  timelineItem: { display: 'flex', gap: '25px', marginBottom: '10px' },
  timelineLeft: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  timelineIcon: { width: '45px', height: '45px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2, fontSize:'18px', backgroundColor:'#fff', boxShadow:'0 2px 5px rgba(0,0,0,0.1)' },
  timelineLine: { width: '3px', flexGrow: 1, backgroundColor: '#E1BEE7' },
  timelineContent: { padding: '20px 25px', borderRadius: '20px', flexGrow: 1, border:'1px solid #f0f0f0', backgroundColor:'#fff' },
  vaccineTag: { padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: '#6A1B9A', backgroundColor:'#F3E5F5' },
  roadmapHeader: { textAlign: 'center', marginBottom: '30px' },
  saveBtn: { width: '100%', padding: '15px', backgroundColor: '#6A1B9A', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },
  addBtn: { marginBottom: '20px', padding: '12px 25px', backgroundColor: '#4A148C', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight:'bold' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000, backdropFilter: 'blur(5px)' }
};

export default Dashboard;