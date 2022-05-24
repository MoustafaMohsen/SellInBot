const BootBot = require('bootbot');
import { MessengerBotConfigs, sendMessage } from "../../interfaces/messenger";

export class MessengerBot {
    bot
    configs: MessengerBotConfigs = {
        appID: process.env.MESSENGER_APP_ID,
        appSecret: process.env.MESSENGER_APP_SECRET,
        verifyToken: process.env.MESSENGER_VERIFY_TOKEN,
        accessToken: process.env.MESSENGER_ACCESS_TOKEN
    };
    active_pages = []
    constructor() {
    }

    setupBotForPage(page_configs: MessengerBotConfigs) {
        let configs_for_page = { ...this.configs, ...page_configs }
        this.active_pages.push(configs_for_page.pageID)
        this.bot = new BootBot(configs_for_page);
        const bot = this.bot
        bot.hear(['hello', 'hi', /hey( there)?/i], (payload, chat) => {
            // Send a text message followed by another text message that contains a typing indicator
            chat.say('Hello, human friend!').then(() => {
                chat.say('How are you today?', { typing: true });
            });
        });

        bot.hear(['food', 'hungry'], (payload, chat) => {
            // Send a text message with quick replies
            chat.say({
                text: 'What do you want to eat today?',
                quickReplies: ['Mexican', 'Italian', 'American', 'Argentine']
            });
        });

        bot.hear(['help'], (payload, chat) => {
            // Send a text message with buttons
            chat.say({
                text: 'What do you need help with?',
                buttons: [
                    { type: 'postback', title: 'Settings', payload: 'HELP_SETTINGS' },
                    { type: 'postback', title: 'FAQ', payload: 'HELP_FAQ' },
                    { type: 'postback', title: 'Talk to a human', payload: 'HELP_HUMAN' }
                ]
            });
        });

        bot.hear('image', (payload, chat) => {
            // Send an attachment
            chat.say({
                attachment: 'image',
                url: 'https://www.adobe.com/express/feature/image/media_16ad2258cac6171d66942b13b8cd4839f0b6be6f3.png?width=750&format=png&optimize=medium'
            });
        });

        bot.start();
        bot.on('message', (payload, chat) => {
            const text = payload.message.text;
            chat.say(`Echo: ${text}`);
        });

        return configs_for_page;
    }

}
