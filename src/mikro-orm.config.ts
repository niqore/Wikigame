import { WikiUser } from "./entities/WikiUser";

export default {
    entities: [WikiUser],
    dbName: './dist/database.db',
    type: 'sqlite',
};