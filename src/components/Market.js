"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { formatToRupiah } from "@/helpers/currency";
import { Line, Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Register the necessary Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

const Market = () => {
    const [tickers,setTickers] = useState({});
    const [search, setSearch] = useState("");
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });
    const [volumeThreshold, setVolumeThreshold] = useState("");
    const [sortBy, setSortBy] = useState(null);
    const [highlightRules, setHighlightRules] = useState([]);
    const [autoFetchInterval, setAutoFetchInterval] = useState(30);
    const [intervalId, setIntervalId] = useState(null);   
    const [newRule, setNewRule] = useState({
        field: "vol_idr",
        condition: ">",
        value: "",
        color: "bg-yellow-700",
    });
    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [activeTab, setActiveTab] = useState('all');

    const addHighlightRule = () => {
        setHighlightRules([...highlightRules, { ...newRule }]);
        setNewRule({ field: "vol_idr", condition: ">", value: "", color: "bg-yellow-700" });
    };

    const getRuleFieldLabel = (field) => {
        switch(field){
            case 'vol_idr':
                return "Volume IDR";
            case 'last':
                return "Last Price";
            case 'buy':
                return "Buy Price";
            case 'sell':
                return "Sell Price";
        }
    }

    const fetchTickers = async () => {
        setLoading(true);
        try {
          const response = await fetch('https://indodax.com/api/tickers');
          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }
          const data = await response.json();
          setTickers(data.tickers);
        } catch (err) {
          setTickers([]);
        } finally {
          setLoading(false);
        }
    };
    
    useEffect(()=>{
    
        fetchTickers();

        if (autoFetchInterval > 0) {
            const id = setInterval(fetchTickers, autoFetchInterval * 1000);
            setIntervalId(id);
        }

        // Load favorites from localStorage
        const savedFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        setFavorites(savedFavorites);

  
        return () => {
            if (intervalId) {
            clearInterval(intervalId);
            }
        };
    
    },[autoFetchInterval])

    const headers = ["Asset", "Volume", "Last Price", "Buy Price", "Sell Price", "Action"];

    const getVolume = (value) => {
        const volumeEntries = Object.entries(value).filter(([key]) =>
          key.startsWith("vol_")
        );
        return volumeEntries.map(([key, val]) => {
          const unit = key.replace("vol_", "").toUpperCase();
          return (
            <span key={key} className={`${unit === "IDR" ? `text-green-600`:``}`}>
              {unit === "IDR" ? formatToRupiah(val) : val } {unit === "IDR" ? "" : unit}
              <br />
            </span>
          );
        });
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp * 1000);
        return new Intl.DateTimeFormat("id-ID", {
          dateStyle: "full",
          timeStyle: "short",
        }).format(date);
    };

    const filteredData = Object.entries(tickers).filter(([key, value]) => {
        const lastPrice = parseFloat(value.last);
        const volumeIDR = parseFloat(value.vol_idr);
      
        const matchesSearch = key.toLowerCase().includes(search.toLowerCase());
        const matchesPriceRange =
          (!priceRange.min || lastPrice >= priceRange.min) &&
          (!priceRange.max || lastPrice <= priceRange.max);
        const matchesVolume =
          !volumeThreshold || volumeIDR >= parseFloat(volumeThreshold);
      
        return matchesSearch && matchesPriceRange && matchesVolume;
    });

    const favoriteData = filteredData.filter(([key]) => favorites.includes(key));

    const totalVolumeIDR = Object.values(tickers).reduce(
        (sum, item) => sum + parseFloat(item.vol_idr || 0),
        0
    );

    const highestVolume = Object.entries(tickers).reduce(
        (max, [key, value]) =>
        parseFloat(value.vol_idr || 0) > max.value
            ? { key, value: parseFloat(value.vol_idr) }
            : max,
        { key: null, value: 0 }
    );

    const highestLastPrice = Object.entries(tickers).reduce(
        (max, [key, value]) =>
        parseFloat(value.last || 0) > max.value
            ? { key, value: parseFloat(value.last) }
            : max,
        { key: null, value: 0 }
    );

    const lowestLastPrice = Object.entries(tickers).reduce(
        (min, [key, value]) =>
        parseFloat(value.last || 0) < min.value
            ? { key, value: parseFloat(value.last) }
            : min,
        { key: null, value: Infinity }
    );

    const sortedData = filteredData.sort(([keyA, valueA], [keyB, valueB]) => {
        const fieldA = parseFloat(valueA[sortBy]) || 0;
        const fieldB = parseFloat(valueB[sortBy]) || 0;
        return sortBy === "asc" ? fieldA - fieldB : fieldB - fieldA;
    });

    const checkHighlight = (item) => {
        for (const rule of highlightRules) {
            const fieldValue = parseFloat(item[rule.field]) || 0;
            const ruleValue = parseFloat(rule.value);
        
            switch (rule.condition) {
            case ">":
                if (fieldValue > ruleValue) return rule.color;
                break;
            case "<":
                if (fieldValue < ruleValue) return rule.color;
                break;
            case "=":
                if (fieldValue === ruleValue) return rule.color;
                break;
            default:
                break;
            }
        }
        return "";
    };

    const addToFavorites = (coin) => {
        let updatedFavorites = [...favorites];
        const isAlreadyFavorite = updatedFavorites.includes(coin);
    
        if (isAlreadyFavorite) {
          updatedFavorites = updatedFavorites.filter(fav => fav !== coin);
        } else {
          updatedFavorites.push(coin);
        }
    
        setFavorites(updatedFavorites);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites)); // Save favorites in localStorage
    };
    
    const resetHighlightRules = () => {
        setHighlightRules([]);
    };

    const chartData = {
        labels: filteredData.slice(0,30).map(([key]) => key.toUpperCase()), // Asset names as labels
        datasets: [
          {
            label: 'High Price',
            data: filteredData.slice(0,30).map(([_, value]) => value.high),
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: false,
          },
          {
            label: 'Low Price',
            data: filteredData.slice(0,30).map(([_, value]) => value.low),
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: false,
          },
          {
            label: 'Last Price',
            data: filteredData.slice(0,30).map(([_, value]) => value.last),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: false,
          },
        ],
      };
    
      const volumeChartData = {
        labels: filteredData.slice(0,30).map(([key]) => key.toUpperCase()), // Asset names as labels
        datasets: [
          {
            label: 'Volume (IDR)',
            data: filteredData.slice(0,30).map(([_, value]) => value.vol_idr),
            backgroundColor: 'rgba(255, 159, 64, 0.6)',
          },
        ],
      };

    return (
    <div className="p-6 bg-gray-800">
      <h1 className="text-2xl font-bold mb-4">Crypto Market</h1>

        <div className="inline-flex rounded-md shadow-sm mb-5" role="group">
            <button 
            onClick={() => setActiveTab('all')}
            type="button" 
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'all' ? 'bg-blue-700 text-white' : 'bg-gray-800'} border border-blue-700 rounded-s-lg`}
            >
                All Coins
            </button>
            <button 
            onClick={() => setActiveTab('favorites')}
            type="button" 
            className={`px-4 py-2 text-sm font-medium ${activeTab === 'favorites' ? 'bg-blue-700 text-white' : 'bg-gray-800'} border border-blue-700 rounded-e-lg`}
            >
                Favorite Coins
            </button>
        </div>


      {/* Display Favorite Coins Section */}
      {activeTab === 'favorites' && (
        <>
          <div className="overflow-x-auto bg-gray-900 rounded-lg shadow p-4">  
            <h1 className="text-xl mb-4">({favoriteData.length}) Crypto Coins</h1>         
            <table className="min-w-full border-collapse border border-gray-200 text-left">
                <thead className="bg-gray-700">
                    <tr>
                    {headers.map((header) => (
                        <th
                        key={header}
                        className="border border-gray-200 px-4 py-2  text-nowrap"
                        >
                        {header}
                        </th>
                    ))}
                    </tr>
                </thead>
                <tbody>
                    {favoriteData.map(([key, value]) => (
                    <tr key={key} className="border-b">
                        <td className="border border-gray-200 px-4 py-2 ">
                        <Link
                            className="text-blue-600"
                            key={`/coin/${key.replace("_","")}`}
                            href={`/coin/${key.replace("_","")}`}
                            >
                                {key.toUpperCase()}
                        </Link>
                        </td>
                       
                        <td className="border border-gray-200 px-4 py-2 ">
                        {getVolume(value)}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 ">
                        {formatToRupiah(value.last)}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 ">
                        {formatToRupiah(value.buy)}
                        </td>
                        <td className="border border-gray-200 px-4 py-2 ">
                        {formatToRupiah(value.sell)}
                        </td>
                        
                        <td className="border border-gray-200 px-4 py-2  text-nowrap">
                        <button
                            onClick={() => addToFavorites(key)}
                            className={`px-4 py-2 rounded ${favorites.includes(key) ? 'bg-yellow-500' : 'bg-gray-200'}`}
                        >
                            {favorites.includes(key) ? 'Unfavorite' : 'Favorite'}
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'all' && (
        <>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-900 rounded-lg shadow">
                <h2 className="text-lg font-bold">Total Volume (IDR)</h2>
                <p className="text-xl text-green-600 font-semibold">
                    {formatToRupiah(totalVolumeIDR)}
                </p>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg shadow">
                <h2 className="text-lg font-bold">Highest Volume</h2>
                <p className="text-sm">Asset: {highestVolume.key?.toUpperCase()}</p>
                <p className="text-xl text-blue-600 font-semibold">
                    {formatToRupiah(highestVolume.value)}
                </p>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg shadow">
                <h2 className="text-lg font-bold">Highest Last Price</h2>
                <p className="text-sm">Asset: {highestLastPrice.key?.toUpperCase()}</p>
                <p className="text-xl text-red-600 font-semibold">
                    {formatToRupiah(highestLastPrice.value)}
                </p>
                </div>
                <div className="p-4 bg-gray-900 rounded-lg shadow">
                <h2 className="text-lg font-bold">Lowest Last Price</h2>
                <p className="text-sm">Asset: {lowestLastPrice.key?.toUpperCase()}</p>
                <p className="text-xl text-yellow-600 font-semibold">
                    {formatToRupiah(lowestLastPrice.value)}
                </p>
                </div>
            </div>

            {filteredData.length > 0 && (
                <div className="gap-4 grid grid-cols-[50%,50%] mb-6">
                    <div className="p-4 bg-gray-900 rounded-lg shadow mr-4">
                        <h3 className="font-bold mb-4">Price Trends</h3>
                        <Line data={chartData} options={{ responsive: true }} />
                    </div>
                    <div className="p-4 bg-gray-900 rounded-lg shadow mr-4">
                        <h3 className="font-bold my-4">Volume Trends</h3>
                        <Bar data={volumeChartData} options={{ responsive: true }} />
                    </div>
                </div>
            )}

            <div className="mb-4 bg-gray-900 rounded-lg shadow p-4">
                <h3 className="font-bold mb-2">Set Highlight Rules</h3>
                <div className="grid grid-cols-6 gap-4 mb-4">
                    <select
                        className="bg-gray-900 border rounded px-4 py-2"
                        value={newRule.field}
                        onChange={(e) => setNewRule({ ...newRule, field: e.target.value })}
                    >
                        <option value="vol_idr">Volume (IDR)</option>
                        <option value="last">Last Price</option>
                        <option value="buy">Buy Price</option>
                        <option value="sell">Sell Price</option>
                    </select>
                    <select
                        className="bg-gray-900 border rounded px-4 py-2"
                        value={newRule.condition}
                        onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                    >
                        <option value=">">Greater Than</option>
                        <option value="<">Less Than</option>
                        <option value="=">Equal To</option>
                    </select>
                    <input
                        type="number"
                        className="bg-gray-900 border rounded px-4 py-2"
                        placeholder="Value"
                        value={newRule.value}
                        onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                    />
                    <select
                    className="bg-gray-900 border rounded px-4 py-2k"
                    value={newRule.color}
                    onChange={(e) => setNewRule({ ...newRule, color: e.target.value })}
                >
                        <option value="bg-yellow-700">Yellow</option>
                        <option value="bg-red-700">Red</option>
                        <option value="bg-green-700">Green</option>
                        <option value="bg-blue-700">Blue</option>
                </select>
                    <button
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                        onClick={addHighlightRule}
                    >
                        Add Rule
                    </button>
                    <button
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                        onClick={resetHighlightRules}
                    >
                        Reset Rules
                    </button>
                </div>
            </div>

            <div className="mb-4 bg-gray-900 rounded-lg shadow p-4">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold mb-2">Active Highlight Rules</h3>
                </div>
                <ul>
                {highlightRules.length > 0 ? (
                    highlightRules.map((rule, index) => (
                    <li key={index} className="mb-1 rounded bg-gray-600 p-2">
                        <span
                        className={`align-middle inline-block w-4 h-4 rounded-full ${rule.color}`}
                        ></span>
                        <span className="ml-2 font-semibold">{getRuleFieldLabel(rule.field)} {` ${rule.condition} ${formatToRupiah(rule.value)}`}</span>
                        
                        
                    </li>
                    ))
                ) : (
                    <p className="text-gray-500 italic">No active rules.</p>
                )}
                </ul>
            </div>

            <div className="bg-gray-900 rounded-lg shadow p-4 grid grid-cols-6 gap-4 mb-4">
                <select
                    className="bg-gray-900 border rounded px-4 py-2"
                    value={autoFetchInterval}
                    onChange={(e) => setAutoFetchInterval(Number(e.target.value))}
                >
                    <option value={10}>10</option>
                    <option value={30}>30</option>
                    <option value={60}>60</option>
                    <option value={120}>120</option>
                </select>
                <input
                    type="number"
                    placeholder="Min Last Price"
                    className="bg-gray-900 border rounded px-4 py-2"
                    value={priceRange.min}
                    onChange={(e) =>
                    setPriceRange({ ...priceRange, min: e.target.value })
                    }
                />
                <input
                    type="number"
                    placeholder="Max Last Price"
                    className="bg-gray-900 border rounded px-4 py-2"
                    value={priceRange.max}
                    onChange={(e) =>
                    setPriceRange({ ...priceRange, max: e.target.value })
                    }
                />
                <input
                    type="number"
                    placeholder="Min Volume (IDR)"
                    className="bg-gray-900 border rounded px-4 py-2"
                    value={volumeThreshold}
                    onChange={(e) => setVolumeThreshold(e.target.value)}
                />
                <select
                className="bg-gray-900 border rounded px-4 py-2"
                onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="">Sort By</option>
                    <option value="last">Last Price</option>
                    <option value="vol_idr">Volume (IDR)</option>
                    <option value="buy">Buy Price</option>
                    <option value="sell">Sell Price</option>
                </select>
                <input
                type="text"
                placeholder="Search by coin name..."
                className="bg-gray-900 border rounded px-4 py-2"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
            {/* {loading && (
                <div className="flex justify-center my-4">
                <div className="animate-spin border-4 border-t-4 border-blue-500 rounded-full w-8 h-8"></div>
                </div>
            )} */}

            <div className="overflow-x-auto bg-gray-900 rounded-lg shadow p-4">
                <h1 className="text-xl mb-4">({filteredData.length}) Crypto Coins</h1>
                <table className="min-w-full border-collapse border text-left">
                    <thead className="bg-gray-700">
                        <tr>
                        {headers.map((header) => (
                            <th
                            key={header}
                            className="border border-gray-200 px-4 py-2 text-nowrap"
                            >
                            {header}
                            </th>
                        ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map(([key, value], index) => (
                        <tr
                            key={index}
                            className={`hover:bg-gray-600 ${checkHighlight(value)}`}
                        >
                            <td className="border border-gray-200 px-4 py-2"> 
                                <Link
                                className="text-blue-600"
                                key={`/coin/${key.replace("_","")}`}
                                href={`/coin/${key.replace("_","")}`}
                                >
                                    {key.toUpperCase()}
                                </Link>
                            </td>
                            <td className="border border-gray-200 px-4 py-2 ">
                            {getVolume(value)}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 ">
                            {formatToRupiah(value.last)}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 ">
                            {formatToRupiah(value.buy)}
                            </td>
                            <td className="border border-gray-200 px-4 py-2 ">
                            {formatToRupiah(value.sell)}
                            </td>
                            <td className="border border-gray-200 px-4 py-2  text-nowrap">
                            <button
                                onClick={() => addToFavorites(key)}
                                className={`px-4 py-2 rounded ${favorites.includes(key) ? 'bg-yellow-500' : 'bg-green-800'}`}
                            >
                                {favorites.includes(key) ? 'Unfavorite' : 'Favorite'}
                            </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            </div>

        </>
      )}

      
    </div>
  );
}
export default Market;