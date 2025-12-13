import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
    expression: `
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
    `
})
export class TopUsers {
    @ViewColumn()
    username: string

    @ViewColumn({ name: "total_products"})
    totalProducts: number;

    @ViewColumn({ name: "favorite_category"})
    favoriteCategory: string;
}