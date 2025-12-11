import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTables1765400008399 implements MigrationInterface {
    name = 'UpdateTables1765400008399'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "is_stock" TO "in_stock"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "version" integer NOT NULL DEFAULT '1'`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "in_stock"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "in_stock" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "CHK_b992dd26c22d6c5d1207cd893b" CHECK ("in_stock" >= 0)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "CHK_b992dd26c22d6c5d1207cd893b"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "in_stock"`);
        await queryRunner.query(`ALTER TABLE "product" ADD "in_stock" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "version"`);
        await queryRunner.query(`ALTER TABLE "product" RENAME COLUMN "in_stock" TO "is_stock"`);
    }

}
