import { IOrder } from '../interfaces/order';
import { DbObjectService } from "../services/db.object.service";

export class Order {
    constructor() { }

    getOrders() {
        let db = new DbObjectService<IOrder>("orders");
        return db.get_db_object({})
    }

    getOrder(minimumOrder: IOrder) {
        let db = new DbObjectService<IOrder>("orders");
        return db.get_db_object(minimumOrder)
    }

    createOrder(order: IOrder) {
        let db = new DbObjectService<IOrder>("orders");
        return db.create_db_object(order)
    }

    updateOrder(oldOrder: IOrder, newOrder: IOrder) {
        let db = new DbObjectService<IOrder>("orders");
        return db.update_db_object(oldOrder, newOrder)
    }

    deleteOrder(minimumOrder: IOrder) {
        let db = new DbObjectService<IOrder>("orders");
        return db.delete_db_object(minimumOrder)
    }
}