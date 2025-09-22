import React, { useState } from "react";
import Navbar from "./components/Header";
import KpiCard from "./components/KpiCard";
import ComparativeChart from "./components/ComparativeChart";
import DataTable from "./components/DataTable";

function App() {
  const [period, setPeriod] = useState(30);
  const [darkMode, setDarkMode] = useState(true);
  const symbols = ["AAPL", "MSFT", "GOOGL", "TSLA", "NVDA", "META"];

  return (
    <div
      className={`${
        darkMode ? "dark" : ""
      } font-sans min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-colors`}
    >
      <Navbar
        period={period}
        setPeriod={setPeriod}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* KPIs Cards */}
      <section className="p-6 pt-20 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
        {symbols.map((symbol) => (
          <KpiCard key={`${symbol}-${period}`} symbol={symbol} days={period} />
        ))}
      </section>

      {/* Comparative Chart */}
      <section className="p-6">
        <ComparativeChart symbols={symbols} period={period} />
      </section>

      {/* Data Table */}
      <section className="p-6">
        <DataTable symbols={symbols} period={period} />
      </section>
    </div>
  );
}

export default App;
