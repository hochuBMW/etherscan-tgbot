const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Замените 'YOUR_TELEGRAM_BOT_TOKEN' на токен вашего бота, полученный от BotFather в Telegram
const token = 'YOUR_TELEGRAM_BOT_TOKEN';

// Создаем новый экземпляр бота с помощью токена
const bot = new TelegramBot(token, { polling: true });

// Функция для преобразования wei в eth
function weiToEth(wei) {
  return wei / Math.pow(10, 18);
}

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const keyboard = {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: "Узнать баланс" }]
      ],
      resize_keyboard: true,
      one_time_keyboard: true
    })
  };
  bot.sendMessage(chatId, "Привет! Я бот, который может показать текущий баланс Ethereum по твоему адресу. Нажми на кнопку ниже.", keyboard);
});

// Обработчик нажатия на кнопку "Узнать баланс"
bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  if (msg.text === "Узнать баланс") {
    bot.sendMessage(chatId, "Отправьте адрес Ethereum кошелька.");
  }
});

// Обработчик текстовых сообщений
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const address = msg.text;

  // Проверяем, является ли сообщение адресом Ethereum
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
    try {
      // Запрашиваем баланс с помощью Etherscan API
      const response = await axios.get(`https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=YourApiKeyToken`);
      const balanceWei = response.data.result;

      // Преобразуем баланс из wei в eth
      const balanceEth = weiToEth(balanceWei);

      // Отправляем сообщение с балансом
      bot.sendMessage(chatId, `Текущий баланс адреса ${address} составляет ${balanceEth.toFixed(6)} ETH`);
    } catch (error) {
      console.error(error);
      bot.sendMessage(chatId, "Произошла ошибка при получении баланса. Пожалуйста, попробуйте еще раз позже.");
    }
  } else if (msg.text !== "Узнать баланс") {
    bot.sendMessage(chatId, "Это не похоже на адрес Ethereum. Пожалуйста, введите действительный адрес.");
  }
});