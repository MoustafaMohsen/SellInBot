/// <reference path="./../../../node_modules/facebook-bot-messenger/index.js"/>
import * as MessengerPlatform from "facebook-bot-messenger"

export class MessengerBot {
    bot
    constructor() {
        MessengerPlatform
    }
    setupBot() {
        this.bot = MessengerPlatform.create({
            pageID: '<your page id>',
            appID: '<your app id>',
            appSecret: '<your app secret>',
            validationToken: '<your validation token>',
            pageToken: '<your page token>'
        });
        this.bot.webhook('/webhook');

        this.bot.on(MessengerPlatform.Events.MESSAGE, function (userId, message) {
            // add code below.
        });

        this.bot.listen(8080);

    }
}