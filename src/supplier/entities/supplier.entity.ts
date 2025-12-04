import { Product } from "src/product/entities/product.entity";
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    Check,
} from "typeorm";

@Entity("supplier")
@Check(`"phone" LIKE '^+'`)
@Check(`"email" LIKE '%@%'`)
export class Supplier {
    @PrimaryGeneratedColumn({ name: "supplier_id" })
    supplierId: number;

    @Column({ length: 50 })
    name: string;

    @Column({ length: 30 })
    phone: string;

    @Column({ length: 50 })
    email: string;

    @Column({ name: "logo_url", type: "text", nullable: true })
    logoUrl: string;

    @OneToMany(() => Product, (product) => product.supplier)
    products: Product[];
}
