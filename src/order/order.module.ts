import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Order } from "./entities/order.entity";
import { ProductModule } from "src/product/product.module";
import { ProductService } from "src/product/product.service";
import { OrderProduct } from "./entities/orderProduct.entity";

@Module({
    imports: [TypeOrmModule.forFeature([Order, OrderProduct])],
    controllers: [OrderController],
    providers: [OrderService]
})
export class OrderModule {}
