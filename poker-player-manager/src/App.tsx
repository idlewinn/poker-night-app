import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainApp from './components/MainApp';
import SessionPage from './components/SessionPage';
import InvitePage from './components/InvitePage';

function App(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/players" element={<MainApp />} />
        <Route path="/sessions" element={<MainApp />} />
        <Route path="/session/:sessionId" element={<SessionPage />} />
        <Route path="/invite/:sessionId/:encodedEmail" element={<InvitePage />} />
      </Routes>
    </div>
  );
}

export default App;
