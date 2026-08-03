import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Archive, Banknote, BookMarked, BookOpen, Bot, BrainCircuit, Building2, History, LayoutDashboard, LogOut, Settings, Shield, UserCog, Users } from 'lucide-react';
import { clearTokens } from '../services/apiService';

const navigation = [
  { to: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard, eyebrow: 'Control Room', title: 'Bảng điều khiển quản trị' },
  { to: '/users', label: 'Người dùng', icon: UserCog, eyebrow: 'User Ops', title: 'Quản lý người dùng và phân quyền' },
  { to: '/classes', label: 'Lớp học', icon: Building2, eyebrow: 'Class Operations', title: 'Quản lý lớp học' },
  { to: '/billing', label: 'Thanh toán', icon: Banknote, eyebrow: 'Revenue Desk', title: 'Quản lý giao dịch và Pro' },
  { to: '/settings', label: 'Cài đặt', icon: Settings, eyebrow: 'System Settings', title: 'Cấu hình hệ thống' },
  { to: '/audit-logs', label: 'Audit', icon: History, eyebrow: 'Audit Trail', title: 'Nhật ký thao tác quản trị' },
  { to: '/lessons', label: 'Bài học', icon: BookMarked, eyebrow: 'Lesson Studio', title: 'Quản lý bài học' },
  { to: '/characters', label: 'Nhân vật', icon: Users, eyebrow: 'Character Registry', title: 'Điều phối nhân vật lịch sử' },
  { to: '/knowledge', label: 'Tri thức', icon: BookOpen, eyebrow: 'Knowledge Import', title: 'Nạp nguồn JSONL vào RAG' },
  { to: '/infer', label: 'Infer Test', icon: Bot, eyebrow: 'RAG Preview', title: 'Kiểm thử câu trả lời trước khi phát hành' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const adminUser = safeParseUser();
  const currentPage = navigation.find((item) => location.pathname.startsWith(item.to)) || navigation[0];

  const handleLogout = () => {
    if (!confirm('Bạn có chắc muốn đăng xuất?')) {
      return;
    }
    clearTokens();
    navigate('/login');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div>
          <div className="brand-lockup">
            <div className="brand-mark"><Shield size={22} /></div>
            <div>
              <p className="brand-name">History Alive</p>
              <p className="brand-caption">Curator Console</p>
            </div>
          </div>

          <nav className="admin-nav" aria-label="Admin navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <div className="operator-card">
            <div className="operator-avatar"><BrainCircuit size={18} /></div>
            <div className="min-w-0">
              <p>{adminUser?.full_name || 'Quản trị viên'}</p>
              <span>{adminUser?.email || 'admin session'}</span>
            </div>
          </div>
          <button type="button" className="danger-ghost-button" onClick={handleLogout}>
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <p className="page-eyebrow">{currentPage.eyebrow}</p>
            <h1>{currentPage.title}</h1>
          </div>
          <div className="system-pill">
            <Archive size={15} /> Mongo RAG Admin
          </div>
        </header>
        <section className="admin-content"><Outlet /></section>
      </main>
    </div>
  );
}

function safeParseUser(): { full_name?: string; email?: string } | null {
  try {
    const raw = localStorage.getItem('admin_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
