import { ViewColumn, ViewEntity } from "typeorm";

@ViewEntity({
    expression: `
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
    `
})
export class SupplierSales {
    @ViewColumn({ name: "company_name" })
    companyName: string;

    @ViewColumn()
    month: string;

    @ViewColumn({ name: "sold_products" })
    soldProducts: number;

    @ViewColumn({ name: "average_price" })
    avgPrice: number;
}
