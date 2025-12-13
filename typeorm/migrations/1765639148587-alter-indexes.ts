import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterIndexes1765639148587 implements MigrationInterface {
    name = 'AlterIndexes1765639148587'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_category_name"`);
        await queryRunner.query(`CREATE INDEX "IXD_PRODUCT_CATEGORY_STOCK" ON "product" ("category_id", "in_stock") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IXD_PRODUCT_CATEGORY_STOCK"`);
        await queryRunner.query(`CREATE INDEX "IDX_category_name" ON "category" ("name") `);
    }

}
