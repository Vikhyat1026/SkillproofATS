import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import {
  User, Mail, Calendar, Award, BarChart2, Target,
  TrendingUp, Code, LogOut, Edit2, Check, X
} from 'lucide-react';

const Profile = ({ session, onSignOut }) => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [nameInput, setNameInput] = useState('');

  const user = session?.user;

  useEffect(() => {
    if (!session) return;
    const name = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
    setDisplayName(name);
    setNameInput(name);
    fetchStats();
  }, [session]);

  const fetchStats = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('analyses')
      .select('overall_match, match_level, missing_skills, github_username, created_at')
      .order('created_at', { ascending: false });
    setAnalyses(data || []);
    setLoading(false);
  };

  const saveName = async () => {
    await supabase.auth.updateUser({ data: { full_name: nameInput } });
    setDisplayName(nameInput);
    setEditingName(false);
  };

  if (!session) {
    return (
      <div className="container" style={{ paddingTop: '5rem', textAlign: 'center' }}>
        <h2 className="title" style={{ fontSize: '1.5rem' }}>Sign in to view your Profile</h2>
      </div>
    );
  }

  // Derived stats
  const totalRuns = analyses.length;
  const bestScore = totalRuns ? Math.max(...analyses.map(a => a.overall_match)) : 0;
  const avgScore = totalRuns ? Math.round(analyses.reduce((s, a) => s + a.overall_match, 0) / totalRuns) : 0;
  const strongMatches = analyses.filter(a => a.match_level === 'Strong Match').length;

  // Top recurring missing skills
  const skillFreq = {};
  analyses.forEach(a => (a.missing_skills || []).forEach(s => {
    skillFreq[s] = (skillFreq[s] || 0) + 1;
  }));
  const topSkills = Object.entries(skillFreq).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // GitHub usernames used
  const githubUsers = [...new Set(analyses.filter(a => a.github_username).map(a => a.github_username))];

  // Score distribution
  const distribution = {
    strong: analyses.filter(a => a.overall_match >= 70).length,
    moderate: analyses.filter(a => a.overall_match >= 40 && a.overall_match < 70).length,
    low: analyses.filter(a => a.overall_match < 40).length,
  };

  // Member since
  const memberSince = new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

  // Avatar initials
  const initials = displayName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  const avatarColors = ['#F59E0B', '#8B5CF6', '#10B981', '#3B82F6', '#EC4899'];
  const avatarColor = avatarColors[initials.charCodeAt(0) % avatarColors.length];

  return (
    <div id="tab-profile" className="tab-pane active fade-in">
      <div className="main-content">

        {/* ── Hero Card ──────────────────────────────── */}
        <div className="container" style={{ marginBottom: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
              background: `linear-gradient(135deg, ${avatarColor}33, ${avatarColor}88)`,
              border: `2px solid ${avatarColor}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.6rem', fontWeight: 800, color: avatarColor,
            }}>
              {initials}
            </div>

            {/* Name & Email */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {editingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <input
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', padding: '4px 10px', color: 'white', fontSize: '1rem', fontWeight: 700 }}
                    autoFocus
                  />
                  <button onClick={saveName} style={{ background: 'var(--success)', border: 'none', borderRadius: 'var(--radius-sm)', padding: '5px 8px', cursor: 'pointer', color: 'white', display: 'flex' }}><Check size={14} /></button>
                  <button onClick={() => setEditingName(false)} style={{ background: 'var(--glass-bg)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '5px 8px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}><X size={14} /></button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{displayName}</h2>
                  <button onClick={() => setEditingName(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '2px', display: 'flex' }}><Edit2 size={13} /></button>
                </div>
              )}
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Mail size={13} /> {user.email}
              </p>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={12} /> Member since {memberSince}
              </p>
            </div>

            {/* Sign Out */}
            <button
              onClick={onSignOut}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-light)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.85rem', flexShrink: 0, transition: 'all 0.2s' }}
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>
        </div>

        {/* ── Stats Row ─────────────────────────────── */}
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Analyses Run', val: totalRuns, icon: <BarChart2 size={17} />, color: 'var(--accent-primary)' },
            { label: 'Best Score', val: `${bestScore}%`, icon: <Award size={17} />, color: '#10B981' },
            { label: 'Avg Score', val: `${avgScore}%`, icon: <Target size={17} />, color: '#8B5CF6' },
            { label: 'Strong Matches', val: strongMatches, icon: <TrendingUp size={17} />, color: '#3B82F6' },
          ].map(({ label, val, icon, color }) => (
            <div key={label} className="glass-card" style={{ padding: '1.1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, margin: '0 auto 0.6rem' }}>{icon}</div>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, margin: 0 }}>{val}</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* ── Bottom panels ──────────────────────────── */}
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>

          {/* Score distribution */}
          {totalRuns > 0 && (
            <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)' }}>Score Distribution</h3>
              {[
                { label: 'Strong (≥70%)', count: distribution.strong, color: '#10B981' },
                { label: 'Moderate (40–69%)', count: distribution.moderate, color: 'var(--accent-primary)' },
                { label: 'Low (<40%)', count: distribution.low, color: 'var(--danger)' },
              ].map(({ label, count, color }) => (
                <div key={label} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontWeight: 700, color }}>{count}</span>
                  </div>
                  <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.07)' }}>
                    <div style={{ height: '100%', borderRadius: 99, background: color, width: totalRuns ? `${(count / totalRuns) * 100}%` : '0%', transition: 'width 0.8s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Top skill gaps */}
          {topSkills.length > 0 && (
            <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)' }}>Your Top Skill Gaps</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Skills you're most often missing across all analyses. Focus here.</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {topSkills.map(([skill, count]) => (
                  <div key={skill} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '4px 10px', borderRadius: 999, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>{skill}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.07)', padding: '1px 5px', borderRadius: 999 }}>×{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GitHub usernames */}
          {githubUsers.length > 0 && (
            <div className="glass-card" style={{ padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', gridColumn: topSkills.length > 0 ? '1 / -1' : 'auto' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code size={15} /> GitHub Profiles Scanned
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {githubUsers.map(u => (
                  <a key={u} href={`https://github.com/${u}`} target="_blank" rel="noreferrer"
                    style={{ padding: '4px 12px', borderRadius: 999, fontSize: '0.8rem', background: 'var(--glass-bg)', border: '1px solid var(--border-light)', color: 'var(--text-secondary)', textDecoration: 'none' }}>
                    @{u}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Empty state */}
        {!loading && totalRuns === 0 && (
          <div className="container" style={{ textAlign: 'center', paddingTop: '1.5rem' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Run your first analysis to populate your profile stats.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
