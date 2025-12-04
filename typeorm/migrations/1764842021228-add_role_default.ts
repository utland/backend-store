import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRoleDefault1764842021228 implements MigrationInterface {
    name = 'AddRoleDefault1764842021228'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
    }

}
