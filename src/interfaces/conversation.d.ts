export interface IConversation {
    conversations_id?: number;
    customer_id?: number;
    source?: "whatsapp" | "messenger";
    status?: "Ordered" | "Paied" | "Pending" | "Shipped" | "Canceled" | "Not Ordred";
    meta?: {
        orders?: number[];
        messages: IMessage[];
        customer_name?: string
    };
}
export interface IMessage {
    text: string;
    timestamp: string;
    sender: "Bot" | "Customer"
}
