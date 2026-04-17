import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  Clock, TrendingUp, Award, Target, Trash2, ChevronDown,
  ChevronUp, AlertTriangle, CheckCircle, Minus, BarChart2
} from 'lucide-react';

// ── Tiny sparkline chart (pure SVG, no library) ──────────────────────────────
const SparkLine = ({ data, color = 'var(--accent-primary)', height = 60 }) => {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 300;
  const h = height;
  const pad = 8;

  const points = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / range) * (h - pad * 2);
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = [
    `${pad},${h - pad}`,
    ...data.map((v, i) => {
      const x = pad + (i / (data.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return `${x},${y}`;
    }),
    `${w - pad},${h - pad}`
  ].join(' ');

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height }} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#sparkGrad)" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Latest dot */}
      {(() => {
        const last = data[data.length - 1];
        const x = w - pad;
        const y = h - pad - ((last - min) / range) * (h - pad * 2);
        return <circle cx={x} cy={y} r="4" fill={color} />;
      })()}
    </svg>
  );
};

// ── Match level badge ─────────────────────────────────────────────────────────
const MatchBadge = ({ level }) => {
  const map = {
    'Strong Match': { color: 'var(--success)', icon: <CheckCircle size={12} /> },
    'Moderate Match': { color: 'var(--accent-primary)', icon: <Minus size={12} /> },
    'Low Match': { color: 'var(--danger)', icon: <AlertTriangle size={12} /> },
  };
  const { color, icon } = map[level] || map['Low Match'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '2px 10px', borderRadius: '999px', fontSize: '0.72rem',
      fontWeight: 700, color, border: `1px solid ${color}20`, background: `${color}15`,
    }}>
      {icon} {level}
    </span>
  );
};

// ── Single history card ───────────────────────────────────────────────────────
const HistoryCard = ({ item, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  const date = new Date(item.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const scoreColor = item.overall_match >= 70
    ? 'var(--success)'
    : item.overall_match >= 40
    ? 'var(--accent-primary)'
    : 'var(--danger)';

  return (
    <div className="history-card glass-card" style={{ marginBottom: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', padding: '1.25rem 1.5rem', transition: 'all 0.2s' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        {/* Score ring (mini) */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
          background: `conic-gradient(${scoreColor} ${item.overall_match * 3.6}deg, rgba(255,255,255,0.07) 0deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 0 3px var(--bg-card)`,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', background: 'var(--bg-card)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 800, color: scoreColor,
          }}>
            {item.overall_match}%
          </div>
        </div>

        {/* Meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>
              {item.job_title || 'Resume Analysis'}
            </span>
            <MatchBadge level={item.match_level} />
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <span><Clock size={11} style={{ marginRight: 3, verticalAlign: 'middle' }} />{date}</span>
            {item.github_username && <span>GitHub: @{item.github_username}</span>}
            {item.background_type && <span style={{ textTransform: 'capitalize' }}>{item.background_type}</span>}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '6px 10px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Less' : 'More'}
          </button>
          <button
            onClick={() => onDelete(item.id)}
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', padding: '6px 9px', color: 'var(--danger)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Score breakdown bars */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '1rem' }}>
        {[
          { label: 'Semantic Fit', val: item.semantic_fit },
          { label: 'Achievement', val: item.achievement_score },
          { label: 'GitHub', val: item.github_score },
        ].map(({ label, val }) => (
          <div key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
              <span>{label}</span><span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{val}%</span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.07)' }}>
              <div style={{ height: '100%', borderRadius: 99, width: `${val}%`, background: 'var(--accent-primary)', transition: 'width 0.6s ease' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
          {item.missing_skills?.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--danger)', marginBottom: '0.5rem' }}>Missing Skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {item.missing_skills.map(s => (
                  <span key={s} style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.75rem', background: 'rgba(239,68,68,0.12)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.25)' }}>{s}</span>
                ))}
              </div>
            </div>
          )}
          {item.insights?.length > 0 && (
            <div>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Insights</p>
              {item.insights.map((ins, i) => (
                <p key={i} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>→ {ins}</p>
              ))}
            </div>
          )}
          {item.github_analysis && (
            <div style={{ marginTop: '0.75rem' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '0.5rem' }}>GitHub Deep Scan</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.github_analysis}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main History Page ─────────────────────────────────────────────────────────
const History = ({ session }) => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const { data, error: fetchError } = await supabase
        .from('analyses')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setAnalyses(data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
      setError('Failed to load history records.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    await supabase.from('analyses').delete().eq('id', id);
    setAnalyses(prev => prev.filter(a => a.id !== id));
  };

  useEffect(() => {
    if (session) fetchHistory();
  }, [session]);

  // Derive chart data — last 10 scores in chronological order
  const sparkData = [...analyses].reverse().slice(-10).map(a => a.overall_match);

  // Top missing skills across all analyses
  const skillFrequency = {};
  analyses.forEach(a => {
    (a.missing_skills || []).forEach(s => {
      skillFrequency[s] = (skillFrequency[s] || 0) + 1;
    });
  });
  const topMissing = Object.entries(skillFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  const bestScore = analyses.length ? Math.max(...analyses.map(a => a.overall_match)) : 0;
  const avgScore = analyses.length ? Math.round(analyses.reduce((s, a) => s + a.overall_match, 0) / analyses.length) : 0;

  if (!session) {
    return (
      <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
        <h2 className="title" style={{ fontSize: '1.5rem' }}>Sign in to view your History</h2>
        <p className="subtitle">Your past analyses will appear here once you're logged in.</p>
      </div>
    );
  }

  return (
    <div id="tab-history" className="tab-pane active fade-in">
      <div className="main-content">
        <section className="container hero-section">
          <h1 className="title">Analysis History</h1>
          <p className="subtitle">Track your resume improvement journey over time.</p>
        </section>

        {/* Stats row */}
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Total Analyses', val: analyses.length, icon: <BarChart2 size={18} />, color: 'var(--accent-primary)' },
            { label: 'Best Score', val: `${bestScore}%`, icon: <Award size={18} />, color: 'var(--success)' },
            { label: 'Average Score', val: `${avgScore}%`, icon: <Target size={18} />, color: 'var(--accent-secondary)' },
          ].map(({ label, val, icon, color }) => (
            <div key={label} className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
                {icon}
              </div>
              <div>
                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{val}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress chart + top skills row */}
        {analyses.length >= 2 && (
          <div className="container" style={{ display: 'grid', gridTemplateColumns: sparkData.length ? '1fr 1fr' : '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            {/* Sparkline */}
            <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <TrendingUp size={16} style={{ color: 'var(--accent-primary)' }} />
                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Score Trend</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>Last {sparkData.length} analyses</span>
              </div>
              <SparkLine data={sparkData} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                <span>Oldest</span><span>Latest</span>
              </div>
            </div>

            {/* Top missing skills */}
            {topMissing.length > 0 && (
              <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Recurring Skill Gaps</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {topMissing.map(([skill, count]) => (
                    <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '4px 10px', borderRadius: 999, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{skill}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 999 }}>×{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History list */}
        <div className="container">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              <div className="spinner" style={{ margin: '0 auto 1rem' }} />
              Loading your history...
            </div>
          ) : analyses.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <BarChart2 size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
              <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No analyses yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Run your first resume analysis to start tracking your progress.</p>
            </div>
          ) : (
            analyses.map(item => (
              <HistoryCard key={item.id} item={item} onDelete={handleDelete} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
