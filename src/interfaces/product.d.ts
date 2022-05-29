export interface IProduct {
    product_id?: number;
    name?: string;
    image_url?: string;
    description?: string;
    price?: string;
    meta?: {
        visibility?: boolean;
    };
}
