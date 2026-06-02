import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BottomNavigation } from './BottomNavigation';

const players = [
  { rank: 1, name: 'Minh Khôi',     xp: 1240, streak: 18, emoji: '🎓', avatarBg: '#FBCE03',  ringColor: '#E6B800', podiumColor: '#FBCE03',  podiumShadow: '#C4A302' },
  { rank: 2, name: 'Thanh Hà',      xp: 980,  streak: 15, emoji: '👩‍🎓', avatarBg: '#A8A8A8',  ringColor: '#888',    podiumColor: '#A8A8A8',  podiumShadow: '#7A7A7A' },
  { rank: 3, name: 'Tuấn Anh',      xp: 870,  streak: 11, emoji: '👨‍🎓', avatarBg: '#C0824A',  ringColor: '#A0612A', podiumColor: '#C0824A',  podiumShadow: '#8C5528' },
  { rank: 4, name: 'Linh Chi',      xp: 760,  streak: 14, emoji: '👩‍💻', avatarBg: '#FFF0C4' },
  { rank: 5, name: 'Phúc Hậu',      xp: 620,  streak: 10, emoji: '👨‍💼', avatarBg: '#FFF0C4' },
  { rank: 6, name: 'Bảo Ngọc',      xp: 540,  streak: 9,  emoji: '👩‍🏫', avatarBg: '#FFF0C4' },
  { rank: 7, name: 'Đức Mạnh',      xp: 490,  streak: 7,  emoji: '👨‍🎓', avatarBg: '#FFF0C4' },
  { rank: 8, name: 'Học Sinh (Bạn)',xp: 450,  streak: 12, emoji: '🎓',   avatarBg: '#FFF0C4', isCurrentUser: true },
];

const podiumOrder = [players[1], players[0], players[2]]; // 2, 1, 3
const podiumHeights = [72, 96, 56]; // px heights for blocks 2, 1, 3
const medalEmoji = ['', '🥈', '🥇', '🥉'];

function AnimatedCounter({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const steps = 40;
    const inc = value / steps;
    const interval = (duration * 1000) / steps;
    const timer = setInterval(() => {
      start += inc;
      if (start >= value) { setDisplay(value); clearInterval(timer); }
      else setDisplay(Math.floor(start));
    }, interval);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{display.toLocaleString()}</>;
}

export default function MobileLeaderboardScreen() {
  const [mounted, setMounted] = useState(false);
  const userXP = 450;
  const userStreak = 12;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-[393px] h-[852px] bg-[#f5f5dc] flex flex-col relative overflow-hidden">

      {/* ── Header ── */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="shrink-0 px-[16px] pt-[16px] pb-[12px] border-b border-[rgba(0,0,0,0.07)] bg-[#f5f5dc]"
      >
        <div className="flex items-center justify-between gap-[8px]">
          <h1
            className="text-[20px] text-[#0f172a] tracking-[-0.5px]"
            style={{ fontFamily: "'Be Vietnam Pro', sans-serif", fontWeight: 700 }}
          >
            Bảng Xếp Hạng
          </h1>

          <div className="flex items-center gap-[6px]">
            {/* Streak pill */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
              className="flex items-center gap-[4px] px-[10px] py-[5px] rounded-full border-2 border-[#FBCE03] bg-white"
            >
              <span className="text-[14px]">🔥</span>
              <span className="text-[13px] text-[#0f172a]" style={{ fontFamily: "'Be Vietnam Pro'", fontWeight: 700 }}>
                {userStreak}
              </span>
            </motion.div>

            {/* XP pill */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring', stiffness: 300 }}
              className="flex items-center gap-[4px] px-[10px] py-[5px] rounded-full bg-[#FBCE03]"
            >
              <span className="text-[13px]">⚡</span>
              <span className="text-[13px] text-[#0f172a]" style={{ fontFamily: "'Be Vietnam Pro'", fontWeight: 700 }}>
                {mounted ? <AnimatedCounter value={userXP} /> : userXP} xp
              </span>
            </motion.div>

            {/* Hearts */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-[2px]"
            >
              {[0,1,2,3,4].map(i => (
                <span key={i} className="text-[14px]" style={{ filter: i < 3 ? 'none' : 'grayscale(1) opacity(0.3)' }}>❤️</span>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto pb-[82px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* ── Podium Section ── */}
        <div className="px-[16px] pt-[24px] pb-[8px] flex items-end justify-center gap-[12px]">
          {podiumOrder.map((player, colIdx) => {
            const isFirst = player.rank === 1;
            const avatarSize = isFirst ? 72 : 60;
            const blockH = podiumHeights[colIdx];
            const delay = colIdx === 1 ? 0.1 : colIdx === 0 ? 0.25 : 0.35;

            return (
              <div key={player.rank} className="flex flex-col items-center" style={{ width: isFirst ? 100 : 88 }}>

                {/* Crown for rank 1 */}
                {isFirst && (
                  <motion.div
                    initial={{ y: -20, opacity: 0, scale: 0.5 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 15 }}
                    className="text-[28px] mb-[-4px]"
                  >
                    👑
                  </motion.div>
                )}

                {/* Avatar circle */}
                <motion.div
                  initial={{ y: -30, opacity: 0, scale: 0.6 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: delay + 0.3, type: 'spring', stiffness: 350, damping: 18 }}
                  className="relative mb-[6px]"
                  style={{ width: avatarSize, height: avatarSize }}
                >
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center relative"
                    style={{
                      background: player.avatarBg,
                      border: `4px solid white`,
                      boxShadow: `0 4px 12px rgba(0,0,0,0.15)`,
                    }}
                  >
                    <span style={{ fontSize: isFirst ? 32 : 26 }}>{player.emoji}</span>
                  </div>
                  {/* Medal badge for rank 2 & 3 */}
                  {!isFirst && (
                    <div className="absolute top-[-4px] right-[-4px] text-[18px] leading-none">
                      {medalEmoji[player.rank]}
                    </div>
                  )}
                </motion.div>

                {/* Name & XP */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: delay + 0.55 }}
                  className="flex flex-col items-center mb-[4px]"
                >
                  <span
                    className="text-center text-[#0f172a]"
                    style={{ fontFamily: "'Be Vietnam Pro'", fontWeight: 700, fontSize: isFirst ? 14 : 12, lineHeight: 1.3 }}
                  >
                    {player.name}
                  </span>
                  <span
                    className="text-center"
                    style={{ fontFamily: "'Be Vietnam Pro'", fontWeight: 400, fontSize: 11, color: '#64748b' }}
                  >
                    {player.xp.toLocaleString()} XP
                  </span>
                </motion.div>

                {/* Podium block */}
                <motion.div
                  initial={{ scaleY: 0, opacity: 0.5 }}
                  animate={{ scaleY: 1, opacity: 1 }}
                  transition={{ delay: delay, duration: 0.6, ease: [0.34, 1.2, 0.64, 1] }}
                  style={{
                    transformOrigin: 'bottom',
                    width: '100%',
                    height: blockH,
                    background: player.podiumColor,
                    borderRadius: '12px 12px 0 0',
                    boxShadow: `0 -4px 0 0 ${player.podiumShadow}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: delay + 0.5 }}
                    style={{ fontFamily: "'Be Vietnam Pro'", fontWeight: 900, fontSize: isFirst ? 28 : 22, color: isFirst ? '#7A5C00' : 'white' }}
                  >
                    {player.rank}
                  </motion.span>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* ── Rankings List (4 - 8) ── */}
        <div className="px-[16px] pt-[16px] flex flex-col gap-[10px]">
          {players.slice(3).map((player, i) => (
            <motion.div
              key={player.rank}
              initial={{ x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{
                delay: 0.6 + i * 0.08,
                type: 'spring',
                stiffness: 300,
                damping: 24,
              }}
              className="relative"
              style={{
                background: player.isCurrentUser ? 'rgba(251,206,3,0.06)' : 'white',
                borderRadius: 16,
                border: player.isCurrentUser ? '2px solid #FBCE03' : '1.5px solid rgba(0,0,0,0.07)',
                boxShadow: player.isCurrentUser
                  ? '0 4px 0 0 rgba(251,206,3,0.3)'
                  : '0 4px 0 0 rgba(0,0,0,0.06)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {/* Rank number */}
              <div style={{ width: 28, flexShrink: 0, textAlign: 'center' }}>
                <span
                  style={{
                    fontFamily: "'Be Vietnam Pro'",
                    fontWeight: 700,
                    fontSize: 15,
                    color: player.isCurrentUser ? '#FBCE03' : '#94a3b8',
                  }}
                >
                  {player.isCurrentUser ? `#${player.rank}` : player.rank}
                </span>
              </div>

              {/* Avatar */}
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex items-center justify-center rounded-full shrink-0"
                style={{
                  width: 44,
                  height: 44,
                  background: player.avatarBg,
                  border: '2px solid rgba(0,0,0,0.06)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                }}
              >
                <span style={{ fontSize: 22 }}>{player.emoji}</span>
              </motion.div>

              {/* Name + stats */}
              <div className="flex-1 min-w-0">
                <p
                  className="truncate"
                  style={{
                    fontFamily: "'Be Vietnam Pro'",
                    fontWeight: 700,
                    fontSize: 15,
                    color: '#0f172a',
                    lineHeight: 1.3,
                  }}
                >
                  {player.name}
                </p>
                <div className="flex items-center gap-[10px] mt-[2px]">
                  <span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                    ⚡ {player.xp.toLocaleString()} XP
                  </span>
                  <span style={{ fontFamily: "'Be Vietnam Pro'", fontSize: 12, color: '#64748b', fontWeight: 500 }}>
                    🔥 {player.streak} ngày
                  </span>
                </div>
              </div>

              {/* Swords icon for current user */}
              {player.isCurrentUser && (
                <motion.div
                  initial={{ rotate: -20, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ delay: 1.1, type: 'spring', stiffness: 300 }}
                  className="shrink-0 text-[22px]"
                >
                  ⚔️
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Bottom Navigation ── */}
      <BottomNavigation />
    </div>
  );
}
