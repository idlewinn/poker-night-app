import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import MainApp from './components/MainApp';
import AnalyticsPage from './components/AnalyticsPage';
import SessionPage from './components/SessionPage';
import InvitePage from './components/InvitePage';
import ProtectedRoute from './components/ProtectedRoute';

function App(): React.JSX.Element {
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
          <Route path="/session/:sessionId" element={
            <ProtectedRoute>
              <SessionPage />
            </ProtectedRoute>
          } />
          <Route path="/invite/:sessionId/:encodedEmail" element={<InvitePage />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
