import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewCheckConstraint1765392793231 implements MigrationInterface {
    name = 'AddNewCheckConstraint1765392793231'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_product" ADD CONSTRAINT "CHK_0cef0dc3aee36a44253b8b4cb7" CHECK ("price" > 0)`);
        await queryRunner.query(`ALTER TABLE "order_product" ADD CONSTRAINT "CHK_8a71767797ef74ec90c4263872" CHECK ("amount" > 0)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_product" DROP CONSTRAINT "CHK_8a71767797ef74ec90c4263872"`);
        await queryRunner.query(`ALTER TABLE "order_product" DROP CONSTRAINT "CHK_0cef0dc3aee36a44253b8b4cb7"`);
    }

}
