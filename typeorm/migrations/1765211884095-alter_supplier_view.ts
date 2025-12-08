import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterSupplierView1765211884095 implements MigrationInterface {
    name = 'AlterSupplierView1765211884095'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE VIEW "supplier_sales" AS 
        select 
        s.name as company_name,
        date_trunc('month', o.created_at) as month,
        sum(op.amount) as sold_products,
        round(avg(op.amount * op.price), 2) as average_price
        from supplier s
        left join product p on s.supplier_id = p.supplier_id
        left join order_product op on op.product_id = p.product_id
        left join orders o on o.order_id = op.order_id
        where o.status = 'completed'
        group by s.name, date_trunc('month', o.created_at)
        order by sold_products desc
    `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","supplier_sales","select \n        s.name as company_name,\n        date_trunc('month', o.created_at) as month,\n        sum(op.amount) as sold_products,\n        round(avg(op.amount * op.price), 2) as average_price\n        from supplier s\n        left join product p on s.supplier_id = p.supplier_id\n        left join order_product op on op.product_id = p.product_id\n        left join orders o on o.order_id = op.order_id\n        where o.status = 'completed'\n        group by s.name, date_trunc('month', o.created_at)\n        order by sold_products desc"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","supplier_sales","public"]);
        await queryRunner.query(`DROP VIEW "supplier_sales"`);
    }

}
