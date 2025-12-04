import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotAcceptableException,
    NotFoundException,
} from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Order } from "./entities/order.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrderProduct } from "./entities/orderProduct.entity";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrderStatus } from "src/common/enums/status.enum";

@Injectable()
export class OrderService {
    constructor(
        private readonly dataSource: DataSource,

        @InjectRepository(Order)
        private readonly orderRepo: Repository<Order>,
    ) {}

    public async createOrder(
        userId: number,
        createOrderDto: CreateOrderDto,
    ): Promise<Order> {
        const { address, createOrderProductsDto } = createOrderDto;
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const order = await queryRunner.manager.save(Order, {
                userId,
                orderAddress: address,
            });

            const orderProducts = createOrderProductsDto.map((item) => {
                return queryRunner.manager.create(OrderProduct, {
                    orderId: order.orderId,
                    productId: item.productId,
                    amount: item.amount,
                    price: item.price,
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
            relations: ["orderProducts"],
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

    public async updateStatus(
        order: Order,
        status: OrderStatus,
    ): Promise<Order> {
        if (
            order.status === OrderStatus.COMPLETED ||
            order.status === OrderStatus.CANCELLED
        ) {
            throw new BadRequestException("This order is closed for updates");
        }

        order.status = status;

        const updatedOrder = await this.orderRepo.save(order);
        return updatedOrder;
    }

    public async updateAddress(order: Order, address: string): Promise<Order> {
        order.orderAddress = address;
        const updatedOrder = await this.orderRepo.save(order);

        return updatedOrder;
    }

    public async deleteOrder(orderId: number): Promise<void> {
        const order = await this.findOrder(orderId);

        if (order.deletedAt)
            throw new BadRequestException("This order is already deleted");

        await this.orderRepo.softRemove(order);
    }
}
