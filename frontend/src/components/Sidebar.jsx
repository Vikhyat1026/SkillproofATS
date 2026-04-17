import React, { useState, useEffect } from 'react';
import { 
  User, 
  BarChart2, 
  Info, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [collapsed, setCollapsed] = useState(false);

  // Initial mobile collapse - only runs once on mount
  useEffect(() => {
    if (window.innerWidth <= 768) {
      setCollapsed(true);
    }
  }, []);

  // Sync state with body class for legacy CSS to work correctly
  useEffect(() => {
    if (collapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, [collapsed]);

  const navItems = [
    { id: 'candidates', label: 'Login', icon: User },
    { id: 'analysis', label: 'Analysis', icon: BarChart2 },
    { id: 'about', label: 'About', icon: Info },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <>
      {/* Mobile overlay backdrop */}
      <div 
        id="sidebar-overlay" 
        className={`sidebar-overlay ${!collapsed ? 'active' : ''}`} 
        onClick={toggleSidebar}
      ></div>

      {/* Floating reopen pill — visible only when sidebar is collapsed */}
      <button 
        className="sidebar-reopen-btn" 
        id="sidebar-reopen" 
        onClick={toggleSidebar} 
        aria-label="Open Sidebar"
      >
        <ChevronRight size={16} />
      </button>

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} id="sidebar">
        <div className="sidebar-brand">
          <img src="/logo.png" alt="SkillProof ATS" onError={(e) => e.target.style.display='none'} />
          <span>SkillProof<span style={{ color: 'var(--accent-primary)' }}>.</span></span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth <= 768) setCollapsed(true);
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Collapse tab — peeks out from sidebar's right edge */}
        <button 
          className="sidebar-collapse-tab" 
          id="sidebar-toggle" 
          onClick={toggleSidebar} 
          aria-label="Collapse Sidebar" 
          title="Collapse sidebar"
        >
          <ChevronLeft 
            size={14} 
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} 
          />
        </button>
      </aside>
    </>
  );
};

export default Sidebar;
