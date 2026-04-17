import React from 'react';

const About = () => {
  return (
    <div className="container" style={{ maxWidth: '900px', paddingTop: '4rem' }}>
      <h1 className="title">About SkillProof ATS</h1>
      <p className="subtitle" style={{ marginLeft: 0, maxWidth: '100%', marginBottom: '2rem' }}>
        Discover the intelligence behind our modern recruitment platform.
      </p>

      <div className="card" style={{ margin: 0, maxWidth: '100%', textAlign: 'left' }}>
        <div style={{ display: 'flex', gap: '2rem', flexDirection: 'column' }}>
          <div>
            <h2 className="section-title" style={{ borderColor: 'rgba(59, 130, 246, 0.3)', color: '#60A5FA' }}>
              Introduction
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginTop: '1rem' }}>
              SkillProof ATS is an advanced Applicant Tracking System powered by AI. It moves beyond simple keyword matching and understands the semantic context of your experiences.
            </p>
          </div>

          <div>
            <h2 className="section-title" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34D399' }}>
              How It Works
            </h2>
            <ol style={{ color: 'var(--text-secondary)', lineHeight: 1.8, marginTop: '1rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li><strong>Data Parsing:</strong> Upload your resume (PDF).</li>
              <li><strong>AI Engine Analysis:</strong> Our engine compares semantic meanings.</li>
              <li><strong>External Integrations:</strong> Deep scan of public achievements (like GitHub).</li>
              <li><strong>Actionable Feedback:</strong> Instant dashboard with scoring and insights.</li>
              <li><strong>Ask Sage:</strong> Your AI Recruiter is available for questions.</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
