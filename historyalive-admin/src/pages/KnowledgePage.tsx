import { FileJson, UploadCloud } from 'lucide-react';
import { useEffect, useState } from 'react';
import { EmptyState, Feedback, LoadingState } from '../components/Feedback';
import { apiService } from '../services/apiService';
import type { Character, KnowledgeImportReport } from '../types/admin';

export default function KnowledgePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [characterId, setCharacterId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<KnowledgeImportReport | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const loadCharacters = async () => {
      setIsLoading(true);
      setError('');
      try {
        const response = await apiService.getCharacters();
        setCharacters(response.characters.filter((character) => character.status !== 'archived'));
        setCharacterId(response.characters[0]?.character_id || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách nhân vật.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadCharacters();
  }, []);

  const handleUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setReport(null);

    if (!characterId || !file) {
      setError('Chọn nhân vật và file JSONL trước khi import.');
      return;
    }

    setIsUploading(true);
    try {
      const response = await apiService.uploadKnowledge(characterId, file);
      setReport(response);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import JSONL thất bại.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return <LoadingState label="Đang tải kênh import knowledge..." />;
  }

  return (
    <div className="knowledge-layout">
      <form className="command-panel upload-panel" onSubmit={handleUpload}>
        <div className="section-heading">
          <p className="panel-kicker"><FileJson size={16} /> JSONL Pipeline</p>
          <h2>Nạp knowledge chunks</h2>
          <p>Mỗi dòng cần có chunk_id, character_id, text và source_title. Các chunk trùng ID sẽ được skip an toàn.</p>
        </div>

        <Feedback message={error} tone="error" />

        {characters.length === 0 ? (
          <EmptyState title="Chưa có nhân vật để import" description="Tạo nhân vật trước, sau đó quay lại import JSONL." />
        ) : (
          <>
            <label className="field-group">
              <span>Nhân vật mục tiêu</span>
              <select id="knowledge-character" value={characterId} onChange={(event) => setCharacterId(event.target.value)}>
                {characters.map((character) => (
                  <option key={character.character_id} value={character.character_id}>{character.display_name} — {character.character_id}</option>
                ))}
              </select>
            </label>

            <label className="drop-zone">
              <UploadCloud size={34} />
              <strong>{file ? file.name : 'Chọn file .jsonl'}</strong>
              <span>Upload dạng JSON Lines UTF-8, tối ưu cho nguồn đã kiểm chứng.</span>
              <input id="knowledge-file" type="file" accept=".jsonl,application/jsonl,text/plain" onChange={(event) => setFile(event.target.files?.[0] || null)} />
            </label>

            <button id="upload-knowledge" className="primary-button full-width" type="submit" disabled={isUploading}>
              {isUploading ? 'Đang import...' : 'Import knowledge'}
            </button>
          </>
        )}
      </form>

      <aside className="command-panel report-panel">
        <div className="section-heading">
          <p className="panel-kicker">Import Report</p>
          <h2>Kết quả</h2>
        </div>
        {report ? (
          <div className="report-grid">
            <Metric label="Inserted" value={report.inserted} tone="success" />
            <Metric label="Skipped" value={report.skipped} tone="info" />
            <Metric label="Failed" value={report.failed} tone="danger" />
            {report.errors.length > 0 && (
              <div className="error-log">
                {report.errors.slice(0, 8).map((item) => <p key={item}>{item}</p>)}
              </div>
            )}
          </div>
        ) : (
          <EmptyState title="Chưa có report" description="Sau khi upload, số dòng inserted/skipped/failed sẽ hiển thị tại đây." />
        )}
      </aside>
    </div>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone: 'success' | 'info' | 'danger' }) {
  return (
    <div className={`metric-card metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
