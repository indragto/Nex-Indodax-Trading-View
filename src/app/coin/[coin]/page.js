"use client";

import { use, useEffect, useState } from 'react';
import TradingChart from '@/components/TradingChart';
import { formatToRupiah } from '@/helpers/currency';

export default function Page({ params }) {
  const { coin } = use(params);
  const [coinDetails, setCoinDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchInterval, setFetchInterval] = useState(30000); // Default interval 30 seconds
  const [tf, setTf] = useState(30); // Default timeframe (minutes)
  const [orderBook, setOrderBook] = useState({ buy: [], sell: [] });
  const [prices, setPrices] = useState([]); // Store historical prices for MA/RSI


  // Function to fetch coin details
  const fetchCoinDetails = () => {
    if (coin) {
      setLoading(true);
      fetch(`https://indodax.com/api/ticker/${coin}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch coin details: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          setPrices((prevPrices) => [...prevPrices, data.ticker.last]); // Add latest price for calculation
          setCoinDetails(data.ticker);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching coin details:", error);
          setLoading(false);
        });
    }
  };

  // Function to fetch order book data (Buy/Sell)
  const fetchOrderBook = () => {
    if (coin) {
      fetch(`http://localhost:3001/api/depth?coin=${coin}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch order book data: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          setOrderBook({
            buy: data.buy,
            sell: data.sell,
          });
        })
        .catch((error) => {
          console.error("Error fetching order book data:", error);
        });
    }
  };

  useEffect(() => {
    console.log("Interval set to:", fetchInterval); // Check if interval is set correctly
    fetchCoinDetails(); // Initial fetch on mount
    fetchOrderBook(); // Fetch initial order book data

    // Check if interval value is valid
    if (fetchInterval && fetchInterval > 0) {
      const intervalId = setInterval(() => {
        console.log("Fetching data..."); // Check if setInterval is running
        fetchCoinDetails(); // Auto-fetch at the interval specified
        fetchOrderBook();   // Auto-fetch order book data
      }, fetchInterval);

      return () => {
        console.log("Clearing interval...");
        clearInterval(intervalId); // Clear the interval on cleanup
      };
    } else {
      console.warn("Invalid interval value:", fetchInterval);
    }
  }, [coin, fetchInterval]); // Re-fetch data whenever coin or interval changes

  // if (loading) {
  //   return (
  //     <div className="flex justify-center items-center h-screen">
  //       <div className="text-xl font-semibold">Loading...</div>
  //     </div>
  //   );
  // }

  if (!coinDetails) {
    return (
      <div className="flex justify-center items-center h-screen text-xl font-semibold">
        Coin not found
      </div>
    );
  }

  // Risk Analysis
  const calculateVolatility = () => {
    const high = parseFloat(coinDetails.high);
    const low = parseFloat(coinDetails.low);
    return ((high - low) / low) * 100; // Volatility as percentage
  };

  const calculateSupportResistance = () => {
    const high = parseFloat(coinDetails.high);
    const low = parseFloat(coinDetails.low);
    return {
      support: low,
      resistance: high,
    };
  };

  const calculateRiskRewardRatio = (buyPrice) => {
    const support = calculateSupportResistance().support;
    const resistance = calculateSupportResistance().resistance;
    const risk = buyPrice - support;
    const reward = resistance - buyPrice;
    return reward / risk;
  };

  const calculateMA = (prices, period) => {
    const sum = prices.slice(-period).reduce((acc, price) => acc + parseFloat(price), 0);
    return sum / period;
  };

  // Calculate Relative Strength Index (RSI)
  const calculateRSI = (prices, period) => {
    if (prices.length < period) {
      // Tidak cukup data untuk menghitung RSI, kembalikan null atau 0 sebagai indikator
      return null;
    }

    let gains = 0;
    let losses = 0;

    for (let i = 1; i < period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) {
      return 100; // Jika tidak ada kerugian, RSI adalah 100
    }

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  };

  // Gunakan `calculateRSI` di dalam komponen

  // Pastikan harga sudah cukup
  const rsiValue = prices.length >= 14 ? calculateRSI(prices, 14) : null;

  // Determine if pump or dump is likely
  const analyzePumpDumpPotential = () => {
    const volatility = calculateVolatility();
    const { buyTotal, sellTotal } = getOrderBookDepth();
    const rsi = prices.length >= 14 ? calculateRSI(prices, 14) : null;
    const trend = getTrendPrediction();
    const currentPrice = parseFloat(coinDetails.last);

    // High volatility and imbalance in order book depth might indicate a pump or dump
    if (volatility > 5) { // Example threshold for volatility percentage
      if (buyTotal > sellTotal && trend === 'up' && rsi < 30) {
        return 'Pump likely'; // High buy pressure + low RSI (oversold condition) + high volatility
      } else if (sellTotal > buyTotal && trend === 'down' && rsi > 70) {
        return 'Dump likely'; // High sell pressure + high RSI (overbought condition) + high volatility
      }
    }

    return 'No pump/dump signal'; // No significant signs of pump or dump
  };

  const getTrendPrediction = () => {
    const ma50 = calculateMA(prices, 50);
    const ma200 = calculateMA(prices, 200);
    if (ma50 > ma200) {
      return 'up'; // Bullish trend
    } else if (ma50 < ma200) {
      return 'down'; // Bearish trend
    }
    return 'neutral'; // No clear trend
  };

  // Order Book Analysis
  const getOrderBookDepth = () => {
    const buyTotal = orderBook.buy.reduce((acc, [price, quantity]) => acc + parseFloat(quantity), 0);
    const sellTotal = orderBook.sell.reduce((acc, [price, quantity]) => acc + parseFloat(quantity), 0);
    return { buyTotal, sellTotal };
  };

  // Calculate buy and sell order recommendations
  const getRecommendation = () => {
    const support = calculateSupportResistance().support;
    const resistance = calculateSupportResistance().resistance;
    const currentPrice = parseFloat(coinDetails.last);
    const rsi = rsiValue;
    const trend = getTrendPrediction();

    // Buy Recommendation (Buy when RSI is low or near support)
    let buyRecommendation = null;
    if (rsi < 30) {
      buyRecommendation = support; // Buy near support if RSI is low
    } else if (currentPrice < support) {
      buyRecommendation = currentPrice; // Buy at current price if it's below support
    }

    // Sell Recommendation (Sell when RSI is high or near resistance)
    let sellRecommendation = null;
    if (rsi > 70) {
      sellRecommendation = resistance; // Sell near resistance if RSI is high
    } else if (currentPrice > resistance) {
      sellRecommendation = currentPrice; // Sell at current price if it's above resistance
    }

    return {
      buy: buyRecommendation,
      sell: sellRecommendation,
      trend, // Include trend prediction
    };
  };

  const recommendations = getRecommendation();
  const pumpDumpSignal = analyzePumpDumpPotential();

  const handleFormSubmit = (e) => {
    e.preventDefault();
    // You could trigger re-fetching here if needed, but it's already done in useEffect
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-white my-6 text-center">
            Indodax - {coin.toUpperCase()}
      </h1>
      {/* Trading Chart */}
     
      
      <div className="grid grid-cols-[30%,70%] gap-2">
        
        <div className='col-setting'>
          <form onSubmit={handleFormSubmit} className="bg-gray-700 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex flex-col space-y-4">
              {/* Interval dropdown */}
              <div className="flex justify-between text-white">
                <label htmlFor="fetchInterval" className="font-medium">Interval:</label>
                <select
                  id="fetchInterval"
                  value={fetchInterval}
                  onChange={(e) => setFetchInterval(Number(e.target.value))}
                  className="p-2 rounded bg-gray-600 text-white"
                >
                  <option value={10000}>10 seconds</option>
                  <option value={20000}>20 seconds</option>
                  <option value={30000}>30 seconds</option>
                  <option value={60000}>1 minute</option>
                  <option value={120000}>2 minutes</option>
                  <option value={180000}>3 minutes</option>
                  <option value={300000}>5 minutes</option>
                  <option value={600000}>10 minutes</option>
                  <option value={900000}>15 minutes</option>
                </select>
              </div>

              {/* Timeframe dropdown */}
              <div className="flex justify-between text-white">
                <label htmlFor="tf" className="font-medium">Timeframe:</label>
                <select
                  id="tf"
                  value={tf}
                  onChange={(e) => setTf(Number(e.target.value))}
                  className="p-2 rounded bg-gray-600 text-white"
                >
                  <option value={1}>1 minute</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={240}>4 hours</option>
                  <option value="1D">1 day</option>
                  <option value="3D">3 days</option>
                  <option value="1W">1 week</option>
                </select>
              </div>
            </div>
          </form>
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-white mb-4">Summary</h2>
            <hr></hr>
            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>Last Price:</strong>
              </div>
              <div>{formatToRupiah(coinDetails.last)}</div>
            </div>

            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>High:</strong>
              </div>
              <div>{formatToRupiah(coinDetails.high)}</div>
            </div>

            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>Low:</strong>
              </div>
              <div>{formatToRupiah(coinDetails.low)}</div>
            </div>

            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>Volume:</strong>
              </div>
              <div>{formatToRupiah(coinDetails.vol_idr)}</div>
            </div>

            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>Buy Price:</strong>
              </div>
              <div>{formatToRupiah(coinDetails.buy)}</div>
            </div>

            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>Sell Price:</strong>
              </div>
              <div>{formatToRupiah(coinDetails.sell)}</div>
            </div>

            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>Server Time:</strong>
              </div>
              <div>{new Date(coinDetails.server_time * 1000).toLocaleString()}</div>
            </div>
          </div>
          {/* Risk Analysis */}
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 mt-6 space-y-4">
            <h2 className="text-2xl font-semibold text-white mb-4">Risk Analysis</h2>
            <hr></hr>
            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>Price Volatility:</strong>
              </div>
              <div>{calculateVolatility().toFixed(2)}%</div>
            </div>

            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>Support Level:</strong>
              </div>
              <div>{formatToRupiah(calculateSupportResistance().support)}</div>
            </div>

            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>Resistance Level:</strong>
              </div>
              <div>{formatToRupiah(calculateSupportResistance().resistance)}</div>
            </div>

            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>Risk-Reward Ratio:</strong>
              </div>
              <div>{calculateRiskRewardRatio(parseFloat(coinDetails.buy)).toFixed(2)}</div>
            </div>

          </div>
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 mt-6 space-y-4">
            <h2 className="text-2xl font-semibold text-white mb-4">Moving Average (MA)</h2>
            <hr></hr>
            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>MA 50:</strong>
              </div>
              <div>{formatToRupiah(calculateMA(prices, 50).toFixed(2))}</div>
            </div>
            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>MA 200:</strong>
              </div>
              <div>{formatToRupiah(calculateMA(prices, 200).toFixed(2))}</div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-lg shadow-lg p-6 mt-6 space-y-4">
            <h2 className="text-2xl font-semibold text-white mb-4">Relative Strength Index (RSI)</h2>
            <hr></hr>
            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>RSI (14):</strong>
              </div>
              <div>{rsiValue !== null ? rsiValue.toFixed(2) : 'Not enough data'}</div>
            </div>
          </div>

        </div>
        <div className='col-detail'>
         
          <TradingChart symbol={coin} tf={tf} autoRefreshInterval={fetchInterval} />
          <div className="bg-gray-900 rounded-lg shadow-lg ml-6 mr-6 p-6 mt-6 space-y-4">
            <h2 className="text-2xl font-semibold text-white mb-4">Trading Recommendations</h2>
            <hr />
            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>Recommended Buy Price:</strong>
              </div>
              <div>{recommendations.buy ? formatToRupiah(recommendations.buy.toFixed(2)) : 'No recommendation'}</div>
            </div>

            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>Recommended Sell Price:</strong>
              </div>
              <div>{recommendations.sell ? formatToRupiah(recommendations.sell.toFixed(2)) : 'No recommendation'}</div>
            </div>
            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>Price Trend:</strong>
              </div>
              <div>{recommendations.trend}</div>
            </div>
            <div className="flex justify-between text-lg text-white">
              <div>
                <strong>Pump/Dump Signal:</strong>
              </div>
              <div>{pumpDumpSignal}</div>
            </div>
          </div>
          <div className="bg-gray-900 rounded-lg shadow-lg ml-6 mr-6 p-6 mt-6 space-y-4">
            <h2 className="text-2xl font-semibold text-white mb-4">Order Book</h2>
            
            <div className="grid grid-cols-2 gap-2">
              {/* Buy Orders */}
              <div>
                <h3 className="text-xl text-green-400 mb-2">Buy Orders</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-white">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">Price</th>
                        <th className="px-4 py-2 text-left">Quantity (IDR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderBook.buy.slice(0, 10).map(([price, quantity], index) => (
                        <tr key={index} className="border-t border-gray-700">
                          <td className={`px-4 py-2 ${ index == 0 ? `text-xl text-green-400` : ``}`}>{formatToRupiah(price)}</td>
                          <td className={`px-4 py-2 ${ index == 0 ? `text-xl text-green-400` : ``}`}>{formatToRupiah(price*quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sell Orders */}
              <div>
                <h3 className="text-xl text-red-400 mb-2">Sell Orders</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-white">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left">Price</th>
                        <th className="px-4 py-2 text-left">Quantity (IDR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orderBook.sell.slice(0, 10).map(([price, quantity], index) => (
                        <tr key={index} className="border-t border-gray-700">
                          <td className={`px-4 py-2 ${ index == 0 ? `text-xl text-red-400` : ``}`}>{formatToRupiah(price)}</td>
                          <td className={`px-4 py-2 ${ index == 0 ? `text-xl text-red-400` : ``}`}>{formatToRupiah(price*quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    
    </div>
  );
}
