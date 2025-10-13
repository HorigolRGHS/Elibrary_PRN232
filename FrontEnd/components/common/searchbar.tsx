"use client";
import { FC } from "react";

export const SearchBar: FC<SearchBarProps> = ({
  value,
  loading = false,
  placeholder = "Search...",
  onChange,
  onSearch,
}) => {
  return (
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border rounded px-3 py-2 w-80"
        disabled={loading}
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={onSearch}
        disabled={loading}
      >
        Search
      </button>
    </div>
  );
};
