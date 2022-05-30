import { IProduct } from './product.d';
export interface IOrder {
    orders_id?: number;
    phone?: string;
    address?: string;
    status?: string;
    country?: string;
    name?: string;
    customer_id?: string;
    meta?: {
        products?:IProduct[]
    };
}
