import * as dotenv from "dotenv";
import { DataSource, DataSourceOptions } from "typeorm";

dotenv.config();

export const dataSourceOptions = {
    type: process.env.DATABASE_TYPE,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DB,
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/typeorm/migrations/[0-9]*.js'],
    synchronize: false,
}

const dataSource = new DataSource(dataSourceOptions as DataSourceOptions);
export default dataSource;