import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import Analysis from './components/Analysis';
import SageChat from './components/SageChat';
import Auth from './components/Auth';
import About from './components/About';

function App() {
  const [activeTab, setActiveTab] = useState('analysis');
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const renderContent = () => {
    // If on candidates tab and not logged in, show Auth
    if (activeTab === 'candidates' && !session) {
      return <Auth />;
    }
    
    // Logged in user on candidates tab might see their profile/history
    if (activeTab === 'candidates' && session) {
      return (
        <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
          <h1 className="title">Welcome, {session.user.user_metadata?.full_name || session.user.email}</h1>
          <p className="subtitle">You are logged in and ready to analyze.</p>
          <button className="btn btn-primary mt-8" style={{ maxWidth: '200px' }} onClick={() => supabase.auth.signOut()}>
            Sign Out
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'analysis':
        return (
          <>
            <Analysis />
            <SageChat />
          </>
        );
      case 'about':
        return <About />;
      case 'settings':
        return (
          <div className="container" style={{ paddingTop: '4rem', textAlign: 'center', height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <h2 style={{ color: 'var(--text-muted)' }}>Settings placeholder</h2>
          </div>
        );
      default:
        return <Analysis />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="dashboard-main">
        <div className={`tab-pane active fade-in`}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
