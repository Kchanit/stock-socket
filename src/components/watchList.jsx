import { useState, useEffect } from "react";
import React from "react";
import StockTile from "@/components/StockTile";

const Watchlist = ({ watchList, handlePost, getCurrentPrice }) => {
  const [stocks, setStocks] = useState([]);

  const fetchWatchListData = async () => {
    const updatedStocks = await Promise.all(
      watchList.map(async (stock) => {
        await getCurrentPrice(stock.symbol);
      })
    );
  };

  useEffect(() => {
    fetchWatchListData();
    // Set up an interval to fetch data every 5 seconds
    const intervalId = setInterval(fetchWatchListData, 5000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="flex flex-col text-center rounded-xl  border p-4">
      <h2 className="text-lg font-bold mb-4 border-b-2">Watchlist</h2>
      {watchList.length > 0 ? (
        watchList.map((stock) => (
          <StockTile
            key={stock.symbol}
            symbol={stock.symbol}
            price={stock.price.toFixed(2)}
            handlePost={handlePost}
          />
        ))
      ) : (
        <div className="text-gray-500">Watchlist is empty</div>
      )}
    </div>
  );
};

export default Watchlist;
