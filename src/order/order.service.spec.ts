import { OrderService } from "./order.service";
import { Test } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import { OrderStatus } from "src/common/enums/status.enum";
import { Order } from "./entities/order.entity";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";

describe("OrderService", () => {
    let orderService: OrderService;
    let orderRepo: Repository<Order>;

    let queryRunnerMock = {
        manager: {
            find: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            softRemove: jest.fn()
        },
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn()
    };

    const testOrder = {
        orderId: 0,
        userId: 0,
        status: OrderStatus.WAITING,
        orderAddress: "address",
        orderProducts: [
            { orderId: 0, productId: 0, amount: 1 },
            { orderId: 0, productId: 1, amount: 10 }
        ]
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                {
                    provide: getRepositoryToken(Order),
                    useValue: {
                        save: jest.fn(),
                        findOne: jest.fn(),
                        softRemove: jest.fn()
                    }
                },
                {
                    provide: DataSource,
                    useValue: {
                        createQueryRunner: () => queryRunnerMock
                    }
                },
                OrderService
            ]
        }).compile();

        orderService = moduleRef.get<OrderService>(OrderService);
        orderRepo = moduleRef.get<Repository<Order>>(getRepositoryToken(Order));
    });

    beforeEach(() => {
        queryRunnerMock = {
            manager: {
                find: jest.fn(),
                save: jest.fn(),
                create: jest.fn(),
                softRemove: jest.fn()
            },
            connect: jest.fn(),
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            rollbackTransaction: jest.fn(),
            release: jest.fn()
        };
    });

    describe("createOrder", () => {
        beforeEach(() => {
            queryRunnerMock.manager.find.mockResolvedValue([{ productId: 0, inStock: 1, name: "test" }]);

            queryRunnerMock.manager.create.mockResolvedValue({});

            queryRunnerMock.manager.save.mockResolvedValue([]);
        });

        const createOrderDto: CreateOrderDto = {
            address: "",
            orderItems: [{ productId: 0, amount: 1, price: 0 }]
        };

        it("should throw exception if provided product is absent", async () => {
            const testDto = {
                address: "",
                orderItems: [
                    { productId: 0, amount: 0, price: 0 },
                    { productId: 1, amount: 0, price: 0 }
                ]
            };

            await expect(orderService.createOrder(0, testDto)).rejects.toThrow(NotFoundException);
        });

        it("should throw exception if inStock =< 0", async () => {
            queryRunnerMock.manager.find.mockResolvedValue([{ productId: 0, inStock: 0, name: "test" }]);

            await expect(orderService.createOrder(0, createOrderDto as CreateOrderDto)).rejects.toThrow(
                ConflictException
            );
        });

        it("should execute 'save' method if it passes successfully", async () => {
            const result = await orderService.createOrder(0, createOrderDto as CreateOrderDto);

            expect(queryRunnerMock.commitTransaction).toHaveBeenCalled();
            expect(expect).toBeDefined();
        });
    });

    describe("findOrder", () => {
        it("should throw exception if order is not found", async () => {
            jest.spyOn(orderRepo, "findOne").mockResolvedValueOnce(null);

            await expect(orderService.findOrder(0)).rejects.toThrow(NotFoundException);
        });

        it("should return order if it is found", async () => {
            jest.spyOn(orderRepo, "findOne").mockResolvedValueOnce(testOrder as Order);

            const order = await orderService.findOrder(0);

            expect(order).toEqual(testOrder);
        });
    });

    describe("updateStatus", () => {
        beforeEach(async () => {
            queryRunnerMock.manager.find.mockResolvedValue([
                { productId: 0, inStock: 4 },
                { productId: 1, inStock: 9 }
            ]);
        });

        it("should throw exception if order is completed", async () => {
            await expect(
                orderService.updateStatus(
                    { ...testOrder, status: OrderStatus.COMPLETED } as Order,
                    OrderStatus.COMPLETED
                )
            ).rejects.toThrow(BadRequestException);
        });

        it("should throw exception if order is cancelled", async () => {
            await expect(
                orderService.updateStatus(
                    { ...testOrder, status: OrderStatus.CANCELLED } as Order,
                    OrderStatus.COMPLETED
                )
            ).rejects.toThrow(BadRequestException);
        });

        it("should return updated order if order is not closed", async () => {
            const orderDto = { ...testOrder, status: OrderStatus.CANCELLED };
            queryRunnerMock.manager.save.mockResolvedValue(orderDto as Order);

            const order = await orderService.updateStatus({ ...testOrder } as Order, OrderStatus.CANCELLED);

            expect(order).toEqual(orderDto);
        });
    });
});
