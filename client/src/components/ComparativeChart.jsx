import React, { useEffect, useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import { fetchDailyFromBackend } from "../services/api";

export default function ComparativeChart({ symbols, period }) {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const colors = [
    "rgb(75,192,192)",
    "rgb(255,99,132)",
    "rgb(54,162,235)",
    "rgb(255,206,86)",
    "rgb(153,102,255)",
    "rgb(255,159,64)",
    "rgb(99,255,132)",
    "rgb(200,100,200)",
  ];

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      setError(null);

      try {
        const results = await Promise.all(
          symbols.map((symbol) =>
            fetchDailyFromBackend(symbol, period).catch((err) => {
              console.error("Error en comparativa:", symbol, err);
              return null;
            })
          )
        );

        const datasets = [];
        let labels = [];

        results.forEach((payload, idx) => {
          const realData = payload?.data;
          if (!realData?.labels?.length) return;
          if (labels.length === 0) labels = realData.labels;

          const color = colors[idx % colors.length];
          datasets.push({
            label: symbols[idx],
            data: realData.data,
            borderColor: color,
            backgroundColor: color.replace(")", ",0.2)"),
            tension: 0.3,
            pointRadius: 0,
            borderWidth: 2,
          });
        });

        if (!datasets.length) {
          setError("No hay datos válidos para mostrar.");
        } else {
          setChartData({ labels, datasets });
        }
      } catch (e) {
        setError("Error al cargar la comparativa.", e);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, [symbols, period]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: true, position: "bottom" },
        tooltip: { mode: "index", intersect: false },
      },
      interaction: { mode: "nearest", intersect: false },
      scales: {
        x: { display: true },
        y: { display: true, beginAtZero: false },
      },
    }),
    []
  );

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Cargando comparativa...
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-center text-red-600 dark:text-red-400">
        {error}
      </div>
    );

  return (
    <div className="bg-white dark:bg-gray-700 p-5 rounded-xl shadow w-full h-96">
      <Line data={chartData} options={options} />
    </div>
  );
}
