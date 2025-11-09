import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

type Props = {
  children: React.ReactElement;
};

const RequireAuth: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session ?? null;
        if (!session) {
          navigate('/login', { replace: true, state: { from: location.pathname } });
        }
      } catch (err) {
        // on error, redirect to login
        navigate('/login', { replace: true });
      } finally {
        if (mounted) setLoading(false);
      }
    };

    check();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
      }
    });

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, [navigate, location]);

  if (loading) return null;

  return children;
};

export default RequireAuth;
