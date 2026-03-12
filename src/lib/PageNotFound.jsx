import React from 'react';
import { createPageUrl } from '@/utils';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-violet-50 to-indigo-50">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-extrabold text-gray-800 mb-2">Страница не найдена</h1>
      <p className="text-gray-400 mb-6">Такой страницы не существует</p>
      <a
        href={createPageUrl("Home")}
        className="px-6 py-3 bg-violet-500 text-white rounded-2xl font-bold hover:bg-violet-600 transition-all"
      >
        На главную
      </a>
    </div>
  );
}
