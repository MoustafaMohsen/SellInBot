import { config } from "dotenv"; "dotenv";
config();
import MainServer from "./server/core/server-init";
import { MessengerBot } from "./services/bots/messenger.service";
export const messenger = new MessengerBot();
try {
    const server = new MainServer();
    server.init();

} catch (error) {
    console.log(error);
}