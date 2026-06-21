import { Activity, BarChart3, CircleDollarSign, Cpu, MousePointer2, Users, Zap } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { EmptyState, Feedback, LoadingState } from '../components/Feedback';
import { apiService } from '../services/apiService';
import type { AdminStats, AnalyticsPoint, AnalyticsSeriesMode } from '../services/apiService';

const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });
const numberFormatter = new Intl.NumberFormat('vi-VN');
const compactFormatter = new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 });

type RangeKey = 'today' | 'last_24h' | 'last_7d' | 'last_30d';
type ChartMode = AnalyticsSeriesMode;

interface ChartPoint extends AnalyticsPoint {
  x: number;
  y: number;
}

const ranges: Array<{ key: RangeKey; label: string; metricKey: keyof NonNullable<AdminStats['user_metrics']> }> = [
  { key: 'today', label: 'Today', metricKey: 'new_users_today' },
  { key: 'last_24h', label: '24h', metricKey: 'new_users_24h' },
  { key: 'last_7d', label: '7D', metricKey: 'new_users_7d' },
  { key: 'last_30d', label: '30D', metricKey: 'new_users_30d' },
];

const chartModes: Array<{ key: ChartMode; label: string; accent: string }> = [
  { key: 'user', label: 'User', accent: '#f97316' },
  { key: 'active_users', label: 'Hoạt động', accent: '#22c55e' },
  { key: 'revenue', label: 'Doanh thu', accent: '#facc15' },
  { key: 'requests', label: 'Requests', accent: '#38bdf8' },
  { key: 'input_tokens', label: 'Input', accent: '#fb7185' },
  { key: 'output_tokens', label: 'Output', accent: '#14b8a6' },
  { key: 'total_tokens', label: 'Tokens', accent: '#f59e0b' },
];

function getChartMode(mode: ChartMode) {
  return chartModes.find((item) => item.key === mode) ?? chartModes[0];
}

function formatMetric(value: number, mode: ChartMode) {
  if (mode === 'revenue') {
    return currencyFormatter.format(value);
  }
  return value >= 10000 ? compactFormatter.format(value) : numberFormatter.format(value);
}

function buildCurvePath(points: ChartPoint[]) {
  if (points.length === 0) {
    return '';
  }
  if (points.length === 1) {
    const point = points[0];
    return `M ${point.x - 1} ${point.y} L ${point.x + 1} ${point.y}`;
  }

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = points[index - 1];
    const controlDistance = (point.x - previous.x) * 0.45;
    return `${path} C ${previous.x + controlDistance} ${previous.y}, ${point.x - controlDistance} ${point.y}, ${point.x} ${point.y}`;
  }, '');
}

function buildAreaPath(points: ChartPoint[], baseline: number) {
  const curve = buildCurvePath(points);
  if (!curve || points.length === 0) {
    return '';
  }
  return `${curve} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`;
}

function clampTooltipPosition(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function AnalyticsChart({ points, mode, animationKey }: { points: AnalyticsPoint[]; mode: ChartMode; animationKey: string }) {
  const [hoverState, setHoverState] = useState<{ index: number; mouseX: number; mouseY: number } | null>(null);
  const width = 940;
  const height = 250;
  const padding = 28;
  const tooltipWidth = 154;
  const tooltipHeight = 74;
  const safePoints = points.length > 0 ? points : [{ date: '', label: 'Now', value: 0 }];
  const maxValue = Math.max(...safePoints.map((point) => point.value), 1);
  const accent = getChartMode(mode).accent;
  const chartPoints = safePoints.map((point, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(safePoints.length - 1, 1);
    const y = height - padding - (point.value / maxValue) * (height - padding * 2);
    return { ...point, x, y };
  });
  const linePath = buildCurvePath(chartPoints);
  const areaPath = buildAreaPath(chartPoints, height - padding);
  const hoveredPoint = hoverState === null ? null : chartPoints[hoverState.index];
  const tooltipX = hoverState
    ? clampTooltipPosition(hoverState.mouseX + (hoverState.mouseX > width - tooltipWidth - 24 ? -18 : 18), 12, width - 12)
    : 0;
  const tooltipY = hoverState
    ? clampTooltipPosition(hoverState.mouseY + (hoverState.mouseY < tooltipHeight + 18 ? 20 : -18), 12, height - 12)
    : 0;
  const tooltipClass = hoverState
    ? `${hoverState.mouseX > width - tooltipWidth - 24 ? 'left' : 'right'} ${hoverState.mouseY < tooltipHeight + 18 ? 'below' : 'above'}`
    : '';

  function handleChartMouseMove(event: React.MouseEvent<SVGSVGElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const mouseX = ((event.clientX - bounds.left) / bounds.width) * width;
    const mouseY = ((event.clientY - bounds.top) / bounds.height) * height;
    const nearestIndex = chartPoints.reduce((nearest, point, index) => {
      const nearestDistance = Math.abs(chartPoints[nearest].x - mouseX);
      const currentDistance = Math.abs(point.x - mouseX);
      return currentDistance < nearestDistance ? index : nearest;
    }, 0);
    setHoverState({
      index: nearestIndex,
      mouseX: clampTooltipPosition(mouseX, padding, width - padding),
      mouseY: clampTooltipPosition(mouseY, padding, height - padding),
    });
  }

  return (
    <div className="area-chart-wrap" onMouseLeave={() => setHoverState(null)}>
      <svg
        className="area-chart"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Biểu đồ ${getChartMode(mode).label}`}
        onMouseMove={handleChartMouseMove}
      >
        <defs>
          <linearGradient id={`chart-fill-${mode}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={accent} stopOpacity="0.34" />
            <stop offset="100%" stopColor={accent} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((line) => {
          const y = padding + (line * (height - padding * 2)) / 3;
          return <line className="chart-grid-line" key={line} x1={padding} x2={width - padding} y1={y} y2={y} />;
        })}
        {hoveredPoint && (
          <>
            <line className="chart-guide-line vertical" x1={hoveredPoint.x} x2={hoveredPoint.x} y1={padding} y2={height - padding} />
            <line className="chart-guide-line horizontal" x1={padding} x2={width - padding} y1={hoveredPoint.y} y2={hoveredPoint.y} />
          </>
        )}
        <path key={`area-${animationKey}`} className="chart-area-fill" d={areaPath} fill={`url(#chart-fill-${mode})`} />
        <path key={`line-${animationKey}`} className="chart-line" d={linePath} stroke={accent} />
        {chartPoints.map((point, index) => (
          <g key={`${point.label}-${index}`}>
            <circle className="chart-hit-area" cx={point.x} cy={point.y} r="14" fill="transparent" />
            <circle className="chart-dot" cx={point.x} cy={point.y} r={hoverState?.index === index ? 6 : 4} fill={accent} />
          </g>
        ))}
      </svg>
      {hoveredPoint && (
        <div className={`chart-tooltip ${tooltipClass}`} style={{ left: `${tooltipX}px`, top: `${tooltipY}px` }}>
          <span>{hoveredPoint.label}</span>
          <strong style={{ color: accent }}>{formatMetric(hoveredPoint.value, mode)}</strong>
        </div>
      )}
      <div className="chart-axis-labels">
        {chartPoints.slice(0, 8).map((point, index) => <span key={`${point.label}-${index}`}>{point.label}</span>)}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRange, setSelectedRange] = useState<RangeKey>('today');
  const [chartMode, setChartMode] = useState<ChartMode>('user');

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      setError('');
      setIsLoading(true);
      try {
        const data = await apiService.getAdminStats();
        if (isMounted) {
          setStats(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Không thể tải dashboard.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedRangeConfig = ranges.find((range) => range.key === selectedRange) ?? ranges[0];
  const activeSeries = useMemo(() => stats?.analytics_series?.[selectedRange]?.[chartMode] ?? [], [chartMode, selectedRange, stats]);

  if (isLoading) {
    return <LoadingState label="Đang tổng hợp chỉ số quản trị..." />;
  }

  if (!stats) {
    return <EmptyState title="Chưa có dữ liệu dashboard" description="Kiểm tra backend hoặc token quản trị rồi thử tải lại." />;
  }

  const newUsers = Number(stats.user_metrics?.[selectedRangeConfig.metricKey] ?? 0);
  const totalUsers = stats.user_metrics?.total_users ?? stats.total_users;
  const activeUsers = stats.user_metrics?.active_users_today ?? 0;
  const totalRevenue = stats.financial_metrics?.total_revenue ?? 0;
  const tokenMetrics = stats.token_metrics ?? {};
  const activeMode = getChartMode(chartMode);
  const cards = [
    { label: 'Tổng người dùng', value: numberFormatter.format(totalUsers), icon: Users, tone: 'orange' },
    { label: `User mới ${selectedRangeConfig.label}`, value: numberFormatter.format(newUsers), icon: Zap, tone: 'red' },
    { label: 'User hoạt động', value: numberFormatter.format(activeUsers), icon: Activity, tone: 'green' },
    { label: 'Doanh thu', value: currencyFormatter.format(totalRevenue), icon: CircleDollarSign, tone: 'gold' },
  ];
  const usageRows = [
    { label: 'Requests', value: numberFormatter.format(tokenMetrics.requests ?? 0), icon: MousePointer2 },
    { label: 'Input Tokens', value: numberFormatter.format(tokenMetrics.input_tokens ?? 0), icon: Cpu },
    { label: 'Output Tokens', value: numberFormatter.format(tokenMetrics.output_tokens ?? 0), icon: Cpu },
    { label: 'Total Tokens', value: numberFormatter.format(tokenMetrics.total_tokens ?? 0), icon: BarChart3 },
  ];

  return (
    <div className="analytics-shell">
      <Feedback message={error} tone="error" />
      <header className="analytics-header">
        <div>
          <p className="panel-kicker"><BarChart3 size={16} /> Usage & Analytics</p>
          <h2>Thống kê</h2>
          <p>Theo dõi user, doanh thu và token sử dụng từ các request mới.</p>
        </div>
        <div className="range-toggle" aria-label="Chọn khoảng thời gian">
          {ranges.map((range) => (
            <button className={selectedRange === range.key ? 'active' : ''} key={range.key} type="button" onClick={() => setSelectedRange(range.key)}>
              {range.label}
            </button>
          ))}
        </div>
      </header>

      <section className="overview-card-strip">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article className={`overview-stat-card ${card.tone}`} key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <Icon size={18} />
            </article>
          );
        })}
      </section>

      <section className="analytics-grid compact">
        <article className="analytics-chart-card">
          <div className="chart-card-topline">
            <div>
              <span className="mono-label">{activeMode.label}</span>
              <h3>{selectedRangeConfig.label} </h3>
            </div>
            <span>{activeSeries.length} points</span>
          </div>
          <div className="chart-tabs" role="tablist" aria-label="Chọn loại biểu đồ">
            {chartModes.map((mode) => (
              <button className={chartMode === mode.key ? 'active' : ''} key={mode.key} type="button" onClick={() => setChartMode(mode.key)}>
                {mode.label}
              </button>
            ))}
          </div>
          <AnalyticsChart animationKey={`${selectedRange}-${chartMode}`} mode={chartMode} points={activeSeries} />
        </article>

        <aside className="usage-metrics-panel">
          <div>
            <span className="mono-label">Token usage</span>
            <h3>Request metrics</h3>
            <p>Dữ liệu token bắt đầu đo từ thời điểm triển khai logger.</p>
          </div>
          <div className="usage-metric-list">
            {usageRows.map((row) => {
              const Icon = row.icon;
              return (
                <div key={row.label}>
                  <Icon size={16} />
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              );
            })}
          </div>
        </aside>
      </section>
    </div>
  );
}
