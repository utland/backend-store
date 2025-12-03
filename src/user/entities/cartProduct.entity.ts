import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';
import { Product } from 'src/product/entities/product.entity';

@Entity('cart_product')
export class CartProduct {
  @PrimaryColumn({ name: 'user_id' })
  userId: number;

  @PrimaryColumn({ name: 'product_id' })
  productId: number;

  @Column('integer')
  amount: number;

  @ManyToOne(() => User, (user) => user.cart)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Product, (product) => product.cartProducts)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}