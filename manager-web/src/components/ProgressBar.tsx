interface ProgressBarProps {
  percent: number;
  className?: string;
}

export function ProgressBar({ percent, className = "" }: ProgressBarProps) {
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-[var(--color-brand)] h-2 rounded-full transition-all duration-500 ease-in-out" 
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
}
