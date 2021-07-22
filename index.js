require('dotenv').config();

const TelegramApi = require('node-telegram-bot-api');
const {gameOptions, againOptions} = require('./options');
const sequelize = require('./db');
const UserModel = require('./models');

const TOKEN = process.env.TELEGRAM_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';

const bot = new TelegramApi(TOKEN, { polling: true });

const chats = {};

const startGame = async (chatId) => {
    await bot.sendMessage(chatId, 'Сейчас я загадаю цифру от 0 до 9, а ты должен ее угадать.');

    chats[chatId] = Math.floor(Math.random() * 10);
    await bot.sendMessage(chatId, 'Угадывай... 😁', gameOptions);
}

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
    } catch (err) {
        console.log('Подключение к БД сломалось', err)
    }

    await bot.setMyCommands([
        { command: '/start', description: 'Начальное приветствие.' },
        { command: '/info', description: 'Получить информацию о пользователе.' },
        { command: '/game', description: 'Игра "Угадай число".' },
    ]);

    bot.on('message', async ({ chat: { id }, text, from: { first_name } }) => {
        try {
            switch (text) {
                case '/start': {
                    await UserModel.create({ chatId: id });
                    await bot.sendSticker(id, 'https://tlgrm.ru/_/stickers/633/5c5/6335c5a3-81a4-3786-bb3c-701aa8335d38/2.webp')
                    await bot.sendMessage(id, 'Добро пожаловать в телеграм бот (авт. r0mm4k).');
                    break;
                }
                case '/info': {
                    const { right, wrong } = await UserModel.findOne({ chatId: id });
                    await bot.sendMessage(id, `Тебя зовут ${first_name}. Твой счет: ${right} - правильных и ${wrong} - неправильных.`);
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
        } catch (err) {
            await bot.sendMessage(id, `Упс!!! Что-то пошло не так...`);
        }
    });

    bot.on('callback_query', async ({ message: { chat: { id } }, data }) => {
        const user = await UserModel.findOne({ chatId: id });

        switch (data) {
            case String(chats[id]): {
                user.right += 1;
                await bot.sendMessage(id, `Поздравляю!!! Ты отгадал цифру - ${data}.`, againOptions);
                break;
            }
            case '/again': {
                await startGame(id);
                break;
            }
            default: {
                user.wrong += 1;
                await bot.sendMessage(id, `К сожалению, ты не угадал... Бот загадал цифру - ${chats[id]}.`, againOptions);
                break;
            }
        }

        await user.save();
    })
};

start();
