import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, subscriptionType } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const isHome = location.pathname === '/';


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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
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

  return (
    <header className="bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border-light dark:border-border-dark shadow-sm">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center gap-3 flex-shrink-0">
              <img
                alt="prepAIred logo"
                className="h-8 w-8"
                src="https://drive.google.com/thumbnail?id=1yLtX3YxubbDBsKYDj82qiaGbSkSX7aLv&sz=w1000"
              />
              <span className="text-xl font-bold text-text-light dark:text-text-dark">
                prep<span className="text-primary">AI</span>red
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              {/* helper to navigate or redirect to login when unauthenticated */}
              {/* keep some links disabled intentionally */}
              {subscriptionType === 'admin' ? (
                <>
                  <a
                    className="text-sm font-semibold text-primary border-b-2 border-primary pb-1"
                    href="/admin"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!user) navigate('/login');
                      else navigate('/admin');
                    }}
                  >
                    Admin Panel
                  </a>
                </>
              ) : (
                <>
                  <a
                    data-testid="dashboard-link"
                    className={
                      location.pathname === '/dashboard'
                        ? 'text-sm font-semibold text-primary border-b-2 border-primary pb-1'
                        : 'text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors'
                    }
                    href="/dashboard"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!user) navigate('/login');
                      else navigate('/dashboard');
                    }}
                  >
                    Dashboard
                  </a>
                  <a
                    className={
                      location.pathname.startsWith('/subjects')
                        ? 'text-sm font-semibold text-primary border-b-2 border-primary pb-1'
                        : 'text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors'
                    }
                    href="/subjects"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!user) navigate('/login');
                      else navigate('/subjects');
                    }}
                  >
                    Subjects
                  </a>
                  <a
                    className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors"
                    href="/coming-soon"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!user) navigate('/login');
                      else navigate('/coming-soon');
                    }}
                  >
                    Revision
                  </a>
                  <a
                    data-testid="tests-link"
                    className={
                      location.pathname === '/tests'
                        ? 'text-sm font-semibold text-primary border-b-2 border-primary pb-1'
                        : 'text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors'
                    }
                    href="/tests"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!user) navigate('/login');
                      else navigate('/tests');
                    }}
                  >
                    Test & Analysis
                  </a>
                  <a
                    className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors"
                    href="/coming-soon"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!user) navigate('/login');
                      else navigate('/coming-soon');
                    }}
                  >
                    Mentorship
                  </a>
                  <a
                    className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors"
                    href="/coming-soon"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!user) navigate('/login');
                      else navigate('/coming-soon');
                    }}
                  >
                    Advanced Material
                  </a>
                  <a
                    className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary dark:hover:text-primary transition-colors"
                    href="/coming-soon"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!user) navigate('/login');
                      else navigate('/coming-soon');
                    }}
                  >
                    Schedule & Routine
                  </a>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center">
            <button onClick={toggleDarkMode} className="w-10 h-10 rounded-full flex items-center justify-center text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background-light dark:focus:ring-offset-background-dark">
              <span className="material-icons-outlined">{darkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <div className="relative" ref={menuRef}>
              {user ? (
                <>
                  <button onClick={toggleMenu} aria-haspopup="true" aria-expanded={isMenuOpen} className="ml-4 w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background-light dark:focus:ring-offset-background-dark">
                    <img
                      alt="User profile picture"
                      className="w-10 h-10 rounded-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBHE3oUlM1yUb7TA8XdWQV26WNdHzcgBDSKirGjXJIdxcOt5I09wPGatmTzwvZ-v8L8w-jPYAcySvVhjDZxdFNtQcHuxuydZ_luTJLKBeLxGz4fZl1bDm5NxbGWchY27b1ZydID7ghZJmMq6GSuBo0taVI_RRmVifP0b70PpM3btYMLVoRMdBXGhwwrDElzljgyoI9FbZIn8pSLFH0axsXyHGbcCPoCl2HG6R_vzcK3HrsyGv1OMaOwkcAXSX-uxUsV21-SnO9-vbyo"
                    />
                  </button>
                  {isMenuOpen && (
                    <div
                      className={`absolute top-14 right-0 w-64 bg-surface-light dark:bg-surface-dark rounded-xl shadow-dropdown-light dark:shadow-dropdown-dark border border-border-light dark:border-border-dark overflow-hidden z-20 transition-all duration-300 ease-in-out transform`}
                    >
                      <div className="p-4 border-b border-border-light dark:border-border-dark">
                        <p className="font-semibold text-text-light dark:text-text-dark truncate">
                          {user?.user_metadata?.full_name || 'Alex Johnson'}
                        </p>
                        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark truncate">
                          {user?.email || 'alex.johnson@example.com'}
                        </p>
                      </div>
                      <nav className="py-2">
                        <a className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-light dark:text-text-dark hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors" href="#">
                          <span className="material-icons-outlined text-xl text-text-secondary-light dark:text-text-secondary-dark"> person </span>
                          <span>Edit Profile</span>
                        </a>
                        <a className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-light dark:text-text-dark hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors" href="#">
                          <span className="material-icons-outlined text-xl text-text-secondary-light dark:text-text-secondary-dark"> settings </span>
                          <span>Settings</span>
                        </a>
                        <a className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-light dark:text-text-dark hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors" href="#">
                          <span className="material-icons-outlined text-xl text-text-secondary-light dark:text-text-secondary-dark"> help_center </span>
                          <span>Help Center</span>
                        </a>
                      </nav>
                      <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors">
                        <span className="material-icons-outlined text-xl"> logout </span>
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="ml-4 flex items-center gap-3">
                  <a href="/login" className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-primary">Log in</a>
                  <a href="/register" className="text-sm font-medium px-3 py-1.5 bg-primary text-white rounded-md">Sign up</a>
                </div>
              )}
            </div>
            </div>
          </div>
      </nav>
    </header>
  );
};

export default Header;
