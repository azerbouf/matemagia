import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ACHIEVEMENTS } from "./achievementsConfig";

const TOAST_STYLES = {
  streak_3:     { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-700" },
  streak_5:     { bg: "bg-yellow-100", border: "border-yellow-300", text: "text-yellow-700" },
  streak_10:    { bg: "bg-violet-100", border: "border-violet-300", text: "text-violet-700" },
  perfect_game: { bg: "bg-green-100",  border: "border-green-300",  text: "text-green-700"  },
  lightning:    { bg: "bg-cyan-100",   border: "border-cyan-300",   text: "text-cyan-700"   },
  bonus_champ:  { bg: "bg-amber-100",  border: "border-amber-300",  text: "text-amber-700"  },
};

export default function AchievementToast({ badgeId }) {
  const badge = ACHIEVEMENTS.find((a) => a.id === badgeId);
  const style = TOAST_STYLES[badgeId] || { bg: "bg-gray-100", border: "border-gray-300", text: "text-gray-700" };

  return (
    <AnimatePresence>
      {badgeId && badge && (
        <motion.div
          key={badgeId}
          initial={{ opacity: 0, y: -60, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -30, scale: 0.9 }}
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border-2 ${style.bg} ${style.border}`}>
            <span className="text-3xl">{badge.emoji}</span>
            <div>
              <p className={`font-extrabold text-xs uppercase tracking-wide ${style.text} opacity-70`}>
                Новое достижение!
              </p>
              <p className={`font-extrabold text-base ${style.text}`}>{badge.title}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}