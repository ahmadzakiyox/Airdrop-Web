// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

// Pages
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import VerifyEmailPage from './pages/VerifyEmailPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AirdropsPage from './pages/AirdropsPage.jsx';
import AddEditAirdropPage from './pages/AddEditAirdropPage.jsx';
import AirdropDetailPage from './pages/AirdropDetailPage.jsx';
import AdminDashboardPage from './pages/AdminDashboardPage.jsx';
import UserManagementPage from './pages/UserManagementPage.jsx';
import AllAirdropsManagementPage from './pages/AllAirdropsManagementPage.jsx';
import UserProfilePage from './pages/UserProfilePage.jsx'; // <<< IMPORT HALAMAN PROFIL
import ChatPage from './pages/ChatPage.jsx'; // <<< PASTIKAN INI ADA

// Layout Components
import Layout from './components/layout/Layout.jsx'; // Layout untuk user biasa
import AdminLayout from './components/layout/AdminLayout.jsx';

const PrivateRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', color: 'white' }}>
            Loading App...
        </div>
    );
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, loading } = useAuth();
    if (loading) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '24px', color: 'white' }}>
            Loading App...
        </div>
    );
    return (isAuthenticated && user && user.isAdmin) ? children : <Navigate to="/" replace />;
};

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
                <Route path="/verify-email/:token/:email" element={<VerifyEmailPage />} />

                {/* Private Routes */}
                <Route path="/" element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />
                <Route path="/airdrops" element={<PrivateRoute><Layout><AirdropsPage /></Layout></PrivateRoute>} />
                <Route path="/airdrops/add" element={<PrivateRoute><Layout><AddEditAirdropPage /></Layout></PrivateRoute>} />
                <Route path="/airdrops/edit/:id" element={<PrivateRoute><Layout><AddEditAirdropPage /></Layout></PrivateRoute>} />
                <Route path="/airdrops/:id" element={<PrivateRoute><Layout><AirdropDetailPage /></Layout></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute><Layout><UserProfilePage /></Layout></PrivateRoute>} /> {/* <<< RUTE BARU */}
                <Route path="/chat" element={<PrivateRoute><Layout><ChatPage /></Layout></PrivateRoute>} /> {/* <<< PASTIKAN RUTE INI ADA */}
                
                {/* Admin Routes - Dibungkus dengan AdminLayout */}
                <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout><AdminDashboardPage /></AdminLayout></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><AdminLayout><UserManagementPage /></AdminLayout></AdminRoute>} />
                <Route path="/admin/airdrops" element={<AdminRoute><AdminLayout><AllAirdropsManagementPage /></AdminLayout></AdminRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;