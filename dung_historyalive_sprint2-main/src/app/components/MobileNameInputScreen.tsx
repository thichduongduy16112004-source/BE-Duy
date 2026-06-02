import { useState } from 'react';
import { ArrowLeft, User, Check } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface MobileNameInputScreenProps {
  onBack?: () => void;
  onContinue?: (name: string) => void;
}

// Avatar options
const AVATAR_OPTIONS = [
  { id: 1, url: 'https://images.unsplash.com/photo-1733837305574-9a8b96c08d5c?w=200', name: 'Boy 1' },
  { id: 2, url: 'https://images.unsplash.com/photo-1662131731759-aa614e7d5708?w=200', name: 'Girl 1' },
  { id: 3, url: 'https://images.unsplash.com/photo-1625301840275-7014744f4173?w=200', name: 'Student 1' },
  { id: 4, url: 'https://images.unsplash.com/photo-1743267216601-f39b8815ed4d?w=200', name: 'Student 2' },
  { id: 5, url: 'https://images.unsplash.com/photo-1772371272152-d1806d4351e0?w=200', name: 'Boy 2' },
  { id: 6, url: 'https://images.unsplash.com/photo-1612486524816-d7aaa8ac7bd6?w=200', name: 'Girl 2' },
];

export function MobileNameInputScreen({
  onBack,
  onContinue,
}: MobileNameInputScreenProps) {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(null);

  const handleContinue = () => {
    if (name.trim() && selectedAvatar !== null) {
      // Save name and avatar to localStorage for use in profile
      localStorage.setItem('user_name', name.trim());
      localStorage.setItem('user_avatar', AVATAR_OPTIONS.find(a => a.id === selectedAvatar)?.url || '');
      onContinue?.(name.trim());
    }
  };

  return (
    <div className="relative w-[393px] h-[852px] bg-[#f5f5dc] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="relative pt-16 pb-6 px-5">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-16 left-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/50 hover:bg-white/80 transition-colors"
          aria-label="Quay lại"
        >
          <ArrowLeft className="w-5 h-5 text-[#0f172a]" />
        </button>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden mb-8">
          <div
            className="h-full bg-[#FCCF03] rounded-full transition-all duration-300"
            style={{ width: '33.33%' }}
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <p className="text-sm font-semibold text-[#FCCF03] uppercase tracking-wider mb-2">
            Bước 2/6
          </p>
          <h1 className="text-2xl font-extrabold text-[#0f172a] tracking-tight">
            Bạn tên gì?
          </h1>
          <p className="text-sm text-[#64748b] mt-2">
            Chọn avatar và nhập tên để cá nhân hóa trải nghiệm
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 flex flex-col justify-between pb-8 overflow-y-auto">
        <form onSubmit={handleContinue} className="space-y-6 pt-4">
          {/* Avatar Preview */}
          <div className="flex justify-center">
            <div className="relative">
              {selectedAvatar ? (
                <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-4 border-[#FCCF03]">
                  <ImageWithFallback
                    src={AVATAR_OPTIONS.find(a => a.id === selectedAvatar)?.url || ''}
                    alt="Selected avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-[#FCCF03] to-[#ffd633] rounded-full flex items-center justify-center shadow-lg">
                  <User className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
              )}
              {name && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-white rounded-full shadow-md">
                  <p className="text-sm font-bold text-[#0f172a]">{name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Avatar Selection */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-[#0f172a]">
              Chọn avatar của bạn
            </label>
            <div className="grid grid-cols-3 gap-3">
              {AVATAR_OPTIONS.map((avatar) => (
                <button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`relative aspect-square rounded-2xl overflow-hidden transition-all ${
                    selectedAvatar === avatar.id
                      ? 'ring-4 ring-[#FCCF03] scale-95'
                      : 'ring-2 ring-gray-200 hover:ring-[#FCCF03]/50'
                  }`}
                >
                  <ImageWithFallback
                    src={avatar.url}
                    alt={avatar.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedAvatar === avatar.id && (
                    <div className="absolute inset-0 bg-[#FCCF03]/20 flex items-center justify-center">
                      <div className="w-8 h-8 bg-[#FCCF03] rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div className="space-y-3">
            <label htmlFor="name" className="block text-sm font-semibold text-[#0f172a]">
              Tên của bạn
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên của bạn"
              autoFocus
              maxLength={50}
              className="w-full h-[54px] px-5 bg-white border-2 border-[#e5e7eb] rounded-[14px] text-[17px] font-medium text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#FCCF03] focus:ring-4 focus:ring-[#FCCF03]/20 transition-all"
            />
            <p className="text-xs text-[#64748b] px-1">
              {name.length}/50 ký tự
            </p>
          </div>
        </form>

        {/* Fixed Bottom CTA */}
        <div className="pt-4">
          <button
            onClick={handleContinue}
            disabled={name.trim().length < 2 || selectedAvatar === null}
            className={`
              w-full h-[56px] rounded-[14px] font-bold text-[16px] uppercase tracking-wide transition-all
              ${
                name.trim().length >= 2 && selectedAvatar !== null
                  ? 'bg-[#FCCF03] border-2 border-[#e5b800] text-[#0f172a] shadow-[0_4px_0_0_#e5b800] active:shadow-[0_2px_0_0_#e5b800] active:translate-y-[2px] hover:bg-[#ffd633]'
                  : 'bg-[#e5e7eb] border-2 border-[#cbd5e1] text-[#94a3b8] cursor-not-allowed'
              }
            `}
          >
            Tiếp tục
          </button>
        </div>
      </div>
    </div>
  );
}