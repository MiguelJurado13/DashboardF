require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const fsp = require("fs").promises;
const path = require("path");

const app = express();
app.use(cors());

const PORT = process.env.PORT || 4000;
const API_KEY = process.env.ALPHA_VANTAGE_KEY;
if (!API_KEY) {
  console.log("Falta API KEY");
  process.exit(1);
}

const CACHE_DIR = path.resolve(process.cwd(), "cache");
const TTL_MS = 1000 * 60 * 60 * 24; //24 Horas de cache disponibles

if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });

function cachePath(symbol, days) {
  return path.join(CACHE_DIR, `${symbol.toUpperCase()}_${days}.json`);
}

async function readCache(symbol, days) {
  try {
    const p = cachePath(symbol, days);
    const stat = await fsp.stat(p);
    const age = Date.now() - stat.mtimeMs;
    if (age > TTL_MS) return null;
    const txt = await fsp.readFile(p, "utf-8");
    return JSON.parse(txt);
  } catch (e) {
    return null;
  }
}

async function writeCache(symbol, days, data) {
  await fsp.writeFile(
    cachePath(symbol),
    JSON.stringify(data), 
    "utf-8"
  );  
}

app.get("/api/daily/:symbol", async (req, res) => {
  try {
    const symbol = (req.params.symbol || "").toUpperCase();
    const days = parseInt(req.query.days) || 30;

    //Dev: devuelve el cache si existe
    const cached = await readCache(symbol, days);
    if (cached) return res.json({ source: "cache", payload: cached });

    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${encodeURIComponent(
      symbol
    )}&outputsize=compact&apikey=${API_KEY}`;

    const r = await fetch(url);
    const json = await r.json();
    console.log("DEBUG Alpha response:", JSON.stringify(json, null, 2));

    //Aqui se manejan los errores que haya con Alpha
    if (json["Error Message"])
      return res.status(400).json({
        error: "Simbolo Invalido o request Mal formado",
        detail: json,
      });
    if (json.Note || json["information"]) {
      //Mensaje cuando se excede el limite
      return res.status(425).json({
        error: "Limite de uso / Respuesta de Alpha",
        detail: json.Note || json["information"],
      });
    }

    const series = json["Time Series (Daily)"];

    if (!series)
      return res
        .status(500)
        .json({ error: "Respuesta Inesperada de Alpha", raw: json });

    const allDates = Object.keys(series).sort(); //Aacendiente por Fecha
    const labels = allDates.slice(-days); //Ultimos dias
    const data = labels.map((d) => parseFloat(series[d]["4. close"]));

    const payload = { symbol, fetchedAt: Date.now(), labels, data };

    //Guardamos el Cache
    await writeCache(symbol, days, payload);

    return res.json({ source: "api", payload });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ error: "Error del Serv", detail: err.message });
  }
});

app.listen(PORT, () =>
  console.log(`API proxy escuchando en https://localhost:${PORT}`)
);
