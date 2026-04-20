// src/components/graph/SearchBar.tsx
"use client";
import React, { useState } from 'react';

type Props = {
  onSearch: (name: string) => void;
};

export const SearchBar = ({ onSearch }: Props) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50">
      <form onSubmit={handleSubmit} className="flex gap-2 group">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="星の名前を入力..."
          className="
            w-80 px-6 py-3 
            /* 修正：完全に白、文字は黒 */
            bg-white 
            text-black 
            placeholder:text-gray-400
            /* ------------------ */
            border-2 border-white
            rounded-full 
            outline-none 
            focus:border-purple-500 
            shadow-[0_0_30px_rgba(0,0,0,0.3)] 
            transition-all 
            font-medium
          "
        />
        <button 
          type="submit"
          className="
            px-8 py-3 
            bg-purple-600 
            hover:bg-purple-500 
            text-white 
            rounded-full 
            font-black 
            tracking-wider 
            transition-all 
            active:scale-90 
            shadow-lg
          "
        >
          探索
        </button>
      </form>
    </div>
  );
};