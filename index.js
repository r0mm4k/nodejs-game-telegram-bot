const TelegramApi = require('node-telegram-bot-api');
require('dotenv').config();

const TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';

const bot = new TelegramApi(TOKEN, { polling: true });

const chats = {};

const start = async () => {
    await bot.setMyCommands([
        { command: '/start', description: 'Начальное приветствие.' },
        { command: '/info', description: 'Получить информацию о пользователе.' },
        { command: '/game', description: 'Игра "Угадай число".' },
    ]);

    bot.on('message', async ({ chat: { id }, text, from: { first_name } }) => {
        switch (text) {
            case '/start': {
                await bot.sendSticker(id, 'https://tlgrm.ru/_/stickers/633/5c5/6335c5a3-81a4-3786-bb3c-701aa8335d38/2.webp')
                await bot.sendMessage(id, 'Добро пожаловать в телеграм бот (авт. r0mm4k).');
                break;
            }
            case '/info': {
                await bot.sendMessage(id, `Тебя зовут ${first_name}.`);
                break;
            }
            case '/game': {
                await bot.sendMessage(id, 'Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать.');

                chats[id] = Math.floor(Math.random() * 10);
                await bot.sendMessage(id, 'Угадывай... 😁');
                break;
            }
            default: {
                await bot.sendMessage(id, `Упс!!! Неизвестная команда...`);
                break;
            }
        }
    });
};

start();
