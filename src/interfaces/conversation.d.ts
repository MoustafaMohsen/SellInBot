export interface IConversation {
    conversation_id?: number;
    source?: "whatsapp" | "messenger";
    status?: "Ordered" | "Paied" | "Pending" | "Shipped" | "Canceled" | "Not Ordred";
    meta?: {
        order?: any;
        messages?: {
            text:string
            time:string
            sender:"bot" | "customer"
        }[];
        customer_name:string
    };
  }
  