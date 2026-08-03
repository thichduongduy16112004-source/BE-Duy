import { Building2, Copy, RefreshCw, Search, Trash2, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmptyState, Feedback, LoadingState } from '../components/Feedback';
import { apiService } from '../services/apiService';
import type { AdminClass, TeacherSearchResult } from '../services/apiService';

function formatDate(value?: string) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}

const initialForm = {
  name: '',
  school_name: '',
  teacher_id: '',
  slot_limit: 30,
  expires_at: '',
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [query, setQuery] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teachers, setTeachers] = useState<TeacherSearchResult[]>([]);
  const [form, setForm] = useState(initialForm);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSearchingTeacher, setIsSearchingTeacher] = useState(false);

  const visibleClasses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return classes;
    return classes.filter((item) => `${item.name} ${item.code || item.class_code || ''} ${item.teacher_email || ''} ${item.school_name || ''}`.toLowerCase().includes(normalizedQuery));
  }, [classes, query]);

  const loadClasses = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiService.getAdminClasses();
      setClasses(response.classes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách lớp.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadClasses();
  }, [loadClasses]);

  async function searchTeachers() {
    const email = teacherEmail.trim();
    if (!email) return;
    setIsSearchingTeacher(true);
    setError('');
    try {
      const response = await apiService.searchTeachersByEmail(email);
      setTeachers(response.users);
      if (response.users.length === 0) setMessage('Không tìm thấy tài khoản teacher/manager/admin theo email này.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tìm teacher.');
    } finally {
      setIsSearchingTeacher(false);
    }
  }

  async function createClass(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    setGeneratedPassword('');
    if (!form.teacher_id) {
      setError('Vui lòng tìm và chọn teacher/manager/admin trước khi tạo lớp.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await apiService.createAdminClass({
        name: form.name.trim(),
        school_name: form.school_name.trim(),
        teacher_id: form.teacher_id,
        slot_limit: Number(form.slot_limit),
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      });
      setMessage(`${response.message}. Mã lớp: ${response.class_item.code || response.class_item.class_code}`);
      setGeneratedPassword(response.class_password);
      setForm(initialForm);
      setTeacherEmail('');
      setTeachers([]);
      await loadClasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo lớp.');
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteClass(classItem: AdminClass) {
    const label = classItem.code ? `${classItem.name} (${classItem.code})` : classItem.name;
    if (!confirm(`Xóa cứng lớp ${label}?\n\nChỉ học sinh có subscription_source = class_code mới bị downgrade.`)) return;
    setMessage('');
    setError('');
    try {
      const response = await apiService.hardDeleteClass(classItem.id);
      setMessage(response.message || 'Đã xóa lớp học.');
      await loadClasses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa lớp.');
    }
  }

  return (
    <div className="page-stack">
      <div className="command-panel hero-panel">
        <div>
          <p className="panel-kicker"><Building2 size={16} /> Edu Plan Operations</p>
          <h2>Quản lý lớp học</h2>
          <p>Tạo lớp bằng school_name trực tiếp, tìm giáo viên theo email và cấp mã lớp + mật khẩu cho học sinh.</p>
        </div>
      </div>

      <Feedback message={message} tone="success" />
      <Feedback message={error} tone="error" />
      {generatedPassword && (
        <div className="toolbar-card" style={{ justifyContent: 'space-between' }}>
          <strong>Mật khẩu lớp mới tạo: {generatedPassword}</strong>
          <button className="ghost-button" type="button" onClick={() => void navigator.clipboard.writeText(generatedPassword)}>
            <Copy size={16} /> Copy mật khẩu
          </button>
        </div>
      )}

      <form className="command-panel" onSubmit={(event) => void createClass(event)}>
        <div>
          <p className="panel-kicker"><Users size={16} /> Tạo lớp mới</p>
          <h3>Thông tin lớp</h3>
        </div>
        <div className="admin-form-grid">
          <label>Tên lớp<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="VD: Lịch sử 12A1" /></label>
          <label>Tên trường<input required value={form.school_name} onChange={(event) => setForm({ ...form, school_name: event.target.value })} placeholder="VD: THPT Nguyễn Trãi" /></label>
          <label>Sĩ số tối đa<input required type="number" min={1} max={500} value={form.slot_limit} onChange={(event) => setForm({ ...form, slot_limit: Number(event.target.value) })} /></label>
          <label>Ngày hết hạn<input type="datetime-local" value={form.expires_at} onChange={(event) => setForm({ ...form, expires_at: event.target.value })} /></label>
        </div>

        <div className="toolbar-card admin-toolbar-3">
          <label className="search-box">
            <Search size={18} />
            <input value={teacherEmail} onChange={(event) => setTeacherEmail(event.target.value)} placeholder="Tìm teacher/manager/admin theo email..." />
          </label>
          <button className="ghost-button" type="button" onClick={() => void searchTeachers()} disabled={isSearchingTeacher}>
            <Search size={16} /> {isSearchingTeacher ? 'Đang tìm...' : 'Tìm tài khoản'}
          </button>
          <button className="primary-button" type="submit" disabled={isSaving}>{isSaving ? 'Đang tạo...' : 'Tạo lớp'}</button>
        </div>

        {teachers.length > 0 && (
          <div className="admin-table-card">
            <table className="admin-table">
              <tbody>{teachers.map((teacher) => (
                <tr key={teacher.id}>
                  <td><strong>{teacher.email}</strong><span>{teacher.full_name || teacher.role}</span></td>
                  <td>{teacher.role}</td>
                  <td className="table-actions"><button className="ghost-button" type="button" onClick={() => setForm({ ...form, teacher_id: teacher.id })}>Chọn</button></td>
                </tr>
              ))}</tbody>
            </table>
            {form.teacher_id && <p className="panel-kicker">Đã chọn teacher_id: {form.teacher_id}</p>}
          </div>
        )}
      </form>

      <div className="toolbar-card admin-toolbar-3">
        <label className="search-box"><Users size={18} /><input id="admin-class-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên lớp, mã lớp, trường hoặc email teacher..." /></label>
        <button className="ghost-button" type="button" onClick={() => void loadClasses()}><RefreshCw size={16} /> Tải lại</button>
      </div>

      {isLoading ? <LoadingState label="Đang tải lớp học..." /> : visibleClasses.length === 0 ? (
        <EmptyState title="Chưa có lớp học" description="Tạo lớp Edu Plan đầu tiên bằng form phía trên." />
      ) : (
        <div className="admin-table-card">
          <table className="admin-table">
            <thead><tr><th>Lớp học</th><th>Mã lớp / Mật khẩu</th><th>Teacher</th><th>Sĩ số</th><th>Hạn</th><th>Thao tác</th></tr></thead>
            <tbody>{visibleClasses.map((classItem) => {
              const code = classItem.code || classItem.class_code || '—';
              const password = classItem.class_password || '—';
              return (
              <tr key={classItem.id}>
                <td><strong>{classItem.name}</strong><span>{classItem.school_name || 'Chưa có trường'}</span></td>
                <td>
                  <strong><span className="status-badge status-active">{code}</span></strong>
                  <span>Mật khẩu: {password}</span>
                  {classItem.class_password && (
                    <button className="ghost-button" type="button" onClick={() => void navigator.clipboard.writeText(`Mã lớp: ${code}\nMật khẩu: ${password}`)}>
                      <Copy size={14} /> Copy
                    </button>
                  )}
                </td>
                <td><strong>{classItem.teacher_name || '—'}</strong><span>{classItem.teacher_email || classItem.teacher_id || '—'}</span></td>
                <td>{classItem.student_count}/{classItem.slot_limit ?? '—'}</td>
                <td>{formatDate(classItem.expires_at || classItem.created_at)}</td>
                <td className="table-actions"><button className="danger-ghost-button" type="button" onClick={() => void deleteClass(classItem)}><Trash2 size={15} /> Xóa cứng</button></td>
              </tr>
              );
            })}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
