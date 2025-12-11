import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, Check, DeleteDateColumn } from "typeorm";
import { Order } from "./order.entity";
import { Product } from "src/product/entities/product.entity";
import { Exclude } from "class-transformer";

@Entity("order_product")
@Check(`"amount" > 0`)
@Check(`"price" > 0`)
export class OrderProduct {
    @PrimaryColumn({ name: "order_id" })
    orderId: number;

    @PrimaryColumn({ name: "product_id" })
    productId: number;

    @Column("integer")
    amount: number;

    @Column("integer")
    price: number;

    @Exclude()
    @DeleteDateColumn({ name: "deleted_at", nullable: true})
    deletedAt: Date

    @ManyToOne(() => Order, (order) => order.orderProducts)
    @JoinColumn({ name: "order_id" })
    order: Order;

    @ManyToOne(() => Product, (product) => product.orderProducts, { onDelete: "RESTRICT"})
    @JoinColumn({ name: "product_id" })
    product: Product;
}
