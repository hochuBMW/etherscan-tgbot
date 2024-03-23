const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Замените 'YOUR_TELEGRAM_BOT_TOKEN' на токен вашего бота, полученный от BotFather в Telegram
const token = 'YOUR_TELEGRAM_BOT_TOKEN';

// Создаем новый экземпляр бота с помощью токена
const bot = new TelegramBot(token, { polling: true });

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const keyboard = {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: "Узнать баланс ETH" }, { text: "Узнать баланс BTC" }, { text: "Узнать баланс LTC" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    })
  };
  bot.sendMessage(chatId, "Привет! Я бот, который может показать текущий баланс Ethereum, Bitcoin и Litecoin по твоему адресу. Нажми на кнопку ниже.", keyboard);
});

// Обработчик нажатия на кнопки
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  let coin = '';
  if (msg.text === "Узнать баланс ETH") {
    coin = 'ETH';
  } else if (msg.text === "Узнать баланс BTC") {
    coin = 'BTC';
  } else if (msg.text === "Узнать баланс LTC") {
    coin = 'LTC';
  }

  if (coin) {
    bot.sendMessage(chatId, `Отправьте адрес ${coin} кошелька.`);
  }
});

// Обработчик текстовых сообщений
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const address = msg.text;
  let coin = '';

  // Проверяем, является ли сообщение адресом Ethereum, Bitcoin или Litecoin
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
    coin = 'ETH';
  } else if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) {
    coin = 'BTC';
  } else if (/^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/.test(address)) {
    coin = 'LTC';
  }

  if (coin) {
    try {
      // Запрашиваем баланс с помощью соответствующего API
      let response;
      if (coin === 'ETH') {
        response = await axios.get(`https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=YourApiKeyToken`);
      } else if (coin === 'BTC') {
        response = await axios.get(`https://blockchain.info/balance?active=${address}`);
      } else if (coin === 'LTC') {
        response = await axios.get(`https://sochain.com/api/v2/get_address_balance/LTC/${address}`);
      }

      const balance = response.data.final_balance || response.data.balance;

      // Отправляем сообщение с балансом
      bot.sendMessage(chatId, `Текущий баланс адреса ${address} составляет ${balance} ${coin}`);
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, "Произошла ошибка при получении баланса. Пожалуйста, попробуйте еще раз позже.");
    }
  } else if (msg.text !== "Узнать баланс ETH" && msg.text !== "Узнать баланс BTC" && msg.text !== "Узнать баланс LTC") {
    bot.sendMessage(chatId, "Это не похоже на адрес Ethereum, Bitcoin или Litecoin. Пожалуйста, введите действительный адрес.");
  }
});