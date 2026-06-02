import { useState } from 'react';
import { X, User, Mail, Camera } from 'lucide-react';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentName: string;
  currentEmail: string;
  onSave: (data: { name: string; email: string }) => void;
}

export function EditProfileModal({
  isOpen,
  onClose,
  currentName,
  currentEmail,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(currentName);
  const [email, setEmail] = useState(currentEmail);

  if (!isOpen) return null;

  const handleSave = () => {
    if (name.trim() && email.trim()) {
      onSave({ name: name.trim(), email: email.trim() });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FCCF03] to-[#FFE566] px-6 py-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <h2 className="text-2xl font-extrabold text-white">Chỉnh sửa hồ sơ</h2>
          <p className="text-sm text-white/90 mt-1">Cập nhật thông tin cá nhân của bạn</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-[#FCCF03] to-[#FFE566] rounded-full flex items-center justify-center text-4xl shadow-lg">
                🎓
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#FCCF03] rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:bg-[#ffd633] transition-colors">
                <Camera className="w-4 h-4 text-[#0f172a]" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">Nhấn để thay đổi ảnh</p>
          </div>

          {/* Name Input */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Tên hiển thị
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên của bạn"
                className="w-full h-14 pl-12 pr-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FCCF03] focus:ring-4 focus:ring-[#FCCF03]/20 transition-all"
              />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full h-14 pl-12 pr-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-base font-semibold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FCCF03] focus:ring-4 focus:ring-[#FCCF03]/20 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-14 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !email.trim()}
            className={`flex-1 h-14 rounded-xl font-bold transition-all ${
              name.trim() && email.trim()
                ? 'bg-[#FCCF03] text-[#0f172a] shadow-[0_4px_0_0_#e5b800] active:shadow-[0_2px_0_0_#e5b800] active:translate-y-[2px] hover:bg-[#ffd633]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
