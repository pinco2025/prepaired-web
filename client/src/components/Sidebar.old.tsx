import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, subscriptionType } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const NavLink = ({ to, icon, label, onClick }: { to: string; icon: string; label: string; onClick?: (e: React.MouseEvent) => void }) => {
    const isActive = location.pathname === to || (to !== '/dashboard' && location.pathname.startsWith(to));

    return (
      <a
        href={to}
        onClick={(e) => {
          e.preventDefault();
          if (onClick) {
            onClick(e);
          } else {
             if (!user && to !== '/') navigate('/login');
             else navigate(to);
          }
          // Close mobile menu on navigate
          setIsMobileMenuOpen(false);
        }}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-primary/10 text-primary font-semibold'
            : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-surface-light-hover dark:hover:bg-surface-dark-hover hover:text-primary dark:hover:text-primary'
        }`}
      >
        <span className="material-icons-outlined">{icon}</span>
        <span>{label}</span>
      </a>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <img
          alt="prepAIred logo"
          className="h-8 w-8"
          src="https://drive.google.com/thumbnail?id=1yLtX3YxubbDBsKYDj82qiaGbSkSX7aLv&sz=w1000"
        />
        <span className="text-xl font-bold text-text-light dark:text-text-dark">
          prep<span className="text-primary">AI</span>red
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto no-scrollbar">
        {subscriptionType === 'admin' ? (
          <NavLink to="/admin" icon="admin_panel_settings" label="Admin Panel" />
        ) : (
          <>
            <NavLink to="/dashboard" icon="dashboard" label="Dashboard" />
            <NavLink to="/subjects" icon="menu_book" label="Subjects" />
            <NavLink to="/coming-soon" icon="history_edu" label="Revision" />
            <NavLink to="/tests" icon="quiz" label="Test & Analysis" />
            <NavLink to="/coming-soon" icon="school" label="Mentorship" />
            <NavLink to="/coming-soon" icon="library_books" label="Advanced Material" />
            <NavLink to="/coming-soon" icon="schedule" label="Schedule & Routine" />
          </>
        )}
      </nav>

      {/* Footer / User Profile */}
      <div className="p-4 border-t border-border-light dark:border-border-dark">
        <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium px-2">Appearance</span>
             <button onClick={toggleDarkMode} className="w-8 h-8 rounded-full flex items-center justify-center text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark focus:outline-none transition-colors">
              <span className="material-icons-outlined text-xl">{darkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
        </div>

        {user ? (
          <div className="relative" ref={userMenuRef}>
             {/* User Menu Popup (Above) */}
             {isUserMenuOpen && (
                <div className="absolute bottom-full left-0 w-full mb-2 bg-surface-light dark:bg-surface-dark rounded-xl shadow-dropdown-light dark:shadow-dropdown-dark border border-border-light dark:border-border-dark overflow-hidden z-20 animate-fade-in-up">
                  <nav className="py-2">
                    <a className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-light dark:text-text-dark hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors cursor-pointer">
                      <span className="material-icons-outlined text-lg">person</span>
                      <span>Edit Profile</span>
                    </a>
                    <a className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-light dark:text-text-dark hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors cursor-pointer">
                       <span className="material-icons-outlined text-lg">settings</span>
                      <span>Settings</span>
                    </a>
                     <a className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-light dark:text-text-dark hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors cursor-pointer">
                       <span className="material-icons-outlined text-lg">help_center</span>
                      <span>Help Center</span>
                    </a>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors">
                      <span className="material-icons-outlined text-lg">logout</span>
                      <span>Sign Out</span>
                    </button>
                  </nav>
                </div>
             )}

            <button
              onClick={toggleUserMenu}
              className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-colors focus:outline-none"
            >
              <img
                alt="User"
                className="w-10 h-10 rounded-full object-cover border border-border-light dark:border-border-dark"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHE3oUlM1yUb7TA8XdWQV26WNdHzcgBDSKirGjXJIdxcOt5I09wPGatmTzwvZ-v8L8w-jPYAcySvVhjDZxdFNtQcHuxuydZ_luTJLKBeLxGz4fZl1bDm5NxbGWchY27b1ZydID7ghZJmMq6GSuBo0taVI_RRmVifP0b70PpM3btYMLVoRMdBXGhwwrDElzljgyoI9FbZIn8pSLFH0axsXyHGbcCPoCl2HG6R_vzcK3HrsyGv1OMaOwkcAXSX-uxUsV21-SnO9-vbyo"
              />
              <div className="flex-1 text-left overflow-hidden">
                <p className="text-sm font-semibold text-text-light dark:text-text-dark truncate">
                  {user?.user_metadata?.full_name || 'Alex Johnson'}
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
                  {user?.email || 'alex@example.com'}
                </p>
              </div>
              <span className="material-icons-outlined text-text-secondary-light dark:text-text-secondary-dark">
                {isUserMenuOpen ? 'expand_more' : 'expand_less'}
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
             <button onClick={() => navigate('/login')} className="w-full py-2 px-4 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary border border-border-light dark:border-border-dark rounded-lg hover:bg-background-light dark:hover:bg-background-dark transition-all">Log in</button>
             <button onClick={() => navigate('/register')} className="w-full py-2 px-4 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark transition-all shadow-md hover:shadow-lg">Sign up</button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
           <img
            alt="prepAIred logo"
            className="h-8 w-8"
            src="https://drive.google.com/thumbnail?id=1yLtX3YxubbDBsKYDj82qiaGbSkSX7aLv&sz=w1000"
          />
          <span className="text-xl font-bold text-text-light dark:text-text-dark">
            prep<span className="text-primary">AI</span>red
          </span>
        </div>
        <button onClick={toggleMobileMenu} className="text-text-light dark:text-text-dark focus:outline-none">
          <span className="material-icons-outlined text-3xl">menu</span>
        </button>
      </div>

      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>

          {/* Drawer */}
          <div className="absolute inset-y-0 left-0 w-64 bg-surface-light dark:bg-surface-dark shadow-xl transform transition-transform duration-300 ease-in-out">
             <div className="h-full relative">
                 <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="absolute top-4 right-4 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark"
                >
                  <span className="material-icons-outlined">close</span>
                </button>
                <SidebarContent />
             </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
