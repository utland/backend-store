import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from 'src/order/entities/order.entity';
import { CartProduct } from './cartProduct.entity';
import { Review } from 'src/review/entities/review.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ length: 20 })
  login: string;

  @Column({ length: 60 }) // Зазвичай тут зберігають хеш пароля
  password: string;

  @Column({ length: 50, nullable: true })
  address: string;

  @Column({ length: 30 })
  phone: string;

  @Column({ length: 50 })
  email: string;

  @Column('text', { name: 'photo_url', nullable: true })
  photoUrl: string;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => CartProduct, (cartProduct) => cartProduct.user)
  cart: CartProduct[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];
}