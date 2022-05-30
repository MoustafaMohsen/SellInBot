import { Order } from './../../models/order';
import { IProduct } from './../../interfaces/product.d';
import { Product } from './../../models/product';
const BootBot = require('bootbot');
import { MessengerBotConfigs, sendMessage } from "../../interfaces/messenger";
import { Conversation } from '../../models/conversation';
import { IConversation, IMessage } from '../../interfaces/conversation';
import { IOrder } from '../../interfaces/order';
export class MessengerBot {

    configs: MessengerBotConfigs = {
        appID: process.env.MESSENGER_APP_ID,
        appSecret: process.env.MESSENGER_APP_SECRET,
        verifyToken: process.env.MESSENGER_VERIFY_TOKEN,
        pageID: process.env.MESSENGER_PAGE_ID,
        accessToken: process.env.MESSENGER_ACCESS_TOKEN
    };

    bot; // the bot class
    _customers: {
        [key: string]: {
            expecting?: "product" | "address" | "phone" | "country" | "name" | "feedback" | "order" | "order_confirm" | "waiting"
            selected_product: IProduct // selected product ids
            cart: IProduct[] // selected product ids
            order: IOrder
        }
    } = {};
    constructor() {
    }

    setupBotForPage(page_configs: MessengerBotConfigs = {} as any) {
        this.bot = new BootBot({ ...this.configs, ...page_configs });
        const bot = this.bot;
        this.setupMenu();
        this.setupPostbacks();
        this.setupHear();
        const initCallback = async (payload, chat) => {
            const customer_id = payload.sender.id;
            this.resetCustoemr(customer_id, false)

            // log all customer messages to db
            this.logMessageToConversation(payload, customer_id, "Customer")
        }
        bot.on('message', initCallback);
        bot.on('postback', initCallback);
        bot.start(process.env.MESSENGER_PORT);
    }

    getStarted(payload, chat) {
        chat.say({
            text: 'Welcome to SellinBot. What are you looking for?',
            buttons: [
                { type: 'postback', title: 'Buy a Product', payload: 'PRODUCT' },
                // { type: 'postback', title: 'Check order status', payload: 'CHECK_ORDER' },
                // { type: 'postback', title: 'Send Feedback', payload: 'FEEDBACK' },
            ]
        });
    }
    setupMenu() {
        this.bot.setGreetingText('Hey there! Welcome to SellinBot!');

        this.bot.setGetStartedButton(this.getStarted);
        this.bot.on('postback:GET_STARTED', this.getStarted);
        this.bot.setPersistentMenu([
            { type: 'postback', title: 'Buy a Product', payload: 'PRODUCT' },
            { type: 'postback', title: 'Cancel', payload: 'RESET' },
            // { type: 'postback', title: 'Check order status', payload: 'CHECK_ORDER' },
            // { type: 'postback', title: 'Send Feedback', payload: 'FEEDBACK' },
        ]);
    }

    setupPostbacks() {
        this.bot.on('postback:PRODUCT', (payload, chat) => {
            this.resetCustoemr(payload.sender.id)
            const customer = this.customer(payload.sender.id);
            customer.expecting = "product";
            chat.say("What is the product code? (example:54)")
        });

        this.bot.on('postback:ADD_TO_CART', (payload, chat) => {
            const customer = this.customer(payload.sender.id);
            customer.cart.push(customer.selected_product)
            customer.expecting = "product";
            chat.say({
                text: "Added, Would you like to continue to order?",
                buttons: [
                    { type: 'postback', title: 'Start order', payload: 'START_ORDER' },
                    { type: 'postback', title: 'Select another Product', payload: 'PRODUCT' },
                ]
            })
        });
        this.bot.on('postback:RESET', (payload, chat) => {
            this.resetCustoemr(payload.sender.id)
            this.getStarted(payload, chat)
        });

        this.bot.on('postback:CONFIRM_ORDER', async (payload, chat) => {
            // add order to db
            let orderService = new Order()
            const customer = this.customer(payload.sender.id);
            customer.order.meta = {
                products: customer.cart
            }
            let order: IOrder = customer.order
            let dbOrder = await orderService.createOrder(order)
            let total = orderService.orderTotal(dbOrder)
            // generate checkout id here
            const checkout_id = "checkout_693bac0ff263969b9f1814f510de37bf"
            chat.say({
                text: `Order no. ${dbOrder.orders_id} Confirmed, Total: ${total}`,
                buttons: [
                    { title: 'Click to Pay', type: 'web_url', url: 'http://localhost:4200//customer/checkout/' + checkout_id }
                ]
            })
        });
        // this.bot.on('postback:CHECK_ORDER', (payload, chat) => {
        //     chat.say(`Here are your settings: ...`);
        // });

        // this.bot.on('postback:FEEDBACK', (payload, chat) => {
        //     chat.say(`Here are your settings: ...`);
        // });
    }

    setupHear() {
        // enter product id
        this.bot.on('message', async (payload, chat) => {
            // if expecting a product
            const customer = this.customer(payload.sender.id);
            if (customer.expecting === "product") {
                const text = payload.message.text;
                // search for product in db
                let PService = new Product();
                let product = await PService.getProductById(text);
                if (product) {
                    customer.selected_product = product
                    // confirm add product id to cart? // ADD_TO_CART:50
                    chat.say({
                        text: "Selecting Product " + product.name,
                        attachment: 'image',
                        url: 'https://www.adobe.com/express/feature/image/media_16ad2258cac6171d66942b13b8cd4839f0b6be6f3.png?width=750&format=png&optimize=medium',
                        buttons: [
                            { type: 'postback', title: 'Add to Cart', payload: 'ADD_TO_CART' },
                            { type: 'postback', title: 'Continue to Order', payload: 'START_ORDER' },
                            { type: 'postback', title: 'Cancel', payload: 'RESET' },
                        ]
                    })
                }
            }
        });
        // continue to order // START_ORDER
        // enter customer name // johne micheal
        this.bot.on('postback:START_ORDER', (payload, chat) => {
            const customer = this.customer(payload.sender.id);
            if (customer.selected_product) customer.cart.push(customer.selected_product)
            customer.selected_product = null;
            setTimeout(() => { customer.expecting = "name" }, 100)
            customer.order = {
                customer_id: payload.sender.id
            }
            chat.say(`what is your name? (example: John Micheal)`);
        });
        this.bot.on('message', (payload, chat) => {
            const customer = this.customer(payload.sender.id);
            if (customer.expecting === "name") {
                customer.order.name = payload.message?.text
                setTimeout(() => { customer.expecting = "phone" }, 100)
                chat.say(`what is your phone number with county code? (example: +12025550107)`);
            }
        });
        this.bot.on('message', (payload, chat) => {
            const customer = this.customer(payload.sender.id);
            if (customer.expecting === "phone") {
                customer.order.phone = payload.message?.text
                setTimeout(() => { customer.expecting = "country" }, 100)
                chat.say(`What is your country? (example: US)`);
            }
        });
        this.bot.on('message', (payload, chat) => {
            const customer = this.customer(payload.sender.id);
            if (customer.expecting === "country") {
                customer.order.country = payload.message?.text
                setTimeout(() => { customer.expecting = "order_confirm" }, 100)
                chat.say(`Please enter your full shipping address?`);
            }
        });
        this.bot.on('message', (payload, chat) => {
            const customer = this.customer(payload.sender.id);
            if (customer.expecting === "order_confirm") {
                customer.order.address = payload.message?.text
                const order = customer.order;
                setTimeout(() => { customer.expecting = "order" }, 100)
                chat.say({
                    text: `Order Detail:\nName: ${order.name}\nPhone: ${order.phone}\nAddress: ${order.address}\nCountry: ${order.country}`,
                    buttons: [
                        { type: 'postback', title: 'Continue to Checkout', payload: 'CONFIRM_ORDER' },
                    ]
                })
            }
        });
        // order created amount 50$ , continue to checkout here
    }


    async logMessageToConversation(payload, customer_id, sender: "Bot" | "Customer") {
        let convo = new Conversation();
        let dbConvo = await convo.getConversation({ customer_id });
        // if convo alrady exists add it to messages else create a brand new message
        let text = payload?.message ? payload.message.text : payload.postback.title
        let message: IMessage = {
            timestamp: payload.timestamp,
            sender,
            text
        };
        if (dbConvo) {
            dbConvo.meta.messages.push(message);
            dbConvo = await convo.updateConversation({ conversations_id: dbConvo.conversations_id }, { meta: dbConvo.meta });
            return dbConvo;
        } else {
            let conversation: IConversation = {
                customer_id,
                source: "messenger",
                status: "Not Ordred",
                meta: {
                    messages: [message],
                    orders: []
                }
            };
            let dbConvo = await convo.createConversation(conversation);
            return dbConvo;
        }
    }

    customer(customer_id) {
        if (!this._customers[customer_id]) {
            this._customers[customer_id] = {} as any
        }
        return this._customers[customer_id]
    }

    resetCustoemr(customer_id, force = true) {
        if (force || !this._customers[customer_id]?.cart) {
            this._customers[customer_id] = {} as any;
            this._customers[customer_id].cart = []
            this._customers[customer_id].selected_product = {}
            this._customers[customer_id].order = {
                meta: {}
            }
        }
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
productConvo(chat) {
    const askProducCode = (convo) => {
        convo.ask(`If you have a product in minde please enter it's Name or Code??`, async (payload, convo) => {
            console.log(payload);
            // if the response is a text then continue conversation, else end conversation
            const text = payload.message.text;
            // search for product in db
            let PService = new Product();
            let result = await PService.getProductById(text);
            console.log(result);
            if (result) {
                convo.set('product_name_or_id', text);
                convo.say({
                    attachment: 'image',
                    url: 'https://www.adobe.com/express/feature/image/media_16ad2258cac6171d66942b13b8cd4839f0b6be6f3.png?width=750&format=png&optimize=medium',
                    buttons: [
                        { type: 'postback', title: 'Add to Cart', payload: 'ADD_TO_CARt:' + text },
                        { type: 'postback', title: 'Sell Available Product', payload: 'ORDER' },
                    ]
                });

            } else {
                askProducCode(convo);
            }
            convo.say(`Oh, your name is ${text}`);


        });
    };
    chat.conversation((convo) => {
        askProducCode(convo);
    });
}
*/