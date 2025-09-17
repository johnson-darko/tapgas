
// Simple modal component
const Modal: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode }> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.25)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: 0,
          minWidth: 'min(400px, 96vw)',
          maxWidth: '98vw',
          maxHeight: '96vh',
          width: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          position: 'relative',
          margin: 'max(16px, env(safe-area-inset-top, 0px)) auto max(16px, env(safe-area-inset-bottom, 0px)) auto',
          paddingLeft: 'max(8px, env(safe-area-inset-left, 0px))',
          paddingRight: 'max(8px, env(safe-area-inset-right, 0px))',
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            background: '#fff',
            zIndex: 2,
            padding: 'max(20px, env(safe-area-inset-top, 0px)) 24px 8px 24px',
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            textAlign: 'center',
            fontWeight: 700,
            fontSize: '1.2rem',
            borderBottom: '1px solid #e5e7eb',
          }}
        >
          Region Overview
        </div>
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>{children}</div>
        <div
          style={{
            position: 'sticky',
            bottom: 0,
            background: '#fff',
            zIndex: 2,
            padding: '16px 0 max(20px, env(safe-area-inset-bottom, 0px)) 0',
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            display: 'flex',
            justifyContent: 'center',
            borderTop: '1px solid #e5e7eb',
          }}
        >
          <button
            onClick={onClose}
            style={{ background: '#e5e7eb', border: 'none', borderRadius: 6, padding: '8px 32px', fontWeight: 700, fontSize: 18, cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { RegionPieChart, RegionBarChart } from '../components/RegionCharts';

// Driver type for region/zone assignment
interface DriverRegion {
  email: string;
  region: string;
  zone: string;
  companies?: string[];
}

const DRIVER_REGION_KEY = 'tapgas_driver_regions';

function getDriverRegions(): DriverRegion[] {
  try {
    const raw = localStorage.getItem(DRIVER_REGION_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveDriverRegions(regions: DriverRegion[]) {
  localStorage.setItem(DRIVER_REGION_KEY, JSON.stringify(regions));
}

function getDrivers(): string[] {
  try {
    const raw = localStorage.getItem('tapgas_drivers');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

const AdminDrivers: React.FC = () => {
  const ghanaRegions = [
    'Greater Accra',
    'Ashanti',
    'Western',
    'Western North',
    'Central',
    'Eastern',
    'Volta',
    'Oti',
    'Northern',
    'North East',
    'Savannah',
    'Upper East',
    'Upper West',
    'Bono',
    'Bono East',
    'Ahafo',
  ];
  const [drivers, setDrivers] = useState<string[]>([]);
  const [regions, setRegions] = useState<DriverRegion[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  // Aggregate data for charts
  const regionStats = ghanaRegions.map(region => {
    const regionDrivers = regions.filter(r => r.region === region);
    const zones = Array.from(new Set(regionDrivers.map(r => r.zone).filter(Boolean)));
    const companies = Array.from(new Set(regionDrivers.flatMap(r => r.companies || [])));
    return {
      region,
      driverCount: regionDrivers.length,
      zoneCount: zones.length,
      companyCount: companies.length,
    };
  });
  const [regionInput, setRegionInput] = useState('');
  const [companiesInput, setCompaniesInput] = useState('');
  const [companiesList, setCompaniesList] = useState<string[]>([]);
  const [zoneInput, setZoneInput] = useState('');

  useEffect(() => {
    setDrivers(getDrivers());
    setRegions(getDriverRegions());
  }, []);

  const [editingCompanyIdx, setEditingCompanyIdx] = useState<number | null>(null);
  const [editingCompanyValue, setEditingCompanyValue] = useState('');

  const handleEdit = (email: string) => {
    setEditing(email);
    const found = regions.find(r => r.email === email);
    setRegionInput(found?.region || '');
    setZoneInput(found?.zone || '');
    setCompaniesList(found?.companies || []);
    setCompaniesInput('');
    setEditingCompanyIdx(null);
    setEditingCompanyValue('');
  };
  const handleDeleteCompany = (idx: number) => {
    setCompaniesList(prev => prev.filter((_, i) => i !== idx));
    setEditingCompanyIdx(null);
    setEditingCompanyValue('');
  };

  const handleStartEditCompany = (idx: number, value: string) => {
    setEditingCompanyIdx(idx);
    setEditingCompanyValue(value);
  };

  const handleSaveEditCompany = (idx: number) => {
    setCompaniesList(prev => prev.map((c, i) => (i === idx ? editingCompanyValue.trim() : c)));
    setEditingCompanyIdx(null);
    setEditingCompanyValue('');
  };

  const handleSave = (email: string) => {
    const updated = regions.filter(r => r.email !== email);
    updated.push({ email, region: regionInput, zone: zoneInput, companies: companiesList });
    setRegions(updated);
    saveDriverRegions(updated);
    setEditing(null);
    setCompaniesInput('');
    setCompaniesList([]);
  };

  const handleAddCompanies = () => {
    if (!companiesInput.trim()) return;
    const newCompanies = companiesInput.split(',').map(c => c.trim()).filter(Boolean);
    setCompaniesList(prev => Array.from(new Set([...prev, ...newCompanies])));
    setCompaniesInput('');
  };

  const handleExport = () => {
    const header = 'Email,Region,Zone,Companies\n';
    const rows = regions.map(r => `${r.email},${r.region},${r.zone},"${(r.companies || []).join(', ')}"`).join('\n');
    const csv = header + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'driver_regions.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: 700, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: '1.2rem', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
  <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '2rem' }}>Driver Region/Zone Management</h2>
  <button onClick={() => setShowModal(true)} style={{ marginBottom: '1.5rem', marginRight: 12, background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: '0.7rem', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}>Visual Display</button>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
          <div style={{ minWidth: 320, maxWidth: 400 }}>
            <RegionPieChart
              data={Object.fromEntries(regionStats.map(stat => [stat.region, stat.driverCount]))}
              label="Drivers per Region"
            />
          </div>
          <div style={{ minWidth: 320, maxWidth: 400 }}>
            <RegionBarChart
              data={Object.fromEntries(regionStats.map(stat => [stat.region, stat.zoneCount]))}
              label="Zones per Region"
            />
          </div>
          <div style={{ minWidth: 320, maxWidth: 400 }}>
            <RegionBarChart
              data={Object.fromEntries(regionStats.map(stat => [stat.region, stat.companyCount]))}
              label="Companies per Region"
            />
          </div>
        </div>
        {regionStats.every(stat => stat.driverCount === 0) && <div style={{ color: '#64748b', marginTop: 24 }}>No data to display.</div>}
      </Modal>
      <button onClick={handleExport} style={{ marginBottom: '1.5rem', background: '#38bdf8', color: '#fff', border: 'none', borderRadius: '0.7rem', padding: '0.5rem 1.2rem', fontWeight: 600, cursor: 'pointer' }}>Export as CSV</button>
      <div style={{ width: '100%', overflowX: 'auto', overflowY: 'hidden', marginBottom: '2rem' }}>
        <table style={{ minWidth: 900, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={{ padding: '0.7rem', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '0.7rem', textAlign: 'left' }}>Region</th>
              <th style={{ padding: '0.7rem', textAlign: 'left' }}>Zone</th>
              <th style={{ padding: '0.7rem', textAlign: 'left' }}>Companies</th>
              <th style={{ padding: '0.7rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(email => {
              const found = regions.find(r => r.email === email);
              return (
                <tr key={email}>
                  <td style={{ padding: '0.7rem' }}>{email}</td>
                  <td style={{ padding: '0.7rem' }}>
                    {editing === email ? (
                      <select
                        value={regionInput}
                        onChange={e => setRegionInput(e.target.value)}
                        style={{ padding: '0.3rem', borderRadius: '0.4rem', border: '1px solid #e5e7eb', minWidth: 140, maxHeight: 120, overflowY: 'auto' }}
                        size={5}
                      >
                        <option value="">Select Region</option>
                        {ghanaRegions.map(region => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    ) : (
                      found?.region || ''
                    )}
                  </td>
                  <td style={{ padding: '0.7rem' }}>
                    {editing === email ? (
                      <input value={zoneInput} onChange={e => setZoneInput(e.target.value)} style={{ padding: '0.3rem', borderRadius: '0.4rem', border: '1px solid #e5e7eb' }} />
                    ) : (
                      found?.zone || ''
                    )}
                  </td>
                  <td style={{ padding: '0.7rem', minWidth: 180 }}>
                    {editing === email ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <input
                            value={companiesInput}
                            onChange={e => setCompaniesInput(e.target.value)}
                            placeholder="Add company (comma separated)"
                            style={{ padding: '0.3rem', borderRadius: '0.4rem', border: '1px solid #e5e7eb', flex: 1 }}
                          />
                          <button type="button" onClick={handleAddCompanies} style={{ background: '#38bdf8', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.3rem 0.8rem', fontWeight: 600, cursor: 'pointer' }}>Add</button>
                        </div>
                        <div style={{ fontSize: '0.95em', color: '#334155', marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {companiesList.length > 0 ? (
                            companiesList.map((company, idx) => (
                              <span
                                key={company + idx}
                                style={{
                                  background: '#f1f5f9',
                                  borderRadius: '0.4rem',
                                  padding: '2px 8px',
                                  marginRight: 2,
                                  position: 'relative',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  cursor: 'default',
                                }}
                                onMouseLeave={() => {
                                  if (editingCompanyIdx === idx) {
                                    setEditingCompanyIdx(null);
                                    setEditingCompanyValue('');
                                  }
                                }}
                              >
                                {editingCompanyIdx === idx ? (
                                  <>
                                    <input
                                      value={editingCompanyValue}
                                      onChange={e => setEditingCompanyValue(e.target.value)}
                                      style={{ width: 80, fontSize: '0.95em', marginRight: 4, borderRadius: 4, border: '1px solid #e5e7eb', padding: '2px 4px' }}
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => handleSaveEditCompany(idx)}
                                      style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: 3, padding: '2px 6px', fontSize: '0.9em', marginRight: 2, cursor: 'pointer' }}
                                      title="Save"
                                    >✔</button>
                                    <button
                                      onClick={() => setEditingCompanyIdx(null)}
                                      style={{ background: '#e5e7eb', color: '#0f172a', border: 'none', borderRadius: 3, padding: '2px 6px', fontSize: '0.9em', cursor: 'pointer' }}
                                      title="Cancel"
                                    >✖</button>
                                  </>
                                ) : (
                                  <>
                                    {company}
                                    <span style={{ display: 'inline-flex', marginLeft: 4, opacity: 0.7 }}>
                                      <button
                                        onClick={() => handleStartEditCompany(idx, company)}
                                        style={{ background: 'transparent', border: 'none', color: '#0ea5e9', cursor: 'pointer', fontSize: '1em', marginRight: 2 }}
                                        title="Edit"
                                      >✎</button>
                                      <button
                                        onClick={() => handleDeleteCompany(idx)}
                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1em' }}
                                        title="Delete"
                                      >🗑</button>
                                    </span>
                                  </>
                                )}
                              </span>
                            ))
                          ) : <span style={{ color: '#64748b' }}>No companies</span>}
                        </div>
                      </div>
                    ) : (
                      (found?.companies && found.companies.length > 0) ? found.companies.join(', ') : ''
                    )}
                  </td>
                  <td style={{ padding: '0.7rem' }}>
                    {editing === email ? (
                      <>
                        <button onClick={() => handleSave(email)} style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.3rem 0.8rem', fontWeight: 600, marginRight: 6, cursor: 'pointer' }}>Save</button>
                        <button onClick={() => setEditing(null)} style={{ background: '#e5e7eb', color: '#0f172a', border: 'none', borderRadius: '0.5rem', padding: '0.3rem 0.8rem', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                      </>
                    ) : (
                      <button onClick={() => handleEdit(email)} style={{ background: '#38bdf8', color: '#fff', border: 'none', borderRadius: '0.5rem', padding: '0.3rem 0.8rem', fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {drivers.length === 0 && <div>No drivers found.</div>}
    </div>
  );
};

export default AdminDrivers;
