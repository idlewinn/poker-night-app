import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainApp from './components/MainApp';
import AnalyticsPage from './components/AnalyticsPage';
import SessionPage from './components/SessionPage';
import InvitePage from './components/InvitePage';
import TestPage from './components/TestPage';
import ProtectedRoute from './components/ProtectedRoute';

function App(): React.JSX.Element {
  // Initialize theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('poker-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
  }, []);

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } />
          <Route path="/players" element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } />
          <Route path="/sessions" element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } />
          <Route path="/analytics" element={
            <ProtectedRoute>
              <AnalyticsPage />
            </ProtectedRoute>
          } />
          <Route path="/sessions/:sessionId" element={
            <ProtectedRoute>
              <SessionPage />
            </ProtectedRoute>
          } />
          <Route path="/sessions/:sessionId/:tab" element={
            <ProtectedRoute>
              <SessionPage />
            </ProtectedRoute>
          } />
          <Route path="/sessions/:sessionId/dashboard" element={
            <ProtectedRoute>
              <SessionPage />
            </ProtectedRoute>
          } />
          <Route path="/sessions/:sessionId/dashboard/:tab" element={
            <ProtectedRoute>
              <SessionPage />
            </ProtectedRoute>
          } />
          <Route path="/test" element={
            <ProtectedRoute>
              <TestPage />
            </ProtectedRoute>
          } />
          <Route path="/invite/:sessionId/:encodedEmail" element={<InvitePage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
