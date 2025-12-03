import { TypeOrmModule } from "@nestjs/typeorm";
import { IJwtConfig } from "./jwt.config";

export interface ConfigType {
    database: TypeOrmModule,
    jwt: IJwtConfig
}