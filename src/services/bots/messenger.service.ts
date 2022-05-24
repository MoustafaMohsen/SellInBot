import * as MessengerPlatform from "facebook-bot-messenger"
import { MessengerBotConfigs, sendMessage } from "../../interfaces/messenger";

export class MessengerBot {
    bot = {}
    configs: MessengerBotConfigs = {
        appID: process.env.MESSENGER_APP_ID,
        appSecret: process.env.MESSENGER_APP_SECRET,
        validationToken: process.env.MESSENGER_VERIFY_TOKEN
    };
    active_pages = []
    constructor() {
    }

    setupBotForPage(page_configs: MessengerBotConfigs) {
        let configs_for_page = { ...this.configs, ...page_configs }
        this.active_pages.push(configs_for_page.pageID)
        this.bot[configs_for_page.pageID] = MessengerPlatform.create(configs_for_page);
        this.bot[configs_for_page.pageID].webhook('/webhook');
        this.bot[configs_for_page.pageID].on(MessengerPlatform.Events.MESSAGE, function (userId, message) {
            // add code below.
            console.log("userId", userId);
            console.log("message", message);
        });

        this.bot[configs_for_page.pageID].listen(process.env.MESSENGER_LISTEN_PORT);
        return configs_for_page;
    }

    send(message: sendMessage) {
        if (!message.page_id) throw "page_id was not defined"
        if (!this.bot[message.page_id]) throw message.page_id + " bot was not found in memory, are you sure you initiated it"
        return new Promise((resolve,reject)=>{
            this.bot[message.page_id].sendTextMessage(message.user_id, message.message).then(
                res => {
                    console.log(res)
                    resolve(res)
                }
            ).catch(
                e => {
                    console.error(e)
                    reject(e)
                }
            );
        })
    }
}
