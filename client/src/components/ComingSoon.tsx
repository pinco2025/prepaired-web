import React from 'react';

const ComingSoon: React.FC = () => {
  return (
    <main className="flex-grow flex items-center justify-center h-full overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-primary/20 to-blue-400/10 blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-purple-500/15 to-primary/10 blur-3xl animate-float-medium"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 rounded-full bg-gradient-to-br from-cyan-400/15 to-emerald-400/10 blur-2xl animate-float-fast"></div>

        {/* Animated rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-primary/10 rounded-full animate-pulse-ring"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-primary/15 rounded-full animate-pulse-ring-delay"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] border border-primary/20 rounded-full animate-pulse-ring-delay-2"></div>

        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-primary/30 animate-particle"
            style={{
              left: `${10 + (i * 7)}%`,
              top: `${20 + (i % 4) * 20}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center relative z-10">
        {/* Animated icon */}
        <div className="mb-6 relative inline-block">
          <div className="text-7xl md:text-8xl animate-bounce-slow relative z-10">
            🚀
          </div>
          <div className="absolute inset-0 blur-xl bg-primary/20 rounded-full animate-pulse scale-150"></div>
        </div>

        {/* Title with gradient */}
        <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-blue-400 to-purple-500 bg-clip-text text-transparent animate-gradient-x mb-4 pb-2 leading-normal">
          Coming Soon
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-lg md:text-xl text-text-secondary-light dark:text-text-secondary-dark max-w-xl mx-auto animate-fade-in-up">
          We're crafting something amazing! Stay tuned for exciting new features.
        </p>

        {/* Animated progress indicator */}
        <div className="mt-8 flex justify-center items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce-dot"></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce-dot" style={{ animationDelay: '0.15s' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-bounce-dot" style={{ animationDelay: '0.3s' }}></div>
        </div>

        {/* Feature pills */}
      </div>

      {/* CSS animations */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(20px, -30px) rotate(5deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          50% { transform: translate(-25px, 20px) rotate(-5deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(15px, -20px); }
        }
        @keyframes pulse-ring {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.05); opacity: 0.1; }
        }
        @keyframes pulse-ring-delay {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.08); opacity: 0.15; }
        }
        @keyframes pulse-ring-delay-2 {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
          50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.2; }
        }
        @keyframes particle {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-30px) scale(1.2); opacity: 0.8; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-dot {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-8px); opacity: 1; }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        .animate-pulse-ring { animation: pulse-ring 4s ease-in-out infinite; }
        .animate-pulse-ring-delay { animation: pulse-ring-delay 4s ease-in-out infinite 0.5s; }
        .animate-pulse-ring-delay-2 { animation: pulse-ring-delay-2 4s ease-in-out infinite 1s; }
        .animate-particle { animation: particle 3s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 2s ease-in-out infinite; }
        .animate-bounce-dot { animation: bounce-dot 1s ease-in-out infinite; }
        .animate-gradient-x { 
          background-size: 200% 100%;
          animation: gradient-x 3s ease infinite; 
        }
      `}</style>
    </main>
  );
};

export default ComingSoon;
