import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare } from 'lucide-react';

const SageChat = () => {
  const [messages, setMessages] = useState([
    { type: 'ai', text: "Hi! I'm Sage, your AI recruiter. I've analyzed your profile — click any question below or ask me anything about your resume fit!" }
  ]);
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, typing]);

  const faqAnswers = {
    'How SkillProof ATS works?': "SkillProof ATS uses a semantic AI engine. Instead of just looking for exact keyword matches, it understands the context of your resume and compares it against the job description to find true alignment.",
    'How is the ATS score calculated?': "Your ATS score is a weighted combination of three factors: Semantic Fit (how well your experience matches the JD), Achievement Strength (your use of measurable results), and your GitHub Technical Impact.",
    'What is semantic fit?': "Semantic fit goes beyond keywords. It means the ATS understands that a 'Software Engineer' who built 'RESTful microservices' is highly related to a JD asking for a 'Backend Developer' with 'API' experience.",
    'What is Achievement Strength?': "Achievement Strength evaluates the impact of your work. The engine looks for quantifiable metrics, success indicators, and clear 'action-to-result' statements in your resume bullet points.",
    'What is GitHub Analysis?': "GitHub Analysis extracts raw coding data from your public GitHub profile and factors it into your overall ATS score to prove you actually write the code you claim on your resume.",
    'How does GitHub Deep Scan work?': "The Deep Scan pulls your repositories, languages, and commit history via the GitHub API. The AI engine then cross-references your specific coding languages directly with the requirements in the Job Description.",
    'What is the reliability & accuracy?': "Our accuracy is very high because we don't rely on simple keyword scraping. By combining Gemini's language models with direct integrations to tools like GitHub, we capture a holistic view of your actual technical skills."
  };

  const handleFAQ = (question) => {
    const answer = faqAnswers[question];
    if (!answer) return;

    setMessages(prev => [...prev, { type: 'user', text: question }]);
    
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { type: 'ai', text: answer }]);
    }, 800);
  };

  return (
    <div className="sage-section">
      <div className="chat-container">
        <div className="chat-header">
          <div className="sage-avatar">
            <MessageSquare size={18} />
          </div>
          <span>Ask Sage</span>
          <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, fontFamily: 'var(--font-body)' }}>
            Click a question below ↓
          </span>
        </div>

        <div id="chat-messages" className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-wrapper ${msg.type}`}>
              <div className={`chat-msg msg-${msg.type}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="chat-wrapper ai">
              <div className="chat-msg msg-ai typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="faq-chips" id="faq-chips">
          {Object.keys(faqAnswers).map((q, i) => (
            <button key={i} className="faq-chip" onClick={() => handleFAQ(q)}>
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SageChat;
