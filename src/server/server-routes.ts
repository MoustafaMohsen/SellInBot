import { HelperService } from './../services/util/helper';
import { IUser } from './../interfaces/user.interface';
import performance from "perf_hooks";
import express from "express";
import MainServerCore from './core/server-core';
import { DBService } from "../services/dbservice";
import { UserService } from '../services/user.service';
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
        //#region Admin Area
        this.app.post('/', async (req, res) => {
            let t0 = performance.performance.now();
            let data = {} as any;
            try {
                send(res, data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
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
        //#region Admin Area
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
                // if (!req.body.configs) {
                //     throw "req.body.configs was not set"
                // }
                var data = messenger.setupBotForPage(req.body.configs)
                send(res, data, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })

        this.app.post('/admin/send-message/' + process.env.APP_SECRET_KEY, async (req, res) => {
            let t0 = performance.performance.now();
            try {
                if (!req.body.message) {
                    throw "req.body.message was not set"
                }
                // var data = await messenger.send(req.body.message)
                send(res, {}, t0)
            } catch (error) {
                err(res, error, t0)
            }
        })
        //#endregion


        this.app.post('/register', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const userSrv = new UserService();
                let newUserObject: IUser = req.body.secureAuthObject;
                newUserObject.meta = {
                    private_key: HelperService.makeid(64)
                }
                userSrv.registerUser(newUserObject).then((d) => {
                    delete d.meta;
                    send(res, d, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (error) {
                err(res, error, t0)
            }
        })

        this.app.post('/login', async (req, res) => {
            let t0 = performance.performance.now();
            try {
                const userSrv = new UserService();
                let secureAuthObject: IUser = req.body.secureAuthObject;
                userSrv.authenticatUser(secureAuthObject).then((d) => {
                    delete d.meta;
                    send(res, d, t0)
                }).catch(e => {
                    err(res, e, t0)
                })
            } catch (error) {
                err(res, error, t0)
            }
        })

    }

}