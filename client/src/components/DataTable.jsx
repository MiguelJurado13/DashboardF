import React, { useEffect, useState } from "react";
import { fetchDailyFromBackend } from "../services/api";

export default function DataTable({ symbols, period }) {
  const [kpiData, setKpiData] = useState({});

  useEffect(() => {
    async function fetchAll() {
      const newData = {};
      for (let symbol of symbols) {
        try {
          const payload = await fetchDailyFromBackend(symbol, period);
          const realData = payload?.data;
          if (!realData?.labels?.length) continue;

          const values = realData.data;
          const latest = values[values.length - 1];
          const prev = values[values.length - 2] || latest;
          const change = ((latest - prev) / prev) * 100;
          const max = Math.max(...values);
          const min = Math.min(...values);
          const avg = values.reduce((a, b) => a + b, 0) / values.length;

          newData[symbol] = {
            latest: latest.toFixed(2),
            change: change.toFixed(2),
            max: max.toFixed(2),
            min: min.toFixed(2),
            avg: avg.toFixed(2),
          };
        } catch (err) {
          console.error("Error en tabla:", symbol, err);
        }
      }
      setKpiData(newData);
    }

    fetchAll();
  }, [symbols, period]);

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-700 rounded-xl shadow p-4">
      <table className="min-w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">Símbolo</th>
            <th className="px-4 py-2 border-b">Último</th>
            <th className="px-4 py-2 border-b">Cambio %</th>
            <th className="px-4 py-2 border-b">Máx</th>
            <th className="px-4 py-2 border-b">Min</th>
            <th className="px-4 py-2 border-b">Prom</th>
          </tr>
        </thead>
        <tbody>
          {symbols.map((symbol) => {
            const kpi = kpiData[symbol];
            return (
              <tr key={symbol}>
                <td className="px-4 py-2">{symbol}</td>
                <td className="px-4 py-2">{kpi?.latest || "-"}</td>
                <td
                  className={`px-4 py-2 ${
                    kpi?.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {kpi?.change ? (kpi.change >= 0 ? "+" : "") + kpi.change : "-"}
                </td>
                <td className="px-4 py-2">{kpi?.max || "-"}</td>
                <td className="px-4 py-2">{kpi?.min || "-"}</td>
                <td className="px-4 py-2">{kpi?.avg || "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
