import React, { useState, useRef, useEffect } from "react";
import { createPageUrl } from "@/utils";
import { LogOut, User } from "lucide-react";

export default function ProfileDropdown({ avatarUrl, displayName, logout }) {
  const [open, setOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setConfirmLogout(false); }
    };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("touchstart", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:ring-2 hover:ring-violet-300"
      >
        {avatarUrl ? (
          <img src={avatarUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-violet-200 flex items-center justify-center text-violet-700 text-sm font-bold">
            {(displayName || "?")[0]?.toUpperCase()}
          </div>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-48 z-50">
          {!confirmLogout ? (
            <>
              <a
                href={createPageUrl("Profile")}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 transition-colors"
              >
                <User className="w-4 h-4 text-violet-500" />
                Профиль
              </a>
              <button
                onClick={() => setConfirmLogout(true)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Выйти
              </button>
            </>
          ) : (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-700 font-medium mb-3">Выйти из аккаунта?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setOpen(false); setConfirmLogout(false); logout(); }}
                  className="flex-1 py-1.5 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  Да
                </button>
                <button
                  onClick={() => setConfirmLogout(false)}
                  className="flex-1 py-1.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Нет
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
