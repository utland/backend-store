import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany, UpdateDateColumn, CreateDateColumn, Check } from 'typeorm';
import { OrderProduct } from 'src/order/entities/orderProduct.entity';
import { Supplier } from 'src/supplier/entities/supplier.entity';
import { Category } from 'src/category/entities/category.entity';
import { CartProduct } from 'src/user/entities/cartProduct.entity';
import { Review } from 'src/review/entities/review.entity';

@Entity('product')
@Check(`"price" > 0`)
export class Product {
  @PrimaryGeneratedColumn({ name: 'product_id' })
  productId: number;

  @Column({ length: 30 })
  name: string;

  @Column({ type: 'integer'})
  price: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'img_url', type: 'text', nullable: true })
  imgUrl: string;

  @Column({ name: "is_stock", type: 'boolean', default: true})
  isInStock: boolean;

  @CreateDateColumn({ name: 'created_at'})
  createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at'})
  updatedAt: Date;

  @Column({ name: 'supplier_id' })
  supplierId: number;

  @Column({ name: 'category_id' })
  categoryId: number;
  
  @ManyToOne(() => Supplier, (supplier) => supplier.products)
  @JoinColumn({ name: 'supplier_id' })
  supplier: Supplier;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => OrderProduct, (op) => op.product)
  orderProducts: OrderProduct[];

  @OneToMany(() => CartProduct, (cp) => cp.product)
  cartProducts: CartProduct[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];
}