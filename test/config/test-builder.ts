import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { testConfig } from "./test.config";
import { ValidationPipe } from "@nestjs/common/pipes";
import { DataSource } from "typeorm";
import { ClassSerializerInterceptor, INestApplication } from "@nestjs/common";
import { AppModule } from "../../src/app.module";
import { Reflector } from "@nestjs/core";
import { ConstraintExceptionFilter } from "src/common/filters/constraint.filter-exception";

export class TestBuilder {
    private _app: INestApplication;
    private dataSource: DataSource;

    public static async create(): Promise<TestBuilder> {
        const testBuilder = new TestBuilder();

        await testBuilder.init();

        return testBuilder;
    }

    private async init(): Promise<void> {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule]
        })
            .overrideProvider(ConfigService)
            .useValue({
                get: (key: string) => {
                    if (key.includes("database")) return testConfig.database;
                    if (key.includes("jwt")) return testConfig.jwt;
                    return null;
                }
            })
            .compile();

        this._app = moduleFixture.createNestApplication();

        this.dataSource = moduleFixture.get(DataSource);

        this.app.useGlobalPipes(
            new ValidationPipe({
                transform: true,
                whitelist: true
            })
        );

        this.app.useGlobalInterceptors(new ClassSerializerInterceptor(new Reflector()));
        this.app.useGlobalFilters(new ConstraintExceptionFilter());

        await this._app.init();
    }

    public async clearDb(skipTables?: string[]): Promise<void> {
        const entities = this.dataSource.entityMetadatas;
        const tables = entities
            .filter((e) => {
                return e.tableType !== "view" && (skipTables ? !skipTables.includes(e.tableName) : true);
            })
            .map((e) => `"${e.tableName}"`)
            .join(", ");

        await this.dataSource.query(`TRUNCATE ${tables} RESTART IDENTITY CASCADE;`);
    }

    public async closeApp(): Promise<void> {
        await this.dataSource.destroy();
        await this._app.close();
    }

    get app() {
        return this._app;
    }
}
