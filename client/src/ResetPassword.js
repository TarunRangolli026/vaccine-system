import React, { useState } from 'react';
import axios from 'axios';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isFinished, setIsFinished] = useState(false);
  const [isFocused, setIsFocused] = useState(false); // To show hints only when typing

  // 1. Manually grab the token from the URL
  const token = window.location.pathname.split('/').pop();

  // --- Live Validation Checks ---
  const hasMinLen = password.length >= 8 && password.length <= 15;
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*]/.test(password);

  const handleReset = async (e) => {
    e.preventDefault();

    // Final security check before sending to server
    if (!hasMinLen || !hasUpper || !hasSpecial) {
      return setStatus({ type: 'error', message: "❌ Please fulfill all password requirements." });
    }

    if (password !== confirmPassword) {
      return setStatus({ type: 'error', message: "❌ Passwords do not match!" });
    }

    try {
      await axios.post(`http://localhost:5000/api/reset-password/${token}`, { password });
      setStatus({ type: 'success', message: "✅ Password reset successful!" });
      setIsFinished(true);
      
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (err) {
      setStatus({ type: 'error', message: "❌ Link expired or invalid." });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>
        <h2 style={{ color: '#4A148C', marginBottom: '10px' }}>New Password</h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
          Please enter and confirm your new password below.
        </p>

        {!isFinished ? (
          <form onSubmit={handleReset}>
            <input 
              type="password" 
              placeholder="New Password" 
              style={styles.input} 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              onFocus={() => setIsFocused(true)}
              required 
            />

            {/* --- LIVE PASSWORD HINTS --- */}
            {isFocused && (
              <div style={styles.hintContainer}>
                {!hasMinLen && <p style={styles.hintText}>• 8 to 15 characters</p>}
                {!hasUpper && <p style={styles.hintText}>• At least one uppercase letter</p>}
                {!hasSpecial && <p style={styles.hintText}>• At least one special character (!@#$%^&*)</p>}
              </div>
            )}

            <input 
              type="password" 
              placeholder="Confirm New Password" 
              style={styles.input} 
              value={confirmPassword} 
              onChange={(e) => setConfirmPassword(e.target.value)} 
              required 
            />
            
            {status.message && (
              <p style={{ color: status.type === 'success' ? 'green' : 'red', fontSize: '13px', marginBottom: '10px' }}>
                {status.message}
              </p>
            )}

            <button type="submit" style={styles.saveBtn}>Update Password</button>
          </form>
        ) : (
          <div>
            <p style={{ color: 'green', fontWeight: 'bold' }}>{status.message}</p>
            <p style={{ fontSize: '12px' }}>Redirecting you to login...</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f4f7fe' },
  glassCard: { backgroundColor: '#fff', padding: '40px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '350px', textAlign: 'center' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', marginBottom: '15px', boxSizing: 'border-box' },
  saveBtn: { width: '100%', padding: '15px', backgroundColor: '#6A1B9A', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  hintContainer: { textAlign: 'left', marginTop: '-10px', marginBottom: '15px', paddingLeft: '5px' },
  hintText: { color: '#D32F2F', fontSize: '11px', margin: '2px 0', fontWeight: '500' }
};

export default ResetPassword;