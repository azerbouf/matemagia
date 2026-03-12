import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Medal, Crown, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { LEVEL_LABELS } from "../components/game/mathUtils";
import { createPageUrl } from "@/utils";

const levelTabs = ["easy", "medium", "hard", "bonus"];
const levelColors = {
  easy: "bg-green-500",
  medium: "bg-orange-500",
  hard: "bg-red-500",
  bonus: "bg-violet-500",
};

function getMedalIcon(index) {
  if (index === 0) return <Crown className="w-5 h-5 text-amber-500" />;
  if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
  if (index === 2) return <Medal className="w-5 h-5 text-amber-700" />;
  return <span className="text-sm font-bold text-gray-400 w-5 text-center">{index + 1}</span>;
}

function getRankBg(index) {
  if (index === 0) return "bg-amber-50 border-amber-200";
  if (index === 1) return "bg-gray-50 border-gray-200";
  if (index === 2) return "bg-orange-50 border-orange-200";
  return "bg-white border-gray-100";
}

export default function Leaderboard() {
  const [activeLevel, setActiveLevel] = React.useState("easy");

  const { data: results, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: () => base44.entities.GameResult.list("-score", 200),
    initialData: [],
  });

  const filtered = results
    .filter((r) => r.level === activeLevel)
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50 pb-8">
      <div className="px-4 pt-4 max-w-md mx-auto">
        <a href={createPageUrl("Home")}>
          <Button
            variant="ghost"
            className="mb-4 text-gray-500 hover:text-gray-700 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Назад
          </Button>
        </a>

        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-7 h-7 text-amber-500" />
          <h1 className="text-2xl font-extrabold text-gray-800">Таблица лидеров</h1>
        </div>

        {/* Level tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          {levelTabs.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setActiveLevel(lvl)}
              className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeLevel === lvl
                  ? `${levelColors[lvl]} text-white shadow-md`
                  : "bg-white text-gray-500 border border-gray-200"
              }`}
            >
              {LEVEL_LABELS[lvl]}
            </button>
          ))}
        </div>

        {/* Results list */}
        <div className="space-y-2">
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-2xl" />
            ))}

          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🏆</p>
              <p>Пока нет результатов</p>
              <p className="text-sm">Будь первым!</p>
            </div>
          )}

          {filtered.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-3 p-4 rounded-2xl border ${getRankBg(index)}`}
            >
              <div className="flex-shrink-0">{getMedalIcon(index)}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 truncate">{result.player_name}</p>
                <p className="text-xs text-gray-400">
                  {result.correct_answers}/{result.total_questions} верных
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-extrabold text-lg text-violet-600">{result.score}</p>
                <p className="text-xs text-gray-400">очков</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}