const express = require("express");
const http = require("http");
const server = http.createServer(express());
const socketServ = require("socket.io");
const io = socketServ(server);
const axios = require("axios");
const winston = require("winston");
const yahooFinance = require("yahoo-finance");

const socketMap = new Map();

// Configure Winston logger
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: "server.log",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

io.on("connection", (socket) => {
  const timestamp = getCurrentTimestamp();
  logger.info(`[${timestamp}] User ${socket.id} connected`);
  socketMap.set(socket.id, socket);

  socket.on("get price", async (data) => {
    try {
      logger.info(`[${timestamp}] Request ${data} price from: ${socket.id}`);
      const result = await getCurrentPrice(data);
      const message = `${data}:${result}`;
      sendMessageToClient(socket.id, "price", message);
    } catch (error) {
      logger.error(`[${timestamp}] (500) Error getting price:`, error);
    }
  });

  socket.on("get historical", async (data) => {
    try {
      logger.info(
        `[${timestamp}] Request ${data} historical from: ${socket.id}`
      );
      const result = await getHistorical(data);
      sendMessageToClient(socket.id, "historical", result);
    } catch (error) {
      logger.error(
        `[${timestamp}] (500) Error getting historical data:`,
        error
      );
    }
  });
});

const port = 7777;
server.listen(port, () =>
  logger.info(`[${getCurrentTimestamp()}] Server is listening on port ${port}`)
);

async function getHistorical(stock) {
  if (!stock) {
    logger.warn(`[${getCurrentTimestamp()}] (400) Stock ticker is required`);
    return;
  }
  try {
    const today = new Date();
    const formattedToday = formatDate(today);
    const formattedFromDate = formatDate(
      new Date(today.setDate(today.getDate() - 7))
    );
    const quotes = await yahooFinance.historical({
      symbol: stock,
      from: formattedFromDate,
      to: formattedToday,
      period: "d",
    });

    if (quotes.length === 0) {
      logger.warn(
        `[${getCurrentTimestamp()}] (404) No historical data found for ${stock}`
      );
    }
    return quotes.reverse();
  } catch (err) {
    logger.error(
      `[${getCurrentTimestamp()}] (500) Error fetching historical data:`,
      err
    );
    return err;
  }
}

async function getCurrentPrice(stock) {
  try {
    const response = await axios.get(
      `https://query1.finance.yahoo.com/v8/finance/chart/${stock}`
    );
    return response.data.chart.result[0].meta.regularMarketPrice;
  } catch (error) {
    logger.error(
      `[${getCurrentTimestamp()}] (500) Error fetching current price:`,
      error
    );
    throw error;
  }
}

function sendMessageToClient(user, topic, message) {
  const socket = socketMap.get(user);
  if (socket) {
    logger.info(
      `[${getCurrentTimestamp()}] (200) Sending ${topic} to: ${user}`
    );
    socket.emit(topic, message);
  }
}

function getCurrentTimestamp() {
  return new Date().toLocaleString();
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}
