import { MigrationInterface, QueryRunner } from "typeorm";

export class CorrectColumns1765469776231 implements MigrationInterface {
    name = 'CorrectColumns1765469776231'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "category" ALTER COLUMN "img_url" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "order_address" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "order_address" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "category" ALTER COLUMN "img_url" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "product" ADD "deleted_at" TIMESTAMP`);
    }

}
