export function calculateSMA(data, period) {
  return data.map((val, idx, arr) => {
    if (idx < period - 1) return null;
    const slice = arr.slice(idx - period + 1, idx + 1);
    return slice.reduce((a, b) => a + b, 0) / period;
  });
}

export function calculateEMA(data, period) {
  const k = 2 / (period + 1);
  let emaArray = [];
  data.forEach((val, idx) => {
    if (idx === 0) {
      emaArray.push(val);
    } else {
      emaArray.push(val * k + emaArray[idx - 1] * (1 - k));
    }
  });
  return emaArray;
}

export function calculateRSI(data, period = 14) {
  let gains = [], losses = [];
  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let rsiArray = [];
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsiArray.push(100 - 100 / (1 + rs));
  }
  return Array(period).fill(null).concat(rsiArray);
}

export function calculateBollingerBands(data, period = 20, multiplier = 2) {
  const sma = calculateSMA(data, period);
  const upper = [], lower = [];

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = data.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / period;
      const stdDev = Math.sqrt(
        slice.reduce((acc, val) => acc + (val - mean) ** 2, 0) / period
      );
      upper.push(mean + multiplier * stdDev);
      lower.push(mean - multiplier * stdDev);
    }
  }

  return { upper, lower };
}
