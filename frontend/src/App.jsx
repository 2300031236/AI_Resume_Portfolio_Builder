import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import ResumeBuilder from './pages/ResumeBuilder';
import AtsAnalyzer from './pages/AtsAnalyzer';
import CoverLetterGenerator from './pages/CoverLetterGenerator';
import PortfolioGenerator from './pages/PortfolioGenerator';
import CareerAdvisor from './pages/CareerAdvisor';
import AiTools from './pages/AiTools';
import PublicPortfolio from './pages/PublicPortfolio';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Shareable Public Portfolio Link */}
          <Route path="/portfolio/:userId" element={<PublicPortfolio />} />

          {/* Secure Workspace routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="resume-builder" element={<ResumeBuilder />} />
            <Route path="ats-analyzer" element={<AtsAnalyzer />} />
            <Route path="cover-letter" element={<CoverLetterGenerator />} />
            <Route path="portfolio-builder" element={<PortfolioGenerator />} />
            <Route path="career-advisor" element={<CareerAdvisor />} />
            <Route path="ai-tools" element={<AiTools />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
