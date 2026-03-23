import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AuthCallback - Handles redirect after OAuth (Google) login/signup.
 * Reads the saved return path from localStorage and navigates there.
 */
const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const returnTo = localStorage.getItem('authReturnTo') || '/question-set';
    localStorage.removeItem('authReturnTo');
    navigate(returnTo, { replace: true });
  }, [navigate]);

  return null;
};

export default AuthCallback;
