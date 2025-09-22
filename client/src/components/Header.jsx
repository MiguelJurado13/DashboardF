import React from "react";

export default function Navbar({ period, setPeriod, darkMode, setDarkMode }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow p-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Dashboard Financiero
      </h1>

      <div className="flex flex-wrap items-center gap-4">
        {/* Selector de periodo */}
        <div>
          <label className="mr-2 text-gray-700 dark:text-gray-200">
            Periodo:
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(Number(e.target.value))}
            className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
          >
            <option value={7}>Últimos 7 días</option>
            <option value={30}>Últimos 30 días</option>
            <option value={90}>Últimos 90 días</option>
          </select>
        </div>

        {/* Toggle Dark Mode */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="px-3 py-1 rounded border dark:border-gray-600"
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
    </header>
  );
}
