import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, User, Baby, Calendar, Filter, Loader2 } from 'lucide-react';

const PatientHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVaccine, setSelectedVaccine] = useState('All');
  const [loading, setLoading] = useState(true);

  const vaccineMilestones = [
    "All", "BCG", "OPV (0)", "Hep-B (1)", "DPT-1", "Polio-1", 
    "Rotavirus-1", "Hib-1", "Measles / MMR-1", "DPT Booster-1"
  ];

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // This matches the app.get('/api/admin/appointments') in your index.js
        const response = await axios.get('http://localhost:5000/api/admin/appointments');
        setAppointments(response.data);
      } catch (error) {
        console.error("Error fetching patient history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const filteredData = appointments.filter(item => {
    // Ensuring we check all possible name fields from your schema
    const childName = (item.childName || item.name || "").toLowerCase();
    const parentName = (item.parentName || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    
    const matchesSearch = parentName.includes(search) || childName.includes(search);
    const matchesVaccine = selectedVaccine === 'All' || item.vaccineName === selectedVaccine;

    return matchesSearch && matchesVaccine;
  });

  if (loading) return (
    <div style={{textAlign:'center', padding:'50px', color: '#1a237e'}}>
      <Loader2 className="animate-spin" style={{margin:'0 auto'}} size={32} />
      <p style={{marginTop: '10px'}}>Loading patient records...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Patient Registration Records</h2>
      
      <div style={styles.controls}>
        <div style={styles.searchBox}>
          <Search size={20} color="#64748b" />
          <input 
            type="text" 
            placeholder="Search by Parent or Child Name..." 
            style={styles.input}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={styles.filterBox}>
          <Filter size={18} color="#64748b" />
          <select 
            style={styles.select}
            value={selectedVaccine}
            onChange={(e) => setSelectedVaccine(e.target.value)}
          >
            {vaccineMilestones.map(v => (
              <option key={v} value={v}>{v === "All" ? "Filter by Vaccine" : v}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        {filteredData.length > 0 ? (
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}><User size={16} /> Parent Details</th>
                <th style={styles.th}><Baby size={16} /> Child Name</th>
                <th style={styles.th}>Vaccine</th>
                <th style={styles.th}><Calendar size={16} /> Appt. Date</th>
                <th style={styles.th}>Slot</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((record, index) => (
                <tr key={record._id || index} style={styles.tableRow}>
                  <td style={styles.td}>
                    <div style={{fontWeight: '600'}}>{record.parentName || "Parent"}</div>
                    <div style={{fontSize: '11px', color: '#94a3b8'}}>{record.parentEmail}</div>
                  </td>
                  <td style={styles.td}><strong>{record.childName || record.name}</strong></td>
                  <td style={styles.td}>
                    <span style={styles.vaccineTag}>{record.vaccineName}</span>
                  </td>
                  <td style={styles.td}>{record.appointmentDate}</td>
                  <td style={styles.td}>
                    <span style={styles.slotBadge}>{record.timeSlot || "N/A"}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{textAlign:'center', padding:'40px', color: '#64748b'}}>
            <p>No appointments found in the system yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '20px', backgroundColor: '#fff', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  title: { color: '#1a237e', marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' },
  controls: { display: 'flex', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' },
  searchBox: { flex: 2, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f1f5f9', padding: '10px 20px', borderRadius: '10px', minWidth: '250px' },
  filterBox: { flex: 1, display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f1f5f9', padding: '10px 15px', borderRadius: '10px', minWidth: '200px' },
  input: { border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '15px' },
  select: { border: 'none', background: 'none', outline: 'none', width: '100%', fontSize: '15px', color: '#475569', cursor: 'pointer' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  tableHeader: { borderBottom: '2px solid #e2e8f0', color: '#64748b' },
  th: { padding: '12px 15px', fontWeight: '600' },
  td: { padding: '15px', color: '#334155' },
  tableRow: { borderBottom: '1px solid #f1f5f9', transition: '0.2s hover', backgroundColor: 'transparent' },
  vaccineTag: { backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold' },
  slotBadge: { backgroundColor: '#f5f3ff', color: '#7c3aed', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', border: '1px solid #ddd6fe' }
};

export default PatientHistory;