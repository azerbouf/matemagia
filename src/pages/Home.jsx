import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import LevelSelect from "../components/game/LevelSelect";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Loader2, Sparkles, LogIn, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(null); // null | "login" | "guest" | "play"
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    base44.auth
      .me()
      .then((u) => {
        setUser(u);
        setMode("play");
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setMode(null);
      });
  }, []);

  const handleLevelSelect = (level) => {
    const name =
      user
        ? (user.display_name || user.full_name || "Игрок")
        : guestName;
    window.location.href =
      createPageUrl("Game") +
      `?name=${encodeURIComponent(name)}&level=${level}&guest=${user ? "0" : "1"}`;
  };

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    if (guestName.trim()) setMode("play");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-violet-50 to-indigo-50">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  // Landing screen
  if (mode === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center w-full max-w-xs"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="text-7xl mb-4"
          >
            🧮
          </motion.div>
          <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            МатеМагия
          </h1>
          <p className="text-gray-400 text-center text-sm mb-10">
            Реши задачки и стань чемпионом!
          </p>

          <div className="w-full space-y-3">
            <Button
              onClick={() => base44.auth.redirectToLogin(createPageUrl("Home"))}
              className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 shadow-lg shadow-violet-200"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Войти / Зарегистрироваться
            </Button>
            <Button
              onClick={() => setMode("guest")}
              variant="outline"
              className="w-full h-14 rounded-2xl text-base font-bold border-2 border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <User className="w-5 h-5 mr-2" />
              Играть как гость
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Guest name input
  if (mode === "guest") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xs"
        >
          <div className="text-5xl text-center mb-4">👤</div>
          <h2 className="text-2xl font-extrabold text-gray-800 text-center mb-1">
            Гостевой вход
          </h2>
          <p className="text-gray-400 text-sm text-center mb-8">
            Введи свой ник для игры
          </p>
          <form onSubmit={handleGuestSubmit} className="space-y-3">
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Твой ник..."
              className="text-center text-lg h-14 rounded-2xl border-2 border-violet-200 focus:border-violet-500"
              maxLength={20}
              autoFocus
            />
            <Button
              type="submit"
              disabled={!guestName.trim()}
              className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-violet-500 to-indigo-500 disabled:opacity-40 shadow-lg shadow-violet-200"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Вперёд!
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMode(null)}
              className="w-full rounded-2xl text-gray-400"
            >
              ← Назад
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Level selection
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50">
      <LevelSelect
        playerName={user ? (user.display_name || user.full_name) : guestName}
        onSelect={handleLevelSelect}
      />
      <div className="px-4 max-w-md mx-auto mt-2 pb-10 space-y-3">
        <a href={createPageUrl("Leaderboard")}>
          <Button
            variant="outline"
            className="w-full h-12 rounded-2xl border-2 border-amber-200 text-amber-700 hover:bg-amber-50"
          >
            <Trophy className="w-5 h-5 mr-2" />
            Таблица лидеров
          </Button>
        </a>
        {!user && (
          <Button
            onClick={() => base44.auth.redirectToLogin(createPageUrl("Home"))}
            variant="outline"
            className="w-full h-12 rounded-2xl border-2 border-violet-200 text-violet-600 hover:bg-violet-50"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Войти в аккаунт
          </Button>
        )}
      </div>
    </div>
  );
}