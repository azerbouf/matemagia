import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trophy, Home } from "lucide-react";
import { LEVEL_LABELS, getPointsPerQuestion, TOTAL_QUESTIONS } from "./mathUtils";
import { playVictorySound } from "./sounds";
import Confetti from "./Confetti";

export default function GameSummary({
  playerName,
  level,
  score,
  correctAnswers,
  onPlayAgain,
  onGoHome,
}) {
  const baseMax = getPointsPerQuestion(level) * TOTAL_QUESTIONS;
  const maxScore = Math.round(baseMax * 1.5);
  const percentage = Math.round((correctAnswers / TOTAL_QUESTIONS) * 100);

  useEffect(() => {
    if (percentage >= 70) playVictorySound();
  }, [percentage]);

  let emoji, message;
  if (percentage === 100) {
    emoji = "🏆";
    message = "Идеально! Ты гений!";
  } else if (percentage >= 80) {
    emoji = "🌟";
    message = "Отлично! Так держать!";
  } else if (percentage >= 50) {
    emoji = "👍";
    message = "Хорошо! Можно лучше!";
  } else {
    emoji = "💪";
    message = "Не сдавайся! Попробуй ещё!";
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="px-4 py-8 max-w-md mx-auto text-center"
    >
      {percentage >= 70 && <Confetti count={40} mode="rain" />}

      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ repeat: 2, duration: 0.5 }}
        className="text-6xl mb-4"
      >
        {emoji}
      </motion.div>

      <h2 className="text-2xl font-extrabold text-gray-800 mb-1">{message}</h2>
      <p className="text-gray-500 mb-6">{playerName}, уровень «{LEVEL_LABELS[level]}»</p>

      <div className="bg-gradient-to-br from-violet-500 to-indigo-600 rounded-3xl p-6 text-white mb-6 shadow-xl shadow-violet-200">
        <p className="text-white/70 text-sm mb-1">Твой результат</p>
        <p className="text-5xl font-extrabold mb-2">{score}</p>
        <p className="text-white/60 text-sm">из {maxScore} возможных очков</p>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-2xl p-3">
            <p className="text-2xl font-bold">{correctAnswers}</p>
            <p className="text-white/60 text-xs">Правильных</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-3">
            <p className="text-2xl font-bold">{TOTAL_QUESTIONS - correctAnswers}</p>
            <p className="text-white/60 text-xs">Ошибок</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button
          onClick={onPlayAgain}
          className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 shadow-lg shadow-violet-200"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          Играть ещё
        </Button>
        <Button
          onClick={onGoHome}
          variant="outline"
          className="w-full h-14 rounded-2xl text-lg font-bold border-2 border-gray-200 text-gray-600"
        >
          <Home className="w-5 h-5 mr-2" />
          На главную
        </Button>
      </div>
    </motion.div>
  );
}