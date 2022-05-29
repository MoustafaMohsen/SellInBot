export interface IConversation {
    conversation_id?: number;
    messages?: {
        text:string
        time:string
    }[];
    source?: string;
    status?: string;
    order?: any;
    meta?: any;
}
