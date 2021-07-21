const TelegramApi = require('node-telegram-bot-api');
const {gameOptions, againOptions} = require('./options');
require('dotenv').config();

const TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';

const bot = new TelegramApi(TOKEN, { polling: true });

const chats = {};

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать.');

    chats[chatId] = Math.floor(Math.random() * 10);
    await bot.sendMessage(chatId, 'Угадывай... 😁', gameOptions);
}

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
                await startGame(id);
                break;
            }
            default: {
                await bot.sendMessage(id, `Упс!!! Неизвестная команда...`);
                break;
            }
        }
    });

    bot.on('callback_query', async ({ message: { chat: { id } }, data }) => {
        switch (data) {
            case String(chats[id]): {
                await bot.sendMessage(id, `Поздравляю!!! Ты отгадал цифру - ${data}.`, againOptions);
                break;
            }
            case '/again': {
                await startGame(id);
                break;
            }
            default: {
                await bot.sendMessage(id, `К сожалению, ты не угадал... Бот загадал цифру - ${chats[id]}.`, againOptions);
                break;
            }
        }
    })
};

start();
