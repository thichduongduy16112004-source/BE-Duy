import { useState } from 'react';
import { X, Bell, Volume2, Mail, MessageSquare } from 'lucide-react';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: NotificationSettings) => void;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  dailyReminder: boolean;
  streakReminder: boolean;
  lessonsUpdates: boolean;
  achievementAlerts: boolean;
}

export function NotificationSettingsModal({
  isOpen,
  onClose,
  onSave,
}: NotificationSettingsModalProps) {
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: true,
    dailyReminder: true,
    streakReminder: true,
    lessonsUpdates: false,
    achievementAlerts: true,
  });

  if (!isOpen) return null;

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const ToggleSwitch = ({ enabled }: { enabled: boolean }) => (
    <div
      className={`relative w-12 h-7 rounded-full transition-colors ${
        enabled ? 'bg-[#FCCF03]' : 'bg-gray-300'
      }`}
    >
      <div
        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FCCF03] to-[#FFE566] px-6 py-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-2xl font-extrabold text-white">Cài đặt thông báo</h2>
          <p className="text-sm text-white/90 mt-1">Quản lý thông báo của bạn</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Push Notifications Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Thông báo đẩy</h3>
                <p className="text-xs text-gray-500">Nhận thông báo trên thiết bị</p>
              </div>
              <button onClick={() => handleToggle('pushEnabled')}>
                <ToggleSwitch enabled={settings.pushEnabled} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Thông báo email</h3>
                <p className="text-xs text-gray-500">Nhận thông báo qua email</p>
              </div>
              <button onClick={() => handleToggle('emailEnabled')}>
                <ToggleSwitch enabled={settings.emailEnabled} />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-gray-100" />

          {/* Reminders Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
              Nhắc nhở
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Nhắc học hàng ngày</h3>
                <p className="text-xs text-gray-500">Nhắc bạn học mỗi ngày</p>
              </div>
              <button onClick={() => handleToggle('dailyReminder')}>
                <ToggleSwitch enabled={settings.dailyReminder} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <span className="text-lg">🔥</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Nhắc duy trì streak</h3>
                <p className="text-xs text-gray-500">Nhắc khi sắp mất streak</p>
              </div>
              <button onClick={() => handleToggle('streakReminder')}>
                <ToggleSwitch enabled={settings.streakReminder} />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t-2 border-gray-100" />

          {/* Updates Section */}
          <div className="space-y-4">
            <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
              Cập nhật
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Bài học mới</h3>
                <p className="text-xs text-gray-500">Thông báo khi có bài học mới</p>
              </div>
              <button onClick={() => handleToggle('lessonsUpdates')}>
                <ToggleSwitch enabled={settings.lessonsUpdates} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="text-lg">🏆</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Thành tích</h3>
                <p className="text-xs text-gray-500">Thông báo khi đạt thành tích</p>
              </div>
              <button onClick={() => handleToggle('achievementAlerts')}>
                <ToggleSwitch enabled={settings.achievementAlerts} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t-2 border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-14 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              className="flex-1 h-14 bg-[#FCCF03] text-[#0f172a] font-bold rounded-xl shadow-[0_4px_0_0_#e5b800] active:shadow-[0_2px_0_0_#e5b800] active:translate-y-[2px] hover:bg-[#ffd633] transition-all"
            >
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
