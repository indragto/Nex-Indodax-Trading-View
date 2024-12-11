import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Bar,
  Line,
} from "recharts";

// Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { date, open, high, low, close, volume } = payload[0].payload;
    return (
      <div className="p-2 bg-gray-900 text-white rounded">
        <p className="font-bold">Date: {date}</p>
        <p>Open: {open}</p>
        <p>High: {high}</p>
        <p>Low: {low}</p>
        <p>Close: {close}</p>
        <p>Volume: {volume}</p>
      </div>
    );
  }
  return null;
};

const TradingChart = ({ symbol = "gmmtidr", tf = 15, autoRefreshInterval = 60000 }) => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get current timestamp and 24 hours earlier
      const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
      const past24Hours = now - 24 * 60 * 60; // 24 hours earlier

      const response = await fetch(
        `https://indodax.com/tradingview/history_v2?from=${past24Hours}&symbol=${symbol}&tf=${tf}&to=${now}`
      );
      const data = await response.json();

      if (Array.isArray(data)) {
        const transformedData = data.map((item) => ({
          date: new Date(item.Time * 1000).toLocaleString(), // Convert timestamp to readable time
          open: item.Open,
          high: item.High,
          low: item.Low,
          close: item.Close,
          volume: parseFloat(item.Volume),
        }));
        setChartData(transformedData);
      } else {
        console.error("Invalid API response structure:", data);
      }
    } catch (error) {
      console.error("Error fetching chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup interval for auto-fetch
    const intervalId = setInterval(fetchData, autoRefreshInterval);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [symbol, tf, autoRefreshInterval]); // Re-run effect when these dependencies change

  // if (loading) {
  //   return <p className="text-white text-center">Loading...</p>;
  // }

  return (
    <div className="w-full h-96 bg-gray-800 p-4">
      <ResponsiveContainer>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          {/* X-Axis */}
          <XAxis
            dataKey="date"
            tick={{ fill: "#fff" }}
            tickLine={{ stroke: "#444" }}
            axisLine={{ stroke: "#444" }}
          />
          {/* Y-Axis for Price */}
          <YAxis
            yAxisId="price"
            domain={["dataMin - 5", "dataMax + 5"]}
            tick={{ fill: "#fff" }}
            tickLine={{ stroke: "#444" }}
            axisLine={{ stroke: "#444" }}
          />
          {/* Y-Axis for Volume */}
          <YAxis
            yAxisId="volume"
            orientation="right"
            tick={{ fill: "#8884d8" }}
            tickFormatter={(value) => `${value / 1000}K`} // Simplify large numbers
          />
          <Tooltip content={<CustomTooltip />} />
          {/* Volume Bar */}
          <Bar
            dataKey="volume"
            fill="#8884d8"
            yAxisId="volume"
            barSize={20}
          />
          {/* Candlestick Lines */}
          <Line
            type="monotone"
            dataKey="high"
            stroke="#00ff00"
            dot={false}
            yAxisId="price"
          />
          <Line
            type="monotone"
            dataKey="low"
            stroke="#ff0000"
            dot={false}
            yAxisId="price"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TradingChart;
