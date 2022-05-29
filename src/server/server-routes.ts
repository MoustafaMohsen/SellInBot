import { IProduct } from './../interfaces/product.d';
import { Product } from './../models/product';
import { IOrder } from './../interfaces/order.d';
import { Order } from './../models/order';
import { IConversation } from './../interfaces/conversation.d';
import { Conversation } from './../models/conversation';
import { HelperService } from './../services/util/helper';
import performance from "perf_hooks";
import express from "express";
import MainServerCore from './core/server-core';
import { DBService } from "../services/dbservice";
import { messenger } from '..';

export default class MainServerRoutes extends MainServerCore {

    setupRoute() {

        function send(res: express.Response, data, t0) {
            let pre = performance.performance.now() - t0;
            console.log(`-->Request for:'${res.req.path}', from client:'${res.req.ip}' took:${pre}ms`);
            if (!res.headersSent) {
                res.send(JSON.stringify({ performance: pre, success: true, data }))
            } else {
                res.write(JSON.stringify({ performance: pre, success: true, data }));
                res.end();
            }
        }

        function err(res: express.Response, message, t0, statuscode = 400) {
            // res.status(statuscode);
            let pre = performance.performance.now() - t0;
            console.log(`-->Request errored for:'${res.req.path}', from client:'${res.req.ip}' took:${pre}ms`);
            console.error(message);
            res.send(JSON.stringify({ data: {}, response_status: 400, message, performance: pre, success: false }))
        }
        // ======================================================
        // ================== Products
        // ======================================================
        //#region Products
        this.app.post('/products/get', async (req, res) => {
            let t0 = performance.performance.now();
            const p = new Product();
            try {
                let data: IProduct = req.body;
                let result = await p.getProduct(data)
                send(res, result, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        this.app.post('/products/get-all', async (req, res) => {
            let t0 = performance.performance.now();
            let data = req.body;
            const p = new Product();
            try {
                let result = await p.getProduct({})
                send(res, result, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        this.app.post('/products/create', async (req, res) => {
            let t0 = performance.performance.now();
            const p = new Product();
            try {
                let data: IProduct = req.body;
                let result = await p.createProduct(data)
                send(res, result, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        this.app.post('/products/update', async (req, res) => {
            let t0 = performance.performance.now();
            const p = new Product();
            try {
                let data = {
                    new_product: req.body.new_product,
                    old_product: req.body.old_product
                };
                let result = await p.updateProduct(data.old_product, data.new_product)
                send(res, result, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        this.app.post('/products/delete', async (req, res) => {
            let t0 = performance.performance.now();
            const p = new Product();
            try {
                let data: IProduct = req.body;
                let result = await p.deleteProduct(data)
                send(res, result, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        //#endregion

        // ======================================================
        // ================== Orders
        // ======================================================
        //#region Orders
        this.app.post('/orders/get', async (req, res) => {
            let t0 = performance.performance.now();
            const p = new Order();
            try {
                let data: IOrder = req.body;
                let result = await p.getOrder(data)
                send(res, result, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        this.app.post('/orders/get-all', async (req, res) => {
            let t0 = performance.performance.now();
            let data = req.body;
            const p = new Order();
            try {
                let result = await p.getOrder({})
                send(res, result, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        this.app.post('/orders/create', async (req, res) => {
            let t0 = performance.performance.now();
            const p = new Order();
            try {
                let data: IOrder = req.body;
                let result = await p.createOrder(data)
                send(res, result, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        this.app.post('/orders/update', async (req, res) => {
            let t0 = performance.performance.now();
            const p = new Order();
            try {
                let data = {
                    new_order: req.body.new_order,
                    old_order: req.body.old_order
                };
                let result = await p.updateOrder(data.old_order, data.new_order)
                send(res, result, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        this.app.post('/orders/delete', async (req, res) => {
            let t0 = performance.performance.now();
            const p = new Order();
            try {
                let data: IOrder = req.body;
                let result = await p.deleteOrder(data)
                send(res, result, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        //#endregion

        // ======================================================
        // ================== Conversations
        // ======================================================
        //#region Conversations
        this.app.post('/conversations/get', async (req, res) => {
            let t0 = performance.performance.now();
            const p = new Conversation();
            try {
                let data: IConversation = req.body;
                let result = await p.getConversation(data)
                send(res, result, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        this.app.post('/conversations/get-all', async (req, res) => {
            let t0 = performance.performance.now();
            let data = req.body;
            const p = new Conversation();
            try {
                let result = await p.getConversation({})
                send(res, result, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        this.app.post('/conversations/create', async (req, res) => {
            let t0 = performance.performance.now();
            const p = new Conversation();
            try {
                let data: IConversation = req.body;
                let result = await p.createConversation(data)
                send(res, result, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        this.app.post('/conversations/update', async (req, res) => {
            let t0 = performance.performance.now();
            const p = new Conversation();
            try {
                let data = {
                    new_conversation: req.body.new_conversation,
                    old_conversation: req.body.old_conversation
                };
                let result = await p.updateConversation(data.old_conversation, data.new_conversation)
                send(res, result, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        this.app.post('/conversations/delete', async (req, res) => {
            let t0 = performance.performance.now();
            const p = new Conversation();
            try {
                let data: IConversation = req.body;
                let result = await p.deleteConversation(data)
                send(res, result, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        //#endregion


        //#region Webhooks
        // All whatsapp messages come here
        this.app.get('/whatsapp/webhook', async (req, res) => {
            let t0 = performance.performance.now();
            let query = req.query;
            try {
                res.send(query["hub.challenge"])
                // send(res, data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        this.app.post('/whatsapp/webhook', async (req, res) => {
            let t0 = performance.performance.now();
            let data = req.body;
            console.log(JSON.stringify(data))
            try {
                send(res, {}, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        //#endregion

        //#region Admin Area
        this.app.get('/', async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            try {
                send(res, data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })

        this.app.get('/admin/test-db', async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            const db = new DBService();
            try {
                data.result = (await db.connect());
                send(res, data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })

        this.app.post('/admin/prepare-db/' + process.env.APP_SECRET_KEY, async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            const db = new DBService();
            try {
                data.result = { ...(await db.PrepareDB(req.body.database)) };
                send(res, data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })

        this.app.post('/admin/listen-to-page/' + process.env.APP_SECRET_KEY, async (req, res) => {
            let t0 = performance.performance.now();
            try {
                var data = messenger.setupBotForPage(req.body.configs)
                send(res, data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        //#endregion

    }

}