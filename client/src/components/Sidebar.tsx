import React from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar: React.FC = () => {
  // Mock user data for now
  const user = {
    name: 'Alex Morgan',
    role: 'JEE Aspirant',
    avatar: 'https://lh3.googleusercontent.com/a/ACg8ocJ_Y_0_-8_j_Vf_w_X_Y_V_c_E_L_w_T_k_S_g_w=s96-c'
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
            <span className="material-symbols-outlined">library_books</span>
            Subjects
          </NavLink>
          <NavLink to="/coming-soon" className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-white/5 hover:text-text-light dark:hover:text-text-dark'
              }`
            }
          >
            <span className="material-symbols-outlined">calendar_month</span>
            Calendar
          </NavLink>
          <NavLink to="/coming-soon" className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-white/5 hover:text-text-light dark:hover:text-text-dark'
              }`
            }
          >
            <span className="material-symbols-outlined">bar_chart</span>
            Reports
          </NavLink>
          <div className="pt-6 pb-2">
            <p className="px-4 text-xs font-semibold text-text-secondary-light/70 dark:text-text-secondary-dark/70 uppercase tracking-wider">Settings</p>
          </div>
          <NavLink to="/coming-soon" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-white/5 hover:text-text-light dark:hover:text-text-dark transition-colors font-medium">
            <span className="material-symbols-outlined">notifications</span>
            Notifications
          </NavLink>
          <NavLink to="/coming-soon" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-white/5 hover:text-text-light dark:hover:text-text-dark transition-colors font-medium">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </NavLink>
          <NavLink to="/coming-soon" className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-white/5 hover:text-text-light dark:hover:text-text-dark transition-colors font-medium">
            <span className="material-symbols-outlined">help</span>
            Support
          </NavLink>
        </div>
        <div className="mt-8 space-y-4">
          <div className="bg-gradient-to-br from-primary to-blue-600 rounded-2xl p-4 relative overflow-hidden text-white shadow-lg shadow-blue-500/20">
            <div className="relative z-10">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center mb-3 backdrop-blur-sm">
                <span className="material-symbols-outlined text-white text-lg">star</span>
              </div>
              <h4 className="font-bold text-sm">Go Premium</h4>
              <p className="text-xs text-white/80 mt-1 mb-3">Unlock advanced analytics.</p>
              <button className="w-full py-1.5 bg-white text-primary text-xs font-bold rounded-lg hover:bg-blue-50 transition-colors">Upgrade</button>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          </div>
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl border border-border-light dark:border-border-dark bg-background-light/50 dark:bg-white/5">
            <img alt="User profile" className="w-10 h-10 rounded-full object-cover ring-2 ring-white dark:ring-white/10" src={user.avatar} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-text-light dark:text-text-dark truncate">{user.name}</p>
              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">{user.role}</p>
            </div>
            <span className="material-symbols-outlined text-text-secondary-light text-lg">chevron_right</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
