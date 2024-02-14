import { useState } from "react";
import { Button } from "./ui/button";

const StockTile = ({ symbol, price, handlePost }) => {
  return (
    <Button
      className="flex justify-between space-x-10 px-2 py-1 "
      onClick={(e) => handlePost(e, symbol)}
    >
      <div>{symbol}</div>
      <div>${price}</div>
    </Button>
  );
};

export default StockTile;
