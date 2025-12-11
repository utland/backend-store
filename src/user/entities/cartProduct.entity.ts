import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn, Check } from "typeorm";
import { User } from "./user.entity";
import { Product } from "src/product/entities/product.entity";

@Entity("cart_product")
@Check(`"amount" > 0`)
export class CartProduct {
    @PrimaryColumn({ name: "user_id" })
    userId: number;

    @PrimaryColumn({ name: "product_id" })
    productId: number;

    @Column({ type: "integer" })
    amount: number;

    @ManyToOne(() => User, (user) => user.cart)
    @JoinColumn({ name: "user_id" })
    user: User;

    @ManyToOne(() => Product, (product) => product.cartProducts, { onDelete: "RESTRICT"})
    @JoinColumn({ name: "product_id" })
    product: Product;
}
