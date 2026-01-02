import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const menuItems = [
    { to: "/dashboard", icon: "dashboard", label: "Dashboard" },
    { to: "/subjects", icon: "menu_book", label: "Subjects" },
    { to: "/coming-soon", icon: "history_edu", label: "Revision" },
    { to: "/tests", icon: "quiz", label: "Tests & Analysis" },
    { to: "/coming-soon", icon: "school", label: "Mentorship" },
    { to: "/coming-soon", icon: "library_books", label: "Advanced Material" },
    { to: "/coming-soon", icon: "schedule", label: "Schedule & Routine" },
  ];

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`flex flex-col h-full bg-surface-light dark:bg-surface-dark transition-all duration-300 ${!mobile ? 'rounded-3xl' : ''}`}>
      {/* Header / Logo */}
      <div className={`h-20 flex items-center ${isCollapsed && !mobile ? 'justify-center px-0' : 'px-6'} transition-all duration-300 overflow-hidden shrink-0`}>
        <div className="flex items-center gap-3 min-w-max">
            <img alt="prepAIred logo" className="h-8 w-8 object-contain" src="https://drive.google.com/thumbnail?id=1yLtX3YxubbDBsKYDj82qiaGbSkSX7aLv&sz=w1000" />
            <span className={`text-xl font-bold text-text-light dark:text-text-dark transition-all duration-300 ${isCollapsed && !mobile ? 'opacity-0 w-0 hidden' : 'opacity-100'}`}>
                prep<span className="text-primary">AI</span>red
            </span>
        </div>
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

                        return `flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors whitespace-nowrap overflow-hidden
                        ${isActuallyActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-white/5 hover:text-text-light dark:hover:text-text-dark'
                        }
                        ${isCollapsed && !mobile ? 'justify-center' : ''}`
                    }}
                    title={isCollapsed && !mobile ? item.label : undefined}
                >
                    <span className={`material-symbols-outlined shrink-0 ${item.to !== '/coming-soon' && location.pathname === item.to ? 'filled' : ''}`}>
                        {item.icon}
                    </span>
                    <span className={`transition-all duration-300 ${isCollapsed && !mobile ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
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
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors">
                    <span className="material-icons-outlined text-lg">logout</span>
                    <span>Sign Out</span>
                    </button>
                </div>
              </div>
            )}
            <button
              onClick={toggleUserMenu}
              className={`w-full flex items-center gap-3 p-2 rounded-xl border border-border-light dark:border-border-dark bg-background-light/50 dark:bg-white/5 hover:bg-border-light/50 dark:hover:bg-white/10 transition-colors whitespace-nowrap overflow-hidden ${isCollapsed && !mobile ? 'justify-center' : ''}`}
            >
              <img
                alt="User profile"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-white/10 shrink-0"
                src={user?.user_metadata?.avatar_url || 'https://lh3.googleusercontent.com/a/ACg8ocJ_Y_0_-8_j_Vf_w_X_Y_V_c_E_L_w_T_k_S_g_w=s96-c'}
              />
              <div className={`flex-1 min-w-0 text-left transition-all duration-300 ${isCollapsed && !mobile ? 'w-0 opacity-0 hidden' : 'block'}`}>
                <p className="text-sm font-bold text-text-light dark:text-text-dark truncate">{user?.user_metadata?.full_name || 'User'}</p>
              </div>
              <span
                className={`material-symbols-outlined text-text-secondary-light text-lg transition-transform duration-300 shrink-0 ${isCollapsed && !mobile ? 'hidden' : 'block'}`}
                style={{ transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
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
      <div className="md:hidden bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark p-4 flex items-center justify-between sticky top-0 z-40">
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
        {/* Collapse Button (Floating on edge) */}
        <button
            onClick={toggleSidebar}
            className="absolute top-8 -right-3 z-50 w-6 h-6 bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform cursor-pointer text-text-secondary-light dark:text-text-secondary-dark hover:text-primary"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
             <span className="material-symbols-outlined text-sm font-bold">
                {isCollapsed ? 'chevron_right' : 'chevron_left'}
             </span>
        </button>

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
