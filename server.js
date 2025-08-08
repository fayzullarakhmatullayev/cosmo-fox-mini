const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
require('dotenv').config();

// === Telegram Bot Setup ===
const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'Click to open the WebApp:', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Open WebApp',
            web_app: {
              url: process.env.WEBAPP_URL
            }
          }
        ]
      ]
    }
  });
});

// === Express Server Setup ===
const app = express();
const PORT = process.env.PORT || 5000;

// 🔐 Middleware to remove ngrok warning
app.use((req, res, next) => {
  res.setHeader('ngrok-skip-browser-warning', 'true');
  next();
});

// Serve static files (e.g., index.html)
app.use(express.static(path.join(__dirname, 'dist')));

// Start server
app.listen(PORT, () => {
  console.log(`WebApp is running on http://localhost:${PORT}`);
});
