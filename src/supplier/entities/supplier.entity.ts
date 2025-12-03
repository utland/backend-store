import { Product } from 'src/product/entities/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('supplier')
export class Supplier {
  @PrimaryGeneratedColumn({ name: 'supplier_id' })
  supplierId: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 15 })
  phone: string;

  @Column({ length: 20 })
  email: string;

  @Column('text', { name: 'logo_url', nullable: true })
  logoUrl: string;

  @OneToMany(() => Product, (product) => product.supplier)
  products: Product[];
}