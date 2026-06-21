import { Save, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState, Feedback, LoadingState } from '../components/Feedback';
import { apiService } from '../services/apiService';
import type { SystemSettings } from '../services/apiService';

export default function SettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      setIsLoading(true);
      setError('');
      try {
        const data = await apiService.getSettings();
        if (isMounted) {
          setSettings(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải cấu hình.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault();
    if (!settings) {
      return;
    }
    setIsSaving(true);
    setMessage('');
    setError('');
    try {
      const updated = await apiService.updateSettings({
        class_code_limit: settings.class_code_limit,
        pro_pricing: settings.pro_pricing,
      });
      setSettings(updated);
      setMessage('Đã lưu cấu hình hệ thống.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu cấu hình.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingState label="Đang tải cấu hình hệ thống..." />;
  }

  if (!settings) {
    return <EmptyState title="Chưa có cấu hình" description="Backend sẽ tự tạo cấu hình mặc định khi endpoint hoạt động." />;
  }

  return (
    <div className="page-stack">
      <div className="command-panel hero-panel">
        <div>
          <p className="panel-kicker"><Settings size={16} /> System Settings</p>
          <h2>Cấu hình vận hành không cần deploy</h2>
          <p>Điều chỉnh giới hạn mã lớp và giá Pro tập trung, có audit log cho mỗi lần lưu.</p>
        </div>
      </div>

      <Feedback message={message} tone="success" />
      <Feedback message={error} tone="error" />

      <form className="command-panel settings-form" onSubmit={(event) => void saveSettings(event)}>
        <label className="field-group">
          <span>Giới hạn mã lớp</span>
          <input id="class-code-limit" type="number" min="1" max="500" value={settings.class_code_limit} onChange={(event) => setSettings({ ...settings, class_code_limit: Number(event.target.value) })} />
        </label>
        <div className="form-grid two-columns">
          <label className="field-group">
            <span>Giá Pro tháng</span>
            <input id="pro-monthly-price" type="number" min="0" value={settings.pro_pricing.monthly_price} onChange={(event) => setSettings({ ...settings, pro_pricing: { ...settings.pro_pricing, monthly_price: Number(event.target.value) } })} />
          </label>
          <label className="field-group">
            <span>Giá Pro năm</span>
            <input id="pro-yearly-price" type="number" min="0" value={settings.pro_pricing.yearly_price} onChange={(event) => setSettings({ ...settings, pro_pricing: { ...settings.pro_pricing, yearly_price: Number(event.target.value) } })} />
          </label>
        </div>
        <button className="primary-button" type="submit" disabled={isSaving}>
          <Save size={18} /> {isSaving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      </form>
    </div>
  );
}
