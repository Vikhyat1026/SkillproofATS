import React from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Github, 
  MessageSquare, 
  Database, 
  History, 
  Zap,
  HelpCircle,
  Lock
} from 'lucide-react';

const About = () => {
  const faqs = [
    {
      q: "How does the AI Scoring work?",
      a: "Unlike traditional ATS that use basic keyword matching, SkillProof uses a local ONNX-powered semantic engine. This understands the context, synonyms, and engineering depth of your experience, not just text strings."
    },
    {
      q: "Is my data private and secure?",
      a: "Yes. Our core AI engine runs locally on our servers, meaning your resume data isn't sent to third-party providers for scoring. For persistent storage, we use Supabase with industry-standard encryption."
    },
    {
      q: "What is a 'GitHub Deep Scan'?",
      a: "For tech roles, we analyze your public GitHub profile to quantify commit consistency, language diversity, and project impact. This provides a 'hidden' score that recruiters love."
    },
    {
      q: "Who is Sage, and how can she help?",
      a: "Sage is your built-in AI career mentor. Powered by advanced LLMs, she can analyze the gap between your resume and a JD, suggest specific bullet points, or even role-play a technical interview with you."
    },
    {
      q: "Why should I create an account?",
      a: "Logged-in users gain access to The Vault (resume persistence), JD Library (job tracking), and Analysis History. This allows you to track your resume's optimization progress over time."
    }
  ];

  return (
    <div className="container" style={{ maxWidth: '1000px', paddingTop: '4rem', paddingBottom: '5rem' }}>
      <section className="hero-section" style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 className="title">Resume Intelligence</h1>
        <p className="subtitle" style={{ margin: '0 auto', maxWidth: '700px' }}>
          SkillProof ATS is more than a scanner. It's a high-performance optimization engine designed to bridge the gap between human talent and algorithmic filtering.
        </p>
      </section>

      {/* Core Intelligence Breakdown */}
      <div className="grid grid-cols-2 gap-md" style={{ marginBottom: '4rem' }}>
        <div className="card" style={{ textAlign: 'left', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: 'var(--accent-primary)', background: 'rgba(245, 158, 11, 0.1)', padding: '10px', borderRadius: '12px' }}>
              <Cpu size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'white' }}>ONNX Local AI</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Our core semantic engine uses quantized ONNX models to perform context-aware matching without external API latency or privacy concerns.
          </p>
        </div>

        <div className="card" style={{ textAlign: 'left', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: '#8B5CF6', background: 'rgba(139, 92, 246, 0.1)', padding: '10px', borderRadius: '12px' }}>
              <Github size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'white' }}>GitHub Deep Scan</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            We look beyond the resume to your actual code. Our deep scan analyzes repository diversity and activity to give software engineers a true competitive edge.
          </p>
        </div>

        <div className="card" style={{ textAlign: 'left', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: '#F472B6', background: 'rgba(244, 114, 182, 0.1)', padding: '10px', borderRadius: '12px' }}>
              <MessageSquare size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'white' }}>Ask Sage</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Meet your AI recruiter. Sage analyzes the intersection of your skills and job requirements to provide conversational, actionable career advice.
          </p>
        </div>

        <div className="card" style={{ textAlign: 'left', margin: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ color: '#34D399', background: 'rgba(52, 211, 153, 0.1)', padding: '10px', borderRadius: '12px' }}>
              <Zap size={24} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'white' }}>Achievement Scoring</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            It's not just about what you did, but the impact you made. Our logic quantifies achievement markers to highlight your results-driven mindset.
          </p>
        </div>
      </div>

      {/* Member Benefits */}
      <h2 className="title" style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>Member Superpowers</h2>
      <div className="card" style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '24px', padding: '2.5rem', marginBottom: '4rem' }}>
        <div className="grid grid-cols-3 gap-lg">
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--accent-primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Database size={32} /></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>The Vault</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Never lose your resume again. Safely store and manage your career documents in one place.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--accent-primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><History size={32} /></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>Audit Trail</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Track your score improvements as you refine your resume over days or weeks.</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'var(--accent-primary)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><ShieldCheck size={32} /></div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>JD Library</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Build a custom library of target roles to benchmark your growth against multiple career paths.</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <h2 className="title" style={{ fontSize: '1.75rem', marginBottom: '2rem' }}>Frequently Asked Questions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqs.map((faq, idx) => (
          <div key={idx} className="card" style={{ textAlign: 'left', margin: 0, padding: '1.5rem', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ color: 'var(--accent-primary)', flexShrink: 0 }}><HelpCircle size={20} /></div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>{faq.q}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{faq.a}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <footer style={{ marginTop: '5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <p>© 2026 SkillProof Intelligence. Built for the modern workforce.</p>
      </footer>
    </div>
  );
};

export default About;
