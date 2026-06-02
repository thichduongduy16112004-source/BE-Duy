import { useState } from 'react';
import { X, Lock, Eye, EyeOff } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { currentPassword: string; newPassword: string }) => void;
}

export function ChangePasswordModal({
  isOpen,
  onClose,
  onSave,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    setError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    onSave({ currentPassword, newPassword });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FCCF03] to-[#FFE566] px-6 py-5 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-2xl font-extrabold text-white">Đổi mật khẩu</h2>
          <p className="text-sm text-white/90 mt-1">Cập nhật mật khẩu bảo mật</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-3">
              <p className="text-sm font-semibold text-red-600">{error}</p>
            </div>
          )}

          {/* Current Password */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Mật khẩu hiện tại
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Nhập mật khẩu hiện tại"
                className="w-full h-14 pl-12 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FCCF03] focus:ring-4 focus:ring-[#FCCF03]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Mật khẩu mới
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nhập mật khẩu mới"
                className="w-full h-14 pl-12 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FCCF03] focus:ring-4 focus:ring-[#FCCF03]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 px-1">Tối thiểu 6 ký tự</p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu mới"
                className="w-full h-14 pl-12 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FCCF03] focus:ring-4 focus:ring-[#FCCF03]/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 h-14 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="flex-1 h-14 bg-[#FCCF03] text-[#0f172a] font-bold rounded-xl shadow-[0_4px_0_0_#e5b800] active:shadow-[0_2px_0_0_#e5b800] active:translate-y-[2px] hover:bg-[#ffd633] transition-all"
          >
            Đổi mật khẩu
          </button>
        </div>
      </div>
    </div>
  );
}
