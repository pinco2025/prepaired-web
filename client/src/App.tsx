import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import SignUp from './components/SignUp';

const AppContent: React.FC = () => {
  const location = useLocation();

  const hideHeaderOnPaths = ['/login', '/register'];
  const showHeader = !hideHeaderOnPaths.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background layer: color + grid image */}
      <div className="absolute inset-0 bg-background-light dark:bg-background-dark grid-bg-light dark:grid-bg-dark -z-10"></div>
      {showHeader && <Header />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
