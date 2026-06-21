import { createContext, useContext } from "react";
import { CONTENT_UNITS } from "./content/mockContent";

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

import mieuImg from '../assets/mascots/mieu.png';
import hungImg from '../assets/mascots/hung.png';
import vangImg from '../assets/mascots/vang.png';
import baoImg from '../assets/mascots/bao.png';
import haiImg from '../assets/mascots/hai.png';
import ngocImg from '../assets/mascots/ngoc.png';

export const MASCOTS = [
  { id: 'mieu', name: 'Miêu', desc: 'Cô Nông Dân', img: mieuImg, color: '#f59e0b', bg: 'linear-gradient(135deg, #fef3c7, #fde68a)' },
  { id: 'hung', name: 'Hùng', desc: 'Nhà Nho', img: hungImg, color: '#92400e', bg: 'linear-gradient(135deg, #fef9e7, #f5e6c8)' },
  { id: 'vang', name: 'Vàng', desc: 'Tiểu Đồng', img: vangImg, color: '#d97706', bg: 'linear-gradient(135deg, #fffbeb, #fef3c7)' },
  { id: 'bao',  name: 'Bảo',  desc: 'Chiến Binh', img: baoImg,  color: '#2563eb', bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)' },
  { id: 'hai',  name: 'Hải',  desc: 'Quan Đại Thần', img: haiImg, color: '#1e3a5f', bg: 'linear-gradient(135deg, #f0f4ff, #dde4f5)' },
  { id: 'ngoc', name: 'Ngọc', desc: 'Tiên Nữ', img: ngocImg, color: '#db2777', bg: 'linear-gradient(135deg, #fff0f6, #fce7f3)' },
];

export const HEART_POLICY = {
  version: 3,
  maxHearts: 5,
  losePerWrong: 1,
  refillMinutesPerHeart: 5,
  freeDailyRecoveryAmount: 5,
} as const;

export type Rank = "iron" | "bronze" | "silver" | "gold";

export type ActivityItem = {
  lessonId?: string | null;
  mode?: string;
  correctAnswers: number;
  totalQuestions: number;
  completed: boolean;
  createdAt?: string | null;
};

export type ActivitySummary = {
  totalAttempts: number;
  totalCompletedLessons: number;
  latestActivityAt?: string | null;
  recentItems: ActivityItem[];
};

export type User = {
  username: string;
  email: string;
  name: string;
  dob: string;
  phone: string;
  avatar: string;
  mascotId: string;
  grade: string;
  studyMinutes: number;
  xp: number;
  streak: number;
  gems: number;
  hearts: number;
  completedLessons: string[];
  achievements: string[];
  rank: Rank;
  rankLabel: string;
  created_at?: string;
  joinedAt?: string;
  lastStreakDate?: string | null;
  activitySummary?: ActivitySummary | null;
  isPremium: boolean;
  planType: "free" | "premium" | "trial";
  trialEndDate: string | null;
  premiumEndDate: string | null;
  isNewUser: boolean;
  lastHeartUpdate: number;
  hasUsedFreeHeartRecovery: boolean;
  lastFreeHeartRecoveryDate?: string;
  hasDepletedHeartsToday?: boolean;
  energyPolicyVersion?: number;
};

export const defaultUser: User = {
  username: "",
  email: "",
  name: "",
  dob: "",
  phone: "",
  avatar: "mieu",
  mascotId: "mieu",
  grade: "",
  studyMinutes: 15,
  xp: 0,
  streak: 0,
  gems: 50,
  hearts: HEART_POLICY.maxHearts,
  completedLessons: [],
  achievements: [],
  rank: "iron",
  rankLabel: "Hạng Sắt",
  created_at: undefined,
  joinedAt: undefined,
  lastStreakDate: null,
  activitySummary: null,
  isPremium: false,
  planType: "free",
  trialEndDate: null,
  premiumEndDate: null,
  isNewUser: false,
  lastHeartUpdate: Date.now(),
  hasUsedFreeHeartRecovery: false,
  lastFreeHeartRecoveryDate: undefined,
  hasDepletedHeartsToday: false,
  energyPolicyVersion: HEART_POLICY.version,
};

export type AppCtx = {
  user: User;
  setUser: (u: User | ((prev: User) => User)) => void;
  updateProfile: (data: Partial<User>) => void;
  completeLesson: (id: string, xp: number, attempt?: { correctAnswers: number; totalQuestions: number; maxStreak?: number; mode?: string }) => void;
  loseHeart: () => void;
  recoverDailyHearts: () => void;
  upgradeToPremium: () => void;
  startTrial: () => void;
  isSoundEnabled: boolean;
  toggleSound: () => void;
  soundVolume: number;
};

export const AppContext = createContext<AppCtx>({
  user: defaultUser,
  setUser: () => {},
  updateProfile: () => {},
  completeLesson: () => {},
  loseHeart: () => {},
  recoverDailyHearts: () => {},
  upgradeToPremium: () => {},
  startTrial: () => {},
  isSoundEnabled: true,
  toggleSound: () => {},
  soundVolume: 0.8,
});

export const useApp = () => useContext(AppContext);

export const UNITS = CONTENT_UNITS;

export const MISSIONS = [
  { id: "m1", title: "Hoàn thành 1 bài học hôm nay", target: 1, reward: 10, icon: "⚔️", desc: "Chinh phục một trận chiến lịch sử" },
  { id: "m2", title: "Kiếm 50 XP trong ngày", target: 50, reward: 20, icon: "⚡", desc: "Tích lũy kinh nghiệm chiến trường" },
  { id: "m3", title: "Duy trì chuỗi 3 ngày", target: 3, reward: 30, icon: "🔥", desc: "Giữ ngọn lửa không bao giờ tắt" },
];

export const ACHIEVEMENTS = [
  { id: "a1", title: "Khai Sơn Phá Thạch", desc: "Hoàn thành bài học đầu tiên", icon: "⚔️", rarity: "common" },
  { id: "a2", title: "Học Giả Bách Chiến", desc: "Đạt 100 XP", icon: "📚", rarity: "common" },
  { id: "a3", title: "Chiến Binh Lịch Sử", desc: "Đánh bại 1 thử thách cuối chương", icon: "🛡️", rarity: "rare" },
  { id: "a4", title: "Người Kể Sử Thi", desc: "Hoàn thành 5 câu chuyện", icon: "📜", rarity: "rare" },
  { id: "a5", title: "Bậc Thầy Thời Đại", desc: "Hoàn thành 1 chương lịch sử", icon: "👑", rarity: "epic" },
  { id: "a6", title: "Ngọn Lửa Vĩnh Cửu", desc: "Chuỗi 7 ngày liên tiếp", icon: "🔥", rarity: "legendary" },
];

export const getEarnedAchievements = (user: User) => {
  const earned = (id: string) => {
    if (id === "a1") return user.completedLessons.length >= 1;
    if (id === "a2") return user.xp >= 100;
    if (id === "a3") return user.completedLessons.some((lessonId) => lessonId.endsWith("-l5") || lessonId.endsWith("-l4"));
    if (id === "a4") return user.completedLessons.length >= 5;
    if (id === "a5") return user.completedLessons.length >= 5;
    if (id === "a6") return user.streak >= 7;
    return false;
  };

  return ACHIEVEMENTS.filter((achievement) => earned(achievement.id));
};
