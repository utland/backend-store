import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { OrderProduct } from './orderProduct.entity';
import { User } from 'src/user/entities/user.entity';

export enum OrderStatus {
  WAITING = 'waiting',
  IN_PROCESS = 'in process',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  orderId: number;

  @Column({ type: 'date', name: 'order_date' })
  orderDate: string;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.WAITING
  })
  status: OrderStatus;

  @Column({ length: 50, name: 'order_address', nullable: true })
  orderAddress: string;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => OrderProduct, (op) => op.order)
  orderProducts: OrderProduct[];
}