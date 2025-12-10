import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    DeleteDateColumn,
    VersionColumn
} from "typeorm";
import { OrderProduct } from "./orderProduct.entity";
import { User } from "src/user/entities/user.entity";
import { OrderStatus } from "src/common/enums/status.enum";
import { Exclude } from "class-transformer";

@Entity("orders")
export class Order {
    @PrimaryGeneratedColumn({ name: "order_id" })
    orderId: number;

    @Column({
        type: "enum",
        enum: OrderStatus,
        default: OrderStatus.WAITING
    })
    status: OrderStatus;

    @Column({ length: 50, name: "order_address", nullable: true })
    orderAddress: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt: Date;

    @UpdateDateColumn({ name: "updated_at" })
    updatedAt: Date;

    @Exclude()
    @DeleteDateColumn({ name: "deleted_at", nullable: true })
    deletedAt: Date;

    @VersionColumn()
    version: number;

    @Column({ name: "user_id" })
    userId: number;

    @ManyToOne(() => User, (user) => user.orders, {
        onDelete: "SET NULL",
        nullable: true
    })
    @JoinColumn({ name: "user_id" })
    user: User;

    @OneToMany(() => OrderProduct, (op) => op.order)
    orderProducts: OrderProduct[];
}
