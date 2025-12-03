import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, Check, Index } from 'typeorm';
import { Order } from 'src/order/entities/order.entity';
import { CartProduct } from './cartProduct.entity';
import { Review } from 'src/review/entities/review.entity';
import { Role } from 'src/common/enums/role.enum';

@Entity('users')
@Check(`"phone" LIKE '^+'`)
@Check(`"email" LIKE '%@%'`)
@Index("IDX_USER_ID", ["login"])
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ length: 20, unique: true })
  login: string;

  @Column({ length: 60 })
  password: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 30 })
  phone: string;

  @Column({ length: 50, unique: true })
  email: string;

  @Column({ name: 'img_url', type: 'text', nullable: true })
  imgUrl: string;

  @CreateDateColumn({ name: 'created_at'})
  createdAt: Date;

  @Column({ type: 'enum', enum: Role })
  role: Role

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => CartProduct, (cartProduct) => cartProduct.user)
  cart: CartProduct[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}