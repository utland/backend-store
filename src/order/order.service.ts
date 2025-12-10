import {
    BadRequestException,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import { DataSource, In, Repository } from "typeorm";
import { Order } from "./entities/order.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrderProduct } from "./entities/orderProduct.entity";
import { OrderStatus } from "src/common/enums/status.enum";
import { Product } from "src/product/entities/product.entity";
import { CreateOrderProductDto } from "./dto/create-order-product.dto";

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

            const idsOfProduct = this.getArrayIds(orderItems);
            const products = await queryRunner.manager.find(Product, {
                where: {
                    productId: In(idsOfProduct)
                }
            });

            this.validateProducts(products, idsOfProduct.length);

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

    private validateProducts(products: Product[], reqLenght: number) {
        if (products.length !== reqLenght) {
            throw new NotFoundException("One of provided products is not found");
        }

        for (let product of products) {
            if (!product.isInStock) {
                throw new BadRequestException(`${product.name} is out of stock`);
            }
        }
    }

    private getArrayIds(orderProducts: CreateOrderProductDto[]): number[] {
        return orderProducts.map((e) => e.productId);
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
        const orders = await this.orderRepo.find();

        return orders;
    }

    public async findOrder(orderId: number): Promise<Order> {
        const order = await this.orderRepo.findOne({ where: { orderId } });
        if (!order) throw new NotFoundException("This order is not found");

        return order;
    }

    public async updateStatus(order: Order, status: OrderStatus): Promise<Order> {
        if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
            throw new BadRequestException("This order is closed for updates");
        }

        order.status = status;
        const updatedOrder = await this.orderRepo.save(order);

        return updatedOrder;
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

        if (order.deletedAt) {
            throw new BadRequestException("This order is already deleted");
        }

        await this.orderRepo.softRemove(order);
    }
}
