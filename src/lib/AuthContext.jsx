import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        loadProfile(session.user.id);
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(true);
        loadProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    const { data } = await supabase
      .from('player_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    setProfile(data);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  };

  const navigateToLogin = () => {
    window.location.href = '/Home';
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated,
      isLoading,
      logout,
      navigateToLogin,
      loadProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
