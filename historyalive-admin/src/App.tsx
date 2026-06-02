import { useState, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { 
  Users, 
  BookOpen, 
  BarChart3, 
  Plus, 
  Trash2, 
  Edit3, 
  Shield, 
  LogOut, 
  Video, 
  Award, 
  CheckCircle2, 
  MessageSquare,
  HelpCircle
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';
import { apiService, getAccessToken, clearTokens } from './services/apiService';

// ── PROTECTED ROUTE COMPONENT ──
function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = getAccessToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ── LOGIN SCREEN ──
function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (getAccessToken()) {
      navigate('/');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await apiService.login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Đăng nhập thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0907] px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(251,206,3,0.08),rgba(255,255,255,0))]" />
      
      <div className="relative w-full max-w-md bg-[#14120e] border border-[#d4af37]/20 rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#fbce03]/10 border border-[#fbce03]/30 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-[#fbce03]" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide font-['Lexend']">HISTORY ALIVE</h1>
          <p className="text-sm text-[#d4af37]/70 font-semibold uppercase tracking-wider mt-1">Cổng Quản Trị Hệ Thống</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-sm font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Quản Trị</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full bg-[#1e1a14] border border-[#d4af37]/10 focus:border-[#fbce03] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Mật Khẩu</label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#1e1a14] border border-[#d4af37]/10 focus:border-[#fbce03] rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#fbce03] hover:bg-[#e0b702] text-[#0a0907] font-black py-3.5 rounded-xl shadow-[0_4px_15px_rgba(251,206,3,0.3)] hover:scale-[1.01] active:scale-95 transition-all text-sm uppercase tracking-wider cursor-pointer mt-4"
          >
            {loading ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── ADMIN HOME SCREEN ──
function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'users'>('overview');
  const [adminUser, setAdminUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('admin_user');
    if (userStr) {
      setAdminUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      clearTokens();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0907] flex text-gray-200">
      {/* ── SIDEBAR ── */}
      <aside className="w-64 bg-[#14120e] border-r border-[#d4af37]/10 flex flex-col justify-between shrink-0">
        <div>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-[#d4af37]/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fbce03]/10 border border-[#fbce03]/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#fbce03]" />
            </div>
            <div>
              <h2 className="font-black text-white text-sm font-['Lexend'] tracking-wide">HISTORY ALIVE</h2>
              <span className="text-[10px] text-[#fbce03]/80 uppercase tracking-widest font-black">ADMIN PORTAL</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-[#fbce03] text-[#0a0907] shadow-lg shadow-[#fbce03]/10'
                  : 'text-gray-400 hover:text-white hover:bg-[#1e1a14]'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Tổng Quan
            </button>

            <button
              onClick={() => setActiveTab('lessons')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'lessons'
                  ? 'bg-[#fbce03] text-[#0a0907] shadow-lg shadow-[#fbce03]/10'
                  : 'text-gray-400 hover:text-white hover:bg-[#1e1a14]'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              Quản Lý Bài Học
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-[#fbce03] text-[#0a0907] shadow-lg shadow-[#fbce03]/10'
                  : 'text-gray-400 hover:text-white hover:bg-[#1e1a14]'
              }`}
            >
              <Users className="w-5 h-5" />
              Quản Lý Học Viên
            </button>
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-[#d4af37]/10 bg-[#191611]/30">
          <div className="flex items-center justify-between mb-4">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{adminUser?.full_name || 'Quản trị viên'}</p>
              <p className="text-[10px] text-gray-500 truncate">{adminUser?.email}</p>
            </div>
            <div className="bg-[#fbce03]/10 border border-[#fbce03]/20 rounded-md px-1.5 py-0.5 text-[8px] font-black text-[#fbce03] uppercase">
              ADMIN
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 hover:border-red-500/40 text-red-400 font-bold py-2 rounded-xl text-xs transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Đăng Xuất
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-[#d4af37]/10 flex items-center justify-between px-8 bg-[#14120e]/30">
          <h1 className="text-lg font-black uppercase text-white font-['Lexend'] tracking-wider">
            {activeTab === 'overview' && 'Báo cáo Hệ thống'}
            {activeTab === 'lessons' && 'Danh Sách Bài Học Lịch Sử'}
            {activeTab === 'users' && 'Danh Sách Học Viên'}
          </h1>
          <div className="text-xs text-gray-500 font-semibold">
            Hệ thống: <span className="text-green-500 font-bold">Hoạt động tốt 🟢</span>
          </div>
        </header>

        {/* Dynamic Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'lessons' && <LessonsTab />}
          {activeTab === 'users' && <UsersTab />}
        </div>
      </main>
    </div>
  );
}

// ── TAB: OVERVIEW ──
function OverviewTab() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService.getAdminStats()
      .then(res => {
        setStats(res);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading admin stats:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-[#fbce03] font-bold">Đang tải số liệu thống kê...</div>;
  }

  // Mock charts data for demonstration
  const chartData = [
    { name: 'Thứ 2', registrations: 4, chatSessions: 12 },
    { name: 'Thứ 3', registrations: 7, chatSessions: 18 },
    { name: 'Thứ 4', registrations: 5, chatSessions: 15 },
    { name: 'Thứ 5', registrations: 10, chatSessions: 22 },
    { name: 'Thứ 6', registrations: 12, chatSessions: 30 },
    { name: 'Thứ 7', registrations: 18, chatSessions: 42 },
    { name: 'Chủ Nhật', registrations: 24, chatSessions: 55 },
  ];

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-[#14120e] border border-[#d4af37]/10 rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Users className="w-24 h-24 text-white" />
          </div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Tổng Học Viên</p>
          <h3 className="text-3xl font-black text-white mt-2 font-['Lexend']">{stats?.total_users || 0}</h3>
          <p className="text-[10px] text-green-500 font-bold mt-2">↑ 18% so với tuần trước</p>
        </div>

        {/* Total Lessons */}
        <div className="bg-[#14120e] border border-[#d4af37]/10 rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <BookOpen className="w-24 h-24 text-white" />
          </div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Bài học Động</p>
          <h3 className="text-3xl font-black text-white mt-2 font-['Lexend']">{stats?.total_lessons || 0}</h3>
          <p className="text-[10px] text-[#fbce03] font-bold mt-2">Biên dịch động từ CSDL</p>
        </div>

        {/* Premium Accounts */}
        <div className="bg-[#14120e] border border-[#d4af37]/10 rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Award className="w-24 h-24 text-white" />
          </div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Học viên Premium</p>
          <h3 className="text-3xl font-black text-[#fbce03] mt-2 font-['Lexend']">{stats?.premium_users || 0}</h3>
          <p className="text-[10px] text-[#fbce03]/80 font-bold mt-2">Doanh thu tài khoản Vip</p>
        </div>

        {/* Chat Sessions */}
        <div className="bg-[#14120e] border border-[#d4af37]/10 rounded-2xl p-6 shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <MessageSquare className="w-24 h-24 text-white" />
          </div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Lượt trò chuyện AI</p>
          <h3 className="text-3xl font-black text-white mt-2 font-['Lexend']">{stats?.total_chats || 0}</h3>
          <p className="text-[10px] text-green-500 font-bold mt-2">Tương tác Nguyễn Trãi cực cao</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Registration Chart */}
        <div className="bg-[#14120e] border border-[#d4af37]/10 rounded-2xl p-6 shadow-md">
          <h4 className="text-sm font-black text-white uppercase tracking-wider mb-6">Lượt Tài Khoản Đăng Ký Mới (Trong tuần)</h4>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#221e16" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis stroke="#6b7280" style={{ fontSize: 10, fontWeight: 700 }} />
                <Tooltip contentStyle={{ backgroundColor: '#14120e', borderColor: '#fbce03', color: '#fff' }} />
                <Bar dataKey="registrations" fill="#fbce03" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chat Sessions Activity */}
        <div className="bg-[#14120e] border border-[#d4af37]/10 rounded-2xl p-6 shadow-md">
          <h4 className="text-sm font-black text-white uppercase tracking-wider mb-6">Số Lượt Hội Thoại Với Nhân Vật AI Lịch Sử</h4>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#221e16" />
                <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: 10, fontWeight: 700 }} />
                <YAxis stroke="#6b7280" style={{ fontSize: 10, fontWeight: 700 }} />
                <Tooltip contentStyle={{ backgroundColor: '#14120e', borderColor: '#fbce03', color: '#fff' }} />
                <Line type="monotone" dataKey="chatSessions" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── TAB: USERS MANAGEMENT ──
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    apiService.getAdminUsers()
      .then(res => {
        setUsers(res.users);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading users:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleToggle = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'student' : 'admin';
    if (confirm(`Bạn muốn chuyển vai trò của tài khoản này thành ${newRole.toUpperCase()}?`)) {
      try {
        await apiService.updateUserRole(userId, newRole);
        alert('Cập nhật quyền thành công!');
        fetchUsers();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm('CẢNH BÁO: Bạn có chắc muốn XÓA VĨNH VIỄN tài khoản này? Hành động này sẽ xóa sạch dữ liệu ôn tập và lịch sử chat của họ!')) {
      try {
        await apiService.deleteUser(userId);
        alert('Xóa tài khoản học viên thành công!');
        fetchUsers();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  if (loading) {
    return <div className="text-[#fbce03] font-bold">Đang tải danh sách học viên...</div>;
  }

  return (
    <div className="bg-[#14120e] border border-[#d4af37]/10 rounded-2xl overflow-hidden shadow-md">
      <div className="p-6 border-b border-[#d4af37]/10 flex items-center justify-between">
        <h4 className="text-sm font-black text-white uppercase tracking-wider">Học Viên Đăng Ký Hệ Thống ({users.length})</h4>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-[#191611]/50 border-b border-[#d4af37]/10 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <th className="p-4">Họ Và Tên</th>
              <th className="p-4">Email</th>
              <th className="p-4">Cấp Học</th>
              <th className="p-4">Vai Trò</th>
              <th className="p-4">Premium</th>
              <th className="p-4 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4af37]/5">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-[#1a1813]/25 transition-colors">
                <td className="p-4 font-bold text-white">{u.full_name}</td>
                <td className="p-4 text-gray-400">{u.email}</td>
                <td className="p-4 font-semibold">
                  {u.grade === 'cap2' ? 'Cấp 2 (Trung học)' : u.grade === 'cap3' ? 'Cấp 3 (Phổ thông)' : 'Chưa thiết lập'}
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase border ${
                    u.role === 'admin' 
                      ? 'bg-[#fbce03]/10 border-[#fbce03]/30 text-[#fbce03]' 
                      : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase border ${
                    u.subscription_type === 'premium' 
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.1)]' 
                      : 'bg-gray-500/10 border-gray-500/30 text-gray-500'
                  }`}>
                    {u.subscription_type}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleRoleToggle(u.id, u.role)}
                    className="bg-[#1e1a14] border border-[#d4af37]/10 hover:border-[#fbce03] text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
                  >
                    Đổi Quyền
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="bg-red-950/20 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white p-1.5 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center"
                    title="Xóa tài khoản"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── TAB: LESSONS MANAGEMENT (CRUD) ──
function LessonsTab() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form states
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [order, setOrder] = useState(1);
  const [points, setPoints] = useState(100);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  // Question editing helper states
  const [qQuestion, setQQuestion] = useState('');
  const [qA, setQA] = useState('');
  const [qB, setQB] = useState('');
  const [qC, setQC] = useState('');
  const [qD, setQD] = useState('');
  const [qCorrect, setQCorrect] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [qExplanation, setQExplanation] = useState('');

  const fetchLessons = () => {
    setLoading(true);
    apiService.getLessons()
      .then(res => {
        setLessons(res.lessons);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading lessons:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const openAddModal = () => {
    setEditingLessonId(null);
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setOrder(lessons.length + 1);
    setPoints(100);
    setQuizQuestions([]);
    clearQuestionForm();
    setShowModal(true);
  };

  const openEditModal = (lesson: any) => {
    setEditingLessonId(lesson.id);
    setTitle(lesson.title);
    setDescription(lesson.description);
    setVideoUrl(lesson.video_url);
    setOrder(lesson.order);
    setPoints(lesson.points || 100);
    setQuizQuestions(lesson.quiz_questions || []);
    clearQuestionForm();
    setShowModal(true);
  };

  const clearQuestionForm = () => {
    setQQuestion('');
    setQA('');
    setQB('');
    setQC('');
    setQD('');
    setQCorrect('A');
    setQExplanation('');
  };

  const handleAddQuestion = () => {
    if (!qQuestion || !qA || !qB || !qC || !qD) {
      alert('Vui lòng điền đầy đủ câu hỏi và 4 phương án trả lời!');
      return;
    }

    const newQuestion = {
      id: quizQuestions.length + 1,
      question: qQuestion,
      options: [
        { id: 'A', text: qA, correct: qCorrect === 'A' },
        { id: 'B', text: qB, correct: qCorrect === 'B' },
        { id: 'C', text: qC, correct: qCorrect === 'C' },
        { id: 'D', text: qD, correct: qCorrect === 'D' },
      ],
      explanation: qExplanation
    };

    setQuizQuestions([...quizQuestions, newQuestion]);
    clearQuestionForm();
  };

  const handleRemoveQuestion = (qId: number) => {
    const updated = quizQuestions.filter(q => q.id !== qId).map((q, idx) => ({ ...q, id: idx + 1 }));
    setQuizQuestions(updated);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (confirm('Bạn có chắc muốn XÓA bài học này? Màn hình ôn tập của học sinh sẽ không còn hiển thị checkpoint này nữa!')) {
      try {
        await apiService.deleteLesson(lessonId);
        alert('Xóa bài học thành công!');
        fetchLessons();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quizQuestions.length === 0) {
      alert('Vui lòng thêm ít nhất 1 câu hỏi trắc nghiệm (quiz) cho bài học này!');
      return;
    }

    const payload = {
      title,
      description,
      video_url: videoUrl,
      order: Number(order),
      points: Number(points),
      quiz_questions: quizQuestions
    };

    try {
      if (editingLessonId) {
        await apiService.updateLesson(editingLessonId, payload);
        alert('Cập nhật bài học thành công! ✅');
      } else {
        await apiService.createLesson(payload);
        alert('Tạo bài học mới thành công! ✅');
      }
      setShowModal(false);
      fetchLessons();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi lưu bài học.');
    }
  };

  if (loading) {
    return <div className="text-[#fbce03] font-bold">Đang tải danh sách bài học...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Tổng số: {lessons.length} checkpoint bài học
        </span>
        <button
          onClick={openAddModal}
          className="bg-[#fbce03] hover:bg-[#e0b702] text-[#0a0907] font-black px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-[#fbce03]/10 hover:scale-[1.02] active:scale-95 transition-all text-sm uppercase tracking-wider cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Thêm Bài Học Mới
        </button>
      </div>

      {/* Grid of lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {lessons.map((l) => (
          <div key={l.id} className="bg-[#14120e] border border-[#d4af37]/10 rounded-2xl overflow-hidden shadow-md flex flex-col justify-between">
            <div className="p-6">
              {/* Header card info */}
              <div className="flex items-center justify-between mb-4">
                <div className="bg-[#fbce03]/10 border border-[#fbce03]/20 rounded-md px-2 py-0.5 text-[10px] font-black text-[#fbce03]">
                  CHECKPOINT {l.order}
                </div>
                <div className="text-xs text-gray-500 font-bold flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#fbce03]" />
                  {l.points || 100} EXP
                </div>
              </div>

              {/* Lesson body */}
              <h3 className="text-lg font-black text-white">{l.title}</h3>
              <p className="text-xs text-gray-400 mt-1 line-clamp-2">{l.description}</p>

              {/* Details grid */}
              <div className="mt-4 pt-4 border-t border-[#d4af37]/5 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Video className="w-4 h-4 text-gray-500" />
                  <span className="truncate">{l.video_url}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>{l.quiz_questions?.length || 0} câu hỏi trắc nghiệm</span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="px-6 py-4 bg-[#191611]/30 border-t border-[#d4af37]/10 flex items-center justify-end gap-3">
              <button
                onClick={() => openEditModal(l)}
                className="bg-[#1e1a14] border border-[#d4af37]/15 hover:border-[#fbce03] text-gray-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                Chỉnh Sửa
              </button>
              <button
                onClick={() => handleDeleteLesson(l.id)}
                className="bg-red-950/20 hover:bg-red-900/30 border border-red-500/20 hover:border-red-500/40 text-red-400 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Xóa Bỏ
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── ADD/EDIT LESSON MODAL ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-[4px] overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-[#14120e] border border-[#d4af37]/20 rounded-3xl p-8 shadow-2xl my-8">
            <h2 className="text-xl font-black text-white font-['Lexend'] tracking-wide border-b border-[#d4af37]/10 pb-4 mb-6 uppercase">
              {editingLessonId ? 'Cập Nhật Bài Học' : 'Thêm Bài Học Mới'}
            </h2>

            <form onSubmit={handleSaveLesson} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Form: Info */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-[#fbce03] uppercase tracking-widest border-b border-[#d4af37]/5 pb-1">1. Thông tin chung</h3>
                  
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tên Bài Học (Title)</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ví dụ: Chiến dịch Điện Biên Phủ"
                      className="w-full bg-[#1e1a14] border border-[#d4af37]/15 focus:border-[#fbce03] rounded-xl px-4 py-2.5 text-white focus:outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Tóm Tắt Bài Học (Description)</label>
                    <textarea
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tóm tắt ngắn gọn bối cảnh và ý nghĩa bài học..."
                      rows={2}
                      className="w-full bg-[#1e1a14] border border-[#d4af37]/15 focus:border-[#fbce03] rounded-xl px-4 py-2.5 text-white focus:outline-none transition-all text-sm resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Link Nhúng Video YouTube (Video URL)</label>
                    <input
                      type="url"
                      required
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="Ví dụ: https://www.youtube.com/embed/AbRg5rH6fxo"
                      className="w-full bg-[#1e1a14] border border-[#d4af37]/15 focus:border-[#fbce03] rounded-xl px-4 py-2.5 text-white focus:outline-none transition-all text-sm"
                    />
                    <span className="text-[10px] text-gray-500 mt-1 block">Yêu cầu link có định dạng nhúng `embed/` để tải được trình phát video.</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Thứ Tự Checkpoint</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={order}
                        onChange={(e) => setOrder(Number(e.target.value))}
                        className="w-full bg-[#1e1a14] border border-[#d4af37]/15 focus:border-[#fbce03] rounded-xl px-4 py-2.5 text-white focus:outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Điểm Thưởng (EXP)</label>
                      <input
                        type="number"
                        required
                        min={10}
                        step={10}
                        value={points}
                        onChange={(e) => setPoints(Number(e.target.value))}
                        className="w-full bg-[#1e1a14] border border-[#d4af37]/15 focus:border-[#fbce03] rounded-xl px-4 py-2.5 text-white focus:outline-none transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Form: Quizzes */}
                <div className="space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-[#fbce03] uppercase tracking-widest border-b border-[#d4af37]/5 pb-1 mb-3">2. Bộ câu hỏi trắc nghiệm (Quizzes)</h3>
                    
                    {/* List of existing questions */}
                    <div className="space-y-2 max-h-40 overflow-y-auto mb-4 border border-[#d4af37]/10 p-2.5 rounded-xl bg-[#1a1813]/30">
                      {quizQuestions.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-6 font-semibold">Chưa có câu hỏi nào. Hãy tạo câu hỏi ở form bên dưới.</p>
                      ) : (
                        quizQuestions.map(q => (
                          <div key={q.id} className="bg-[#1e1a14] border border-[#d4af37]/10 p-3 rounded-lg flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">Q{q.id}: {q.question}</p>
                              <p className="text-[10px] text-green-500 font-bold uppercase mt-0.5">
                                Đáp án: {q.options.find((o: any) => o.correct)?.id}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveQuestion(q.id)}
                              className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                              title="Xóa câu hỏi này"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Question builder panel */}
                    <div className="bg-[#1c1913]/30 border border-[#d4af37]/15 p-4 rounded-xl space-y-3">
                      <p className="text-[10px] font-black text-[#fbce03] uppercase tracking-wider flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" />
                        Trình soạn câu hỏi
                      </p>
                      
                      <input
                        type="text"
                        placeholder="Nội dung câu hỏi..."
                        value={qQuestion}
                        onChange={(e) => setQQuestion(e.target.value)}
                        className="w-full bg-[#1e1a14] border border-[#d4af37]/15 focus:border-[#fbce03] rounded-lg px-3 py-2 text-white focus:outline-none text-xs"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Phương án A"
                          value={qA}
                          onChange={(e) => setQA(e.target.value)}
                          className="bg-[#1e1a14] border border-[#d4af37]/15 focus:border-[#fbce03] rounded-lg px-3 py-2 text-white focus:outline-none text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Phương án B"
                          value={qB}
                          onChange={(e) => setQB(e.target.value)}
                          className="bg-[#1e1a14] border border-[#d4af37]/15 focus:border-[#fbce03] rounded-lg px-3 py-2 text-white focus:outline-none text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Phương án C"
                          value={qC}
                          onChange={(e) => setQC(e.target.value)}
                          className="bg-[#1e1a14] border border-[#d4af37]/15 focus:border-[#fbce03] rounded-lg px-3 py-2 text-white focus:outline-none text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Phương án D"
                          value={qD}
                          onChange={(e) => setQD(e.target.value)}
                          className="bg-[#1e1a14] border border-[#d4af37]/15 focus:border-[#fbce03] rounded-lg px-3 py-2 text-white focus:outline-none text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Đáp án đúng</label>
                          <select
                            value={qCorrect}
                            onChange={(e) => setQCorrect(e.target.value as any)}
                            className="w-full bg-[#1e1a14] border border-[#d4af37]/15 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-[#fbce03]"
                          >
                            <option value="A">Đáp án A</option>
                            <option value="B">Đáp án B</option>
                            <option value="C">Đáp án C</option>
                            <option value="D">Đáp án D</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 uppercase mb-1">Giải thích chi tiết</label>
                          <input
                            type="text"
                            placeholder="Tại sao đáp án này đúng..."
                            value={qExplanation}
                            onChange={(e) => setQExplanation(e.target.value)}
                            className="w-full bg-[#1e1a14] border border-[#d4af37]/15 focus:border-[#fbce03] rounded-lg px-3 py-1.5 text-white focus:outline-none text-xs"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddQuestion}
                        className="w-full bg-[#fbce03]/10 hover:bg-[#fbce03]/20 border border-[#fbce03]/30 text-[#fbce03] font-bold py-2 rounded-lg text-xs transition-all cursor-pointer"
                      >
                        Thêm Câu Hỏi Vào Bộ Đề
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form buttons */}
              <div className="border-t border-[#d4af37]/10 pt-4 flex items-center justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-[#1e1a14] border border-[#d4af37]/15 hover:border-[#fbce03] text-gray-300 hover:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="bg-[#fbce03] hover:bg-[#e0b702] text-[#0a0907] font-black px-6 py-2.5 rounded-xl shadow-lg shadow-[#fbce03]/10 hover:scale-[1.01] active:scale-95 transition-all text-xs uppercase tracking-wider cursor-pointer"
                >
                  Lưu Bài Học & Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MAIN ROUTER CONFIG ──
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
