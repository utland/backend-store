import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { OrderProduct } from 'src/order/entities/orderProduct.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Category } from 'src/category/entities/category.entity';
import { CartProduct } from 'src/user/entities/cartProduct.entity';
import { Review } from 'src/review/entities/review.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn({ name: 'product_id' })
  productId: number;

  @Column({ length: 30 })
  name: string;

  @Column('integer') // TypeORM не перевіряє check(price > 0) автоматично, це робить БД
  price: number;

  @Column('text')
  description: string;

  @Column({ name: 'supplier_id' })
  supplierId: number;

  @ManyToOne(() => Supplier, (supplier) => supplier.products)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @Column({ name: 'category_id' })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  // Зворотні зв'язки для ORM
  @OneToMany(() => OrderProduct, (op) => op.product)
  orderProducts: OrderProduct[];

  @OneToMany(() => CartProduct, (cp) => cp.product)
  cartProducts: CartProduct[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];
}