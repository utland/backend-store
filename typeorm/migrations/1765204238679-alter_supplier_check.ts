import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterSupplierCheck1765204238679 implements MigrationInterface {
    name = 'AlterSupplierCheck1765204238679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier" DROP CONSTRAINT "CHK_a69f3cf299d89bc2f9e6bc1efb"`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD CONSTRAINT "CHK_156cbde897c184ae46220370c7" CHECK ("phone" LIKE '+%')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "supplier" DROP CONSTRAINT "CHK_156cbde897c184ae46220370c7"`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD CONSTRAINT "CHK_a69f3cf299d89bc2f9e6bc1efb" CHECK (((phone)::text ~~ '^+'::text))`);
    }

}
