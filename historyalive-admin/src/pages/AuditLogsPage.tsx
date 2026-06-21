import { History } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState, Feedback, LoadingState } from '../components/Feedback';
import { apiService } from '../services/apiService';
import type { AuditLog } from '../services/apiService';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadLogs() {
      setError('');
      setIsLoading(true);
      try {
        const response = await apiService.getAuditLogs();
        if (isMounted) {
          setLogs(response.logs);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải audit logs.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadLogs();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="page-stack">
      <div className="command-panel hero-panel">
        <div>
          <p className="panel-kicker"><History size={16} /> Audit Trail</p>
          <h2>Dấu vết thay đổi quản trị</h2>
          <p>Lưu lại thao tác nhạy cảm như đổi role, khóa tài khoản, chỉnh Pro và settings.</p>
        </div>
      </div>

      <Feedback message={error} tone="error" />

      {isLoading ? <LoadingState label="Đang tải audit logs..." /> : logs.length === 0 ? (
        <EmptyState title="Chưa có log" description="Các thao tác admin mới sẽ được ghi lại tại đây." />
      ) : (
        <div className="timeline-card">
          {logs.map((log) => (
            <article className="audit-item" key={log._id || `${log.action}-${log.timestamp}`}>
              <div>
                <strong>{log.action}</strong>
                <span>{log.target_id || 'system'}</span>
              </div>
              <p>{JSON.stringify(log.details || {})}</p>
              <time>{new Date(log.timestamp).toLocaleString('vi-VN')}</time>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
