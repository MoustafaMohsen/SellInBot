import { IDBSelect } from "../interfaces/db";
import { DBService } from "./dbservice";

export class DbObjectService<T> {
    constructor(private tablename: string, private parseArr:string[] = ["meta"], private dbname = "sellinbotdb") {
    }

    async create_db_object(obj: T) {
        const db = new DBService();
        let results = await db.insert_object(obj, this.tablename, this.dbname, this.tablename + "_id");
        let result = await this.get_db_object(results.rows[0]);
        return result;
    }

    async get_all_objects() {
        const db = new DBService();
        let client = await db.connect();
        let results = await client.query(`SELECT * FROM ${this.tablename}`);
        for (let i = 0; i < results.rows.length; i++) {
            let row = results.rows[i];
            row = this.parse_object(row);
        }
        return results.rows
    }
    async get_db_object(minimum_user_object: T) {
        const db = new DBService();
        let _user: IDBSelect<T> = {
            "*": minimum_user_object
        }
        let results = await db.get_object<T>(_user, "AND", this.tablename);
        if (results.rows[0]) {
            return this.parse_object(results.rows[0]);
        }
        return null;
    }

    async update_db_object(object: T, newObj: T) {
        const db = new DBService();
        let results = await db.update_object<T>(newObj as Object, object as Object, this.tablename);
        let result = await this.get_db_object(object);
        return result;
    }


    async delete_db_object(obj: T) {
        const db = new DBService();
        let results = await db.delete_object<T>(obj as Object, "AND", this.tablename);
        return results;
    }

    //#region User parser
    private parse_object(obj, parseArr:string[] = this.parseArr) {
        try {
            for (let i = 0; i < parseArr.length; i++) {
                const key = parseArr[i];
                if (obj[key]) {
                    obj[key] = this.parse_if_string(obj[key]) as any;
                } else {
                    obj[key] = {}
                }
            }
            return obj;
        } catch (error) {
            return obj
        }
    }

    private parse_if_string<T = any>(str: string | object): T {
        let temp = str;
        if (str && typeof str === "string") {
            try {
                temp = JSON.parse(str);
            } catch (error) {
                temp = str;
            }
        } else {
            temp = str;
        }
        return (temp as any);
    }
}