import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { fetchDailyFromBackend } from "../services/api";
import {
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateBollingerBands,
} from "../utils/indicators";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function KpiCard({ symbol = "AAPL", days = 30 }) {
  const [priceChartData, setPriceChartData] = useState(null);
  const [rsiChartData, setRsiChartData] = useState(null);
  const [kpiStats, setKpiStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    fetchDailyFromBackend(symbol, days)
      .then((payload) => {
        const realData = payload?.data;
        if (!realData?.labels?.length || !realData?.data?.length) {
          setError("Datos inválidos");
          return;
        }

        const values = realData.data;
        const latest = values[values.length - 1];
        const prev = values[values.length - 2] || latest;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const stdDev = Math.sqrt(
          values.reduce((acc, val) => acc + (val - mean) ** 2, 0) /
            values.length
        ).toFixed(2);
        const trend = latest >= prev ? "up" : "down";

        const sma = calculateSMA(values, 7);
        const ema = calculateEMA(values, 14);
        const rsi = calculateRSI(values, 14);
        const bb = calculateBollingerBands(values, 20);

        if (mounted) {
          setPriceChartData({
            labels: realData.labels,
            datasets: [
              {
                label: `${symbol} - Cierre`,
                data: values,
                borderColor:
                  trend === "up" ? "rgb(34,197,94)" : "rgb(239,68,68)",
                backgroundColor:
                  trend === "up"
                    ? "rgba(34,197,94,0.2)"
                    : "rgba(239,68,68,0.2)",
                fill: true,
                tension: 0.3,
                borderWidth: 2,
                pointRadius: 0,
              },
              {
                label: "SMA 7",
                data: sma,
                borderColor: "rgb(59,130,246)",
                tension: 0.3,
                fill: false,
                borderWidth: 2,
                pointRadius: 0,
              },
              {
                label: "EMA 14",
                data: ema,
                borderColor: "rgb(14,165,233)",
                tension: 0.3,
                fill: false,
                borderWidth: 2,
                pointRadius: 0,
              },
              {
                label: "Bollinger Upper",
                data: bb.upper,
                borderColor: "rgb(156,163,175)",
                tension: 0.3,
                fill: false,
                borderWidth: 1,
                pointRadius: 0,
              },
              {
                label: "Bollinger Lower",
                data: bb.lower,
                borderColor: "rgb(156,163,175)",
                tension: 0.3,
                fill: false,
                borderWidth: 1,
                pointRadius: 0,
              },
            ],
          });

          setRsiChartData({
            labels: realData.labels,
            datasets: [
              {
                label: "RSI 14",
                data: rsi,
                borderColor: "rgb(251,191,36)",
                tension: 0.3,
                fill: false,
                borderWidth: 2,
                pointRadius: 0,
              },
            ],
          });

          setKpiStats({
            latest,
            change: ((latest - prev) / prev) * 100,
            max: Math.max(...values),
            min: Math.min(...values),
            avg: mean.toFixed(2),
            stdDev,
            trend,
          });
        }
      })
      .catch((e) => mounted && setError(e.message || "Error al obtener datos"))
      .finally(() => mounted && setLoading(false));

    return () => (mounted = false);
  }, [symbol, days]);

  if (loading)
    return (
      <div className="flex justify-center items-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
        <span className="ml-3">Cargando {symbol}...</span>
      </div>
    );

  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow hover:scale-105 transition-transform w-full space-y-4">
      {/* Header KPI */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <h3 className="text-lg font-semibold">{symbol}</h3>
        <p
          className={`text-xl font-bold ${
            kpiStats.trend === "up" ? "text-green-600" : "text-red-600"
          }`}
        >
          {kpiStats.trend === "up" ? "▲" : "▼"} {kpiStats.change.toFixed(2)}%
        </p>
      </div>

      <p className="text-3xl font-bold">{kpiStats.latest}</p>

      {/* Stats rápidos */}
      <div className="text-xs mt-2 flex flex-wrap justify-between w-full px-2 opacity-80 gap-2">
        <span>Max: {kpiStats.max}</span>
        <span>Min: {kpiStats.min}</span>
        <span>Prom: {kpiStats.avg}</span>
        <span>Vol: {kpiStats.stdDev}</span>
      </div>

      {/* Gráfico de Precio */}
      <div className="w-full h-52 sm:h-64 md:h-72">
        <Line
          key={`${symbol}-price`}
          data={priceChartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, position: "bottom" } },
            interaction: { mode: "index", intersect: false },
            scales: {
              x: { display: true },
              y: { display: true },
            },
          }}
        />
      </div>

      {/* Gráfico RSI */}
      <div className="w-full h-28 sm:h-32 md:h-36">
        <Line
          key={`${symbol}-rsi`}
          data={rsiChartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true, position: "bottom" } },
            interaction: { mode: "index", intersect: false },
            scales: {
              x: { display: false },
              y: { min: 0, max: 100 },
            },
          }}
        />
      </div>
    </div>
  );
}
