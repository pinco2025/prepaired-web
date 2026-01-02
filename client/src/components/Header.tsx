import React from 'react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="md:hidden bg-surface-light/80 dark:bg-surface-dark/80 backdrop-blur-sm border-b border-border-light dark:border-border-dark h-16 flex items-center justify-between px-4 z-30">
      <div className="flex items-center gap-2">
        <img alt="prepAIred logo" className="h-8 w-8" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdzj_WfIjmmM52JXz4zKQrlQgJkA4UmPvuySjzEbq9Bsdj31RsY7ncfFrEi-fD-BWSo0ZTpLvMe7hOv0DP_1JXMQbL8BW_EgaawiBsr0daDGG68D4iJN_47bGlm98RGzILkKm4sgrjxbv04CENGDP2nGSO6OWmZ8vg5Q9-vdcYbpfJrfN1QRe-Abx_bYN4iP1dZnaJMNe-Jycl4XN4_crPSiEv3ULZH5fzZGU9CbUHu7gVaJ3NCZ4o0LRozC1uo6aoEl7HLrY5k_En" />
        <span className="text-lg font-bold text-text-light dark:text-text-dark">prep<span className="text-primary">AI</span>red</span>
      </div>
      <button onClick={onMenuClick} className="text-text-light dark:text-text-dark">
        <span className="material-icons-outlined">menu</span>
      </button>
    </header>
  );
};

export default Header;
