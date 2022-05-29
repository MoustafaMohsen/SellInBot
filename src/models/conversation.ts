import { IConversation } from '../interfaces/conversation';
import { DbObjectService } from "../services/db.object.service";

export class Conversation {
    constructor() { }

    getConversations() {
        let db = new DbObjectService<IConversation>("conversations");
        return db.get_all_objects()
    }

    getConversation(minimumConversation: IConversation) {
        let db = new DbObjectService<IConversation>("conversations");
        return db.get_db_object(minimumConversation)
    }

    createConversation(conversation: IConversation) {
        let db = new DbObjectService<IConversation>("conversations");
        return db.create_db_object(conversation)
    }

    updateConversation(oldConversation: IConversation, newConversation: IConversation) {
        let db = new DbObjectService<IConversation>("conversations");
        return db.update_db_object(oldConversation, newConversation)
    }

    deleteConversation(minimumConversation: IConversation) {
        let db = new DbObjectService<IConversation>("conversations");
        return db.delete_db_object(minimumConversation)
    }
}