import { UserService } from "src/user/user.service";
import { OrderService } from "./order.service";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, QueryRunner, Repository } from "typeorm";
import { User } from "src/user/entities/user.entity";
import { OrderStatus } from "src/common/enums/status.enum";
import { Order } from "./entities/order.entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { rejects } from "assert";

describe("OrderService", () => {
    let orderService: OrderService;
    let orderRepo: Repository<Order>;
    
    const testOrder = {
        orderId: 0,
        userId: 0,
        status: OrderStatus.WAITING,
        orderAddress: "address"
    }

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                {
                    provide: getRepositoryToken(Order),
                    useValue: {
                        save: jest.fn(),
                        findOne: jest.fn(),
                    }
                },
                {
                    provide: DataSource,
                    useValue: {}
                },
                OrderService,
            ]
        }).compile();

        orderService = moduleRef.get<OrderService>(OrderService);
        orderRepo = moduleRef.get<Repository<Order>>(getRepositoryToken(Order));
    })

    it("should throw exception if order is not found", async () => {
        jest.spyOn(orderRepo, "findOne").mockResolvedValueOnce(null);

        await expect(orderService.findOrder(0))
            .rejects
            .toThrow(NotFoundException)
    })

    it("should return order if it is found", async () => {
        jest.spyOn(orderRepo, "findOne").mockResolvedValueOnce(testOrder as Order);

        const order = await orderService.findOrder(0);

        expect(order).toEqual(testOrder);
    })

    it("should throw exception if order is completed", async () => {
        await expect(orderService.updateStatus
            ({...testOrder, status: OrderStatus.COMPLETED } as Order, OrderStatus.COMPLETED)
        )
            .rejects
            .toThrow(BadRequestException);
    })

    it("should throw exception if order is cancelled", async () => {
        await expect(orderService.updateStatus
            ({...testOrder, status: OrderStatus.CANCELLED } as Order, OrderStatus.COMPLETED)
        )
            .rejects
            .toThrow(BadRequestException);
    })

    it("should return updated order if order is not closed", async () => {
        jest.spyOn(orderRepo, "save").mockResolvedValueOnce(testOrder as Order);

        const order = await orderService.updateStatus(testOrder as Order, OrderStatus.CANCELLED);

        expect(order).toEqual(testOrder);
    })

    it("should throw exception if order is already deleted", async () => {
        jest.spyOn(orderRepo, "findOne").mockResolvedValueOnce(
            {...testOrder, deletedAt: new Date()} as Order
        );

        await expect(orderService.deleteOrder(0))
            .rejects
            .toThrow(BadRequestException);
    })
})