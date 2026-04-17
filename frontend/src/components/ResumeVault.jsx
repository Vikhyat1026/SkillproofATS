import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Database, Trash2, Play, Calendar, 
  FileText, Plus, Search, Layers
} from 'lucide-react';

const ResumeVault = ({ session, onSelectResume }) => {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchResumes = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('resumes')
      .select('*')
      .order('created_at', { ascending: false });
    setResumes(data || []);
    setLoading(false);
  };

  const deleteResume = async (id) => {
    await supabase.from('resumes').delete().eq('id', id);
    setResumes(prev => prev.filter(r => r.id !== id));
  };

  useEffect(() => {
    if (session) fetchResumes();
  }, [session]);

  const filtered = resumes.filter(r => 
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.content.toLowerCase().includes(search.toLowerCase())
  );

  if (!session) return (
    <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
      <Database size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
      <h2 className="title" style={{ fontSize: '1.5rem' }}>Login to use the Resume Vault</h2>
    </div>
  );

  return (
    <div id="tab-vault" className="tab-pane active fade-in">
      <div className="main-content">
        <section className="container hero-section">
          <h1 className="title">Resume Vault</h1>
          <p className="subtitle">Re-run any of your saved resume versions against new JDs instantly.</p>
        </section>

        <div className="container" style={{ marginBottom: '2rem' }}>
          <div className="glass-card" style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--border-light)' }}>
            <Search size={18} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search your saved resumes..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, outline: 'none' }}
            />
          </div>
        </div>

        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {loading ? (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
          ) : filtered.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border-light)' }}>
              <Layers size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-secondary)' }}>Your vault is empty</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Analyzed resumes can be saved here for quick re-use.</p>
            </div>
          ) : (
            filtered.map(r => (
              <div key={r.id} className="glass-card" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>{r.name}</h3>
                  <button onClick={() => deleteResume(r.id)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
                
                <div style={{ flex: 1, marginBottom: '1.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', height: '100px' }}>
                  {r.content.substring(0, 300)}...
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {new Date(r.created_at).toLocaleDateString()}
                  </span>
                  <button className="btn btn-primary" onClick={() => onSelectResume(r)} style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Play size={12} /> Analyze version
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeVault;
