import { useState, useCallback, useEffect } from "react";
import { RouterProvider } from "react-router";
import { AppContext, defaultUser, HEART_POLICY, User, API_URL } from "./store";
import { router } from "./routes";

const getLocalDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const calculateNextLessonStreak = (currentStreak: number, lastStreakDate?: string | null) => {
  const today = getLocalDateKey();
  if (!lastStreakDate) return 1;

  const previousKey = lastStreakDate.slice(0, 10);
  if (previousKey === today) return Math.max(1, currentStreak);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return previousKey === getLocalDateKey(yesterday) ? currentStreak + 1 : 1;
};

export default function App() {
  const [user, setUser] = useState<User>(() => {
    let initial = { ...defaultUser };

    try {
      const savedUser = localStorage.getItem("ha_user");
      if (savedUser) initial = { ...initial, ...JSON.parse(savedUser) };

      if (!initial.energyPolicyVersion || initial.energyPolicyVersion < HEART_POLICY.version) {
        initial = {
          ...initial,
          hearts: HEART_POLICY.maxHearts,
          lastHeartUpdate: Date.now(),
          hasUsedFreeHeartRecovery: false,
          lastFreeHeartRecoveryDate: undefined,
          hasDepletedHeartsToday: false,
          energyPolicyVersion: HEART_POLICY.version,
        };
        localStorage.setItem("ha_user", JSON.stringify(initial));
      }
    } catch {}

    // Premium state is stored separately so payment/trial updates survive refreshes.
    try {
      const saved = localStorage.getItem("ha_premium");
      if (saved) {
        const { isPremium, planType, trialEndDate, premiumEndDate } = JSON.parse(saved);
        // Check trial expiry
        if (planType === "trial" && trialEndDate) {
          const expired = new Date(trialEndDate) < new Date();
          if (expired) return { ...initial, isPremium: false, planType: "free", trialEndDate: null, premiumEndDate: null };
        }
        // Check premium expiry
        if (planType === "premium" && premiumEndDate) {
          const expired = new Date(premiumEndDate) < new Date();
          if (expired) return { ...initial, isPremium: false, planType: "free", trialEndDate: null, premiumEndDate: null };
        }
        return { ...initial, isPremium, planType, trialEndDate, premiumEndDate };
      }
    } catch {}
    return initial;
  });

  useEffect(() => {
    const token = localStorage.getItem("ha_token");
    if (token) {
      fetch(`${API_URL}/users/me`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => {
        setUser((current) => {
          const next = {
            ...defaultUser,
            ...current,
            ...data,
            created_at: data.created_at ?? current.created_at,
            joinedAt: data.joinedAt ?? data.created_at ?? current.joinedAt,
            streak: data.streak ?? 0,
            rank: data.rank ?? "iron",
            rankLabel: data.rankLabel ?? "Hạng Sắt",
            lastStreakDate: data.lastStreakDate ?? null,
            activitySummary: data.activitySummary ?? null,
            completedLessons: data.completedLessons ?? [],
            hearts: data.energyPolicyVersion >= HEART_POLICY.version ? data.hearts : current.hearts,
            energyPolicyVersion: current.energyPolicyVersion ?? HEART_POLICY.version,
          };
          localStorage.setItem("ha_user", JSON.stringify(next));
          return next;
        });
      })
      .catch(() => {
        localStorage.removeItem("ha_token");
      });
    }
  }, []);

  const completeLesson = useCallback((id: string, xp: number, attempt?: { correctAnswers: number; totalQuestions: number; maxStreak?: number; mode?: string }) => {
    const token = localStorage.getItem("ha_token");
    const mode = attempt?.mode ?? "lesson";
    const shouldUpdateLocalCompletion = mode !== "assignment";

    setUser((u) => {
      if (shouldUpdateLocalCompletion && u.completedLessons.includes(id)) return u;

      const lastStreakDate = getLocalDateKey();
      const createdAt = new Date().toISOString();
      const activityItem = {
        lessonId: id,
        mode,
        correctAnswers: attempt?.correctAnswers ?? 1,
        totalQuestions: Math.max(1, attempt?.totalQuestions ?? 1),
        completed: true,
        createdAt,
      };
      const currentSummary = u.activitySummary ?? {
        totalAttempts: 0,
        totalCompletedLessons: 0,
        latestActivityAt: null,
        recentItems: [],
      };
      const nextActivitySummary = {
        totalAttempts: currentSummary.totalAttempts + 1,
        totalCompletedLessons: currentSummary.totalCompletedLessons + (shouldUpdateLocalCompletion ? 1 : 0),
        latestActivityAt: createdAt,
        recentItems: [activityItem, ...currentSummary.recentItems].slice(0, 7),
      };
      const next = shouldUpdateLocalCompletion ? {
        ...u,
        completedLessons: [...u.completedLessons, id],
        xp: u.xp + xp,
        gems: u.gems + 5,
        streak: calculateNextLessonStreak(u.streak, u.lastStreakDate),
        lastStreakDate,
        activitySummary: nextActivitySummary,
      } : {
        ...u,
        activitySummary: nextActivitySummary,
      };
      localStorage.setItem("ha_user", JSON.stringify(next));

      if (token && shouldUpdateLocalCompletion) {
        fetch(`${API_URL}/users/me`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            completedLessons: next.completedLessons,
            xp: next.xp,
            gems: next.gems,
            streak: next.streak,
            lastStreakDate: next.lastStreakDate,
            isNewUser: next.isNewUser,
          })
        })
        .then(res => {
          if (res.ok) return res.json();
          throw new Error();
        })
        .then(updatedUser => {
          setUser((current) => ({
            ...current,
            ...updatedUser,
            activitySummary: current.activitySummary,
          }));
        })
        .catch(() => {});
      }

      return next;
    });

    if (token) {
      fetch(`${API_URL}/me/quiz-attempts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          tenantSlug: "ha-tenant",
          lessonLegacyId: id,
          mode,
          correctAnswers: attempt?.correctAnswers ?? 1,
          totalQuestions: Math.max(1, attempt?.totalQuestions ?? 1),
          maxStreak: attempt?.maxStreak ?? 0,
          completed: true,
        })
      }).catch(() => {});
    }
  }, []);

  const loseHeart = useCallback(() => {
    setUser((u) => {
      if (u.isPremium || u.planType === "premium") return u;
      const wasFull = (u.hearts ?? HEART_POLICY.maxHearts) >= HEART_POLICY.maxHearts;
      const hearts = Math.max(0, (u.hearts ?? HEART_POLICY.maxHearts) - HEART_POLICY.losePerWrong);
      const next = {
        ...u,
        hearts,
        lastHeartUpdate: wasFull && hearts < HEART_POLICY.maxHearts ? Date.now() : u.lastHeartUpdate,
        hasDepletedHeartsToday: hearts <= 0 || u.hasDepletedHeartsToday,
        energyPolicyVersion: HEART_POLICY.version,
      };
      localStorage.setItem("ha_user", JSON.stringify(next));
      return next;
    });
  }, []);

  const recoverDailyHearts = useCallback(() => {
    setUser((u) => {
      const today = new Date().toISOString().slice(0, 10);
      if (u.isPremium || u.planType === "premium" || u.hearts > 0 || u.lastFreeHeartRecoveryDate === today) return u;
      const next = {
        ...u,
        hearts: Math.min(HEART_POLICY.maxHearts, HEART_POLICY.freeDailyRecoveryAmount),
        hasUsedFreeHeartRecovery: true,
        lastFreeHeartRecoveryDate: today,
        lastHeartUpdate: Date.now(),
        energyPolicyVersion: HEART_POLICY.version,
      };
      localStorage.setItem("ha_user", JSON.stringify(next));
      return next;
    });
  }, []);

  const upgradeToPremium = useCallback(() => {
    setUser((u) => {
      const updated = { ...u, isPremium: true, planType: "premium" as const, trialEndDate: null };
      localStorage.setItem("ha_premium", JSON.stringify({ isPremium: true, planType: "premium", trialEndDate: null }));
      return updated;
    });
  }, []);

  const startTrial = useCallback(() => {
    const trialEndDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(); // 3 ngày
    // Sync with frontend local storage
    localStorage.setItem("ha_premium", JSON.stringify({ isPremium: true, planType: "trial", trialEndDate }));
    
    // Use the existing fetch logic to update backend immediately
    const token = localStorage.getItem("ha_token");
    if (token) {
      fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isPremium: true, planType: "trial", trialEndDate })
      })
      .then(res => res.json())
      .then(updatedUser => setUser(updatedUser))
      .catch(err => console.error("Failed to sync trial to server", err));
    } else {
      setUser((u) => ({ ...u, isPremium: true, planType: "trial" as const, trialEndDate }));
    }
  }, []);

  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("ha_sound");
      if (saved) return JSON.parse(saved).enabled;
    } catch {}
    return true;
  });

  const toggleSound = useCallback(() => {
    setIsSoundEnabled(prev => {
      const next = !prev;
      localStorage.setItem("ha_sound", JSON.stringify({ enabled: next }));
      return next;
    });
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    setUser(prev => {
      const next = { ...prev, ...data };
      localStorage.setItem("ha_user", JSON.stringify(next));
      return next;
    });

    const token = localStorage.getItem("ha_token");
    if (token) {
      fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(updatedUser => {
        setUser(updatedUser);
      })
      .catch(err => {
        console.error("Failed to sync profile with server", err);
      });
    }
  }, []);

  return (
    <AppContext.Provider value={{ 
      user, setUser, updateProfile, completeLesson, loseHeart, recoverDailyHearts, upgradeToPremium, startTrial,
      isSoundEnabled, toggleSound, soundVolume: 0.8
    }}>
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
}
