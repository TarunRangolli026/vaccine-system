import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post('http://localhost:5000/api/forgot-password', { email });
      setStatus({ type: 'success', message: response.data.message });
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.error || "Something went wrong. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.glassCard}>
        <div style={styles.iconContainer}>🔑</div>
        <h2 style={styles.title}>Forgot Password?</h2>
        <p style={styles.subtitle}>
          Enter your registered email and we'll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Email Address</label>
          <input
            type="email"
            placeholder="example@gmail.com"
            style={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {status.message && (
            <div style={{
              ...styles.statusMessage,
              color: status.type === 'success' ? '#2E7D32' : '#C62828',
              backgroundColor: status.type === 'success' ? '#E8F5E9' : '#FFEBEE'
            }}>
              {status.message}
            </div>
          )}

          <button 
            type="submit" 
            style={{...styles.submitBtn, opacity: loading ? 0.7 : 1}}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <button onClick={onBack} style={styles.backLink}>
          ← Back to Login
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f4f7fe' },
  glassCard: { backgroundColor: '#fff', padding: '40px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center' },
  iconContainer: { fontSize: '50px', marginBottom: '10px' },
  title: { color: '#4A148C', margin: '0 0 10px 0' },
  subtitle: { color: '#666', fontSize: '14px', marginBottom: '25px', lineHeight: '1.5' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#888', display: 'block', textAlign: 'left', marginBottom: '5px' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', boxSizing: 'border-box', marginBottom: '20px' },
  submitBtn: { width: '100%', padding: '15px', backgroundColor: '#6A1B9A', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
  backLink: { background: 'none', border: 'none', color: '#6A1B9A', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px', fontSize: '14px' },
  statusMessage: { padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '13px', fontWeight: '500' }
};

export default ForgotPassword;