import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUsertopView1765629293883 implements MigrationInterface {
    name = 'AddUsertopView1765629293883'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE VIEW "top_users" AS 
    with category_stat as (
        select
	    u.login as username,
	    c.name as category,
	    sum(sum(op.amount)) over (partition by u.login)::integer as total_products,
	    row_number() over (partition by u.login order by sum(op.amount) desc) as rank_category
	    from users u
	    left join orders o using(user_id)
	    left join order_product op on op.order_id = o.order_id
	    left join product p on p.product_id = op.product_id
	    left join category c on c.category_id = p.category_id
	    where o.status = 'completed'
	    group by u.login, u.role, c.category_id, c.name
	    having u.role = 'user'
    )

    select 
    username, 
    total_products, 
    category as favorite_category
    from category_stat
    where rank_category = 1
    order by total_products desc
    limit 3 offset 0
    `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","VIEW","top_users","with category_stat as (\n        select\n\t    u.login as username,\n\t    c.name as category,\n\t    sum(sum(op.amount)) over (partition by u.login)::integer as total_products,\n\t    row_number() over (partition by u.login order by sum(op.amount) desc) as rank_category\n\t    from users u\n\t    left join orders o using(user_id)\n\t    left join order_product op on op.order_id = o.order_id\n\t    left join product p on p.product_id = op.product_id\n\t    left join category c on c.category_id = p.category_id\n\t    where o.status = 'completed'\n\t    group by u.login, u.role, c.category_id, c.name\n\t    having u.role = 'user'\n    )\n\n    select \n    username, \n    total_products, \n    category as favorite_category\n    from category_stat\n    where rank_category = 1\n    order by total_products desc\n    limit 3 offset 0"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["VIEW","top_users","public"]);
        await queryRunner.query(`DROP VIEW "top_users"`);
    }

}
