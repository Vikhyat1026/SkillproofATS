import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Sidebar from './components/Sidebar';
import Analysis from './components/Analysis';
import SageChat from './components/SageChat';
import Auth from './components/Auth';
import About from './components/About';
import History from './components/History';
import Profile from './components/Profile';
import JDLibrary from './components/JDLibrary';
import ResumeVault from './components/ResumeVault';

function App() {
  const [activeTab, setActiveTab] = useState('analysis');
  const [session, setSession] = useState(null);
  const [selectedJD, setSelectedJD] = useState('');
  const [selectedResume, setSelectedResume] = useState(null);

  const handleSelectJD = (jd) => {
    setSelectedJD(jd.content);
    setActiveTab('analysis');
  };

  const handleSelectResume = (resume) => {
    setSelectedResume(resume);
    setActiveTab('analysis');
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const renderContent = () => {
    // Shared check: if on a protected tab and not logged in, show Auth
    const protectedTabs = ['history', 'candidates', 'library', 'vault'];
    if (protectedTabs.includes(activeTab) && !session) {
      return <Auth />;
    }
    
    switch (activeTab) {
      case 'analysis':
        return (
          <>
            <Analysis 
              session={session} 
              initialJD={selectedJD} 
              initialResume={selectedResume} 
            />
            <SageChat />
          </>
        );
      case 'history':
        return <History session={session} />;
      case 'library':
        return <JDLibrary session={session} onSelectJD={handleSelectJD} />;
      case 'vault':
        return <ResumeVault session={session} onSelectResume={handleSelectResume} />;
      case 'candidates':
        return <Profile session={session} onSignOut={() => supabase.auth.signOut()} />;
      case 'about':
        return <About />;
      default:
        return <Analysis session={session} initialJD={selectedJD} initialResume={selectedResume} />;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} session={session} />
      
      <main className="dashboard-main">
        <div className={`tab-pane active fade-in`}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
