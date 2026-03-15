import React, { useState, useRef, useEffect } from "react";
import { createPageUrl } from "@/utils";
import { Calculator, Table2, Wrench } from "lucide-react";

export default function ToolsDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
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
        className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
        title="Инструменты"
      >
        <Wrench className="w-5 h-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-11 bg-white rounded-xl shadow-lg border border-gray-100 py-1 w-52 z-50">
          <a
            href={createPageUrl("Calculator")}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 transition-colors"
          >
            <Calculator className="w-4 h-4 text-violet-500" />
            Калькулятор
          </a>
          <a
            href={createPageUrl("MultiplicationTable")}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 transition-colors"
          >
            <Table2 className="w-4 h-4 text-violet-500" />
            Таблица умножения
          </a>
        </div>
      )}
    </div>
  );
}
