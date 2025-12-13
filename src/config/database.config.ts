import { registerAs } from "@nestjs/config";

export const databaseConfig = registerAs("database", () => ({
    type: process.env.DATABASE_TYPE,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DB,
    synchronize: Boolean(parseInt(process.env.DATABASE_SYNC ?? "0"))
}));
