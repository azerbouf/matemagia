import React from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Home, X } from "lucide-react";

export default function ExitConfirmDialog({ open, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            className="bg-white rounded-3xl p-6 w-full max-w-xs shadow-2xl text-center"
          >
            <div className="text-5xl mb-4">🚪</div>
            <h2 className="text-xl font-extrabold text-gray-800 mb-2">Выйти из игры?</h2>
            <p className="text-gray-400 text-sm mb-6">
              Прогресс не сохранится. Ты уверен?
            </p>
            <div className="space-y-2">
              <Button
                onClick={onConfirm}
                className="w-full h-12 rounded-2xl font-bold bg-gradient-to-r from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600 text-white"
              >
                <Home className="w-4 h-4 mr-2" />
                Да, выйти
              </Button>
              <Button
                onClick={onCancel}
                variant="outline"
                className="w-full h-12 rounded-2xl font-bold border-2 border-gray-200 text-gray-600"
              >
                <X className="w-4 h-4 mr-2" />
                Остаться
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}