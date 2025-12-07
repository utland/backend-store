import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { CurrentUserId } from "src/common/decorators/current-user-id.decorator";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "src/common/enums/role.enum";
import { Order } from "./entities/order.entity";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { isAdmin } from "src/common/decorators/is-admin.decorator";
import { CurrentUser } from "src/common/decorators/current-user.decorator";
import { OrderStatus } from "src/common/enums/status.enum";
import { UpdateOrderAddressDto } from "./dto/update-order-address.dto";
import type { IPayload } from "src/common/interfaces/request.i";

@Controller("order")
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Post()
    public async create(@Body() createOrderDto: CreateOrderDto, @CurrentUserId() userId: number): Promise<Order> {
        return await this.orderService.createOrder(userId, createOrderDto);
    }

    @Get()
    public async findByUser(@CurrentUserId() userId: number): Promise<Order[]> {
        return await this.orderService.findOrdersByUserId(userId);
    }

    @Get("/all")
    @Roles(Role.ADMIN, Role.MODERATOR)
    public async findAll(): Promise<Order[]> {
        return await this.orderService.findAll();
    }

    @Patch("/status")
    public async updateStatus(
        @Body() updateStatsDto: UpdateOrderStatusDto,
        @CurrentUser() user: IPayload
    ): Promise<Order> {
        const { orderId, status } = updateStatsDto;

        if (status !== OrderStatus.CANCELLED && user.role === Role.USER) {
            throw new ForbiddenException("Only for ADMIN it's available to change STATUS");
        }

        const order = await this.checkOwnership(orderId, user.id);

        const updatedOrder = await this.orderService.updateStatus(order, status);
        return updatedOrder;
    }

    @Patch("/address")
    @Roles(Role.USER)
    public async updateAddress(
        @Body() updateAddressDto: UpdateOrderAddressDto,
        @CurrentUserId() userId: number
    ): Promise<Order> {
        const { orderId, address } = updateAddressDto;

        const order = await this.checkOwnership(orderId, userId);

        const updatedOrder = await this.orderService.updateAddress(order, address);
        return updatedOrder;
    }

    @Delete("/:id")
    @Roles(Role.ADMIN)
    public async deleteSoft(@Param("id", ParseIntPipe) orderId: number): Promise<void> {
        await this.orderService.deleteOrder(orderId);
    }

    private async checkOwnership(orderId: number, userId: number): Promise<Order> {
        const order = await this.orderService.findOrder(orderId);

        if (order.userId !== userId) {
            throw new ForbiddenException("This order is unavailable for other users");
        }

        return order;
    }
}
