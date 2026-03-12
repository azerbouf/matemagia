import React, { useMemo } from "react";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Gamepad2, Target, Star, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import { LEVEL_LABELS } from "../components/game/mathUtils";

const LEVEL_EMOJI = { easy: '🌟', medium: '⚡', hard: '🔥', bonus: '👑', daily: '📅' };
const LEVEL_BAR_COLORS = {
  easy: 'from-green-400 to-emerald-400',
  medium: 'from-amber-400 to-orange-400',
  hard: 'from-rose-400 to-red-400',
  bonus: 'from-violet-400 to-purple-400',
  daily: 'from-pink-400 to-rose-400',
};

function formatGameDate(isoStr) {
  if (!isoStr) return '';
  const dateStr = isoStr.slice(0, 10);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
  if (dateStr === today) return 'Сегодня';
  if (dateStr === yesterday) return 'Вчера';
  const months = ['янв','фев','мар','апр','май','июн','июл','авг','сен','окт','ноя','дек'];
  const d = new Date(isoStr);
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

function getActivityData(results) {
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().slice(0, 10),
      label: String(d.getDate()),
      count: 0,
      totalScore: 0,
      totalCorrect: 0,
      totalQuestions: 0,
    });
  }
  for (const r of results) {
    const rDate = r.created_at?.slice(0, 10);
    const day = days.find(d => d.date === rDate);
    if (day) {
      day.count += 1;
      day.totalScore += r.score;
      day.totalCorrect += r.correct_answers;
      day.totalQuestions += r.total_questions;
    }
  }
  return days;
}

function getLevelStats(results) {
  const levels = ['easy', 'medium', 'hard', 'bonus', 'daily'];
  return levels.map(level => {
    const games = results.filter(r => r.level === level);
    if (games.length === 0) return null;
    const totalScore = games.reduce((s, r) => s + r.score, 0);
    const totalCorrect = games.reduce((s, r) => s + r.correct_answers, 0);
    const totalQuestions = games.reduce((s, r) => s + r.total_questions, 0);
    return {
      level,
      games: games.length,
      avgScore: Math.round(totalScore / games.length),
      accuracy: totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0,
    };
  }).filter(Boolean);
}

function ActivityChart({ data }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-4 h-4 text-violet-500" />
        <h3 className="text-sm font-bold text-gray-700">Активность за 14 дней</h3>
      </div>
      <div className="flex items-end gap-[3px] h-24">
        {data.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            {d.count > 0 && (
              <span className="text-[8px] font-bold text-violet-500 leading-none">{d.count}</span>
            )}
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: d.count > 0 ? `${Math.max((d.count / maxCount) * 100, 10)}%` : '0%' }}
              transition={{ duration: 0.5, delay: i * 0.03 }}
              className="w-full rounded-t bg-gradient-to-t from-violet-500 to-violet-300"
              style={{ minHeight: d.count > 0 ? 4 : 0 }}
            />
            <span className={`text-[9px] leading-none ${i === data.length - 1 ? 'text-violet-600 font-bold' : 'text-gray-400'}`}>
              {d.label}
            </span>
          </div>
        ))}
      </div>
      {data.every(d => d.count === 0) && (
        <p className="text-center text-xs text-gray-400 mt-2">Пока нет данных</p>
      )}
    </div>
  );
}

function AccuracyTrend({ data }) {
  const withGames = data.filter(d => d.count > 0);
  if (withGames.length < 2) return null;

  const points = [];
  const w = 280, h = 60, px = 8, py = 6;
  const accs = withGames.map(d => Math.round((d.totalCorrect / d.totalQuestions) * 100));
  const minA = Math.min(...accs);
  const maxA = Math.max(...accs);
  const range = maxA - minA || 1;

  withGames.forEach((d, i) => {
    const acc = Math.round((d.totalCorrect / d.totalQuestions) * 100);
    const x = px + (i / (withGames.length - 1)) * (w - 2 * px);
    const y = h - py - ((acc - minA) / range) * (h - 2 * py);
    points.push({ x, y, acc, label: d.label });
  });

  const polyline = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-emerald-500" />
        <h3 className="text-sm font-bold text-gray-700">Точность по дням</h3>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ height: 70 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        {points.length > 1 && (
          <polygon
            fill="url(#areaGrad)"
            points={`${points[0].x},${h - py} ${polyline} ${points[points.length - 1].x},${h - py}`}
          />
        )}
        <polyline fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={polyline} />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="#10b981" />
            <text x={p.x} y={p.y - 7} textAnchor="middle" fontSize="8" fontWeight="bold" fill="#059669">{p.acc}%</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function LevelBreakdown({ stats }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-4 h-4 text-amber-500" />
        <h3 className="text-sm font-bold text-gray-700">По уровням</h3>
      </div>
      <div className="space-y-3">
        {stats.map(s => (
          <div key={s.level}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{LEVEL_EMOJI[s.level]}</span>
                <span className="text-xs font-bold text-gray-700">{LEVEL_LABELS[s.level]}</span>
              </div>
              <span className="text-xs text-gray-400">
                {s.games} {s.games === 1 ? 'игра' : s.games < 5 ? 'игры' : 'игр'} · ø{s.avgScore} очков
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${s.accuracy}%` }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className={`h-full rounded-full bg-gradient-to-r ${LEVEL_BAR_COLORS[s.level]}`}
                />
              </div>
              <span className="text-xs font-bold text-gray-600 w-9 text-right">{s.accuracy}%</span>
            </div>
          </div>
        ))}
        {stats.length === 0 && (
          <p className="text-center text-xs text-gray-400 py-2">Пока нет данных</p>
        )}
      </div>
    </div>
  );
}

function RecentGames({ games }) {
  if (games.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Gamepad2 className="w-4 h-4 text-violet-500" />
        <h3 className="text-sm font-bold text-gray-700">Последние игры</h3>
      </div>
      <div className="space-y-0">
        {games.slice(0, 10).map((g, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
            <span className="text-lg leading-none">{LEVEL_EMOJI[g.level] || '🎮'}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-700">{LEVEL_LABELS[g.level] || g.level}</p>
              <p className="text-[11px] text-gray-400">{formatGameDate(g.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-violet-600">{g.score}</p>
              <p className="text-[11px] text-gray-400">{g.correct_answers}/{g.total_questions}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Stats() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: results, isLoading } = useQuery({
    queryKey: ["stats", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
    initialData: [],
  });

  const { totalGames, totalCorrect, totalQuestions, totalScore, gamesThisWeek, activity, levelStats } = useMemo(() => {
    const totalGames = results.length;
    const totalCorrect = results.reduce((s, r) => s + r.correct_answers, 0);
    const totalQuestions = results.reduce((s, r) => s + r.total_questions, 0);
    const totalScore = results.reduce((s, r) => s + r.score, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = weekAgo.toISOString().slice(0, 10);
    const gamesThisWeek = results.filter(r => r.created_at?.slice(0, 10) >= weekStr).length;

    return {
      totalGames,
      totalCorrect,
      totalQuestions,
      totalScore,
      gamesThisWeek,
      activity: getActivityData(results),
      levelStats: getLevelStats(results),
    };
  }, [results]);

  const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4">
        <p className="text-gray-500 mb-4">Войди в аккаунт, чтобы видеть статистику</p>
        <a href={createPageUrl("Home")}>
          <Button className="rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500">
            На главную
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50">
      <div className="px-4 py-6 max-w-md mx-auto pb-12">
        <a href={createPageUrl("Profile")}>
          <Button variant="ghost" className="mb-4 text-gray-500 hover:text-gray-700 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Профиль
          </Button>
        </a>

        <h1 className="text-2xl font-extrabold text-gray-800 mb-6">📊 Статистика</h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overview cards */}
            <div className="grid grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0 }}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Gamepad2 className="w-4 h-4 text-violet-500" />
                  <span className="text-xs text-gray-400">Всего игр</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-800">{totalGames}</p>
                <p className="text-[11px] text-gray-400">{gamesThisWeek} за неделю</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-gray-400">Точность</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-800">{accuracy}%</p>
                <p className="text-[11px] text-gray-400">{totalCorrect} из {totalQuestions}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-gray-400">Всего очков</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-800">{totalScore.toLocaleString()}</p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-1">
                  <CalendarDays className="w-4 h-4 text-pink-500" />
                  <span className="text-xs text-gray-400">Ср. за игру</span>
                </div>
                <p className="text-2xl font-extrabold text-gray-800">
                  {totalGames > 0 ? Math.round(totalScore / totalGames) : 0}
                </p>
                <p className="text-[11px] text-gray-400">очков</p>
              </motion.div>
            </div>

            {/* Activity chart */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <ActivityChart data={activity} />
            </motion.div>

            {/* Accuracy trend */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <AccuracyTrend data={activity} />
            </motion.div>

            {/* Per-level breakdown */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <LevelBreakdown stats={levelStats} />
            </motion.div>

            {/* Recent games */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <RecentGames games={results} />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
