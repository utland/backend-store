import { Product } from "src/product/entities/product.entity";
import { text } from "stream/consumers";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index } from "typeorm";

@Entity("category")
@Index("IDX_category_name", ["name"])
export class Category {
    @PrimaryGeneratedColumn({ name: "category_id" })
    categoryId: number;

    @Column({ type: "text" })
    img_url: string;

    @Column({ length: 20 })
    name: string;

    @OneToMany(() => Product, (product) => product.category, { onDelete: "RESTRICT" })
    products: Product[];
}
