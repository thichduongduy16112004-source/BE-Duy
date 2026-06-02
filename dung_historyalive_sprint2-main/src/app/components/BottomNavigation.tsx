import { useNavigate, useLocation } from 'react-router';
import svgPaths from '../../imports/svg-wdeaovtbx7';

// Icon components using exact Figma SVG paths
function HomeIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 23.8076 23.8076" fill="none">
      <path d={svgPaths.p3401fa00} fill={color} />
    </svg>
  );
}

function PracticeIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 23.6542 23.6332" fill="none">
      <path d={svgPaths.p30041680} fill={color} />
    </svg>
  );
}

function LeaderboardIcon({ color }: { color: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 22.2834 21.6417" fill="none">
      <path d={svgPaths.p14abe280} fill={color} />
    </svg>
  );
}

function PremiumIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="21" viewBox="0 0 23.5844 21.272" fill="none">
      <path d={svgPaths.pf693500} fill={color} />
    </svg>
  );
}

function ProfileIcon({ color }: { color: string }) {
  return (
    <svg width="24" height="24" viewBox="0 0 23.8076 23.8076" fill="none">
      <path d={svgPaths.p3fa083c0} fill={color} />
    </svg>
  );
}

export function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/home', icon: HomeIcon, label: 'Học' },
    { path: '/practice', icon: PracticeIcon, label: 'Trận Đấu' },
    { path: '/leaderboard', icon: LeaderboardIcon, label: 'Bảng Xếp Hạng' },
    { path: '/premium', icon: PremiumIcon, label: 'Phần Thưởng' },
    { path: '/profile', icon: ProfileIcon, label: 'Hồ Sơ' },
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white flex items-center justify-between px-[10px] pb-[8px] pt-[6px] z-10 border-t border-[#e0e0e0] shadow-[0px_-2px_10px_0px_rgba(0,0,0,0.05)]">
      {navItems.map((item) => {
        const active = isActive(item.path);
        const IconComponent = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="relative flex flex-col items-center justify-center gap-[3px] flex-1 transition-all"
          >
            {/* Icon container */}
            <div className={`relative flex items-center justify-center w-[44px] h-[44px] rounded-full transition-all ${active ? 'bg-[#FBCE03]' : ''}`}>
              <div className="relative z-[1]">
                <IconComponent color={active ? '#0F172A' : '#9E9E9E'} />
              </div>
            </div>
            {/* Label */}
            <span
              className="text-center leading-tight"
              style={{
                fontFamily: "'Be Vietnam Pro', sans-serif",
                fontSize: '10px',
                fontWeight: active ? 700 : 400,
                color: active ? '#0F172A' : '#9E9E9E',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}