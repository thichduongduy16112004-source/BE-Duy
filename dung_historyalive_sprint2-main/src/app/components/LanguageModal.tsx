import { useState, useEffect } from 'react';
import { X, Check, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  onSave: (language: string) => void;
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
];

export function LanguageModal({
  isOpen,
  onClose,
  currentLanguage,
  onSave,
}: LanguageModalProps) {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage);

  useEffect(() => {
    setSelectedLanguage(currentLanguage);
  }, [currentLanguage, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(selectedLanguage);
    onClose();
  };

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
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-white">{t('language_modal.title')}</h2>
              <p className="text-sm text-white/90">{t('language_modal.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {languages.map((language) => {
              const isSelected = selectedLanguage === language.code;
              return (
                <button
                  key={language.code}
                  onClick={() => setSelectedLanguage(language.code)}
                  className={`w-full p-4 rounded-2xl flex items-center gap-4 transition-all ${
                    isSelected
                      ? 'bg-[#FCCF03]/20 border-2 border-[#FCCF03] shadow-md'
                      : 'bg-gray-50 border-2 border-transparent hover:border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {/* Flag */}
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">
                    {language.flag}
                  </div>

                  {/* Language Info */}
                  <div className="flex-1 text-left">
                    <h3 className="font-bold text-gray-900">{language.nativeName}</h3>
                    <p className="text-sm text-gray-500">{language.name}</p>
                  </div>

                  {/* Check Mark */}
                  {isSelected && (
                    <div className="w-8 h-8 bg-[#FCCF03] rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-[#0f172a]" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-4 border-t-2 border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 h-14 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors"
            >
              {t('language_modal.cancel')}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 h-14 bg-[#FCCF03] text-[#0f172a] font-bold rounded-xl shadow-[0_4px_0_0_#e5b800] active:shadow-[0_2px_0_0_#e5b800] active:translate-y-[2px] hover:bg-[#ffd633] transition-all"
            >
              {t('language_modal.apply')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

