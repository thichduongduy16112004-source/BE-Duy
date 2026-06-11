import { useState, useCallback, useEffect } from "react";
import { RouterProvider } from "react-router";
import { AppContext, defaultUser, User, API_URL } from "./store";
import { router } from "./routes";
import { BGM_B64 } from "./hooks/useSound";

export default function App() {
  const [user, setUser] = useState<User>(() => {
    // Persist premium state across refresh
    try {
      const saved = localStorage.getItem("ha_premium");
      if (saved) {
        const { isPremium, planType, trialEndDate } = JSON.parse(saved);
        // Check trial expiry
        if (planType === "trial" && trialEndDate) {
          const expired = new Date(trialEndDate) < new Date();
          if (expired) return { ...defaultUser, isPremium: false, planType: "free", trialEndDate: null };
        }
        return { ...defaultUser, isPremium, planType, trialEndDate };
      }
    } catch {}
    return defaultUser;
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
        setUser(data);
      })
      .catch(() => {
        localStorage.removeItem("ha_token");
      });
    }
  }, []);

  const completeLesson = useCallback((id: string, xp: number) => {
    setUser((u) => {
      if (u.completedLessons.includes(id)) return u;
      return {
        ...u,
        completedLessons: [...u.completedLessons, id],
        xp: u.xp + xp,
        gems: u.gems + 5,
        streak: u.streak,
      };
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
    setUser((u) => {
      const updated = { ...u, isPremium: true, planType: "trial" as const, trialEndDate };
      localStorage.setItem("ha_premium", JSON.stringify({ isPremium: true, planType: "trial", trialEndDate }));
      return updated;
    });
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
      user, setUser, updateProfile, completeLesson, upgradeToPremium, startTrial,
      isSoundEnabled, toggleSound, soundVolume: 0.8
    }}>
      <RouterProvider router={router} />
      <audio id="global-bgm" src={BGM_B64} loop autoPlay={isSoundEnabled} muted={!isSoundEnabled} />
    </AppContext.Provider>
  );
}
