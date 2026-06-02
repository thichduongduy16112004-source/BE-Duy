import { useNavigate } from 'react-router';
import { useState } from 'react';
import { Home, Swords, Trophy, Crown, User, Settings, Lock, Bell, Globe, LogOut, Edit, Award, Flame, Target } from 'lucide-react';
import { EditProfileModal } from './EditProfileModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { LanguageModal } from './LanguageModal';

export default function MobileProfileScreen() {
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);
  const [userName, setUserName] = useState('Tuấn Nguyễn');
  const [userEmail, setUserEmail] = useState('tuan@example.com');
  const [language, setLanguage] = useState('vi');

  const stats = [
    { icon: <Flame className="w-6 h-6" />, label: 'Streak', value: '7 days', color: 'bg-orange-500' },
    { icon: <Target className="w-6 h-6" />, label: 'Total XP', value: '1,980', color: 'bg-blue-500' },
    { icon: <Trophy className="w-6 h-6" />, label: 'Rank', value: '#7', color: 'bg-yellow-500' },
    { icon: <Award className="w-6 h-6" />, label: 'Achievements', value: '12/24', color: 'bg-purple-500' },
  ];

  const menuItems = [
    { icon: <Edit className="w-5 h-5" />, label: 'Edit Profile', action: () => setShowEditProfile(true) },
    { icon: <Lock className="w-5 h-5" />, label: 'Change Password', action: () => setShowChangePassword(true) },
    { icon: <Bell className="w-5 h-5" />, label: 'Notification Settings', action: () => console.log('Notifications') },
    { icon: <Globe className="w-5 h-5" />, label: 'Language', action: () => setShowLanguage(true) },
  ];

  const handleLogout = () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      navigate('/');
    }
  };

  return (
    <div className="w-[393px] h-[852px] bg-gradient-to-b from-[#f8f9fa] to-white flex flex-col">
      {/* Header with Avatar */}
      <div className="bg-gradient-to-r from-[#FCCF03] to-[#FFE566] px-6 py-8 pb-20 relative">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-white">Profile</h1>
          <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl shadow-xl border-4 border-white/50 mb-3">
            🎓
          </div>
          <h2 className="text-2xl font-extrabold text-white mb-1">Tuấn Nguyễn</h2>
          <p className="text-white/90 text-sm">Student • Grade 10</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto -mt-12 px-6 pb-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-4 shadow-md">
              <div className={`w-10 h-10 ${stat.color} rounded-xl flex items-center justify-center text-white mb-3`}>
                {stat.icon}
              </div>
              <p className="text-xs text-gray-500 font-semibold mb-1">{stat.label}</p>
              <p className="text-xl font-extrabold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="bg-white rounded-3xl shadow-md overflow-hidden mb-4">
          {menuItems.map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className={`w-full px-6 py-4 flex items-center gap-4 hover:bg-gray-50 active:bg-gray-100 transition-colors ${
                idx < menuItems.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
                {item.icon}
              </div>
              <span className="flex-1 text-left font-semibold text-gray-900">{item.label}</span>
              <span className="text-gray-400">›</span>
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full bg-red-50 text-red-600 px-6 py-4 rounded-3xl flex items-center justify-center gap-3 font-bold hover:bg-red-100 active:bg-red-200 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>

        <p className="text-center text-xs text-gray-400 mt-4">Version 1.0.0</p>
      </div>

      {/* Bottom Navigation */}
      <div className="bg-white border-t border-gray-200 px-6 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/home')}
            className="flex flex-col items-center gap-1 px-3 py-2"
          >
            <Home className="w-6 h-6 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400">Home</span>
          </button>

          <button
            onClick={() => navigate('/practice')}
            className="flex flex-col items-center gap-1 px-3 py-2"
          >
            <Swords className="w-6 h-6 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400">Practice</span>
          </button>

          <button
            onClick={() => navigate('/leaderboard')}
            className="flex flex-col items-center gap-1 px-3 py-2"
          >
            <Trophy className="w-6 h-6 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400">Leaderboard</span>
          </button>

          <button
            onClick={() => navigate('/premium')}
            className="flex flex-col items-center gap-1 px-3 py-2"
          >
            <Crown className="w-6 h-6 text-gray-400" />
            <span className="text-xs font-semibold text-gray-400">Premium</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center gap-1 px-3 py-2"
          >
            <User className="w-6 h-6 text-[#FCCF03] fill-[#FCCF03]" />
            <span className="text-xs font-bold text-[#FCCF03]">Profile</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        currentName={userName}
        currentEmail={userEmail}
        onSave={(data) => {
          setUserName(data.name);
          setUserEmail(data.email);
          alert('Profile updated successfully!');
        }}
      />
      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSave={(data) => {
          console.log('Password changed:', data);
          alert('Password changed successfully!');
        }}
      />
      <LanguageModal
        isOpen={showLanguage}
        onClose={() => setShowLanguage(false)}
        currentLanguage={language}
        onSave={(lang) => {
          setLanguage(lang);
          alert(`Language changed to: ${lang}`);
        }}
      />
    </div>
  );
}