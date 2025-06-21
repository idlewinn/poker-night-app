import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainApp from './components/MainApp';
import SessionPage from './components/SessionPage';
import './App.css';

function App(): React.JSX.Element {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/players" element={<MainApp />} />
      <Route path="/sessions" element={<MainApp />} />
      <Route path="/session/:sessionId" element={<SessionPage />} />
    </Routes>
  );
}

export default App;
