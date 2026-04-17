import React, { useState } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import Results from './Results';

const Analysis = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [backgroundType, setBackgroundType] = useState('');
  const [githubUsername, setGithubUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const sampleJDs = {
    software: `We are looking for a Software Developer who will be responsible for designing, developing, and maintaining scalable software applications. The ideal candidate should be passionate about writing clean code, solving complex problems, and collaborating with cross-functional teams to deliver high-quality products.

Key Responsibilities:
• Design, develop and maintain scalable software applications.
• Write clean, efficient, and maintainable code.
• Develop backend services and APIs using modern frameworks.
• Collaborate with product managers and designers to build new features.
• Debug and troubleshoot software issues to ensure system reliability.

Required Skills:
Python, REST APIs, Database Management, Git, Software Development Principles.

Preferred Skills:
Experience with cloud platforms such as AWS or Azure, containerization tools like Docker, and microservices architecture.`,

    fullstack: `We are looking for a talented Full Stack Developer who is comfortable working on both frontend and backend technologies. The candidate should have experience building modern web applications and working with databases and APIs.

Key Responsibilities:
• Develop responsive user interfaces using modern JavaScript frameworks.
• Design and implement backend services and APIs.
• Integrate frontend components with backend systems.
• Optimize application performance and ensure scalability.
• Participate in code reviews and maintain high coding standards.

Required Skills:
JavaScript, React, Node.js, SQL, REST APIs, Git.

Preferred Skills:
Experience with cloud services, Docker, CI/CD pipelines, and modern UI frameworks.`,

    analyst: `We are looking for a Senior Data Analyst who will be responsible for analyzing large datasets and providing actionable insights to support business decisions. The candidate should have strong analytical thinking and the ability to communicate insights effectively.

Key Responsibilities:
• Analyze complex datasets to identify trends and patterns.
• Build dashboards and reports to support business decision-making.
• Work with stakeholders to understand analytical requirements.
• Develop data models and ensure data accuracy.
• Present insights and recommendations to business teams.

Required Skills:
Python, SQL, Data Analysis, Excel, Statistical Analysis.

Preferred Skills:
Experience with visualization tools such as Tableau or Power BI and familiarity with machine learning concepts.`,

    hr: `We are looking for an experienced HR Manager responsible for managing recruitment, employee engagement, and HR operations. The candidate will play a key role in developing HR strategies and supporting organizational growth.

Key Responsibilities:
• Manage end-to-end recruitment and hiring processes.
• Develop and implement employee engagement initiatives.
• Oversee HR operations including policies, onboarding, and training.
• Support leadership in workforce planning and performance management.
• Ensure compliance with HR regulations and company policies.

Required Skills:
Recruitment, HR Operations, Employee Engagement, Communication, Organizational Management.

Preferred Skills:
Experience with HR analytics, talent management strategies, and HR software systems.`
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const fillSampleJD = (e) => {
    const selected = e.target.value;
    if (sampleJDs[selected]) {
      setJobDescription(sampleJDs[selected]);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!file) return setError('Upload resume (PDF)');
    if (!jobDescription) return setError('Enter job description');
    if (!backgroundType) return setError('Select background type');

    setError('');
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("job_description", jobDescription);
    formData.append("background_type", backgroundType);
    if (githubUsername) {
      formData.append("github_username", githubUsername);
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      setResults(data);
      
      // Scroll to results
      setTimeout(() => {
        const el = document.getElementById("results-section");
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError("Backend not reachable or error processing request.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="tab-analysis" className="tab-pane active fade-in">
      <div className="main-content">
        <section className="container hero-section">
          <h1 className="title">SkillProof ATS</h1>
          <p className="subtitle">
            A Resume Intelligence Platform designed to optimize your resume for applicant tracking systems instantly.
            Upload your resume, paste the job description, and get actionable insights.
          </p>
        </section>

        <div className="container card">
          {/* Upload Zone */}
          <div 
            id="drop-zone" 
            className="file-dropzone" 
            onClick={() => document.getElementById('file-input').click()}
          >
            <input 
              id="file-input" 
              type="file" 
              accept=".pdf" 
              className="file-input" 
              onChange={handleFileChange} 
            />
            <Upload size={48} className="mb-4 text-muted" />
            
            <div id="idle-state" className={`file-idle ${file ? 'hidden' : ''}`}>
              <p className="file-drop-text">Click to upload Resume (PDF)</p>
            </div>
            <div id="success-state" className={`file-success ${file ? 'active' : ''}`}>
              <p id="file-name">{file?.name}</p>
            </div>
          </div>

          {/* Form Elements */}
          <div className="form-group">
            <label className="form-label">Sample Job Description</label>
            <select className="form-control" onChange={fillSampleJD}>
              <option value="">Select Sample JD</option>
              <option value="software">Software Developer</option>
              <option value="fullstack">Full Stack Developer</option>
              <option value="analyst">Senior Data Analyst</option>
              <option value="hr">HR Manager</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Job Description</label>
            <textarea 
              className="form-control" 
              placeholder="Paste job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-md">
            <div className="form-group">
              <label className="form-label">Background Type</label>
              <select 
                className="form-control"
                value={backgroundType}
                onChange={(e) => setBackgroundType(e.target.value)}
              >
                <option value="">Select</option>
                <option value="tech">Tech</option>
                <option value="non-tech">Non Tech</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">GitHub Username</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="username" 
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="error-msg active flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button 
            id="analyze-btn"
            className="btn btn-primary" 
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
        </div>

        {results && <Results data={results} />}
      </div>
    </div>
  );
};

export default Analysis;
