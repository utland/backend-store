import { ConfigType } from "src/config/config.types";
import { dataSourceOptions } from "typeorm/data-source";
import * as dotenv from "dotenv";

dotenv.config();

export const testConfig: ConfigType = {
    database: {
        type: process.env.DATABASE_TYPE,
        host: process.env.DATABASE_TEST_HOST,
        port: process.env.DATABASE_TEST_PORT,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_TEST_DB,
        synchronize: true
    },
    jwt: {
        secret: "test-secret",
        expiresIn: "1m"
    }
};
