"use client";

import { useState, useEffect } from "react";
import { formatToRupiah } from "@/helpers/currency";
import CryptoCard from "@/components/CryptoCard";

export default function Trade() {
    const [orderBook, setOrderBook] = useState({ buy: [], sell: [] });
    const [fetchInterval, setFetchInterval] = useState(30000); 
    const [buyMethod, setBuyMethod] = useState('limitOrder');
    const [sellMethod, setSellMethod] = useState('limitOrder');
    const [pairs, setPairs] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCrypto, setSelectedCrypto] = useState("btcidr");

    const fetchOrderBook = () => {
        if (selectedCrypto) {
          fetch(`http://localhost:3001/api/depth?coin=${selectedCrypto}`)
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

    const fetchPairs = async () => {
        try {
            const response = await fetch('https://indodax.com/api/pairs');
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            const data = await response.json();
            setPairs(data);
        } catch (err) {
            setPairs([]);
        }
    };

    useEffect(() => {
        
        fetchOrderBook();
        fetchPairs();

        if (fetchInterval && fetchInterval > 0) {
          const intervalId = setInterval(() => {
            fetchOrderBook();
            fetchPairs();
          }, fetchInterval);
    
          return () => {
            console.log("Clearing interval...");
            clearInterval(intervalId);
          };
        } else {
          console.warn("Invalid interval value:", fetchInterval);
        }
      }, [fetchInterval, selectedCrypto]); 
    
      const filteredData = pairs.filter((crypto) =>
        crypto.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

    return (
      <div className="min-h-screen p-6 bg-gray-800">
        <div className="grid grid-cols-[24%,24%,24%,27%] gap-2">
            <div className="col-1">
            <h3 className="text-xl text-white mb-2">Select Crypto Currency</h3>
            <div className="max-w-lg mx-auto mb-6">
                <input
                type="text"
                placeholder="Search cryptocurrency..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-600 border rounded px-4 py-2"
                />
            </div>
                <div className="h-80 overflow-auto bg-gray-900 rounded-lg shadow-lg p-4 mb-2">
                    {filteredData.map((pair,index)=>{

                        return (
                            <div key={index}>
                                <CryptoCard 
                                    onSelected={(id)=>{
                                        setSelectedCrypto(id);
                                    }} 
                                    selected={selectedCrypto} 
                                    keyId={pair.id} 
                                    name={pair.description} 
                                    price={pair.trade_min_base_currency} 
                                    logo={pair.url_logo}
                                />
                            </div>
                        )

                    })}
                </div> 
                <form className="bg-gray-700 rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex flex-col space-y-4"> 
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
                    </div>
                </form>
               
            </div>
            <div className="col-2">
                <h3 className="text-xl text-green-400 mb-2">Buy {selectedCrypto.slice(0, -3).toUpperCase()}</h3>
                <form className="bg-gray-700 rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex flex-col space-y-4">
                        <div className="flex justify-between text-white">
                            <select
                            id="buyMethod"
                            value={buyMethod}
                            onChange={(e) => setBuyMethod(e.target.value)}
                            className="w-full p-2 rounded bg-gray-600 text-white py-3"
                            >
                            <option value="limitOrder">Limit Order</option>
                            <option value="marketOrder">Market Order</option>
                            </select>
                        </div>
                        <div className="flex justify-between text-white">
                            <input
                                type="number"
                                className="w-full bg-gray-600 border rounded px-4 py-2"
                                placeholder="Price (IDR)"
                            />
                        </div>
                        
                        <div className="flex justify-between text-white">
                            <input
                                type="number"
                                className="w-full bg-gray-600 border rounded px-4 py-2"
                                placeholder={`Amount (${selectedCrypto.slice(0, -3).toUpperCase()})`}
                            />
                        </div>
                        <div className="flex justify-end text-white">
                            <div className="w-full inline-flex rounded-md shadow-sm float-right" role="group">
                                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                                    25 %
                                </button>
                                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                                    50 %
                                </button>
                                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-l border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                                    75 %
                                </button>
                                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                                    100 %
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between text-white">
                            <input
                                type="number"
                                className="w-full bg-gray-600 border rounded px-4 py-2"
                                placeholder="Total (IDR)"
                            />
                        </div>
                        <button
                        className="bg-green-500 text-white px-4 py-2 rounded"
                        >
                        Buy
                        </button>
                    </div>
                </form>
                <div className="bg-gray-900 rounded-lg shadow-lg p-4 mb-2">
                    <p className="italic">No open buy order yet</p>
                </div>           
            </div>
            <div className="col-3">
                <h3 className="text-xl text-red-400 mb-2">Sell {selectedCrypto.slice(0, -3).toUpperCase()}</h3>
                <form className="bg-gray-700 rounded-lg shadow-lg p-6 mb-6">
                    <div className="flex flex-col space-y-4">
                        <div className="flex justify-between text-white">
                            <select
                            id="sellMethod"
                            value={sellMethod}
                            onChange={(e) => setSellMethod(e.target.value)}
                            className="w-full p-2 rounded bg-gray-600 text-white py-3"
                            >
                            <option value="limitOrder">Limit Order</option>
                            <option value="marketOrder">Market Order</option>
                            </select>
                        </div>
                        <div className="flex justify-between text-white">
                            <input
                                type="number"
                                className="w-full bg-gray-600 border rounded px-4 py-2"
                                placeholder="Price (IDR)"
                            />
                        </div>
                        
                        <div className="flex justify-between text-white">
                            <input
                                type="number"
                                className="w-full bg-gray-600 border rounded px-4 py-2"
                                placeholder={`Amount (${selectedCrypto.slice(0, -3).toUpperCase()})`}
                            />
                        </div>
                        <div className="flex justify-end text-white">
                            <div className="w-full inline-flex rounded-md shadow-sm float-right" role="group">
                                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-s-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                                    25 %
                                </button>
                                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                                    50 %
                                </button>
                                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border-t border-l border-b border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                                    75 %
                                </button>
                                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-e-lg hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:ring-blue-500 dark:focus:text-white">
                                    100 %
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between text-white">
                            <input
                                type="number"
                                className="w-full bg-gray-600 border rounded px-4 py-2"
                                placeholder="Total (IDR)"
                            />
                        </div>
                        <button
                        className="bg-red-500 text-white px-4 py-2 rounded"
                        >
                        Sell
                        </button>
                    </div>
                </form>
                <div className="bg-gray-900 rounded-lg shadow-lg p-4 mb-2">
                    <p className="italic">No open sell order yet</p>
                </div>
            </div>
            <div className="col-4">
                <h1 className="text-xl text-white mb-2">Estimated Asset Value</h1>
                <div className="bg-gray-900 rounded-lg shadow-lg p-6 mb-2">
                    <h1 className="text-2xl text-blue-400">{formatToRupiah(1000000000)}</h1>
                </div>
                <div className="bg-gray-900 rounded-lg shadow-lg p-4 mb-2">
                    <h3 className="text-xlmb-2">{selectedCrypto.slice(0, -3).toUpperCase()} <span className="text-green-400">Buy</span> & <span className="text-red-400">Sell</span> Orders</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-white">
                            <thead>
                            <tr>
                                <th className="px-4 py-2 text-left">Price</th>
                                <th className="px-4 py-2 text-left">Quantity (IDR)</th>
                            </tr>
                            </thead>
                            <tbody>
                            {orderBook.buy.reverse().slice(0, 4).map(([price, quantity], index) => (
                                <tr key={index} className="border-t border-gray-700">
                                <td className={`px-4 py-2 ${ index == 3 ? `text-xl text-green-400` : ``}`}>{formatToRupiah(price)}</td>
                                <td className={`px-4 py-2 ${ index == 3 ? `text-xl text-green-400` : ``}`}>{formatToRupiah(price*quantity)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-white">                
                        <tbody>
                        {orderBook.sell.slice(0, 4).map(([price, quantity], index) => (
                            <tr key={index} className="border-t border-gray-700">
                            <td className={`px-4 py-2 ${ index == 0 ? `text-xl text-red-400` : ``}`}>{formatToRupiah(price)}</td>
                            <td className={`px-4 py-2 ${ index == 0 ? `text-xl text-red-400` : ``}`}>{formatToRupiah(price*quantity)}</td>
                            </tr>
                        ))}
                        </tbody>
                        <tfoot>
                        <tr>
                            <th className="px-4 py-2 text-left">Price</th>
                            <th className="px-4 py-2 text-left">Quantity (IDR)</th>
                        </tr>
                        </tfoot>
                    </table>
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }