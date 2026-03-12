import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function NameInput({ onSubmit }) {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[70vh] px-4"
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
        className="text-6xl mb-6"
      >
        🧮
      </motion.div>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-center bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">
        МатеМагия
      </h1>
      <p className="text-gray-500 text-center mb-8 text-sm sm:text-base">
        Реши задачки и стань чемпионом!
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <div className="relative">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Как тебя зовут?"
            className="text-center text-lg h-14 rounded-2xl border-2 border-violet-200 focus:border-violet-500 bg-white shadow-sm"
            maxLength={20}
          />
        </div>
        <Button
          type="submit"
          disabled={!name.trim()}
          className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600 shadow-lg shadow-violet-200 transition-all duration-300 disabled:opacity-40"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Начать игру!
        </Button>
      </form>
    </motion.div>
  );
}