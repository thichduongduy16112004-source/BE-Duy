import { Ban, Crown, Search, ShieldCheck, UserCog, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmptyState, Feedback, LoadingState } from '../components/Feedback';
import { apiService } from '../services/apiService';
import type { AdminRole, User, UserStatus } from '../services/apiService';

function getUserId(user: User) {
  return user.id || user._id || '';
}

function getDisplayName(user: User) {
  return user.full_name || user.name || user.username || user.email;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const visibleUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users.filter((user) => `${user.email} ${getDisplayName(user)}`.toLowerCase().includes(normalizedQuery));
  }, [query, users]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiService.getAdminUsers({ role: role || undefined });
      setUsers(response.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải người dùng.');
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function runAction(action: () => Promise<{ message: string }>, fallbackMessage: string) {
    setMessage('');
    setError('');
    try {
      const response = await action();
      setMessage(response.message || fallbackMessage);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : fallbackMessage);
    }
  }

  return (
    <div className="page-stack">
      <div className="command-panel hero-panel">
        <div>
          <p className="panel-kicker"><Users size={16} /> User Ops</p>
          <h2>Quản lý tài khoản, quyền và Pro</h2>
          <p>Tìm kiếm, đổi role admin/manager/student, khóa tài khoản và nâng/hạ gói Pro từ một màn hình.</p>
        </div>
      </div>

      <Feedback message={message} tone="success" />
      <Feedback message={error} tone="error" />

      <div className="toolbar-card admin-toolbar-3">
        <label className="search-box">
          <Search size={18} />
          <input id="admin-user-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm email hoặc tên..." />
        </label>
        <select id="admin-user-role-filter" value={role} onChange={(event) => setRole(event.target.value)}>
          <option value="">Tất cả role</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="student">Student</option>
        </select>
        <button className="ghost-button" type="button" onClick={() => void loadUsers()}>Tải lại</button>
      </div>

      {isLoading ? <LoadingState label="Đang tải người dùng..." /> : visibleUsers.length === 0 ? (
        <EmptyState title="Không có người dùng phù hợp" description="Đổi bộ lọc hoặc thử tìm email khác." />
      ) : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead>
              <tr><th>Người dùng</th><th>Role</th><th>Gói</th><th>Trạng thái</th><th>Thao tác</th></tr>
            </thead>
            <tbody>
              {visibleUsers.map((user) => {
                const userId = getUserId(user);
                const nextStatus: UserStatus = user.status === 'BANNED' ? 'ACTIVE' : 'BANNED';
                const nextProAction = user.subscription_type === 'premium' || user.isPremium ? 'downgrade' : 'upgrade';
                return (
                  <tr key={userId || user.email}>
                    <td><strong>{getDisplayName(user)}</strong><span>{user.email}</span></td>
                    <td>
                      <select value={user.role || 'student'} onChange={(event) => void runAction(() => apiService.updateUserRole(userId, event.target.value as AdminRole), 'Đã cập nhật role')} disabled={!userId}>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="student">Student</option>
                      </select>
                    </td>
                    <td><span className="status-badge status-active">{user.subscription_type || 'free'}</span></td>
                    <td><span className={`status-badge ${user.status === 'BANNED' ? 'status-archived' : 'status-active'}`}>{user.status || 'ACTIVE'}</span></td>
                    <td className="table-actions">
                      <button className="ghost-button" type="button" onClick={() => void runAction(() => apiService.updateUserPro(userId, nextProAction), 'Đã cập nhật Pro')} disabled={!userId}>
                        <Crown size={15} /> {nextProAction === 'upgrade' ? 'Pro' : 'Free'}
                      </button>
                      <button className="danger-ghost-button" type="button" onClick={() => void runAction(() => apiService.updateUserStatus(userId, nextStatus), 'Đã cập nhật trạng thái')} disabled={!userId}>
                        {nextStatus === 'BANNED' ? <Ban size={15} /> : <ShieldCheck size={15} />} {nextStatus === 'BANNED' ? 'Khóa' : 'Mở'}
                      </button>
                      <button className="danger-ghost-button" type="button" onClick={() => confirm(`Xóa ${user.email}?`) && void runAction(() => apiService.deleteUser(userId), 'Đã xóa người dùng')} disabled={!userId}>
                        <UserCog size={15} /> Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
