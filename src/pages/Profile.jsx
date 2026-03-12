import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/api/supabaseClient";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Camera, Save, Loader2, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import { ACHIEVEMENTS } from "../components/game/achievementsConfig";

export default function Profile() {
  const { user, profile, isAuthenticated, isLoading: authLoading, loadProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = createPageUrl("Home");
    }
  }, [authLoading, isAuthenticated]);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || user?.user_metadata?.full_name || "");
      setAge(profile.age ? String(profile.age) : "");
    } else if (user) {
      setDisplayName(user.user_metadata?.full_name || "");
    }
  }, [profile, user]);

  const badges = profile?.badges || [];

  const handleSave = async () => {
    setSaving(true);
    if (profile) {
      await supabase
        .from('player_profiles')
        .update({ display_name: displayName, age: age ? Number(age) : null })
        .eq('id', profile.id);
    } else {
      await supabase
        .from('player_profiles')
        .insert({ user_id: user.id, display_name: displayName, age: age ? Number(age) : null, badges: [] });
    }
    await loadProfile(user.id);
    setSaving(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingAvatar(true);

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

    if (profile) {
      await supabase
        .from('player_profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);
    } else {
      await supabase
        .from('player_profiles')
        .insert({ user_id: user.id, avatar_url: publicUrl, display_name: displayName, badges: [] });
    }
    await loadProfile(user.id);
    setUploadingAvatar(false);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-indigo-50">
      <div className="px-4 py-6 max-w-md mx-auto pb-12">
        <a href={createPageUrl("Home")}>
          <Button variant="ghost" className="mb-4 text-gray-500 hover:text-gray-700 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Назад
          </Button>
        </a>

        <h1 className="text-2xl font-extrabold text-gray-800 mb-6">Мой профиль</h1>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-violet-100 border-4 border-violet-200 shadow-lg">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl font-extrabold text-violet-400">
                  {(displayName || "?")[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 bg-violet-500 text-white rounded-full p-2 shadow-lg hover:bg-violet-600 transition-all disabled:opacity-60"
            >
              {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
          </div>
          <p className="text-sm text-gray-400 mt-3">{user.email}</p>
        </div>

        {/* Form */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Игровое имя</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Как тебя называть?"
              className="h-12 rounded-2xl border-2 border-gray-200 focus:border-violet-400"
              maxLength={20}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-600 mb-1.5 block">Возраст</label>
            <Input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Сколько лет?"
              className="h-12 rounded-2xl border-2 border-gray-200 focus:border-violet-400"
              min={4}
              max={100}
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-violet-500 to-indigo-500 shadow-lg shadow-violet-200 mb-8"
        >
          {saving ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
          Сохранить
        </Button>

        {/* Stats link */}
        <a href={createPageUrl("Stats")}>
          <Button
            variant="outline"
            className="w-full h-12 rounded-2xl border-2 border-violet-200 text-violet-600 hover:bg-violet-50 mb-8"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Статистика прогресса
          </Button>
        </a>

        {/* Badges */}
        <div>
          <h2 className="text-lg font-extrabold text-gray-800 mb-4">🏅 Мои достижения</h2>
          {badges.length === 0 ? (
            <div className="text-center py-8 bg-white/60 rounded-2xl text-gray-400 border border-gray-100">
              <p className="text-3xl mb-2">🎯</p>
              <p className="text-sm font-medium">Пока нет достижений</p>
              <p className="text-xs mt-1 text-gray-300">Сыграй и заработай первые бейджи!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {ACHIEVEMENTS.filter((a) => badges.includes(a.id)).map((badge) => (
                <motion.div
                  key={badge.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-white border-2 border-violet-100 rounded-2xl p-3 flex items-center gap-3 shadow-sm"
                >
                  <span className="text-2xl">{badge.emoji}</span>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{badge.title}</p>
                    <p className="text-xs text-gray-400">{badge.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
