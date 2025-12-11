import { CreateCategoryDto } from "src/category/dto/create-category.dto";
import { EntityBuilder, ITestPayload } from "./config/entity-builder";
import { TestBuilder } from "./config/test-builder";
import request from "supertest";
import { CreateOrderDto } from "src/order/dto/create-order.dto";
import { Repository } from "typeorm";
import { Order } from "src/order/entities/order.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { exec } from "child_process";
import { OrderStatus } from "src/common/enums/status.enum";
import { Test } from "@nestjs/testing";
import TestAgent from "supertest/lib/agent";
import { OrderProduct } from "src/order/entities/orderProduct.entity";

describe("Order test", () => {
    let test: TestBuilder;
    let server: any;
    let entityBuilder: EntityBuilder;
    let tokens: Map<string, ITestPayload>;
    let orderId: number;

    beforeAll(async () => {
        test = await TestBuilder.create();
        server = test.app.getHttpServer();

        entityBuilder = new EntityBuilder(test.app, server);
        tokens = await entityBuilder.createUsers();
    });

    beforeEach(async () => {
        const id = tokens.get("user")?.id as number;
        orderId = await entityBuilder.createOrder(id);
    });

    afterEach(async () => {
        await test.clearDb(["users"]);
    });

    afterAll(async () => {
        await test.clearDb();
        await test.closeApp();
    });

    describe("createOrder", () => {
        it("should create order successfully if everything is OK", async () => {
            const token = tokens.get("user")?.token;

            const categoryId = await entityBuilder.createCategory();
            const supplierId = await entityBuilder.createSupplier();
            const productId = await entityBuilder.createProduct(categoryId, supplierId);

            const createOrderDto: CreateOrderDto = {
                address: "address",
                orderItems: [{ productId, amount: 1, price: 100 }]
            };

            await request(server)
                .post("/order")
                .set("Authorization", `Bearer ${token}`)
                .send(createOrderDto)
                .expect(201);
        });

        it("should rollback changes if error happened (product not-found)", async () => {
            const token = tokens.get("user")?.token;

            const orderRepo = test.app.get<Repository<Order>>(getRepositoryToken(Order));

            const createOrderDto: CreateOrderDto = {
                address: "address",
                orderItems: [{ productId: 10, amount: 1, price: 100 }]
            };

            await request(server)
                .post("/order")
                .set("Authorization", `Bearer ${token}`)
                .send(createOrderDto)
                .expect(404);

            const count = await orderRepo.count();
            expect(count).toBe(1);
        });

        it("should support pessimistic locking", async () => {
            const categoryId = await entityBuilder.createCategory();
            const supplierId = await entityBuilder.createSupplier();
            const productId = await entityBuilder.createProduct(categoryId, supplierId, 2);

            const createOrderDto: CreateOrderDto = {
                address: "address",
                orderItems: [{ productId, amount: 1, price: 10 }]
            };

            const requests: Promise<any>[] = [];

            for (let i = 0; i < 3; i++) {
                const tokenUser = (await entityBuilder.createUser()).token;

                requests.push(
                    request(server).post("/order").set("Authorization", `Bearer ${tokenUser}`).send(createOrderDto)
                );
            }

            const reponses = await Promise.all(requests);

            const resolves = reponses.filter((res) => res.status === 200 || res.status === 201);
            const rejects = reponses.filter((res) => res.status === 409 || res.status === 404);

            expect(resolves.length).toBe(2);
            expect(rejects.length).toBe(1);
        });
    });

    describe("findByUser", () => {
        it("should return relative orders of user", async () => {
            const token = tokens.get("user")?.token;

            await request(server)
                .get("/order")
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect((res) => expect(res.body.length).toBe(1));
        });
    });

    describe("findAll", () => {
        it("should be available only for ADMIN and MODERATOR", async () => {
            const token1 = tokens.get("moderator")?.token;
            const token2 = tokens.get("admin")?.token;

            await request(server)
                .get("/order/all")
                .set("Authorization", `Bearer ${token1}`)
                .expect(200)
                .expect((res) => expect(res.body.length).toBe(1));

            await request(server)
                .get("/order/all")
                .set("Authorization", `Bearer ${token2}`)
                .expect(200)
                .expect((res) => expect(res.body.length).toBe(1));
        });

        it("should be unavailable for USER", async () => {
            const token = tokens.get("user")?.token;

            await request(server).get("/order/all").set("Authorization", `Bearer ${token}`).expect(403);
        });
    });

    describe("findOrder", () => {
        it("should return in regard to 'id' params", async () => {
            const token = tokens.get("user")?.token;

            await request(server)
                .get(`/order/${orderId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.orderId).toBe(orderId);
                    expect(res.body.status).toBeDefined();
                    expect(res.body.orderAddress).toBeDefined();
                    expect(res.body.createdAt).toBeDefined();
                    expect(res.body.updatedAt).toBeDefined();
                    expect(res.body.userId).toBeDefined();
                });
        });
    });

    describe("updateAddress", () => {
        it("should update an address for an order", async () => {
            const token = tokens.get("user")?.token;

            await request(server)
                .patch("/order/address")
                .set("Authorization", `Bearer ${token}`)
                .send({ orderId, address: "new-address" })
                .expect(200);

            await request(server)
                .get(`/order/${orderId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.orderAddress).toBe("new-address");
                });
        });
    });

    describe("updateStatus", () => {
        let productId: number;

        beforeEach(async () => {
            const categoryId = await entityBuilder.createCategory();
            const supplierId = await entityBuilder.createSupplier();
            productId = await entityBuilder.createProduct(categoryId, supplierId);
        });

        it("should updates status for an order", async () => {
            const token = tokens.get("admin")?.token;

            await request(server)
                .patch("/order/status")
                .set("Authorization", `Bearer ${token}`)
                .send({ orderId, status: OrderStatus.IN_PROCESS })
                .expect(200);

            await request(server)
                .get(`/order/${orderId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.status).toBe(OrderStatus.IN_PROCESS);
                });
        });

        it("should support optimistic locking", async () => {
            const token = tokens.get("user")?.token;
            const token2 = tokens.get("moderator")?.token;

            await entityBuilder.createOrderProduct(orderId, productId);

            const req1 = request(server)
                .patch("/order/status")
                .set("Authorization", `Bearer ${token}`)
                .send({ orderId, status: OrderStatus.CANCELLED });

            const req2 = request(server)
                .get("/order/status")
                .set("Authorization", `Bearer ${token2}`)
                .send({ orderId, status: OrderStatus.IN_PROCESS });

            const reponses = await Promise.all([req1, req2]);

            const resolves = reponses.filter((res) => res.status === 200 || res.status === 201);
            const rejects = reponses.filter((res) => res.status === 400);

            expect(resolves.length).toBe(1);
            expect(rejects.length).toBe(1);
        });

        it("should add to inStock if order is cancelled", async () => {
            const token = tokens.get("user")?.token;

            await entityBuilder.createOrderProduct(orderId, productId);

            await request(server)
                .patch("/order/status")
                .set("Authorization", `Bearer ${token}`)
                .send({ orderId, status: OrderStatus.CANCELLED })
                .expect(200);

            await request(server)
                .get(`/product/${productId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.inStock).toBe(2);
                });
        });
    });

    describe("deleteSoft", () => {
        it("should be available only for ADMIN", async () => {
            const token1 = tokens.get("moderator")?.token;
            const token2 = tokens.get("user")?.token;

            await request(server).delete(`/order/${orderId}`).set("Authorization", `Bearer ${token1}`).expect(403);

            await request(server).delete(`/order/${orderId}`).set("Authorization", `Bearer ${token2}`).expect(403);
        });

        it("should softly remove order with CASCADE", async () => {
            const orderProductRepo = test.app.get<Repository<OrderProduct>>(getRepositoryToken(OrderProduct));
            
            const categoryId = await entityBuilder.createCategory();
            const supplierId = await entityBuilder.createSupplier();
            
            const productId1 = await entityBuilder.createProduct(categoryId, supplierId, 2);
            const productId2 = await entityBuilder.createProduct(categoryId, supplierId, 2);
            
            await entityBuilder.createOrderProduct(orderId, productId1);
            await entityBuilder.createOrderProduct(orderId, productId2);

            const token = tokens.get("admin")?.token;

            const countBefore = await orderProductRepo.countBy({ orderId });
            expect(countBefore).toBe(2);

            await request(server).delete(`/order/${orderId}`).set("Authorization", `Bearer ${token}`).expect(200);

            await request(server).get(`/order/${orderId}`).set("Authorization", `Bearer ${token}`).expect(404);

            const countAfter = await orderProductRepo.countBy({ orderId });
            expect(countAfter).toBe(0);
        });
    });
});
