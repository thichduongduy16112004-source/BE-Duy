import { useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import svgPaths from '../../imports/svg-yp1i6x35lz';
import imgAvatar from "figma:asset/b32d1c52916914adadf06f7eebd01134eb363e16.png";
import { EditProfileModal } from './EditProfileModal';
import { ChangePasswordModal } from './ChangePasswordModal';
import { NotificationSettingsModal, NotificationSettings } from './NotificationSettingsModal';
import { LanguageModal } from './LanguageModal';
import { BottomNavigation } from './BottomNavigation';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { apiService } from '../services/apiService';

export default function MobileProfileScreenNew() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('NguyenVanA');
  const [userEmail, setUserEmail] = useState('nguyen@example.com');
  const [language, setLanguage] = useState(i18n.language || 'vi');
  const [userAvatar, setUserAvatar] = useState('');
  const [userRole, setUserRole] = useState('student');
  
  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguage, setShowLanguage] = useState(false);

  useEffect(() => {
    // Get username from localStorage (set during registration)
    const storedName = localStorage.getItem('user_name');
    const storedEmail = localStorage.getItem('user_email');
    const storedLanguage = localStorage.getItem('user_language');
    const storedAvatar = localStorage.getItem('user_avatar');
    const storedRole = localStorage.getItem('user_role');
    
    if (storedName) setUserName(storedName);
    if (storedEmail) setUserEmail(storedEmail);
    if (storedLanguage) {
      setLanguage(storedLanguage);
      i18n.changeLanguage(storedLanguage);
    }
    if (storedAvatar) setUserAvatar(storedAvatar);
    if (storedRole) setUserRole(storedRole);

    // Fetch fresh user details to check for admin status
    apiService.getMe()
      .then(user => {
        if (user) {
          setUserName(user.full_name);
          setUserEmail(user.email);
          setUserRole(user.role || 'student');
          localStorage.setItem('user_name', user.full_name);
          localStorage.setItem('user_email', user.email);
          localStorage.setItem('user_role', user.role || 'student');
        }
      })
      .catch(err => {
        console.error("Error loading user profile:", err);
      });
  }, []);

  const handleSaveProfile = (data: { name: string; email: string }) => {
    setUserName(data.name);
    setUserEmail(data.email);
    localStorage.setItem('user_name', data.name);
    localStorage.setItem('user_email', data.email);
    alert(t('profile.success_profile'));
  };

  const handleChangePassword = (data: { currentPassword: string; newPassword: string }) => {
    // In a real app, this would call an API
    console.log('Password change requested:', data);
    localStorage.setItem('user_password', data.newPassword); // Mock save
    alert(t('profile.success_password'));
  };

  const handleSaveNotifications = (settings: NotificationSettings) => {
    localStorage.setItem('notification_settings', JSON.stringify(settings));
    alert(t('profile.success_noti'));
  };

  const handleChangeLanguage = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('user_language', lang);
    
    const languageNames: Record<string, string> = {
      vi: 'Tiếng Việt',
      en: 'English',
      ja: '日本語',
      ko: '한국어',
      zh: '中文',
      th: 'ไทย',
      fr: 'Français',
      de: 'Deutsch',
      es: 'Español',
    };
    
    alert(`${t('profile.success_lang')} ${languageNames[lang] || lang}!`);
  };

  const handleLogout = () => {
    if (confirm(t('profile.logout_confirm'))) {
      localStorage.clear();
      navigate('/');
    }
  };

  return (
    <div className="w-[393px] h-[852px] bg-[#f5f5dc] flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="bg-[#f5f5dc] px-6 pt-6 pb-4 flex items-center justify-between relative z-10">
        <h1 className="text-xl font-bold text-[#0f172a]">{t('profile.title')}</h1>
        <button className="bg-white border-2 border-[#e2e8f0] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] rounded-2xl w-12 h-12 flex items-center justify-center">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 20.1 20">
            <path d={svgPaths.p3cdadd00} fill="#334155" />
          </svg>
        </button>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center px-6 py-4">
        <div className="relative z-[2] mb-4">
          <div className="absolute inset-0 bg-[#fbce03] blur-md opacity-30 rounded-full" />
          <div className="relative bg-white border-6 border-[#fbce03] rounded-full shadow-lg w-32 h-32 flex items-center justify-center p-2.5">
            <div className="w-full h-full rounded-full overflow-hidden">
              <ImageWithFallback
                alt="Avatar"
                className="w-full h-full object-cover"
                src={userAvatar || imgAvatar}
              />
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-[#0f172a] text-center">{userName}</h2>
        <p className="text-sm text-[#64748b] text-center mt-1">
          <span>{t('profile.joined')}: 2023 • </span>
          <span className="font-bold text-[#fbce03]">{t('profile.rank_gold')}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="px-6 mb-6 grid grid-cols-2 gap-3">
        {/* Streak */}
        <div className="bg-white border-2 border-[#e2e8f0] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] rounded-2xl p-4">
          <div className="bg-[#ffedd5] rounded-full w-10 h-10 flex items-center justify-center mb-2">
            <svg className="w-4 h-5" fill="none" viewBox="0 0 16 19">
              <path d={svgPaths.p38fbbc00} fill="#EA580C" />
            </svg>
          </div>
          <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">{t('profile.streak')}</p>
          <p className="text-lg font-bold text-[#0f172a]">12 {t('profile.days')}</p>
        </div>

        {/* Total EXP */}
        <div className="bg-white border-2 border-[#e2e8f0] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] rounded-2xl p-4">
          <div className="bg-[rgba(251,206,3,0.2)] rounded-full w-10 h-10 flex items-center justify-center mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 20 19">
              <path d={svgPaths.p1f93f980} fill="#FBCE03" />
            </svg>
          </div>
          <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">{t('profile.total_exp')}</p>
          <p className="text-lg font-bold text-[#0f172a]">2,450</p>
        </div>

        {/* Tournament */}
        <div className="bg-white border-2 border-[#e2e8f0] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] rounded-2xl p-4">
          <div className="bg-[#fef9c3] rounded-full w-10 h-10 flex items-center justify-center mb-2">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 18 18">
              <path d={svgPaths.pda44380} fill="#CA8A04" />
            </svg>
          </div>
          <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">{t('profile.tournament')}</p>
          <p className="text-lg font-bold text-[#0f172a]">{t('profile.gold')}</p>
        </div>

        {/* Achievements */}
        <div className="bg-white border-2 border-[#e2e8f0] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] rounded-2xl p-4">
          <div className="bg-[#dbeafe] rounded-full w-10 h-10 flex items-center justify-center mb-2">
            <svg className="w-2.5 h-5" fill="none" viewBox="0 0 10 20">
              <path d={svgPaths.p2d1edbc0} fill="#2563EB" />
            </svg>
          </div>
          <p className="text-xs font-bold text-[#94a3b8] uppercase tracking-wider">{t('profile.achievements')}</p>
          <p className="text-lg font-bold text-[#0f172a] leading-7">12 {t('profile.medals')}</p>
        </div>
      </div>

      {/* Settings Section */}
      <div className="flex-1 overflow-y-auto px-6 pb-20">
        <p className="text-sm font-bold text-[#94a3b8] uppercase tracking-widest mb-1">{t('profile.account_settings')}</p>

        <div className="space-y-3">
          {/* Admin Panel Link */}
          {userRole === 'admin' && (
            <button
              onClick={() => window.open('http://localhost:5174', '_blank')}
              className="bg-gradient-to-r from-[#fbce03] to-[#d4ae00] border-2 border-[#a38600] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] rounded-full w-full px-4.5 py-4 flex items-center justify-between hover:opacity-95 transition-all text-[#0f172a] font-bold cursor-pointer mb-2"
            >
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#0f172a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-base text-[#0f172a] font-bold">Trang Quản Trị (Admin Portal)</span>
              </div>
              <svg className="w-2 h-3" fill="none" viewBox="0 0 7.4 12">
                <path d={svgPaths.p28c84800} fill="#0f172a" />
              </svg>
            </button>
          )}
          {/* Edit Profile */}
          <button
            onClick={() => setShowEditProfile(true)}
            className="bg-white border-2 border-[#e2e8f0] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] rounded-full w-full px-4.5 py-4.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-4.5" fill="none" viewBox="0 0 19 17">
                <path d={svgPaths.p1449c200} fill="#475569" />
              </svg>
              <span className="text-base font-bold text-[#0f172a]">{t('profile.edit_profile')}</span>
            </div>
            <svg className="w-2 h-3" fill="none" viewBox="0 0 7.4 12">
              <path d={svgPaths.p28c84800} fill="#CBD5E1" />
            </svg>
          </button>

          {/* Change Password */}
          <button
            onClick={() => setShowChangePassword(true)}
            className="bg-white border-2 border-[#e2e8f0] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] rounded-full w-full px-4.5 py-4.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-5.25" fill="none" viewBox="0 0 16 21">
                <path d={svgPaths.p12930f00} fill="#475569" />
              </svg>
              <span className="text-base font-bold text-[#0f172a]">{t('profile.change_password')}</span>
            </div>
            <svg className="w-2 h-3" fill="none" viewBox="0 0 7.4 12">
              <path d={svgPaths.p28c84800} fill="#CBD5E1" />
            </svg>
          </button>

          {/* Notifications */}
          <button
            onClick={() => setShowNotifications(true)}
            className="bg-white border-2 border-[#e2e8f0] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] rounded-full w-full px-4.5 py-4.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-5" fill="none" viewBox="0 0 16 20">
                <path d={svgPaths.p164b49c0} fill="#475569" />
              </svg>
              <span className="text-base font-bold text-[#0f172a]">{t('profile.notifications')}</span>
            </div>
            <svg className="w-2 h-3" fill="none" viewBox="0 0 7.4 12">
              <path d={svgPaths.p28c84800} fill="#CBD5E1" />
            </svg>
          </button>

          {/* Language */}
          <button
            onClick={() => setShowLanguage(true)}
            className="bg-white border-2 border-[#e2e8f0] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] rounded-full w-full px-4.5 py-4.5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 20 20">
                <path d={svgPaths.p237be000} fill="#475569" />
              </svg>
              <span className="text-base font-bold text-[#0f172a]">{t('profile.language')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm text-[#94a3b8]">
                {language === 'vi' ? 'Tiếng Việt' : language === 'en' ? 'English' : language}
              </span>
              <svg className="w-2 h-3" fill="none" viewBox="0 0 7.4 12">
                <path d={svgPaths.p28c84800} fill="#CBD5E1" />
              </svg>
            </div>
          </button>

          {/* Logout */}
          <button 
            onClick={handleLogout}
            className="bg-white border-2 border-[#fee2e2] shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] rounded-full w-full px-4.5 py-4.5 flex items-center hover:bg-red-50 transition-colors mt-2"
          >
            <div className="flex items-center gap-3">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 18 18">
                <path d={svgPaths.p3e9df400} fill="#EF4444" />
              </svg>
              <span className="text-base font-bold text-[#ef4444]">{t('profile.logout')}</span>
            </div>
          </button>
        </div>
      </div>

      {/* Modals */}
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        currentName={userName}
        currentEmail={userEmail}
        onSave={handleSaveProfile}
      />

      <ChangePasswordModal
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
        onSave={handleChangePassword}
      />

      <NotificationSettingsModal
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onSave={handleSaveNotifications}
      />

      <LanguageModal
        isOpen={showLanguage}
        onClose={() => setShowLanguage(false)}
        currentLanguage={language}
        onSave={handleChangeLanguage}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}