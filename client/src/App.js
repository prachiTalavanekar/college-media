import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { OnboardingProvider } from './contexts/OnboardingContext';

// Components
import Layout from './components/Layout/Layout';
import AdminLayout from './components/Layout/AdminLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import OnboardingWrapper from './components/Onboarding/OnboardingWrapper';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Home from './pages/Home/Home';
import Communities from './pages/Communities/Communities';
import CommunityDetail from './pages/Communities/CommunityDetail';
import Profile from './pages/Profile/Profile';
import EditProfile from './pages/Profile/EditProfile';
import StudentProfile from './pages/Profile/StudentProfile';
import CreatePost from './pages/Posts/CreatePost';
import Notifications from './pages/Notifications/Notifications';
import Messages from './pages/Messages/Messages';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import TestProfile from './pages/TestProfile';
import FixProfile from './pages/FixProfile';
import Search from './pages/Search/Search';

// Styles
import './App.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <OnboardingWrapper>
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Register /> : <Navigate to="/" replace />} 
        />

        {/* Protected Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Home />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/communities" element={
          <ProtectedRoute>
            <Layout>
              <Communities />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/communities/:id" element={
          <ProtectedRoute>
            <Layout>
              <CommunityDetail />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/create" element={
          <ProtectedRoute>
            <Layout>
              <CreatePost />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Layout>
              <Notifications />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/messages" element={
          <ProtectedRoute>
            <Layout>
              <Messages />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/profile/edit" element={
          <ProtectedRoute>
            <Layout>
              <EditProfile />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/profile/:userId" element={
          <ProtectedRoute>
            <Layout>
              <StudentProfile />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/search" element={
          <ProtectedRoute>
            <Layout>
              <Search />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/test-profile" element={
          <ProtectedRoute>
            <Layout>
              <TestProfile />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/fix-profile" element={
          <ProtectedRoute>
            <Layout>
              <FixProfile />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Admin Routes - Separate from main app */}
        <Route 
          path="/admin/login" 
          element={<AdminLogin />} 
        />
        
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />

        {/* Legacy admin route redirect */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </OnboardingWrapper>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
          <OnboardingProvider>
            <div className="App">
              <AppRoutes />
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
            </div>
          </OnboardingProvider>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;