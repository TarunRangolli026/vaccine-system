import React, { useState } from 'react';

const History = ({ selectedChild, vaccineRoadmap, onBack }) => {
  const [showCertificate, setShowCertificate] = useState(null);
  const today = new Date();

  const isCompleted = (dob, milestoneMonths) => {
    if (!dob) return false;
    const birth = new Date(dob);
    const diffMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    return diffMonths >= milestoneMonths;
  };

  return (
    <div style={{ width: '100%', maxWidth: '700px' }}>
      <button onClick={onBack} style={styles.backLink}>← Back to Menu</button>
      
      <div style={styles.glassCard}>
        <h2 style={{ color: '#4A148C', textAlign: 'center' }}>📜 Vaccination History</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>Official records for {selectedChild.name}</p>
        
        <div style={{ marginTop: '30px' }}>
          {vaccineRoadmap.map((item, idx) => {
            if (!isCompleted(selectedChild.dob, item.months)) return null;

            return (
              <div key={idx} style={styles.historyRow}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#333' }}>{item.age} Milestone</div>
                  <div style={{ fontSize: '12px', color: '#888' }}>{item.vaccines.join(", ")}</div>
                </div>
                <button 
                  style={styles.certBtn} 
                  onClick={() => setShowCertificate(item)}
                >
                  View Certificate 📄
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {showCertificate && (
        <div style={styles.overlay}>
          <div style={styles.certPaper}>
            <div style={styles.certBorder}>
                {/* Header Section */}
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px'}}>
                    <div style={{textAlign:'left'}}>
                        <h3 style={{margin:0, color:'#1A237E', fontSize:'16px'}}>Malaprabha Multispeciallity Hospital</h3>
                        <p style={{margin:0, fontSize:'10px', color:'#555'}}>Bailhongal, Karnataka</p>
                    </div>
                    <div style={{textAlign:'right'}}>
                        <div style={{fontWeight:'bold', color:'#6A1B9A', fontSize:'14px'}}>Vacci_Care</div>
                        <div style={{fontSize:'8px', color:'#999'}}>DIGITAL HEALTH LOGO</div>
                    </div>
                </div>

                <hr style={{border:'0.5px solid #eee'}}/>
                
                <h2 style={{color: '#C5A059', letterSpacing:'2px', margin:'15px 0 5px', fontSize:'22px', fontFamily:'serif'}}>CERTIFICATE OF VACCINATION</h2>
                <p style={{fontSize:'10px', fontStyle:'italic', color:'#777'}}>This document confirms the successful administration of immunizations.</p>

                <div style={{margin:'25px 0'}}>
                    <p style={{margin:0, fontSize:'14px'}}>This is to certify that the child</p>
                    <h1 style={{margin:'5px 0', color:'#1A237E', textTransform:'uppercase', borderBottom:'1px solid #ddd', display:'inline-block', padding:'0 20px'}}>{selectedChild.name}</h1>
                </div>

                <p style={{fontSize:'14px', lineHeight:'1.6'}}>
                    has been immunized against <strong>{showCertificate.vaccines.join(", ")}</strong> 
                    at the <strong>{showCertificate.age}</strong> milestone in accordance with the National Immunization Schedule.
                </p>

                <div style={styles.milestoneBadge}>
                    Verified Milestone: {showCertificate.age}
                </div>

                {/* Footer / Signature Section */}
                <div style={{marginTop: '40px', display: 'flex', justifyContent: 'space-between', alignItems:'flex-end'}}>
                    <div style={{textAlign:'left'}}>
                        <div style={styles.officialSeal}>OFFICIAL<br/>SEAL</div>
                        <p style={{fontSize:'10px', color:'#999', margin:0}}>Ref ID: VC-{Math.floor(Math.random()*10000)}</p>
                    </div>

                    <div style={{textAlign:'center', minWidth:'150px'}}>
                        <div style={styles.signatureSlot}>
                            Sharan Angadi
                        </div>
                        <div style={{borderTop:'1px solid #333', paddingTop:'5px'}}>
                            <strong style={{fontSize:'12px'}}>Dr. Sharan Angadi</strong><br/>
                            <span style={{fontSize:'10px', color:'#666'}}>Chief Medical Officer</span>
                        </div>
                    </div>
                </div>
                
                <div style={{marginTop:'20px', fontSize:'9px', color:'#aaa', textAlign:'center'}}>
                    Generated on {today.toLocaleDateString()} via Vacci_Care Digital Portal
                </div>
            </div>

            <div style={{display: 'flex', gap: '10px', marginTop: '20px'}} className="no-print">
                <button style={styles.printBtn} onClick={() => window.print()}>🖨️ Download / Print</button>
                <button style={{...styles.printBtn, backgroundColor: '#eee', color: '#333'}} onClick={() => setShowCertificate(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
          }
        `}
      </style>
    </div>
  );
};

const styles = {
  glassCard: { backgroundColor: '#fff', padding: '30px', borderRadius: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' },
  backLink: { background: 'none', border: 'none', color: '#6A1B9A', fontWeight: 'bold', cursor: 'pointer', marginBottom: '15px' },
  historyRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', borderBottom: '1px solid #f5f5f5' },
  certBtn: { backgroundColor: '#F3E5F5', color: '#6A1B9A', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight:'bold' },
  overlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000, padding:'20px' },
  certPaper: { backgroundColor: '#fff', padding: '25px', width: '100%', maxWidth: '600px', borderRadius: '8px', boxShadow:'0 0 50px rgba(0,0,0,0.5)' },
  certBorder: { border: '15px solid #f1f1f1', outline:'2px solid #C5A059', outlineOffset:'-10px', padding: '30px', textAlign: 'center', position:'relative', backgroundColor:'#fff' },
  milestoneBadge: { backgroundColor: '#E8F5E9', color: '#2E7D32', display: 'inline-block', padding: '5px 15px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', marginTop: '10px' },
  signatureSlot: { fontFamily: '"Dancing Script", cursive', fontSize: '24px', color: '#002366', marginBottom: '-5px', transform: 'rotate(-5px)' },
  officialSeal: { width:'60px', height:'60px', border:'2px dashed #C5A059', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', color:'#C5A059', fontWeight:'bold', transform:'rotate(-20deg)', marginBottom:'10px' },
  printBtn: { flex: 1, padding: '12px', backgroundColor: '#6A1B9A', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }
};

export default History;