import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  Plus, Search, Trash2, FileText, Calendar, 
  ExternalLink, CheckCircle, AlertCircle, Bookmark
} from 'lucide-react';

const JDLibrary = ({ session, onSelectJD }) => {
  const [jds, setJds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const fetchJDs = async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from('saved_jds')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError('Could not load library.');
    } else {
      setJds(data || []);
    }
    setLoading(false);
  };

  const deleteJD = async (id) => {
    const { error: delError } = await supabase
      .from('saved_jds')
      .delete()
      .eq('id', id);

    if (!delError) {
      setJds(prev => prev.filter(jd => jd.id !== id));
    }
  };

  useEffect(() => {
    if (session) fetchJDs();
  }, [session]);

  const filteredJDs = jds.filter(jd => 
    jd.title.toLowerCase().includes(search.toLowerCase()) ||
    jd.content.toLowerCase().includes(search.toLowerCase())
  );

  if (!session) {
    return (
      <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
        <Bookmark size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
        <h2 className="title" style={{ fontSize: '1.5rem' }}>Login to use the JD Library</h2>
        <p className="subtitle">Save job descriptions to your library for quick access later.</p>
      </div>
    );
  }

  return (
    <div id="tab-library" className="tab-pane active fade-in">
      <div className="main-content">
        <section className="container hero-section">
          <h1 className="title">JD Library</h1>
          <p className="subtitle">Your personal collection of target job descriptions and roles.</p>
        </section>

        {/* Search and Filter */}
        <div className="container" style={{ marginBottom: '2rem' }}>
          <div className="glass-card" style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid var(--border-light)' }}>
            <Search size={18} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search saved job descriptions..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'white', flex: 1, fontSize: '0.95rem', outline: 'none' }}
            />
          </div>
        </div>

        {/* Grid of JDs */}
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              Loading your library...
            </div>
          ) : filteredJDs.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', background: 'var(--glass-bg)', borderRadius: 'var(--radius-xl)', border: '1px dashed var(--border-light)' }}>
              <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-secondary)' }}>Library is empty</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Save job descriptions from the <b>Analysis</b> tab to see them here.
              </p>
            </div>
          ) : (
            filteredJDs.map(jd => (
              <div key={jd.id} className="glass-card library-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', transition: 'transform 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)', lineHeight: 1.2 }}>{jd.title}</h3>
                  <button 
                    onClick={() => deleteJD(jd.id)} 
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <p style={{ 
                  fontSize: '0.85rem', color: 'var(--text-muted)', flex: 1, 
                  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
                  lineHeight: 1.6, marginBottom: '1.5rem'
                }}>
                  {jd.content}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {new Date(jd.created_at).toLocaleDateString()}
                  </span>
                  
                  <button 
                    className="btn btn-primary" 
                    onClick={() => onSelectJD(jd)}
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', width: 'auto' }}
                  >
                    Load to Analyze
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

export default JDLibrary;
