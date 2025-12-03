import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConstraints1764779369377 implements MigrationInterface {
    name = 'AddConstraints1764779369377'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "review" DROP COLUMN "review_date"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "order_date"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "photo_url"`);
        await queryRunner.query(`ALTER TABLE "category" ADD "img_url" text`);
        await queryRunner.query(`ALTER TABLE "review" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "review" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "product" ADD "img_url" text`);
        await queryRunner.query(`ALTER TABLE "product" ADD "is_stock" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "product" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "product" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ADD "img_url" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "phone" character varying(30) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "email" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE ("login")`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "address" text`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email")`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD CONSTRAINT "CHK_bd0e334878c2b0957b2eeef039" CHECK ("email" LIKE '%@%')`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD CONSTRAINT "CHK_a69f3cf299d89bc2f9e6bc1efb" CHECK ("phone" LIKE '^+')`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "CHK_6c12de879f5c0fa3a16e1dd95b" CHECK ("evaluation" >= 0 AND "evaluation" <= 5)`);
        await queryRunner.query(`ALTER TABLE "product" ADD CONSTRAINT "CHK_dfa05ac382975a36460b98fd0e" CHECK ("price" > 0)`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_6deb16327b8b5957516eedb774" CHECK ("email" LIKE '%@%')`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_941928bb57d62811ff3d36daee" CHECK ("phone" LIKE '^+')`);
        await queryRunner.query(`ALTER TABLE "cart_product" ADD CONSTRAINT "CHK_725d79a173bf22e3be3dede01b" CHECK ("amount" > 0)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_product" DROP CONSTRAINT "CHK_725d79a173bf22e3be3dede01b"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_941928bb57d62811ff3d36daee"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_6deb16327b8b5957516eedb774"`);
        await queryRunner.query(`ALTER TABLE "product" DROP CONSTRAINT "CHK_dfa05ac382975a36460b98fd0e"`);
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "CHK_6c12de879f5c0fa3a16e1dd95b"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP CONSTRAINT "CHK_a69f3cf299d89bc2f9e6bc1efb"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP CONSTRAINT "CHK_bd0e334878c2b0957b2eeef039"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "address" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c"`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "email"`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "email" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "supplier" DROP COLUMN "phone"`);
        await queryRunner.query(`ALTER TABLE "supplier" ADD "phone" character varying(15) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "img_url"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "is_stock"`);
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "img_url"`);
        await queryRunner.query(`ALTER TABLE "review" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "review" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "category" DROP COLUMN "img_url"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "photo_url" text`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "order_date" date NOT NULL`);
        await queryRunner.query(`ALTER TABLE "review" ADD "review_date" date NOT NULL`);
    }

}
