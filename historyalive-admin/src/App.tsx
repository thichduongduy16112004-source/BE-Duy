import './App.css';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { Shield } from 'lucide-react';
import AdminLayout from './components/AdminLayout';
import AuditLogsPage from './pages/AuditLogsPage';
import BillingPage from './pages/BillingPage';
import CharacterEditPage from './pages/CharacterEditPage';
import CharactersPage from './pages/CharactersPage';
import DashboardPage from './pages/DashboardPage';
import InferTestPage from './pages/InferTestPage';
import KnowledgePage from './pages/KnowledgePage';
import SettingsPage from './pages/SettingsPage';
import UsersPage from './pages/UsersPage';
import LessonsPage from './pages/LessonsPage';
import ClassesPage from './pages/ClassesPage';
import { apiService, clearTokens, getAccessToken } from './services/apiService';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!getAccessToken()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getAccessToken()) {
      navigate('/characters');
    }
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await apiService.login(email, password);
      navigate('/characters');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đăng nhập thất bại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-shell">
      <section className="login-stage">
        <div className="login-manifesto">
          <p className="login-kicker">History Alive Command Desk</p>
          <h1>Archive. Train. Publish.</h1>
          <p>Điều phối nhân vật lịch sử, tri thức JSONL và kiểm thử RAG từ một bảng điều khiển dành riêng cho quản trị viên.</p>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <div className="brand-mark"><Shield size={28} /></div>
            <div>
              <h2>Admin Portal</h2>
              <p>Secure access</p>
            </div>
          </div>

          {error && <div className="feedback feedback-error">{error}</div>}

          <form onSubmit={handleSubmit} className="form-stack">
            <label className="field-group">
              <span>Email quản trị</span>
              <input id="admin-login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="admin@example.com" required />
            </label>
            <label className="field-group">
              <span>Mật khẩu</span>
              <input id="admin-login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required />
            </label>
            <button id="admin-login-submit" className="primary-button full-width" type="submit" disabled={isLoading}>
              {isLoading ? 'Đang xác thực...' : 'Đăng nhập'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

function LogoutRoute() {
  clearTokens();
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/logout" element={<LogoutRoute />} />
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/characters" element={<CharactersPage />} />
          <Route path="/characters/new" element={<CharacterEditPage />} />
          <Route path="/characters/:id/edit" element={<CharacterEditPage />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/infer" element={<InferTestPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}
