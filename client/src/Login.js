import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ForgotPassword from './ForgotPassword';

const Login = ({ onLoginSuccess }) => {
  const [view, setView] = useState('landing');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // --- CAPTCHA States ---
  const [captchaCode, setCaptchaCode] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaError, setCaptchaError] = useState(""); 

  const backgroundHospital = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop";
  const babyVaccine = "https://images.pexels.com/photos/3845129/pexels-photo-3845129.jpeg?auto=compress&cs=tinysrgb&w=600";
  const doctorImage = "https://images.pexels.com/photos/4173239/pexels-photo-4173239.jpeg?auto=compress&cs=tinysrgb&w=600";
  const clinicPlay = "https://images.pexels.com/photos/127873/pexels-photo-127873.jpeg?auto=compress&cs=tinysrgb&w=600";
  const medicalCheckup = "https://images.pexels.com/photos/3985227/pexels-photo-3985227.jpeg?auto=compress&cs=tinysrgb&w=600";

  // --- CAPTCHA Generator (Letters + Numbers) ---
  const generateCaptcha = useCallback(() => {
    const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput(""); 
    // We don't clear captchaError here so the user can see it briefly
  }, []);

  useEffect(() => {
    if (view === 'parentAuth' || view === 'adminLogin') {
      generateCaptcha();
      setCaptchaError(""); // Clear error when switching views
    }
  }, [view, isRegistering, generateCaptcha]);

  const hasMinLen = formData.password.length >= 8 && formData.password.length <= 15;
  const hasUpper = /[A-Z]/.test(formData.password);
  const hasSpecial = /[!@#$%^&*]/.test(formData.password);
  const hasConfirmMatch = formData.password === formData.confirmPassword;

  const handleAuth = async (e) => {
    e.preventDefault();

    // --- CAPTCHA Validation ---
    if (captchaInput !== captchaCode) {
      setCaptchaError("❌ Incorrect CAPTCHA. Please try again.");
      generateCaptcha(); // Refresh code on failure
      return; 
    }

    // If correct, clear the error
    setCaptchaError("");

    if (view === 'adminLogin') {
      if (formData.email === 'Sharan@gmail.com' && formData.password === 'admin@123') {
        onLoginSuccess({ fullName: 'Dr. Sharan', role: 'admin' });
      } else {
        alert("Invalid Admin Credentials");
        generateCaptcha();
      }
      return;
    }

    if (isRegistering && (!hasMinLen || !hasUpper || !hasSpecial)) {
      alert("Please fulfill all password requirements.");
      return;
    }

    if (isRegistering && !hasConfirmMatch) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const endpoint = isRegistering ? 'signup' : 'login';
      const payload = isRegistering 
        ? { email: formData.email, password: formData.password, fullName: formData.username }
        : { email: formData.email, password: formData.password };

      const res = await axios.post(`http://13.126.218.232:5000/api/${endpoint}`, payload);
      
      if (isRegistering) {
        onLoginSuccess({ email: formData.email, fullName: formData.username, role: 'parent', children: [] });
      } else {
        onLoginSuccess(res.data);
      }
    } catch (error) {
      alert(error.response?.data?.error || "Action failed.");
      generateCaptcha();
    }
  };

  return (
    <div style={{...styles.container, backgroundImage: `linear-gradient(rgba(10,0,30,0.78), rgba(40,0,80,0.82)), url(${backgroundHospital})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>

      {view === 'landing' && <div style={styles.blob1} />}
      {view === 'landing' && <div style={styles.blob2} />}
      {view === 'landing' && <div style={styles.blob3} />}

      {view === 'landing' && (
        <div style={styles.landingWrapper}>

          {/* Navbar */}
          <div style={styles.navStrip}>
            <div style={styles.navLogo}>
              <span style={styles.navLogoIcon}>🏥</span>
              <div>
                <div style={styles.navLogoText}>MALAPRABHA Multispeciality Hospital</div>
                <div style={styles.navLogoSub}>Bailhongal, Karnataka</div>
              </div>
            </div>
            <div style={styles.navBadge}>💉 Vaccination Portal</div>
          </div>

          {/* Hero */}
          <div style={styles.heroSection}>
            <div style={styles.heroLeft}>
              <span style={styles.heroPill}>🌟 Trusted by 500+ Families in Bailhongal</span>
              <h1 style={styles.heroTitle}>Smart Vaccination<br/><span style={styles.heroAccent}>Care for Your Child</span></h1>
              <p style={styles.heroDesc}>
                MALAPRABHA Multispeciality Hospital brings you a digital vaccination management portal —
                track your child's immunization milestones, book appointments with expert doctors,
                receive real-time reminders, and access official health certificates, all from one place.
              </p>
              <div style={styles.statsRow}>
                <div style={styles.statGlass}><span style={styles.statNum}>500+</span><span style={styles.statLabel}>Families</span></div>
                <div style={styles.statGlass}><span style={styles.statNum}>9</span><span style={styles.statLabel}>Milestones</span></div>
                <div style={styles.statGlass}><span style={styles.statNum}>24/7</span><span style={styles.statLabel}>Access</span></div>
              </div>
              <button style={styles.mainBtnLarge} onClick={() => setView('selection')}>Get Started →</button>
            </div>
            <div style={styles.heroRight}>
              <div style={styles.imgCardMain}>
                <img src={babyVaccine} alt="Baby Vaccine" style={styles.imgMain} />
                <div style={styles.imgCardBadge}>💉 Safe Vaccination</div>
              </div>
              <div style={styles.imgCardSmallCol}>
                <div style={styles.imgCardSmall}>
                  <img src={doctorImage} alt="Doctor" style={styles.imgSmall} />
                  <div style={styles.imgSmallLabel}>👨⚕️ Expert Doctors</div>
                </div>
                <div style={styles.imgCardSmall}>
                  <img src={medicalCheckup} alt="Checkup" style={styles.imgSmall} />
                  <div style={styles.imgSmallLabel}>🩺 Full Checkup</div>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div style={styles.aboutGlass}>
            <h2 style={styles.aboutTitle}>About Our Portal</h2>
            <p style={styles.aboutDesc}>
              The <strong>Malaprabha Vaccination Portal</strong> is a dedicated digital health platform built for parents
              in Bailhongal and surrounding communities. Our system follows the <strong>National Immunization Schedule</strong>
              to ensure every child receives timely vaccinations from birth to 16 years. Parents can register their children,
              view personalized vaccine roadmaps, schedule appointments, and download official vaccination certificates —
              all secured and accessible 24/7.
            </p>
          </div>

          {/* Features */}
          <div style={styles.featuresRow}>
            {[
              { icon: '🗺️', title: 'Vaccine Roadmap', desc: 'Personalized milestone tracking from birth to 16 years.' },
              { icon: '📅', title: 'Book Appointments', desc: 'Schedule visits with doctors in just a few clicks.' },
              { icon: '📜', title: 'Health Certificates', desc: 'Download official vaccination records anytime.' },
              { icon: '🔔', title: 'Smart Reminders', desc: 'Get notified before every upcoming vaccine milestone.' },
            ].map((f, i) => (
              <div key={i} style={styles.featureGlass}>
                <div style={styles.featureIcon}>{f.icon}</div>
                <div style={styles.featureTitle}>{f.title}</div>
                <div style={styles.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Image Strip */}
          <div style={styles.imageStrip}>
            {[clinicPlay, medicalCheckup, doctorImage, babyVaccine].map((src, i) => (
              <img key={i} src={src} alt="medical" style={styles.stripImg} />
            ))}
          </div>

        </div>
      )}

      {view === 'forgot' && (
        <ForgotPassword onBack={() => setView('parentAuth')} />
      )}

      {(view === 'selection' || view === 'parentAuth' || view === 'adminLogin') && (
        <div style={styles.card}>
          {view === 'selection' ? (
            <>
              <h2 style={{color: '#4A148C', marginBottom: '20px'}}>Identify Yourself</h2>
              <button style={styles.roleBtn} onClick={() => { setView('parentAuth'); setIsRegistering(false); }}>I'm a Parent</button>
              <button style={styles.roleBtn} onClick={() => { setView('adminLogin'); setIsRegistering(false); }}>I'm an Admin</button>
              <p style={styles.back} onClick={() => setView('landing')}>← Back to Home</p>
            </>
          ) : (
            <>
              <h2 style={{color: '#4A148C', marginBottom: '15px'}}>{view === 'adminLogin' ? 'Admin Access' : (isRegistering ? 'Register Account' : 'Parent Login')}</h2>
              <form onSubmit={handleAuth} autoComplete="off">
                {isRegistering && <input style={styles.input} placeholder="Full Name" value={formData.username} onChange={(e)=>setFormData({...formData, username: e.target.value})} required />}
                <input style={styles.input} type="email" placeholder="Email Address" value={formData.email} onChange={(e)=>setFormData({...formData, email: e.target.value})} required />
                
                <div style={{position: 'relative'}}>
                  <input 
                    style={styles.input} 
                    type={showPassword ? "text" : "password"} 
                    placeholder="Password" 
                    value={formData.password} 
                    onChange={(e) => { setFormData({...formData, password: e.target.value}); setIsPasswordFocused(true); }}
                    onFocus={() => setIsPasswordFocused(true)}
                    required 
                  />
                  <span style={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "👁️‍" : "👁️"}</span>
                </div>

                {view !== 'adminLogin' && isRegistering && (
                  <div style={{ position: 'relative' }}>
                    <input
                      style={styles.input}
                      type={showPassword ? "text" : "password"}
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      onFocus={() => setIsPasswordFocused(true)}
                      required
                    />
                  </div>
                )}

                {view !== 'adminLogin' && isPasswordFocused && formData.password.length > 0 && (
                  <div style={styles.hintContainer}>
                    {!hasMinLen && <p style={styles.hintItem}>• 8 to 15 characters</p>}
                    {!hasUpper && <p style={styles.hintItem}>• At least one uppercase letter</p>}
                    {!hasSpecial && <p style={styles.hintItem}>• At least one special character (!@#$%^&*)</p>}
                    {isRegistering && formData.confirmPassword && !hasConfirmMatch && <p style={styles.hintItem}>• Passwords must match</p>}
                  </div>
                )}

                {/* --- REALISTIC CAPTCHA UI --- */}
                <div style={styles.captchaWrapper}>
                  <div style={styles.captchaBox}>
                    <div style={styles.captchaVisual}>
                      {captchaCode}
                      <div style={styles.distortionLine}></div>
                    </div>
                    <button type="button" onClick={generateCaptcha} title="Refresh Captcha" style={styles.refreshBtn}>🔄</button>
                  </div>
                  <input 
                    style={{
                        ...styles.input, 
                        marginTop: '8px', 
                        marginBottom: '0',
                        borderColor: captchaError ? '#e53935' : '#ddd' // Red border on error
                    }} 
                    placeholder="Enter the code shown" 
                    value={captchaInput} 
                    onChange={(e) => {
                        setCaptchaInput(e.target.value);
                        if(captchaError) setCaptchaError(""); // Clear error while they type
                    }} 
                    required 
                  />
                  {captchaError && <div style={styles.captchaErrorBox}>{captchaError}</div>}
                </div>

                {view === 'parentAuth' && !isRegistering && (
                  <div style={{ textAlign: 'right', marginTop: '5px' }}>
                    <span onClick={() => setView('forgot')} style={{ color: '#6A1B9A', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>
                      Forgot Password?
                    </span>
                  </div>
                )}

                <button style={styles.mainBtn} type="submit">{isRegistering ? 'Sign Up' : 'Login'}</button>
              </form>
              {view !== 'adminLogin' && <p style={styles.toggle} onClick={() => { setIsRegistering(!isRegistering); setIsPasswordFocused(false); setFormData({ username: '', email: '', password: '', confirmPassword: '' }); }}>{isRegistering ? "Already have an account? Login" : "New parent? Register here"}</p>}
              <p style={styles.back} onClick={() => setView('selection')}>← Back</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: '"Segoe UI", sans-serif', overflowX: 'hidden', position: 'relative' },

  // Blobs
  blob1: { position: 'fixed', top: '-150px', right: '-150px', width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(106,27,154,0.35) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  blob2: { position: 'fixed', bottom: '-150px', left: '-150px', width: '450px', height: '450px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,193,7,0.2) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 },
  blob3: { position: 'fixed', top: '40%', left: '30%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(33,150,243,0.1) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 },

  // Landing wrapper
  landingWrapper: { width: '100%', maxWidth: '1100px', padding: '20px 30px 40px', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '30px' },

  // Navbar
  navStrip: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '14px 28px' },
  navLogo: { display: 'flex', alignItems: 'center', gap: '12px' },
  navLogoIcon: { fontSize: '36px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '6px 10px', border: '1px solid rgba(255,255,255,0.2)' },
  navLogoText: { color: 'white', fontWeight: '800', fontSize: '17px' },
  navLogoSub: { color: 'rgba(255,255,255,0.55)', fontSize: '11px', marginTop: '2px' },
  navBadge: { background: 'rgba(255,193,7,0.18)', border: '1px solid rgba(255,193,7,0.35)', color: '#FFC107', padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: '700' },

  // Hero
  heroSection: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '40px', background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '30px', padding: '50px 50px' },
  heroLeft: { flex: 1 },
  heroPill: { display: 'inline-block', background: 'rgba(255,193,7,0.2)', border: '1px solid rgba(255,193,7,0.4)', color: '#FFC107', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', marginBottom: '18px' },
  heroTitle: { fontSize: '46px', fontWeight: '900', color: 'white', margin: '0 0 16px', lineHeight: 1.15 },
  heroAccent: { color: '#FFC107' },
  heroDesc: { fontSize: '15px', color: 'rgba(255,255,255,0.78)', lineHeight: '1.8', marginBottom: '28px', maxWidth: '480px' },
  statsRow: { display: 'flex', gap: '16px', marginBottom: '30px' },
  statGlass: { background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', padding: '14px 22px', textAlign: 'center' },
  statNum: { display: 'block', fontSize: '22px', fontWeight: '900', color: '#FFC107' },
  statLabel: { display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.65)', marginTop: '4px' },
  mainBtnLarge: { padding: '15px 36px', backgroundColor: '#6A1B9A', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '16px', fontWeight: '800', boxShadow: '0 10px 30px rgba(106,27,154,0.5)', letterSpacing: '0.03em' },

  // Hero images
  heroRight: { display: 'flex', gap: '14px', alignItems: 'stretch', flexShrink: 0 },
  imgCardMain: { position: 'relative', borderRadius: '22px', overflow: 'hidden', width: '200px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' },
  imgMain: { width: '100%', height: '260px', objectFit: 'cover', display: 'block' },
  imgCardBadge: { position: 'absolute', bottom: '12px', left: '10px', right: '10px', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', fontSize: '11px', fontWeight: '700', padding: '6px 10px', borderRadius: '10px', textAlign: 'center' },
  imgCardSmallCol: { display: 'flex', flexDirection: 'column', gap: '14px' },
  imgCardSmall: { position: 'relative', borderRadius: '18px', overflow: 'hidden', width: '150px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' },
  imgSmall: { width: '100%', height: '115px', objectFit: 'cover', display: 'block' },
  imgSmallLabel: { background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', color: 'white', fontSize: '10px', fontWeight: '700', padding: '5px 8px', textAlign: 'center' },

  // About glass
  aboutGlass: { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '24px', padding: '36px 44px', textAlign: 'center' },
  aboutTitle: { color: '#FFC107', fontSize: '22px', fontWeight: '800', margin: '0 0 14px' },
  aboutDesc: { color: 'rgba(255,255,255,0.8)', fontSize: '15px', lineHeight: '1.85', margin: 0 },

  // Features
  featuresRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' },
  featureGlass: { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '20px', padding: '26px 20px', textAlign: 'center' },
  featureIcon: { fontSize: '32px', marginBottom: '12px' },
  featureTitle: { color: '#FFC107', fontWeight: '800', fontSize: '14px', marginBottom: '8px' },
  featureDesc: { color: 'rgba(255,255,255,0.7)', fontSize: '12px', lineHeight: '1.6' },

  // Image strip
  imageStrip: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' },
  stripImg: { width: '100%', height: '110px', objectFit: 'cover', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', filter: 'brightness(0.85)' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '25px', width: '360px', textAlign: 'center', zIndex: 10, boxShadow: '0 20px 50px rgba(0,0,0,0.4)' },
  roleBtn: { width: '100%', padding: '14px', margin: '10px 0', borderRadius: '12px', border: '2px solid #6A1B9A', color: '#6A1B9A', cursor: 'pointer', background: 'none', fontWeight: 'bold' },
  input: { width: '100%', padding: '14px', margin: '10px 0', borderRadius: '10px', border: '1px solid #ddd', fontSize: '15px', outline: 'none' },
  eyeIcon: { position: 'absolute', right: '15px', top: '22px', cursor: 'pointer', fontSize: '18px' },
  mainBtn: { width: '100%', padding: '14px', background: '#6A1B9A', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', marginTop: '15px', fontWeight: 'bold' },
  back: { marginTop: '20px', cursor: 'pointer', color: '#6A1B9A', fontWeight: '600' },
  toggle: { marginTop: '15px', fontSize: '14px', cursor: 'pointer', color: '#7B1FA2', fontWeight: '600' },
  hintContainer: { textAlign: 'left', marginTop: '-5px', marginBottom: '10px', padding: '10px 14px', background: '#fff8e1', borderRadius: '10px', border: '1px solid #ffe082' },
  hintItem: { color: '#c62828', fontSize: '12px', margin: '4px 0', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', animation: 'fadeIn 0.3s ease' },
  
  // CAPTCHA STYLES
  captchaWrapper: { margin: '15px 0', textAlign: 'left' },
  captchaBox: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    background: '#e8eaf6', 
    padding: '8px 12px', 
    borderRadius: '10px',
    border: '1px solid #c5cae9'
  },
  captchaVisual: { 
    position: 'relative',
    fontSize: '24px', 
    fontWeight: '800', 
    fontStyle: 'italic', 
    color: '#1a237e', 
    letterSpacing: '6px',
    userSelect: 'none',
    fontFamily: '"Courier New", Courier, monospace',
    padding: '5px 10px',
    borderRadius: '5px',
    overflow: 'hidden'
  },
  distortionLine: {
    position: 'absolute',
    top: '50%',
    left: '0',
    width: '100%',
    height: '2px',
    background: 'rgba(0,0,0,0.15)',
    transform: 'rotate(-7deg)',
    pointerEvents: 'none'
  },
  refreshBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' },
  captchaErrorBox: { 
    color: '#d32f2f', 
    fontSize: '13px', 
    marginTop: '6px', 
    fontWeight: '600', 
    textAlign: 'center',
    padding: '4px',
    background: '#ffebee',
    borderRadius: '5px'
  }
};

export default Login;