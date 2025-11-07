import React from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="absolute inset-0 grid-bg-light dark:grid-bg-dark -z-10"></div>
      <Header />
      <Dashboard />
    </div>
  );
};

export default App;
