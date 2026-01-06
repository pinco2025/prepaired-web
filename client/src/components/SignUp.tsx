import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { usePageTitle } from '../hooks/usePageTitle';

const SignUp: React.FC = () => {
  usePageTitle('Sign Up');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session ?? null;
        if (session && mounted) {
          navigate('/', { replace: true });
        }
      } catch (err) {
        // ignore and allow registration UI
      }
    };
    check();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4 font-display text-text-light dark:text-text-dark antialiased transition-colors duration-300">
      <div className="absolute inset-0 grid-bg-light dark:grid-bg-dark -z-10 opacity-70"></div>
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-light/5 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-md backdrop-blur-sm">
        <div className="flex items-center justify-center gap-3 mb-10 transform hover:scale-105 transition-transform duration-300 cursor-default">
          <img
            alt="prepAIred logo"
            className="h-12 w-12 drop-shadow-md"
            src="https://drive.google.com/thumbnail?id=1yLtX3YxubbDBsKYDj82qiaGbSkSX7aLv&sz=w1000"
          />
          <span className="text-4xl font-bold text-text-light dark:text-text-dark tracking-tight">
            prep<span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-light">AI</span>red
          </span>
        </div>

        <div className="bg-surface-light/80 dark:bg-surface-dark/90 backdrop-blur-md p-10 rounded-2xl shadow-card-light dark:shadow-card-dark border border-white/20 dark:border-white/5">
          <h1 className="text-3xl font-bold text-center text-text-light dark:text-text-dark mb-3 tracking-tight">Create an Account</h1>
          <p className="text-center text-text-secondary-light dark:text-text-secondary-dark mb-8 text-sm font-medium">
            Start your AI-powered preparation journey.
          </p>
          <form onSubmit={handleSignUp} className="space-y-6">
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark ml-1" htmlFor="fullname">
                Full Name
              </label>
              <div className="relative group">
                <input
                  className="glow-input block w-full rounded-xl border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark/50 text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm py-3 px-4 placeholder-text-secondary-light/50 dark:placeholder-text-secondary-dark/50"
                  id="fullname"
                  name="fullname"
                  placeholder="John Doe"
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark ml-1" htmlFor="email">
                Email
              </label>
              <div className="relative group">
                <input
                  className="glow-input block w-full rounded-xl border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark/50 text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm py-3 px-4 placeholder-text-secondary-light/50 dark:placeholder-text-secondary-dark/50"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark ml-1" htmlFor="password">
                Create Password
              </label>
              <div className="relative group">
                <input
                  className="glow-input block w-full rounded-xl border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark/50 text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary/50 focus:border-primary shadow-sm py-3 px-4"
                  id="password"
                  name="password"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="pt-2">
              <button
                className="glow-button w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-primary/30 text-sm font-bold text-white bg-gradient-to-r from-primary to-primary-light hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary uppercase tracking-wider"
                type="submit"
              >
                Sign Up
              </button>
            </div>
          </form>
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-light dark:border-border-dark"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface-light dark:bg-surface-dark/95 text-text-secondary-light dark:text-text-secondary-dark font-medium">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="mt-8">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="google-btn-hover w-full inline-flex justify-center items-center py-3 px-4 border border-border-light dark:border-border-dark rounded-xl shadow-sm bg-surface-light dark:bg-surface-dark text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:text-text-light dark:hover:text-text-dark"
              >
                <span className="sr-only">Sign up with Google</span>
                <svg aria-hidden="true" className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"></path>
                </svg>
                <span className="ml-2">Sign up with Google</span>
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Already have an account?
            <a className="font-bold text-primary hover:text-primary-light link-hover transition-colors ml-1" href="/login">
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
