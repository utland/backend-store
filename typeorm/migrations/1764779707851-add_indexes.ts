import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIndexes1764779707851 implements MigrationInterface {
    name = 'AddIndexes1764779707851'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "CHK_6c12de879f5c0fa3a16e1dd95b"`);
        await queryRunner.query(`CREATE INDEX "IDX_category_name" ON "category" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_USER_ID" ON "users" ("login") `);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "CHK_2e91998a0c837768c46ff073a3" CHECK ("evaluation" >= 0 AND "evaluation" <= 5)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "CHK_2e91998a0c837768c46ff073a3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_USER_ID"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_category_name"`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "CHK_6c12de879f5c0fa3a16e1dd95b" CHECK (((evaluation >= 0) AND (evaluation <= 5)))`);
    }

}
