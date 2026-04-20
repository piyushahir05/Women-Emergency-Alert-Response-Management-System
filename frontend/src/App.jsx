import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
// User pages
import Register     from './pages/user/Register';
import Login        from './pages/user/Login';
import Dashboard    from './pages/user/Dashboard';
import SOS          from './pages/user/SOS';
import Contacts     from './pages/user/Contacts';
import CaseStatus   from './pages/user/CaseStatus';
import AlertHistory from './pages/user/AlertHistory';

// Vigilance pages
import VigilanceLogin   from './pages/vigilance/VigilanceLogin';
import VigilanceLayout  from './pages/vigilance/VigilanceLayout';
import IncomingCases    from './pages/vigilance/IncomingCases';
import PendingCases     from './pages/vigilance/PendingCases';
import ResolvedCases    from './pages/vigilance/ResolvedCases';
import ClosedCases      from './pages/vigilance/ClosedCases';
import Officers         from './pages/vigilance/Officers';
import Reports          from './pages/vigilance/Reports';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" toastOptions={{ duration: 3500 }} />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login"    element={<Login />} />

          {/* User Protected */}
          <Route path="/dashboard"     element={<ProtectedRoute allowedRoles={['user']}><Dashboard /></ProtectedRoute>} />
          <Route path="/sos"           element={<ProtectedRoute allowedRoles={['user']}><SOS /></ProtectedRoute>} />
          <Route path="/contacts"      element={<ProtectedRoute allowedRoles={['user']}><Contacts /></ProtectedRoute>} />
          <Route path="/case-status"   element={<ProtectedRoute allowedRoles={['user']}><CaseStatus /></ProtectedRoute>} />
          <Route path="/alert-history" element={<ProtectedRoute allowedRoles={['user']}><AlertHistory /></ProtectedRoute>} />

          {/* Vigilance */}
          <Route path="/vigilance/login" element={<VigilanceLogin />} />
          <Route
            path="/vigilance"
            element={
              <ProtectedRoute allowedRoles={['officer', 'admin']}>
                <VigilanceLayout />
              </ProtectedRoute>
            }
          >
            <Route index                element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"    element={<IncomingCases />} />
            <Route path="pending"      element={<PendingCases />} />
            <Route path="resolved"     element={<ResolvedCases />} />
            <Route path="closed"       element={<ClosedCases />} />
            <Route path="officers"     element={<Officers />} />
            <Route path="reports"      element={<Reports />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
