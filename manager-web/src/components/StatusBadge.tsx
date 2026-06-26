interface StatusBadgeProps {
  needsSupport: boolean;
}

export function StatusBadge({ needsSupport }: StatusBadgeProps) {
  if (needsSupport) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        Cần hỗ trợ
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
      Ổn định
    </span>
  );
}
