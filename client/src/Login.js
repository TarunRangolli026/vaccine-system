import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import ForgotPassword from './ForgotPassword';

const Login = ({ onLoginSuccess }) => {
  const [view, setView] = useState('landing');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
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

    try {
      const endpoint = isRegistering ? 'signup' : 'login';
      const payload = isRegistering 
        ? { email: formData.email, password: formData.password, fullName: formData.username }
        : { email: formData.email, password: formData.password };

      const res = await axios.post(`http://localhost:5000/api/${endpoint}`, payload);
      
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
    <div style={{...styles.container, backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.65)), url(${backgroundHospital})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed'}}>
      {view === 'landing' && (
        <div style={styles.hero}>
          <div style={styles.floatingBoxTopLeft}><img src={babyVaccine} alt="Vaccine" style={styles.floatingImg} /><p style={styles.imgLabel}>Safe Dosing</p></div>
          <div style={styles.floatingBoxTopRight}><img src={medicalCheckup} alt="Checkup" style={styles.floatingImg} /><p style={styles.imgLabel}>Full Checkup</p></div>
          <div style={styles.logoCircle}>💉</div>
          <h1 style={styles.titleLanding}>Vacci_Care</h1>
          <p style={styles.subtitleLanding}>Ensuring a healthier tomorrow for your little ones.</p>
          <button style={styles.mainBtnLarge} onClick={() => setView('selection')}>Get Connected With Us</button>
          <div style={styles.floatingBoxBottomLeft}><img src={doctorImage} alt="Doctor" style={styles.floatingImg} /><p style={styles.imgLabel}>Expert Doctors</p></div>
          <div style={styles.floatingBoxBottomRight}><img src={clinicPlay} alt="Clinic" style={styles.floatingImg} /><p style={styles.imgLabel}>Friendly Clinic</p></div>
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
                    onChange={(e)=>setFormData({...formData, password: e.target.value})}
                    onFocus={() => setIsPasswordFocused(true)}
                    required 
                  />
                  <span style={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>{showPassword ? "👁️‍" : "👁️"}</span>
                </div>

                {isRegistering && isPasswordFocused && (
                  <div style={styles.hintContainer}>
                    {!hasMinLen && <p style={styles.hintText}>• 8 to 15 characters</p>}
                    {!hasUpper && <p style={styles.hintText}>• At least one uppercase letter</p>}
                    {!hasSpecial && <p style={styles.hintText}>• At least one special character (!@#$%^&*)</p>}
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
              {view !== 'adminLogin' && <p style={styles.toggle} onClick={() => {setIsRegistering(!isRegistering); setIsPasswordFocused(false);}}>{isRegistering ? "Already have an account? Login" : "New parent? Register here"}</p>}
              <p style={styles.back} onClick={() => setView('selection')}>← Back</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: '"Segoe UI", sans-serif', overflow: 'hidden', position: 'relative' },
  hero: { textAlign: 'center', color: 'white', zIndex: 1 },
  logoCircle: { fontSize: '50px', background: 'white', width: '90px', height: '90px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px', boxShadow: '0 8px 20px rgba(0,0,0,0.3)' },
  titleLanding: { fontSize: '65px', margin: '0', fontWeight: 'bold' },
  subtitleLanding: { fontSize: '22px', marginBottom: '35px', fontWeight: '300' },
  mainBtnLarge: { padding: '18px 45px', backgroundColor: '#6A1B9A', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '20px', fontWeight: 'bold' },
  floatingBoxTopLeft: { position: 'absolute', top: '5%', left: '5%', width: '170px', background: 'white', padding: '10px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' },
  floatingBoxTopRight: { position: 'absolute', top: '8%', right: '8%', width: '170px', background: 'white', padding: '10px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' },
  floatingBoxBottomLeft: { position: 'absolute', bottom: '10%', left: '10%', width: '190px', background: 'white', padding: '10px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' },
  floatingBoxBottomRight: { position: 'absolute', bottom: '5%', right: '5%', width: '180px', background: 'white', padding: '10px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.3)' },
  floatingImg: { width: '100%', borderRadius: '10px', height: '115px', objectFit: 'cover' },
  imgLabel: { color: '#4A148C', fontSize: '14px', margin: '8px 0 0', fontWeight: 'bold' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '25px', width: '360px', textAlign: 'center', zIndex: 10, boxShadow: '0 20px 50px rgba(0,0,0,0.4)' },
  roleBtn: { width: '100%', padding: '14px', margin: '10px 0', borderRadius: '12px', border: '2px solid #6A1B9A', color: '#6A1B9A', cursor: 'pointer', background: 'none', fontWeight: 'bold' },
  input: { width: '100%', padding: '14px', margin: '10px 0', borderRadius: '10px', border: '1px solid #ddd', fontSize: '15px', outline: 'none' },
  eyeIcon: { position: 'absolute', right: '15px', top: '22px', cursor: 'pointer', fontSize: '18px' },
  mainBtn: { width: '100%', padding: '14px', background: '#6A1B9A', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', marginTop: '15px', fontWeight: 'bold' },
  back: { marginTop: '20px', cursor: 'pointer', color: '#6A1B9A', fontWeight: '600' },
  toggle: { marginTop: '15px', fontSize: '14px', cursor: 'pointer', color: '#7B1FA2', fontWeight: '600' },
  hintContainer: { textAlign: 'left', marginTop: '-5px', marginBottom: '10px', paddingLeft: '5px' },
  hintText: { color: '#D32F2F', fontSize: '12px', margin: '2px 0', fontWeight: '500' },
  
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