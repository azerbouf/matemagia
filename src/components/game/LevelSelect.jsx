import React from "react";
import { motion } from "framer-motion";
import { Star, Trophy, Zap, Crown } from "lucide-react";

const levels = [
  {
    id: "easy",
    label: "Лёгкий",
    description: "Сложение и вычитание до 100",
    icon: Star,
    color: "from-green-400 to-emerald-500",
    shadow: "shadow-green-200",
    emoji: "🌟",
    points: "10 очков за ответ",
  },
  {
    id: "medium",
    label: "Средний",
    description: "До 1000 + умножение",
    icon: Zap,
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-orange-200",
    emoji: "⚡",
    points: "20 очков за ответ",
  },
  {
    id: "hard",
    label: "Тяжёлый",
    description: "Умножение и деление",
    icon: Trophy,
    color: "from-rose-400 to-red-500",
    shadow: "shadow-rose-200",
    emoji: "🔥",
    points: "30 очков за ответ",
  },
  {
    id: "bonus",
    label: "Бонусный",
    description: "Всё вместе — для смелых!",
    icon: Crown,
    color: "from-violet-500 to-purple-600",
    shadow: "shadow-violet-200",
    emoji: "👑",
    points: "50 очков за ответ",
  },
];

export default function LevelSelect({ playerName, onSelect }) {
  return (
    <div className="px-4 py-6 max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <p className="text-gray-500 text-sm">Привет,</p>
        <h2 className="text-2xl font-extrabold text-gray-800">{playerName}! 👋</h2>
        <p className="text-gray-400 mt-1 text-sm">Выбери уровень сложности</p>
      </motion.div>

      <div className="space-y-4">
        {levels.map((level, index) => (
          <motion.button
            key={level.id}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onSelect(level.id)}
            className={`w-full p-4 rounded-2xl bg-gradient-to-r ${level.color} ${level.shadow} shadow-lg text-white text-left transition-all duration-200 active:scale-95 hover:scale-[1.02]`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{level.emoji}</span>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{level.label}</h3>
                <p className="text-white/80 text-sm">{level.description}</p>
                <p className="text-white/60 text-xs mt-1">{level.points}</p>
              </div>
              <level.icon className="w-6 h-6 text-white/60" />
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}