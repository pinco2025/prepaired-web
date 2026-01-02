import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
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

  return (
    <aside className="w-64 bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark flex-shrink-0 hidden md:flex flex-col z-20">
      <div className="h-20 flex items-center px-6 border-b border-border-light/50 dark:border-border-dark/50">
        <div className="flex items-center gap-3">
          <img alt="prepAIred logo" className="h-8 w-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdzj_WfIjmmM52JXz4zKQrlQgJkA4UmPvuySjzEbq9Bsdj31RsY7ncfFrEi-fD-BWSo0ZTpLvMe7hOv0DP_1JXMQbL8BW_EgaawiBsr0daDGG68D4iJN_47bGlm98RGzILkKm4sgrjxbv04CENGDP2nGSO6OWmZ8vg5Q9-vdcYbpfJrfN1QRe-Abx_bYN4iP1dZnaJMNe-Jycl4XN4_crPSiEv3ULZH5fzZGU9CbUHu7gVaJ3NCZ4o0LRozC1uo6aoEl7HLrY5k_En" />
          <span className="text-xl font-bold text-text-light dark:text-text-dark">prep<span className="text-primary">AI</span>red</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto sidebar-scroll py-6 px-4 flex flex-col justify-between">
        <div className="space-y-1">
          <NavLink to="/dashboard" className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-white/5 hover:text-text-light dark:hover:text-text-dark'
              }`
            }
          >
            <span className="material-symbols-outlined filled">dashboard</span>
            Dashboard
          </NavLink>
          <NavLink to="/subjects" className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-white/5 hover:text-text-light dark:hover:text-text-dark'
              }`
            }
          >
            <span className="material-symbols-outlined">menu_book</span>
            Subjects
          </NavLink>
          <NavLink to="/tests" className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-white/5 hover:text-text-light dark:hover:text-text-dark'
              }`
            }
          >
            <span className="material-symbols-outlined">quiz</span>
            Tests
          </NavLink>
        </div>
        <div className="mt-8 space-y-4">
          <div className="relative" ref={userMenuRef}>
            {isUserMenuOpen && (
              <div className="absolute bottom-full w-full mb-2 bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark overflow-hidden z-20">
                <button onClick={toggleDarkMode} className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-text-light dark:text-text-dark hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors">
                  <span>Dark Mode</span>
                  <span className="material-icons-outlined text-lg">{darkMode ? 'light_mode' : 'dark_mode'}</span>
                </button>
                <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors">
                  <span className="material-icons-outlined text-lg">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
            <button
              onClick={toggleUserMenu}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-xl border border-border-light dark:border-border-dark bg-background-light/50 dark:bg-white/5 hover:bg-border-light/50 dark:hover:bg-white/10 transition-colors"
            >
              <img
                alt="User profile"
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-white/10"
                src={user?.user_metadata?.avatar_url || 'https://lh3.googleusercontent.com/a/ACg8ocJ_Y_0_-8_j_Vf_w_X_Y_V_c_E_L_w_T_k_S_g_w=s96-c'}
              />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-bold text-text-light dark:text-text-dark truncate">{user?.user_metadata?.full_name || 'User'}</p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">{user?.email}</p>
              </div>
              <span
                className="material-symbols-outlined text-text-secondary-light text-lg transition-transform duration-300"
                style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                expand_less
              </span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
