import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Register from './pages/Register';
import ApplicantDashboard from './pages/ApplicantDashboard';
import BotDashboard from './pages/BotDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminApplications from './pages/AdminApplications';
import AdminStats from './pages/AdminStats';
import AdminUsers from './pages/AdminUsers';
import BotQueue from './pages/BotQueue';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ApplicationForm from './components/ApplicationForm';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={`/dashboard/${user.role}`} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="flex">
        <div className="w-64 min-h-screen">
          <Sidebar />
        </div>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="bg-gray-100 min-h-screen">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route
              path="/dashboard/applicant"
              element={
                <PrivateRoute roles={['applicant']}>
                  <ApplicantDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/applicant/new"
              element={
                <PrivateRoute roles={['applicant']}>
                  <ApplicationForm />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/dashboard/bot"
              element={
                <PrivateRoute roles={['bot']}>
                  <BotDashboard />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/dashboard/admin"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/admin/applications"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminApplications />
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/admin/stats"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminStats />
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/admin/users"
              element={
                <PrivateRoute roles={['admin']}>
                  <AdminUsers />
                </PrivateRoute>
              }
            />

            <Route
              path="/dashboard/bot/queue"
              element={
                <PrivateRoute roles={['bot']}>
                  <BotQueue />
                </PrivateRoute>
              }
            />
            
            <Route
              path="/"
              element={<Navigate to="/login" replace />}
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
