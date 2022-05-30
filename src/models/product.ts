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

    async getProductById(searchStr) {
        let db = new DbObjectService<IProduct>("products");
        let minimumProduct:IProduct = {
            products_id:searchStr,
        }
        let result1 = await db.get_db_object(minimumProduct, "OR")
        if (result1) {
            return result1
        }
        return null;

    }

    createProduct(product: IProduct) {
        let db = new DbObjectService<IProduct>("products");
        return db.create_db_object(product)
    }

    updateProduct(oldProduct: IProduct, newProduct: IProduct) {
        let db = new DbObjectService<IProduct>("products");
        return db.update_db_object(oldProduct, newProduct)
    }

    deleteProduct(id:string) {
        let db = new DbObjectService<IProduct>("products");
        return db.delete_db_object(id, "products_id")
    }
}