import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const storedPreference = localStorage.getItem('darkMode');
    // Default to dark mode if no preference is stored (null means first visit)
    const isDark = storedPreference === null ? true : storedPreference === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = (e: React.MouseEvent) => {
    const isDark = !darkMode;

    // Helper to actually perform the toggle
    const toggle = () => {
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('darkMode', 'true');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('darkMode', 'false');
      }
    };

    // @ts-ignore - View Transition API
    if (document.startViewTransition) {
      const x = e.clientX;
      const y = e.clientY;
      const endRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      // @ts-ignore
      const transition = document.startViewTransition(() => {
        toggle();
      });

      transition.ready.then(() => {
        const clipPath = [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ];

        document.documentElement.animate(
          {
            clipPath: isDark ? clipPath : [...clipPath].reverse(),
          },
          {
            duration: 500,
            easing: "ease-out",
            pseudoElement: isDark
              ? "::view-transition-new(root)"
              : "::view-transition-old(root)",
          }
        );
      });

    } else {
      toggle();
    }
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Close user menu when toggling sidebar to prevent layout artifacts
    setIsUserMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }

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

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isSigningOut) return; // Prevent double-click

    setIsSigningOut(true);
    setIsUserMenuOpen(false);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
      }
      // Force navigation and reload to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out failed:', error);
      // Fallback: force reload
      window.location.href = '/';
    }
  };

  const menuItems = [
    { to: "/super30", icon: "history_edu", label: "Super 30" },
    { to: "/pyq-2026", icon: "restore_page", label: "2026 PYQ" },
    { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { to: "/subjects", icon: "menu_book", label: "Subjects" },
    { to: "/tests", icon: "quiz", label: "Tests & Analysis" },
    { to: "/coming-soon", icon: "school", label: "Mentorship" },
    { to: "/coming-soon", icon: "schedule", label: "Schedule & Routine" },
  ];

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full bg-surface-light dark:bg-surface-dark transition-all duration-300 ${!mobile ? 'rounded-3xl' : ''}`}>
      {/* Header / Logo */}
      <div className={`h-20 flex items-center ${isCollapsed && !mobile ? 'justify-center px-0' : 'px-6 justify-between'} transition-all duration-300 overflow-hidden shrink-0`}>
        <div className={`flex items-center gap-3 min-w-max ${isCollapsed && !mobile ? 'hidden' : 'flex'}`}>
          <img alt="prepAIred logo" className="h-8 w-8 object-contain" src="https://drive.google.com/thumbnail?id=1yLtX3YxubbDBsKYDj82qiaGbSkSX7aLv&sz=w1000" />
          <span className={`text-xl font-bold text-text-light dark:text-text-dark transition-all duration-300`}>
            prep<span className="text-primary">AI</span>red
          </span>
        </div>

        {!mobile && (
          <button
            onClick={toggleSidebar}
            className={`p-2 rounded-xl hover:bg-background-light dark:hover:bg-white/5 text-text-secondary-light dark:text-text-secondary-dark transition-colors ${isCollapsed ? 'w-full flex justify-center' : ''}`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <span className="material-symbols-outlined">
              {isCollapsed ? 'menu' : 'menu_open'}
            </span>
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto sidebar-scroll py-2 flex flex-col justify-between overflow-x-hidden">
        <div className="space-y-1 px-3">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={() => mobile && setIsMobileMenuOpen(false)}
              className={({ isActive }) => {
                const isActuallyActive = isActive && item.to !== '/coming-soon';
                const isSuper30 = item.label === "Super 30";
                const isPYQ = item.label === "2026 PYQ";

                return `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-300 whitespace-nowrap overflow-hidden
                        ${isActuallyActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-white/5 hover:text-text-light dark:hover:text-text-dark'
                  }
                        ${isCollapsed && !mobile ? 'justify-center' : ''}
                        ${isSuper30 ? 'hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] dark:hover:shadow-[0_0_15px_rgba(255,215,0,0.15)]' : ''}
                        ${isPYQ ? 'hover:shadow-[0_0_15px_rgba(34,211,238,0.3)] dark:hover:shadow-[0_0_15px_rgba(34,211,238,0.15)]' : ''}`
              }}
              title={isCollapsed && !mobile ? item.label : undefined}
            >
              {item.label === "Super 30" ? (
                <span className={`shrink-0 font-black text-xl tracking-tighter transition-all duration-300 
                  ${location.pathname === item.to ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'text-yellow-600/80 dark:text-yellow-500/80 group-hover:text-yellow-500 group-hover:drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]'}
                  `}
                  style={{ fontFamily: 'monospace' }}
                >
                  30
                </span>
              ) : item.label === "2026 PYQ" ? (
                <span className={`material-symbols-outlined shrink-0 text-xl transition-all duration-300 
                  ${location.pathname === item.to ? 'drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] filled' : 'group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.3)]'}
                  `}
                >
                  {item.icon}
                </span>
              ) : (
                <span className={`material-symbols-outlined shrink-0 ${item.to !== '/coming-soon' && location.pathname === item.to ? 'filled' : ''}`}>
                  {item.icon}
                </span>
              )}
              <span className={`transition-all duration-300 ${isCollapsed && !mobile ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'} ${item.label === "Super 30" || item.label === "2026 PYQ" ? 'font-bold' : ''} ${item.label === "2026 PYQ" ? 'text-cyan-600 dark:text-cyan-400' : ''}`}>
                {item.label}
              </span>
            </NavLink>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className="mt-4 px-3 space-y-4 mb-6">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-white/5 transition-colors whitespace-nowrap overflow-hidden ${isCollapsed && !mobile ? 'justify-center' : ''}`}
            title="Toggle Dark Mode"
          >
            <span className="material-symbols-outlined shrink-0">
              {darkMode ? 'light_mode' : 'dark_mode'}
            </span>
            <span className={`transition-all duration-300 ${isCollapsed && !mobile ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
          </button>


          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            {isUserMenuOpen && (
              <div
                className={`absolute bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark overflow-hidden z-20
                ${isCollapsed && !mobile
                    ? 'left-full bottom-0 ml-4 w-48'
                    : 'bottom-full left-0 w-full mb-2'
                  }`}
              >
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-border-light dark:border-border-dark mb-1">
                    <p className="text-sm font-bold text-text-light dark:text-text-dark truncate">{user?.user_metadata?.full_name || 'User'}</p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 active:bg-red-500/20 active:scale-[0.98] transition-all duration-150 ease-out cursor-pointer select-none ${isSigningOut ? 'opacity-60 pointer-events-none' : ''}`}
                  >
                    {isSigningOut ? (
                      <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <span className="material-icons-outlined text-lg">logout</span>
                    )}
                    <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>
            )}
            <button
              onClick={toggleUserMenu}
              className={`w-full flex items-center gap-3 rounded-xl transition-colors whitespace-nowrap overflow-hidden
                ${isCollapsed && !mobile
                  ? 'justify-center p-2 hover:bg-background-light dark:hover:bg-white/5'
                  : 'p-2 border border-border-light dark:border-border-dark bg-background-light/50 dark:bg-white/5 hover:bg-border-light/50 dark:hover:bg-white/10'
                }`}
            >
              <img
                alt="User profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-white/10 shrink-0"
                src={user?.user_metadata?.avatar_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'%3E%3Ccircle cx='12' cy='12' r='12' fill='%23e0e7ff'/%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' fill='%236366f1'/%3E%3C/svg%3E"}
              />
              <div className={`flex-1 min-w-0 text-left transition-all duration-300 ${isCollapsed && !mobile ? 'w-0 opacity-0 hidden' : 'block'}`} style={{ display: isCollapsed && !mobile ? 'none' : 'block' }}>
                <p className="text-sm font-bold text-text-light dark:text-text-dark truncate">{user?.user_metadata?.full_name || 'User'}</p>
              </div>
              <span
                className={`material-symbols-outlined text-text-secondary-light text-lg transition-transform duration-300 shrink-0 ${isCollapsed && !mobile ? 'hidden' : 'block'}`}
                style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: isCollapsed && !mobile ? 'none' : 'block' }}
              >
                expand_less
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="app-mobile-header md:hidden bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img alt="prepAIred logo" className="h-8 w-8 object-contain" src="https://drive.google.com/thumbnail?id=1yLtX3YxubbDBsKYDj82qiaGbSkSX7aLv&sz=w1000" />
          <span className="text-xl font-bold text-text-light dark:text-text-dark">
            prep<span className="text-primary">AI</span>red
          </span>
        </div>
        <button onClick={toggleMobileMenu} className="text-text-light dark:text-text-dark focus:outline-none">
          <span className="material-icons-outlined text-3xl">menu</span>
        </button>
      </div>

      {/* Desktop Sidebar (Floating) */}
      <aside className={`hidden md:flex flex-col h-[calc(100vh-2rem)] sticky top-4 ml-4 my-4 rounded-3xl border border-border-light dark:border-border-dark shadow-xl bg-surface-light dark:bg-surface-dark relative transition-all duration-300 ${isCollapsed ? 'w-24' : 'w-72'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Drawer) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          <div className="absolute inset-y-0 left-0 w-64 bg-surface-light dark:bg-surface-dark shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="h-full relative">
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="absolute top-4 right-4 text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark z-50"
              >
                <span className="material-icons-outlined">close</span>
              </button>
              <SidebarContent mobile={true} />
            </div>
          </div>
        </div>
      )}

      {/* Global styles for view transition */}
      <style>{`
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
        }
        ::view-transition-old(root) {
          z-index: 1;
        }
        ::view-transition-new(root) {
          z-index: 2147483646;
        }
        .dark::view-transition-old(root) {
          z-index: 2147483646;
        }
        .dark::view-transition-new(root) {
          z-index: 1;
        }
      `}</style>
    </>
  );
};

export default Sidebar;
