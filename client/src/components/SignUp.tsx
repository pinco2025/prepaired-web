import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

const SignUp: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
      <div className="absolute inset-0 grid-bg-light dark:grid-bg-dark -z-10"></div>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 h-24">
          <img
            alt="prepAIred logo"
            className="h-10 w-10"
            src="https://drive.google.com/thumbnail?id=1yLtX3YxubbDBsKYDj82qiaGbSkSX7aLv&sz=w1000"
          />
          <span className="text-3xl font-bold text-text-light dark:text-text-dark">
            prep<span className="text-primary">AI</span>red
          </span>
        </div>
        <div className="bg-surface-light dark:bg-surface-dark p-8 rounded-xl shadow-card-light dark:shadow-card-dark">
          <h1 className="text-2xl font-bold text-center text-text-light dark:text-text-dark mb-2">Create an Account</h1>
          <p className="text-center text-text-secondary-light dark:text-text-secondary-dark mb-8">
            Start your AI-powered preparation journey.
          </p>
          <form onSubmit={handleSignUp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark" htmlFor="fullname">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  className="block w-full h-10 leading-[48px] rounded-md border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary shadow-sm text-left px-4"
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
            <div>
              <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark" htmlFor="email">
                Email
              </label>
              <div className="mt-1">
                <input
                  className="block w-full h-10 leading-[48px] rounded-md border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary shadow-sm text-left px-4"
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
            <div>
              <label className="block text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark" htmlFor="password">
                Create Password
              </label>
              <div className="mt-1 relative">
                <input
                  className="block w-full h-10 leading-[48px] rounded-md border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark focus:ring-primary focus:border-primary shadow-sm text-left px-4"
                  id="password"
                  name="password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-2.5 text-text-secondary-light dark:text-text-secondary-dark hover:text-primary focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-icons-outlined select-none" aria-hidden="true">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div>
              <button
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                type="submit"
              >
                Sign Up
              </button>
            </div>
          </form>
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-light dark:border-border-dark"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface-light dark:bg-surface-dark text-text-secondary-light dark:text-text-secondary-dark">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="mt-6">
              <a
                className="w-full inline-flex justify-center py-2.5 px-4 border border-border-light dark:border-border-dark rounded-md shadow-sm bg-surface-light dark:bg-surface-dark text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark hover:bg-background-light dark:hover:bg-background-dark"
                onClick={handleGoogleSignUp}
              >
                <span className="sr-only">Continue with Google</span>
                <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"></path>
                </svg>
                <span className="ml-3">Continue with Google</span>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Already have an account?{" "}
            <a className="font-medium text-primary hover:underline" href="/login">
              Log In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
