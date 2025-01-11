import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import BasicDetails from './pages/BasicDetails';
import Social from './pages/Social';
import GenerateQR from './pages/GenerateQR';
import GenerateProfile from './pages/GenerateProfile';
import PublicProfile from './pages/PublicProfile';
import SearchProfile from './pages/SearchProfile';
import Auth from './pages/Auth';
import { supabase } from './lib/supabase';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/p/:urlAlias" element={<PublicProfile />} />
        <Route path="/search" element={<SearchProfile />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<BasicDetails />} />
          <Route path="social" element={<Social />} />
          <Route path="qr" element={<GenerateQR />} />
          <Route path="profile" element={<GenerateProfile />} />
          <Route path="search" element={<SearchProfile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;