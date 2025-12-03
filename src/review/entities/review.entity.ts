import { Product } from 'src/product/entities/product.entity';
import { User } from 'src/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, Check } from 'typeorm';

@Entity('review')
@Check(`"evaluation" >= 0 AND "evaluation" <= 5`)
export class Review {
  @PrimaryGeneratedColumn({ name: 'review_id' })
  reviewId: number;

  @Column({ name: 'user_id' })
  userId: number;
  
  @Column({ name: 'product_id' })
  productId: number;
  
  @Column({ type: 'smallint'})
  evaluation: number;
  
  @Column({ type: 'text', nullable: true })
  comment: string;
  
  @CreateDateColumn({ name: 'created_at'})
  createdAt: Date;
  
  @UpdateDateColumn({ name: 'updated_at'})
  updatedAt: Date;

  @ManyToOne(() => Product, (product) => product.reviews)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @ManyToOne(() => User, (user) => user.reviews)
  @JoinColumn({ name: 'user_id' })
  user: User;
}