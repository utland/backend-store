import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { appSchema } from './config/schema.config';
import { databaseConfig } from './config/database.config';
import { jwtConfig } from './config/jwt.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigType } from './config/config.types';
import { UserModule } from './user/user.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { SupplierModule } from './supplier/supplier.module';
import { CategoryModule } from './category/category.module';
import { Review } from './review/entities/review.entity';
import { ReviewModule } from './review/review.module';
import { User } from './user/entities/user.entity';
import { Product } from './product/entities/product.entity';
import { Order } from './order/entities/order.entity';
import { Category } from './category/entities/category.entity';
import { Supplier } from './supplier/entities/supplier.entity';
import { OrderProduct } from './order/entities/orderProduct.entity';
import { CartProduct } from './user/entities/cartProduct.entity';
import { TestModule } from './test/test.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigType>) => ({
        ...configService.get("database"),
        entities: [User, Product, Order, Review, Category, Supplier, OrderProduct, CartProduct],
      }),
    }),

    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: appSchema,
      load: [databaseConfig, jwtConfig],
      validationOptions: {
        abortEarly: true
      }
    }),
    UserModule,
    OrderModule,
    ProductModule,
    SupplierModule,
    CategoryModule,
    ReviewModule,
    TestModule
  ]
})
export class AppModule {}
