import { useState, useEffect } from "react";
import React from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const PriceChart = ({
  watchList,
  historicalData,
  addToWatchList,
  removeFromWatchList,
}) => {
  const [data, setData] = useState([]);
  const [symbol, setSymbol] = useState("-");
  useEffect(() => {
    if (historicalData.length > 0) {
      setSymbol(historicalData[0].symbol.toUpperCase());
      setData(
        historicalData.map((data) => {
          return {
            price: data.close,
            date: data.date,
          };
        })
      );
    }
  }, [historicalData]);

  const handleAddToWatchList = () => {
    addToWatchList(symbol, data[data.length - 1].price);
  };

  const handleRemoveFromWatchList = () => {
    removeFromWatchList(symbol);
  };

  return (
    <Card>
      <div>
        <CardHeader>
          <div className="flex justify-around items-center">
            <CardTitle className="text-2xl justify-start">{symbol}</CardTitle>

            {watchList.map((stock) => stock.symbol).includes(symbol) ? (
              <Button
                onClick={handleRemoveFromWatchList}
                className="text-m text-white"
              >
                Remove from Watchlist
              </Button>
            ) : (
              <Button
                onClick={handleAddToWatchList}
                className="text-m text-white"
              >
                Add to Watchlist
              </Button>
            )}
          </div>
          <CardDescription>The last 7 days price of {symbol}</CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <div className="h-[200px] w-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{
                  top: 5,
                  right: 10,
                  left: 10,
                  bottom: 0,
                }}
              >
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const date = new Date(payload[0].payload.date);
                      const formattedDate = date.toLocaleDateString();
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Price
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].value}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Date
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {formattedDate}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  strokeWidth={2}
                  dataKey="price"
                  stroke="#18181B"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default PriceChart;
