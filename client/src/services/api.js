export async function fetchDailyFromBackend(symbol = "AAPL", days = 30) {
  const resp = await fetch(
    `https://dashboardf-lo21.onrender.com/api/daily/${encodeURIComponent(symbol)}?days=${days}`,
    { cache: "no-store" }
  );

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({ error: "Error Desconocido " }));
    throw new Error(err.error || JSON.stringify(err));
  }

  const json = await resp.json();
  
  const actualPayload = json.payload?.data ?? json.data ?? json;

  return { data: actualPayload };
}
