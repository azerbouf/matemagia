import React, { useState } from "react";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import LevelSelect from "../components/game/LevelSelect";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trophy, Loader2, Sparkles, LogIn, User, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { user, profile, isAuthenticated, isLoading } = useAuth();
  const [mode, setMode] = useState(null); // null | "guest" | "play" | "email-login"
  const [guestName, setGuestName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  if (isLoading) {
    return (
      <div className="h-[100dvh] flex items-center justify-center bg-gradient-to-b from-violet-50 to-indigo-50">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && mode !== "play") {
    setMode("play");
  }

  const handleLevelSelect = (level) => {
    const name = isAuthenticated
      ? (profile?.display_name || user?.user_metadata?.full_name || "Игрок")
      : guestName;
    window.location.href =
      createPageUrl("Game") +
      `?name=${encodeURIComponent(name)}&level=${level}&guest=${isAuthenticated ? "0" : "1"}`;
  };

  const handleGuestSubmit = (e) => {
    e.preventDefault();
    if (guestName.trim()) setMode("play");
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);

    let result;
    if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }

    if (result.error) {
      setAuthError(result.error.message);
      setAuthLoading(false);
    } else {
      if (isSignUp && result.data?.user?.identities?.length === 0) {
        setAuthError("Аккаунт уже существует. Попробуй войти.");
        setAuthLoading(false);
      } else {
        setMode("play");
        setAuthLoading(false);
      }
    }
  };

  // Landing screen
  if (mode === null) {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-violet-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center w-full max-w-xs"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="mb-3"
          >
            <img src="/logo.png" alt="МатеМагия" className="w-20 h-20 mx-auto" />
          </motion.div>
          <h1 className="text-4xl font-extrabold text-center bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-1">
            МатеМагия
          </h1>
          <p className="text-gray-400 text-center text-sm mb-8">
            Реши задачки и стань чемпионом!
          </p>

          <div className="w-full space-y-3">
            <Button
              onClick={() => setMode("email-login")}
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

  // Email login/signup
  if (mode === "email-login") {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-violet-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xs"
        >
          <div className="text-5xl text-center mb-4">
            <Mail className="w-12 h-12 mx-auto text-violet-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-800 text-center mb-1">
            {isSignUp ? "Регистрация" : "Вход"}
          </h2>
          <p className="text-gray-400 text-sm text-center mb-6">
            {isSignUp ? "Создай аккаунт" : "Войди в свой аккаунт"}
          </p>

          {/* OAuth buttons */}
          <div className="space-y-2 mb-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/Home' } })}
              className="w-full h-12 rounded-2xl border-2 border-gray-200 text-gray-700 hover:bg-gray-50 font-bold"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Войти через Google
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400">или по email</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="text-center text-base h-12 rounded-2xl border-2 border-violet-200 focus:border-violet-500"
              required
              autoFocus
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Пароль"
              className="text-center text-base h-12 rounded-2xl border-2 border-violet-200 focus:border-violet-500"
              required
              minLength={6}
            />
            {authError && (
              <p className="text-red-500 text-sm text-center">{authError}</p>
            )}
            <Button
              type="submit"
              disabled={authLoading}
              className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-violet-500 to-indigo-500 disabled:opacity-40 shadow-lg shadow-violet-200"
            >
              {authLoading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <LogIn className="w-5 h-5 mr-2" />}
              {isSignUp ? "Зарегистрироваться" : "Войти"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setIsSignUp(!isSignUp); setAuthError(""); }}
              className="w-full rounded-2xl text-violet-500"
            >
              {isSignUp ? "Уже есть аккаунт? Войти" : "Нет аккаунта? Зарегистрироваться"}
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

  // Guest name input
  if (mode === "guest") {
    return (
      <div className="h-[100dvh] bg-gradient-to-b from-violet-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4 overflow-hidden">
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
    <div className="h-[100dvh] bg-gradient-to-b from-violet-50 via-white to-indigo-50 flex flex-col overflow-hidden">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <LevelSelect
          playerName={isAuthenticated ? (profile?.display_name || user?.user_metadata?.full_name) : guestName}
          onSelect={handleLevelSelect}
        />
        <div className="px-4 max-w-md mx-auto pt-6 pb-8 space-y-3">
          <a href={createPageUrl("Leaderboard")}>
            <Button
              variant="outline"
              className="w-full h-11 rounded-2xl border-2 border-amber-200 text-amber-700 hover:bg-amber-50"
            >
              <Trophy className="w-5 h-5 mr-2" />
              Таблица лидеров
            </Button>
          </a>
          {!isAuthenticated && (
            <Button
              onClick={() => setMode("email-login")}
              variant="outline"
              className="w-full h-11 rounded-2xl border-2 border-violet-200 text-violet-600 hover:bg-violet-50 mt-2"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Войти в аккаунт
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
