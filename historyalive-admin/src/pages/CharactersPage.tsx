import { Archive, Edit3, Plus, Search, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { EmptyState, Feedback, LoadingState } from '../components/Feedback';
import { apiService } from '../services/apiService';
import type { Character, CharacterStatus } from '../types/admin';

const statusLabels: Record<CharacterStatus, string> = {
  draft: 'Bản nháp',
  active: 'Đang phát hành',
  archived: 'Đã lưu trữ',
};

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | CharacterStatus>('all');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const visibleCharacters = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return characters.filter((character) => {
      const matchesStatus = statusFilter === 'all' || character.status === statusFilter;
      const searchable = `${character.display_name} ${character.character_id} ${character.era}`.toLowerCase();
      return matchesStatus && searchable.includes(normalizedQuery);
    });
  }, [characters, query, statusFilter]);

  const loadCharacters = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await apiService.getCharacters();
      setCharacters(response.characters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách nhân vật.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      void loadCharacters();
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, [loadCharacters]);

  const handleArchive = async (character: Character) => {
    const confirmed = confirm(`Lưu trữ ${character.display_name}? Nhân vật sẽ không còn hiển thị như active.`);
    if (!confirmed) {
      return;
    }

    setMessage('');
    setError('');
    try {
      await apiService.archiveCharacter(character.character_id);
      setMessage(`Đã lưu trữ ${character.display_name}.`);
      await loadCharacters();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lưu trữ nhân vật.');
    }
  };

  return (
    <div className="page-stack">
      <div className="command-panel hero-panel">
        <div>
          <p className="panel-kicker"><Sparkles size={16} /> Registry</p>
          <h2>Quản lý vòng đời nhân vật</h2>
          <p>Tạo persona, chỉnh trạng thái phát hành và lưu trữ nhân vật cũ mà không xoá dữ liệu tri thức.</p>
        </div>
        <Link id="create-character-link" className="primary-button" to="/characters/new">
          <Plus size={18} /> Tạo nhân vật
        </Link>
      </div>

      <Feedback message={message} tone="success" />
      <Feedback message={error} tone="error" />

      <div className="toolbar-card">
        <label className="search-box">
          <Search size={18} />
          <input id="character-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên, ID hoặc thời kỳ..." />
        </label>
        <select id="character-status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | CharacterStatus)}>
          <option value="all">Tất cả trạng thái</option>
          <option value="draft">Bản nháp</option>
          <option value="active">Đang phát hành</option>
          <option value="archived">Đã lưu trữ</option>
        </select>
      </div>

      {isLoading ? (
        <LoadingState label="Đang tải registry nhân vật..." />
      ) : visibleCharacters.length === 0 ? (
        <EmptyState title="Chưa có nhân vật phù hợp" description="Tạo nhân vật đầu tiên hoặc đổi bộ lọc để xem thêm dữ liệu." />
      ) : (
        <div className="character-grid">
          {visibleCharacters.map((character) => (
            <article key={character.character_id} className="character-card">
              <div className="portrait-frame">
                {character.portrait_url ? <img src={character.portrait_url} alt={character.display_name} /> : <span>{character.display_name.slice(0, 2).toUpperCase()}</span>}
              </div>
              <div className="character-card-body">
                <div className="card-row">
                  <span className={`status-badge status-${character.status}`}>{statusLabels[character.status]}</span>
                  <span className="metric-chip">{character.chunk_count || 0} chunks</span>
                </div>
                <h3>{character.display_name}</h3>
                <p className="mono-label">{character.character_id}</p>
                <p className="character-bio">{character.short_bio || 'Chưa có mô tả ngắn.'}</p>
                <div className="card-actions">
                  <Link className="ghost-button" to={`/characters/${character.character_id}/edit`}>
                    <Edit3 size={16} /> Sửa
                  </Link>
                  <button className="danger-ghost-button" type="button" onClick={() => void handleArchive(character)} disabled={character.status === 'archived'}>
                    <Archive size={16} /> Lưu trữ
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
