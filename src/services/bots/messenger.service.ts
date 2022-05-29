const BootBot = require('bootbot');
import { MessengerBotConfigs, sendMessage } from "../../interfaces/messenger";

export class MessengerBot {
    bot
    configs: MessengerBotConfigs = {
        appID: process.env.MESSENGER_APP_ID,
        appSecret: process.env.MESSENGER_APP_SECRET,
        verifyToken: process.env.MESSENGER_VERIFY_TOKEN,
        pageID: process.env.MESSENGER_PAGE_ID,
        accessToken: process.env.MESSENGER_ACCESS_TOKEN
    };
    active_pages = []
    constructor() {
    }

    setupBotForPage(page_configs: MessengerBotConfigs = {} as any) {
        let configs_for_page = { ...this.configs, ...page_configs }
        this.active_pages.push(configs_for_page.pageID)
        this.bot = new BootBot(configs_for_page);
        const bot = this.bot
        bot.hear(['hello', 'hi', /hey( there)?/i], (payload, chat) => {
            console.log(payload, chat);
            chat.say('Hello, human friend!', { typing: true }).then(() => {
                chat.say({
                    text: 'What would you like to do today?',
                    quickReplies: ['Purchase a Product', 'Check order status', 'Browse Products']
                });
            });

        });

        bot.hear(['Purchase a Product'], (payload, chat) => {
            // Send a text message with quick replies
            chat.say({
                text: 'Please enter product Name or Code?'
            });
        });

        bot.hear(['help'], (payload, chat) => {
            // Send a text message with buttons

        });

        bot.hear('image', (payload, chat) => {
        });

        bot.start(process.env.MESSENGER_PORT);
        bot.on('message', (payload, chat) => {
            console.log(payload);

            // chat.say(`Echo: ${text}`);
        });
        bot.on('message', (payload, chat) => {
            console.log(payload);

            // chat.say(`Echo: ${text}`);
        });

        return configs_for_page;
    }

}


/*
chat.say({

    text: 'What do you need help with?',
    buttons: [
        { type: 'postback', title: 'Settings', payload: 'HELP_SETTINGS' },
        { type: 'postback', title: 'FAQ', payload: 'HELP_FAQ' },
        { type: 'postback', title: 'Talk to a human', payload: 'HELP_HUMAN' }
    ]
})

chat.say({
    attachment: 'image',
    url: 'https://www.adobe.com/express/feature/image/media_16ad2258cac6171d66942b13b8cd4839f0b6be6f3.png?width=750&format=png&optimize=medium'
});

chat.say({
    text: 'What would you like to do today?',
    quickReplies: ['Purchase a Product', 'Check order status', 'Browse Products']
});

// Start a conversation
const askName = (convo) => {
		convo.ask(`What's your name?`, (payload, convo) => {
			const text = payload.message.text;
			convo.set('name', text);
			convo.say(`Oh, your name is ${text}`).then(() => sendSummary(convo));
		});
	};
const sendSummary = (convo) => {
		convo.say(`Ok, here's what you told me about you:
	      - Name: ${convo.get('name')}
      convo.end();
	};

chat.conversation((convo) => {
    askName(convo);
});
*/