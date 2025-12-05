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
import { Product } from "src/product/entities/product.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { CreateOrderProductDto } from "./dto/create-order-product.dto";

const queryRunnerMock = {
    manager: {
        find: jest.fn(),
        save: jest.fn(),
        create: jest.fn(),
    },
    connect: jest.fn(),
    startTransaction: jest.fn(),
    commitTransaction: jest.fn(),
    rollbackTransaction: jest.fn(),
    release: jest.fn(),
};

describe("OrderService", () => {
    let orderService: OrderService;
    let orderRepo: Repository<Order>;
    let dataSource: DataSource;

    const testOrder = {
        orderId: 0,
        userId: 0,
        status: OrderStatus.WAITING,
        orderAddress: "address",
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [
                {
                    provide: getRepositoryToken(Order),
                    useValue: {
                        save: jest.fn(),
                        findOne: jest.fn(),
                    },
                },
                {
                    provide: DataSource,
                    useValue: {
                        createQueryRunner: () => queryRunnerMock,
                    },
                },
                OrderService,
            ],
        }).compile();

        orderService = moduleRef.get<OrderService>(OrderService);
        orderRepo = moduleRef.get<Repository<Order>>(getRepositoryToken(Order));
        dataSource = moduleRef.get<DataSource>(DataSource);
    });

    describe("createOrder", () => {
        beforeEach(() => {
            jest.spyOn(
                dataSource.createQueryRunner().manager,
                "find",
            ).mockResolvedValueOnce([
                { productId: 0, isInStock: false, name: "test" },
            ] as any);
        });

        const createOrderDto = {
            address: "",
            createOrderProductsDto: [
                {
                    productId: 0,
                },
            ],
        };

        it("should throw exception if provided product is absent", async () => {
            const orderDto = {
                address: "",
                createOrderProductsDto: [
                    ...createOrderDto.createOrderProductsDto,
                    {
                        productId: 1,
                    },
                ],
            };

            await expect(
                orderService.createOrder(0, orderDto as CreateOrderDto),
            ).rejects.toThrow(NotFoundException);
        });

        it("should throw exception if provided product is out of stock", async () => {
            jest.spyOn(
                dataSource.createQueryRunner().manager,
                "find",
            ).mockResolvedValueOnce([
                { productId: 0, isInStock: true, name: "test" },
            ] as any);

            const createOrderDto = {
                address: "",
                createOrderProductsDto: [
                    {
                        productId: 0,
                    },
                ],
            };

            await expect(
                orderService.createOrder(0, createOrderDto as CreateOrderDto),
            ).rejects.toThrow(BadRequestException);
        });

        it("should execute 'save' method if it passes successfully", async () => {
            const saveSpy = jest
                .spyOn(dataSource.createQueryRunner().manager, "save")
                .mockResolvedValueOnce({ orderId: 0 });
            jest.spyOn(
                dataSource.createQueryRunner().manager,
                "create",
            ).mockReturnValue({} as any);

            await orderService.createOrder(0, createOrderDto as CreateOrderDto);

            expect(saveSpy).toHaveBeenCalled();
        });
    });

    it("should throw exception if order is not found", async () => {
        jest.spyOn(orderRepo, "findOne").mockResolvedValueOnce(null);

        await expect(orderService.findOrder(0)).rejects.toThrow(
            NotFoundException,
        );
    });

    it("should return order if it is found", async () => {
        jest.spyOn(orderRepo, "findOne").mockResolvedValueOnce(
            testOrder as Order,
        );

        const order = await orderService.findOrder(0);

        expect(order).toEqual(testOrder);
    });

    it("should throw exception if order is completed", async () => {
        await expect(
            orderService.updateStatus(
                { ...testOrder, status: OrderStatus.COMPLETED } as Order,
                OrderStatus.COMPLETED,
            ),
        ).rejects.toThrow(BadRequestException);
    });

    it("should throw exception if order is cancelled", async () => {
        await expect(
            orderService.updateStatus(
                { ...testOrder, status: OrderStatus.CANCELLED } as Order,
                OrderStatus.COMPLETED,
            ),
        ).rejects.toThrow(BadRequestException);
    });

    it("should return updated order if order is not closed", async () => {
        jest.spyOn(orderRepo, "save").mockResolvedValueOnce(testOrder as Order);

        const order = await orderService.updateStatus(
            testOrder as Order,
            OrderStatus.CANCELLED,
        );

        expect(order).toEqual(testOrder);
    });

    it("should throw exception if order is already deleted", async () => {
        jest.spyOn(orderRepo, "findOne").mockResolvedValueOnce({
            ...testOrder,
            deletedAt: new Date(),
        } as Order);

        await expect(orderService.deleteOrder(0)).rejects.toThrow(
            BadRequestException,
        );
    });
});
