interface FeedbackProps {
  message?: string;
  tone?: 'success' | 'error' | 'info';
}

export function Feedback({ message, tone = 'info' }: FeedbackProps) {
  if (!message) {
    return null;
  }

  return <div className={`feedback feedback-${tone}`} role="status">{message}</div>;
}

export function LoadingState({ label = 'Đang tải dữ liệu...' }: { label?: string }) {
  return (
    <div className="state-panel">
      <div className="loading-orb" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="state-panel empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
