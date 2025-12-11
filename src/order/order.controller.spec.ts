import { Test } from "@nestjs/testing";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { Order } from "./entities/order.entity";
import { OrderStatus } from "src/common/enums/status.enum";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { IPayload } from "src/common/interfaces/request.i";
import { Role } from "src/common/enums/role.enum";
import { ForbiddenException } from "@nestjs/common";
import { UpdateOrderAddressDto } from "./dto/update-order-address.dto";

describe("OrderController", () => {
    let orderServiceMock: OrderService;
    let orderController: OrderController;

    const testOrder = {
        orderId: 0,
        userId: 0,
        status: OrderStatus.CANCELLED,
        orderAddress: "address"
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [OrderController],
            providers: [
                {
                    provide: OrderService,
                    useValue: {
                        updateStatus: jest.fn(),
                        updateAddress: jest.fn(),
                        findOrder: jest.fn()
                    }
                }
            ]
        }).compile();

        orderServiceMock = moduleRef.get<OrderService>(OrderService);
        orderController = moduleRef.get<OrderController>(OrderController);

        jest.spyOn(orderServiceMock, "findOrder").mockResolvedValueOnce(testOrder as Order);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("findOrder", () => {
        beforeEach(() => {
            jest.spyOn(orderServiceMock, "findOrder").mockResolvedValueOnce(testOrder as Order);
        });

        it("should return order if user has ownership", async () => {
            const order = await orderController.findOrder(false, 0, 0);

            expect(order).toEqual(testOrder);
        });

        it("should throw exception if user doesn't have ownership", async () => {
            await expect(orderController.findOrder(false, 1, 0)).rejects.toThrow(ForbiddenException);
        });

        it("should return order if user is ADMIN", async () => {
            const order = await orderController.findOrder(true, 1, 0);

            expect(order).toEqual(testOrder);
        });
    });

    describe("updateAddress", () => {
        let updateAddressDto: UpdateOrderAddressDto = {
            orderId: 0,
            address: "new_address"
        };

        it("should return updatedOrder with new address", async () => {
            jest.spyOn(orderServiceMock, "updateAddress").mockResolvedValueOnce({
                ...testOrder,
                orderAddress: "new_address"
            } as Order);

            const order = await orderController.updateAddress(updateAddressDto, 0);

            expect(order).toHaveProperty("orderAddress", "new_address");
        });

        it("should throw error if user doesn't have ownership", async () => {
            expect(orderController.updateAddress(updateAddressDto, 1)).rejects.toThrow(ForbiddenException);
        });
    });

    describe("updateStatus", () => {
        let updateStatusDto: UpdateOrderStatusDto = {
            orderId: 0,
            status: OrderStatus.CANCELLED
        };

        let payload: IPayload = {
            id: 0,
            login: "login",
            role: Role.USER
        };

        afterEach(() => {
            updateStatusDto = {
                orderId: 0,
                status: OrderStatus.CANCELLED
            };

            payload = {
                id: 0,
                login: "login",
                role: Role.USER
            };
        });

        it("should return updatedOrder with new status", async () => {
            jest.spyOn(orderServiceMock, "updateStatus").mockResolvedValueOnce(testOrder as Order);

            const order = await orderController.updateStatus(updateStatusDto, payload, false);

            expect(order).toHaveProperty("status", "cancelled");
        });

        it("should throw error if user doesn't have ownership", async () => {
            payload.id = 1;

            expect(orderController.updateStatus(updateStatusDto, payload, false)).rejects.toThrow(ForbiddenException);
        });

        it("should throw error if user doesn't have access", async () => {
            updateStatusDto.status = OrderStatus.IN_PROCESS;

            expect(orderController.updateStatus(updateStatusDto, payload, false)).rejects.toThrow(ForbiddenException);
        });

        it("should update order if user have access", async () => {
            jest.spyOn(orderServiceMock, "updateStatus").mockResolvedValueOnce({
                ...testOrder,
                status: OrderStatus.IN_PROCESS
            } as Order);

            updateStatusDto.status = OrderStatus.IN_PROCESS;
            payload.role = Role.MODERATOR;

            const order = await orderController.updateStatus(updateStatusDto, payload, true);
            expect(order).toHaveProperty("status", "in process");
        });
    });
});
