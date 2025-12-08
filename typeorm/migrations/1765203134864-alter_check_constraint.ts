import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterCheckConstraint1765203134864 implements MigrationInterface {
    name = 'AlterCheckConstraint1765203134864'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_941928bb57d62811ff3d36daee"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_881c6c8fe9219270aaa49fb117" CHECK ("phone" LIKE '+%')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_881c6c8fe9219270aaa49fb117"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_941928bb57d62811ff3d36daee" CHECK (((phone)::text ~~ '^+'::text))`);
    }

}
