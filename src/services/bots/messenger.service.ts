import { Order } from './../../models/order';
import { IProduct } from './../../interfaces/product.d';
import { Product } from './../../models/product';
const BootBot = require('bootbot');
import { MessengerBotConfigs, sendMessage } from "../../interfaces/messenger";
import { Conversation } from '../../models/conversation';
import { IConversation, IMessage } from '../../interfaces/conversation';
import { IOrder } from '../../interfaces/order';
import axios from 'axios';
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
            await logConvo(payload, "Customer")

        }
        bot.on('message', initCallback);
        bot.on('postback', initCallback);
        bot.start(process.env.MESSENGER_PORT);
    }

    getStarted(payload, chat) {
        let text = 'Welcome to SellinBot. What are you looking for?'
        logConvo(payload, "Bot", text)
        chat.say({
            text,
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
        this.bot.on('postback:PRODUCT', async (payload, chat) => {
            this.resetCustoemr(payload.sender.id)
            const customer = this.customer(payload.sender.id);
            customer.expecting = "product";
            let text = "What is the product code? (example:54)"
            await logConvo(payload, "Bot", text)
            chat.say(text)
        });

        this.bot.on('postback:ADD_TO_CART', async (payload, chat) => {
            const customer = this.customer(payload.sender.id);
            customer.cart.push(customer.selected_product)
            customer.selected_product = null
            customer.expecting = "product";
            let text = 'Added, Would you like to continue to order?'
            await logConvo(payload, "Bot", text)
            chat.say({
                text,
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
            let amount = orderService.orderTotal(dbOrder)
            // generate checkout id here
            let request = { amount }
            await axios.post(process.env.PAYMENT_API + '/checkout', request).then(async (res)=>{
                let checkout_id = res?.data?.data?.id
                if (!checkout_id) {
                    let text = `Could not generate payment page, someone will be in contact with you soon`
                    await logConvo(payload, "Bot", text)
                    chat.say(text)
                    return
                }
                let text = `Order no. ${dbOrder.orders_id} Confirmed, Total: ${amount}`
                await logConvo(payload, "Bot", text)
                chat.say({
                    text,
                    buttons: [
                        { title: 'Click to Pay', type: 'web_url', url: 'http://localhost:4200//customer/checkout/' + checkout_id }
                    ]
                })
            }).catch(r=>{
                console.error(r)
            })
        });
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
                    let text = "Selecting Product " + product.name
                    await logConvo(payload, "Bot", text)
                    chat.say({
                        text,
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
        this.bot.on('postback:START_ORDER', async (payload, chat) => {
            const customer = this.customer(payload.sender.id);
            if (customer.selected_product) customer.cart.push(customer.selected_product)
            customer.selected_product = null;
            setTimeout(() => { customer.expecting = "name" }, 100)
            customer.order = {
                customer_id: payload.sender.id
            }
            let text = `what is your name? (example: John Micheal)`
            await logConvo(payload, "Bot", text)
            chat.say(text);
        });
        this.bot.on('message', async (payload, chat) => {
            const customer = this.customer(payload.sender.id);
            if (customer.expecting === "name") {
                customer.order.name = payload.message?.text
                setTimeout(() => { customer.expecting = "phone" }, 100)
                let text = `what is your phone number with county code? (example: +12025550107)`
                await logConvo(payload, "Bot", text)
                chat.say(text);
            }
        });
        this.bot.on('message', async (payload, chat) => {
            const customer = this.customer(payload.sender.id);
            if (customer.expecting === "phone") {
                customer.order.phone = payload.message?.text
                setTimeout(() => { customer.expecting = "country" }, 100)
                let text = `What is your country? (example: US)`
                await logConvo(payload, "Bot", text)
                chat.say(text);
            }
        });
        this.bot.on('message', async (payload, chat) => {
            const customer = this.customer(payload.sender.id);
            if (customer.expecting === "country") {
                customer.order.country = payload.message?.text
                setTimeout(() => { customer.expecting = "order_confirm" }, 100)
                let text = `Please enter your full shipping address?`
                await logConvo(payload, "Bot", text)
                chat.say(text);
            }
        });
        this.bot.on('message', async (payload, chat) => {
            const customer = this.customer(payload.sender.id);
            if (customer.expecting === "order_confirm") {
                customer.order.address = payload.message?.text
                const order = customer.order;
                setTimeout(() => { customer.expecting = "order" }, 100)
                let text = `Order Detail:\nName: ${order.name}\nPhone: ${order.phone}\nAddress: ${order.address}\nCountry: ${order.country}`
                await logConvo(payload, "Bot", text)
                chat.say({
                    text,
                    buttons: [
                        { type: 'postback', title: 'Continue to Checkout', payload: 'CONFIRM_ORDER' },
                    ]
                })
            }
        });
        // order created amount 50$ , continue to checkout here
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

function logConvo(payload, sender: "Bot" | "Customer", text?, customer_id?) {
    let convo = new Conversation();
    if (!customer_id) customer_id = payload.sender.id
    convo.getConversation({ customer_id }).then(dbConvo => {
        // if convo alrady exists add it to messages else create a brand new message
        if (!text) {
            text = payload?.message ? payload.message.text : payload.postback.title
        }
        let message: IMessage = {
            timestamp: payload.timestamp,
            sender,
            text
        };
        if (dbConvo) {
            dbConvo.meta.messages.push(message);
            convo.updateConversation({ conversations_id: dbConvo.conversations_id }, { meta: dbConvo.meta });
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
            convo.createConversation(conversation);
        }
    })
}