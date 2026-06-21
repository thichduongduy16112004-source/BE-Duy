import { useState, useEffect } from "react";
import { HEART_POLICY, useApp } from "../store";
import { useIsPremium } from "./useIsPremium";

export const HEART_REFILL_TIME = HEART_POLICY.refillMinutesPerHeart * 60 * 1000;
export const MAX_HEARTS = HEART_POLICY.maxHearts;

export function useHearts() {
  const { user, updateProfile } = useApp();
  const isPremium = useIsPremium();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (isPremium) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const lastUpdate = user.lastHeartUpdate || now;
      const diff = now - lastUpdate;
      const shouldRefill = user.hearts < MAX_HEARTS;

      if (shouldRefill) {
        const heartsToAdd = Math.floor(diff / HEART_REFILL_TIME);
        if (heartsToAdd > 0) {
          const newHearts = Math.min(MAX_HEARTS, user.hearts + heartsToAdd);
          updateProfile({
            hearts: newHearts,
            lastHeartUpdate: lastUpdate + (heartsToAdd * HEART_REFILL_TIME),
            hasDepletedHeartsToday: newHearts < MAX_HEARTS,
            energyPolicyVersion: HEART_POLICY.version,
          });
        } else {
          setTimeLeft(Math.max(0, Math.floor((HEART_REFILL_TIME - diff) / 1000)));
        }
      } else {
        setTimeLeft(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [user.hearts, user.lastHeartUpdate, isPremium, updateProfile]);

  return {
    hearts: isPremium ? Infinity : user.hearts,
    isPremium,
    timeLeft,
    isFull: user.hearts >= MAX_HEARTS,
    maxHearts: MAX_HEARTS,
  };
}
