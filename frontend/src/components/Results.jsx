import React from 'react';

const Results = ({ data }) => {
  const parsePct = (val) => parseInt(String(val || "0").replace("%", ""));
  
  const pct = parsePct(data.overall_match);
  const circumference = 283; 
  const offset = circumference - (pct / 100) * circumference;

  const breakdownItems = [
    { label: "Semantic Fit", val: data.breakdown.semantic_fit },
    { label: "Achievement Strength", val: data.breakdown.achievement_strength },
    { label: "GitHub Impact", val: data.breakdown.github_strength },
  ];

  return (
    <section id="results-view" className="results-section active container" style={{ marginTop: '4rem' }}>
      <div className="card" style={{ maxWidth: '900px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>Analysis Results</h2>

        <div className="results-grid">
          {/* Left Column: Scores */}
          <div>
            <div className="score-container">
              <div className="progress-ring">
                <svg viewBox="0 0 100 100">
                  <circle className="progress-ring-bg" cx="50" cy="50" r="45"></circle>
                  <circle 
                    className="progress-ring-fill" 
                    cx="50" cy="50" r="45"
                    style={{ strokeDashoffset: offset }}
                  ></circle>
                </svg>
                <div className="progress-ring-text">
                  <span className="progress-ring-value">{data.overall_match}</span>
                  <span className="progress-ring-label">Match</span>
                </div>
              </div>
              <span className="badge">{data.match_level}</span>
            </div>

            <div>
              {breakdownItems.map((item, index) => (
                <div key={index} className="breakdown-item">
                  <div className="breakdown-header">
                    <span>{item.label}</span>
                    <span className="breakdown-value">{item.val}</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div 
                      style={{ width: `${parsePct(item.val)}%` }} 
                      className="progress-bar-fill"
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Insights & Skills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {data.missing_skills?.length > 0 && (
              <div className="missing-skills-container">
                <h3 className="section-title" style={{ color: '#FCA5A5', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                  Priority Missing Skills
                </h3>
                <div className="skills-tags">
                  {data.missing_skills.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="section-title">Better Suited Roles</h3>
              <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                {data.alternative_roles?.length > 0 ? data.alternative_roles.map((r, i) => (
                  <div key={i}>• {r}</div>
                )) : "Current role seems to be the best fit."}
              </div>
            </div>

            <div>
              <h3 className="section-title">Actionable Insights</h3>
              <ul className="insights-list">
                {data.insights?.map((insight, i) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
            </div>

            {data.github_analysis && (
              <div>
                <h3 className="section-title" style={{ color: '#60A5FA', borderColor: 'rgba(96, 165, 250, 0.3)' }}>
                  GitHub Deep Scan
                </h3>
                <div 
                  dangerouslySetInnerHTML={{ __html: data.github_analysis.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br/>") }}
                  style={{ 
                    padding: '1rem', 
                    background: 'rgba(59, 130, 246, 0.1)', 
                    border: '1px solid rgba(59, 130, 246, 0.3)', 
                    borderRadius: '8px', 
                    color: '#DBEAFE', 
                    fontSize: '0.95rem', 
                    lineHeight: '1.5' 
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Results;
