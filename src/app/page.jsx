"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import PriceChart from "../components/priceChart";
import Watchlist from "../components/watchList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const socket = io("http://localhost:7777", {
  transports: ["websocket"],
  reconnection: false,
});

const STORAGE_KEY = "watchlist";

export default function Home() {
  const [inputStock, setInputStock] = useState("");
  const [stockData, setStockData] = useState([]);
  const [error, setError] = useState("");
  const [watchList, setWatchlist] = useState([]);

  useEffect(() => {
    const defaultSymbol = "AAPL";
    socket.emit("get historical", defaultSymbol);

    // Load watchlist from localStorage
    const storedWatchlist = localStorage.getItem(STORAGE_KEY);
    if (storedWatchlist) {
      setWatchlist(JSON.parse(storedWatchlist));
    }
  }, []);

  const handlePost = (e, symbol) => {
    e.preventDefault();
    setError("");
    if (!symbol) {
      setError("Please enter a stock symbol");
      return;
    }
    socket.emit("get historical", symbol);
  };

  const getCurrentPrice = (symbol) => {
    socket.emit("get price", symbol);
  };

  const addToWatchList = (symbol, price) => {
    let stock = {
      symbol,
      price: price,
    };
    const updatedWatchList = [...watchList, stock];
    setWatchlist(updatedWatchList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWatchList));
  };

  const removeFromWatchList = (symbol) => {
    const updatedWatchList = watchList.filter(
      (stock) => stock.symbol !== symbol
    );
    setWatchlist(updatedWatchList);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedWatchList));
  };

  socket.on("historical", (data) => {
    if (data.length === 0) {
      setError("No stock found");
      return;
    }
    setStockData(data);
  });

  socket.on("price", (data) => {
    let symbol = data.split(":")[0];
    let price = data.split(":")[1];
    const updatedStocks = watchList.map((stock) => {
      if (stock.symbol === symbol) {
        stock.price = price;
        return stock;
      }
      return stock;
    });
    setWatchlist(updatedStocks);
  });

  return (
    <div className="flex flex-col items-center mt-40">
      <h1 className="font-spacemono text-6xl">Stock Stock</h1>
      <form onSubmit={(e) => handlePost(e, inputStock)} className="my-10">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Enter Stock Symbol"
            type="text"
            value={inputStock}
            onChange={(e) => setInputStock(e.target.value)}
            className="text-xl"
          />
          <Button type="submit" className="text-xl">
            Search
          </Button>
        </div>
        <div className="text-red-500 mt-2 text-center text-m">{error}</div>
      </form>
      <div className="flex space-x-10">
        <PriceChart
          className="justify-center"
          watchList={watchList}
          historicalData={stockData}
          addToWatchList={addToWatchList}
          removeFromWatchList={removeFromWatchList}
        />

        <Watchlist
          className="flex-shrink-0 w-1/3"
          watchList={watchList}
          handlePost={handlePost}
          getCurrentPrice={getCurrentPrice}
        />
      </div>
    </div>
  );
}
