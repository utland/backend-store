import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { DataSource, In, OptimisticLockVersionMismatchError, QueryRunner, Repository } from "typeorm";
import { Order } from "./entities/order.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrderProduct } from "./entities/orderProduct.entity";
import { OrderStatus } from "src/common/enums/status.enum";
import { Product } from "src/product/entities/product.entity";
import { CreateOrderProductDto } from "./dto/create-order-product.dto";
import { retry } from "rxjs";

@Injectable()
export class OrderService {
    constructor(
        private readonly dataSource: DataSource,

        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>
    ) {}

    public async createOrder(userId: number, createOrderDto: CreateOrderDto): Promise<Order> {
        const { address, orderItems } = createOrderDto;

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const order = await queryRunner.manager.save(Order, {
                userId,
                orderAddress: address
            });

            const ids = orderItems.map((e) => e.productId);
            const products = await queryRunner.manager.find(Product, {
                where: { productId: In(ids) },
                lock: { mode: "pessimistic_write" }
            });

            if (products.length !== ids.length) {
                throw new NotFoundException("One of provided products is not found");
            }

            for (let product of products) {
                product.inStock -= this.getAmount(orderItems, product.productId);

                if (product.inStock < 0) {
                    throw new ConflictException("Product is out of stock");
                }
            }

            await queryRunner.manager.save(Product, products);

            const orderProducts = orderItems.map((item) => {
                return queryRunner.manager.create(OrderProduct, {
                    orderId: order.orderId,
                    productId: item.productId,
                    amount: item.amount,
                    price: item.price
                });
            });

            order.orderProducts = orderProducts;
            await queryRunner.manager.save(OrderProduct, orderProducts);

            await queryRunner.commitTransaction();

            return order;
        } catch (error) {
            await queryRunner.rollbackTransaction();

            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    public async findOrdersByUserId(userId: number): Promise<Order[]> {
        const orders = await this.orderRepo.find({
            where: { userId },
            relations: ["orderProducts", "orderProducts.product"],
            order: { createdAt: "DESC" }
        });

        return orders;
    }

    public async findAll(): Promise<Order[]> {
        const orders = await this.orderRepo.find({ relations: ["orderProducts.product"] });

        return orders;
    }

    public async findOrder(orderId: number): Promise<Order> {
        const order = await this.orderRepo.findOne({
            where: { orderId },
            relations: ["orderProducts.product"]
        });

        if (!order) throw new NotFoundException("This order is not found");

        return order;
    }

    public async updateStatus(order: Order, status: OrderStatus): Promise<Order> {
        if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException("This order is closed for updates");
        }

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const items = order.orderProducts;

            const ids = items.map((item) => item.productId);
            const products = await queryRunner.manager.find(Product, {
                where: {
                    productId: In(ids)
                }
            });

            if (status === OrderStatus.CANCELLED) {
                for (let product of products) {
                    product.inStock += this.getAmount(items, product.productId);
                }

                await queryRunner.manager.save(Product, products);
            }

            order.status = status;
            const result = await queryRunner.manager.update(
                Order, { orderId: order.orderId, version: order.version}, { status }
            );

            if (result.affected === 0) {
                throw new ConflictException("This order is already updated")
            }

            await queryRunner.commitTransaction();

            const updatedOrder = await this.findOrder(order.orderId);

            return updatedOrder;
        } catch (error) {
            await queryRunner.rollbackTransaction();

            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    public async updateAddress(order: Order, address: string): Promise<Order> {
        if (order.status !== OrderStatus.WAITING) {
            throw new BadRequestException("This order is closed for updates");
        }

        order.orderAddress = address;
        const updatedOrder = await this.orderRepo.save(order);

        return updatedOrder;
    }

    public async deleteOrder(orderId: number): Promise<void> {
        const order = await this.findOrder(orderId);

        await this.orderRepo.softRemove(order);
    }

    private getAmount(items: OrderProduct[] | CreateOrderProductDto[], productId: number): number {
        for (let item of items) {
            if (productId === item.productId) return item.amount;
        }

        return 0;
    }
}
