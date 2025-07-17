import React from 'react';
import { useAuth } from './hooks/useAuth';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ChatBot from './components/ChatBot';

function App() {
  const { loading } = useAuth();
  const currentPath = window.location.pathname;
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex items-center space-x-4">
          <div className="spinner"></div>
          <span className="text-white text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  // Simple routing without react-router for WebContainer compatibility
  if (currentPath === '/login') {
    return <LoginPage />;
  }
  
  if (currentPath === '/admin') {
    return <AdminDashboard />;
  }

  return (
    <>
      <HomePage />
      <ChatBot />
    </>
  );
}

export default App;