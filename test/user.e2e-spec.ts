import { TestBuilder } from "./config/test-builder";
import request from "supertest";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EntityBuilder, ITestPayload } from "./config/entity-builder";
import { UpdateCartProductDto } from "src/user/cart/dto/update-cart-product.dto";
import { CartProduct } from "src/user/entities/cartProduct.entity";
import { Order } from "src/order/entities/order.entity";
import { OrderStatus } from "src/common/enums/status.enum";

describe("User test", () => {
    let test: TestBuilder;
    let server: any;
    let entityBuilder: EntityBuilder;
    let users: Map<string, ITestPayload>;

    beforeAll(async () => {
        test = await TestBuilder.create();
        server = test.app.getHttpServer();
        entityBuilder = new EntityBuilder(test.app, server);

        users = await entityBuilder.createUsers();
    });

    afterEach(async () => {
        await test.clearDb(["users", "cart_product"]);
    });

    afterAll(async () => {
        await test.clearDb();
        await test.closeApp();
    });

    describe("findAll", () => {
        it("should be available for ADMIN and MODERATOR", async () => {
            const token1 = users.get("admin")?.token;
            const token2 = users.get("moderator")?.token;

            await request(server)
                .get("/user")
                .set("Authorization", `Bearer ${token1}`)
                .expect(200)
                .expect((res) => expect(res.body.length).toBe(3));

            await request(server)
                .get("/user")
                .set("Authorization", `Bearer ${token2}`)
                .expect(200)
                .expect((res) => expect(res.body.length).toBe(3));
        });

        it("should be unavailable for USER", async () => {
            const token = users.get("user")?.token;

            await request(server).get("/user").set("Authorization", `Bearer ${token}`).expect(403);
        });
    });

    describe("findById", () => {
        it("should get cerialized user", async () => {
            const token = users.get("user")?.token;

            await request(server)
                .get("/user/token")
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.password).toBeUndefined();
                    expect(res.body.deletedAt).toBeUndefined();
                    expect(res.body.userId).toBeDefined();
                    expect(res.body.login).toBeDefined();
                    expect(res.body.address).toBeDefined();
                    expect(res.body.email).toBeDefined();
                    expect(res.body.phone).toBeDefined();
                    expect(res.body.imgUrl).toBeDefined();
                    expect(res.body.createdAt).toBeDefined();
                    expect(res.body.role).toBeDefined();
                    expect(res.body.cart).toBeInstanceOf(Array);
                });
        });
    });

    describe("getTopUsers", () => {
        it("should successfully get analytics of top users", async () => {
            const token = users.get("admin")?.token;
            const id = users.get("user")!.id;
            const login = users.get("user")!.login;

            const supplierId = await entityBuilder.createSupplier();
            const categoryId1 = await entityBuilder.createCategory("cat1")
            const categoryId2 = await entityBuilder.createCategory("cat2")

            const productId1 = await entityBuilder.createProduct(supplierId, categoryId1);
            const productId2 = await entityBuilder.createProduct(supplierId, categoryId1);

            const order1 = await entityBuilder.createOrder(id, OrderStatus.COMPLETED);
            const order2 = await entityBuilder.createOrder(id, OrderStatus.COMPLETED);
            const order3 = await entityBuilder.createOrder(id, OrderStatus.CANCELLED);

            await entityBuilder.createOrderProduct(order1, productId1)
            await entityBuilder.createOrderProduct(order1, productId2)
            await entityBuilder.createOrderProduct(order2, productId1)
            await entityBuilder.createOrderProduct(order3, productId1)
            await entityBuilder.createOrderProduct(order3, productId2)

            await request(server)
                    .get("/user/topUsers")
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body).toBeInstanceOf(Array)
                        expect(res.body[0].username).toBe(login)
                        expect(res.body[0].totalProducts).toBe(3)
                        expect(res.body[0].favoriteCategory).toBe("cat1")
                    })
        })
    })

    describe("changePasswd", () => {
        it("should change password for user", async () => {
            const changPassDto = {
                login: users.get("user")?.login,
                oldPass: "test",
                newPass: "new"
            };

            await request(server).patch("/user/pass").send(changPassDto).expect(200);

            await request(server).post("/auth/login").send({ login: changPassDto.login, password: "test" }).expect(401);

            await request(server).post("/auth/login").send({ login: changPassDto.login, password: "new" }).expect(201);
        });
    });

    describe("updateUser", () => {
        const updatedDto = {
            address: "new-address",
            phone: "+309403940",
            email: "new@gmail.com"
        };

        it("should update data for user", async () => {
            const token = users.get("user")?.token;

            await request(server).patch("/user").set("Authorization", `Bearer ${token}`).send(updatedDto).expect(200);

            await request(server)
                .get("/user/token")
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.address).toBe(updatedDto.address);
                    expect(res.body.phone).toBe(updatedDto.phone);
                    expect(res.body.email).toBe(updatedDto.email);
                });
        });
    });

    describe("changeRole", () => {
        it("should be available only for ADMIN", async () => {
            const token1 = users.get("user")?.token;
            const token2 = users.get("moderator")?.token;
            const moderatorId = users.get("moderator")?.id;

            await request(server)
                .patch(`/user/role/${moderatorId}`)
                .set("Authorization", `Bearer ${token1}`)
                .expect(403);

            await request(server)
                .patch(`/user/role/${moderatorId}`)
                .set("Authorization", `Bearer ${token2}`)
                .expect(403);
        });

        it("should change role for user", async () => {
            const token = users.get("admin")?.token;
            const moderatorId = users.get("moderator")?.id;

            await request(server)
                .patch(`/user/role/${moderatorId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ role: "user" })
                .expect(200);

            await request(server)
                .get(`/user/${moderatorId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.role).toBe("user");
                });
        });
    });

    describe("deleteUser", () => {
        it("should be available only for ADMIN", async () => {
            const token1 = users.get("user")?.token;
            const token2 = users.get("moderator")?.token;

            await request(server).delete("/user/1").set("Authorization", `Bearer ${token1}`).expect(403);

            await request(server).delete("/user/1").set("Authorization", `Bearer ${token2}`).expect(403);
        });

        it("should softly remove user with hard-deleting cart and soft-deleting orders", async () => {
            const token = users.get("admin")?.token;
            const moderatorId = users.get("moderator")!.id;

            const cartProductRepo = test.app.get<Repository<CartProduct>>(getRepositoryToken(CartProduct));
            const orderRepo = test.app.get<Repository<Order>>(getRepositoryToken(Order));

            const categoryId = await entityBuilder.createCategory();
            const supplierId = await entityBuilder.createSupplier();
            const productId = await entityBuilder.createProduct(categoryId, supplierId);

            const orderId = await entityBuilder.createOrder(moderatorId);
            await entityBuilder.createOrderProduct(orderId, productId);

            await entityBuilder.createCartProduct(moderatorId, productId);

            const countCartBefore = await cartProductRepo.countBy({ userId: moderatorId });
            const countOrderBefore = await orderRepo.countBy({ userId: moderatorId });

            expect(countCartBefore).toBe(1);
            expect(countOrderBefore).toBe(1);

            await request(server).delete(`/user/${moderatorId}`).set("Authorization", `Bearer ${token}`).expect(200);

            await request(server).get(`/user/${moderatorId}`).set("Authorization", `Bearer ${token}`).expect(404);

            const countCartAfter = await cartProductRepo.countBy({ userId: moderatorId });
            const countOrderAfter = await orderRepo.countBy({ userId: moderatorId });
            const orderAfterWithDeleted = await orderRepo.find({ 
                where: { userId: moderatorId}, withDeleted: true
            });

            expect(countCartAfter).toBe(0);
            expect(countOrderAfter).toBe(0);
            expect(orderAfterWithDeleted.length).toBe(1);
        });
    });

    describe("cartProduct", () => {
        let productId: number;
        let categoryId: number;
        let supplierId: number;

        beforeEach(async () => {
            const id = users.get("user")!.id;

            categoryId = await entityBuilder.createCategory();
            supplierId = await entityBuilder.createSupplier();

            productId = await entityBuilder.createProduct(supplierId, categoryId);
            await entityBuilder.createCartProduct(id, productId);
        });

        describe("addCartProduct", () => {
            it("should add new product to user's cart", async () => {
                const token = users.get("user")?.token;

                const productId2 = await entityBuilder.createProduct(supplierId, categoryId);

                await request(server).post(`/cart/${productId2}`).set("Authorization", `Bearer ${token}`).expect(201);

                await request(server)
                    .get("/user/token")
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.cart.length).toBe(2);
                    });
            });
        });

        describe("updateCartProduct", () => {
            it("should add new product to user's cart", async () => {
                const token = users.get("user")?.token;

                const updateCPDto: UpdateCartProductDto = {
                    amount: 3,
                    productId
                };

                await request(server)
                    .patch("/cart")
                    .set("Authorization", `Bearer ${token}`)
                    .send(updateCPDto)
                    .expect(200);

                await request(server)
                    .get("/user/token")
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200)
                    .expect((res) => expect(res.body.cart[0].amount).toBe(updateCPDto.amount));
            });
        });

        describe("removeCartProduct", () => {
            it("should delete product from user's cart", async () => {
                const token = users.get("user")?.token;

                await request(server).delete(`/cart/${productId}`).set("Authorization", `Bearer ${token}`).expect(200);

                await request(server)
                    .get("/user/token")
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200)
                    .expect((res) => expect(res.body.cart.length).toBe(0));
            });
        });
    });
});
