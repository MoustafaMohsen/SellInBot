import { IProduct } from './../interfaces/product.d';
import { DbObjectService } from "../services/db.object.service";

export class Product {
    constructor() { }

    getProducts() {
        let db = new DbObjectService<IProduct[]>("products");
        return db.get_all_objects()
    }

    getProduct(minimumProduct: IProduct) {
        let db = new DbObjectService<IProduct>("products");
        return db.get_db_object(minimumProduct)
    }

    createProduct(product: IProduct) {
        let db = new DbObjectService<IProduct>("products");
        return db.create_db_object(product)
    }

    updateProduct(oldProduct: IProduct, newProduct: IProduct) {
        let db = new DbObjectService<IProduct>("products");
        return db.update_db_object(oldProduct, newProduct)
    }

    deleteProduct(minimumProduct: IProduct) {
        let db = new DbObjectService<IProduct>("products");
        return db.delete_db_object(minimumProduct)
    }
}