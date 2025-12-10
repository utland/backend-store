import { TestBuilder } from "./config/test-builder";
import { SignUpDto } from "../src/auth/dto/sign-up.dto";
import request from "supertest";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { Role } from "src/common/enums/role.enum";
import { EntityBuilder, ITestPayload } from "./config/entity-builder";
import { UpdateCartProductDto } from "src/user/cart/dto/update-cart-product.dto";

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
        await  test.clearDb(["users", "cart_product"])
    })

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
        })

        it("should be unavailable for USER", async () => {
            const token = users.get("user")?.token;

            await request(server)
                    .get("/user")
                    .set("Authorization", `Bearer ${token}`)
                    .expect(403);
        })
    })

    describe("findById", () => {
        it("should get cerialized user", async () => {
            const token = users.get("user")?.token;

            await request(server)
                    .get("/user/token")
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.password).toBeUndefined()
                        expect(res.body.deletedAt).toBeUndefined()
                        expect(res.body.userId).toBeDefined()
                        expect(res.body.login).toBeDefined()
                        expect(res.body.address).toBeDefined()
                        expect(res.body.email).toBeDefined()
                        expect(res.body.phone).toBeDefined()
                        expect(res.body.imgUrl).toBeDefined()
                        expect(res.body.createdAt).toBeDefined()
                        expect(res.body.role).toBeDefined()     
                        expect(res.body.cart).toBeInstanceOf(Array)   
                    });
        })
    })

    describe("changePasswd", () => {
        it("should change password for user", async () => {
            const changPassDto = {
                login: users.get("user")?.login,
                oldPass: "test",
                newPass: "new"
            }

            await request(server)
                    .patch("/user/pass")
                    .send(changPassDto)
                    .expect(200);
            
            await request(server)
                    .post("/auth/login")
                    .send({ login: changPassDto.login, password: "test"})
                    .expect(401);

            await request(server)
                    .post("/auth/login")
                    .send({ login: changPassDto.login, password: "new"})
                    .expect(201)
        })
    })

    describe("updateUser", () => {
        const updatedDto = {
            address: "new-address",
            phone: "+309403940",
            email: "new@gmail.com"
        }

        it("should update data for user", async () => {
            const token = users.get("user")?.token;

            await request(server)
                    .patch("/user")
                    .set("Authorization", `Bearer ${token}`)
                    .send(updatedDto)
                    .expect(200);

            await request(server)
                    .get("/user/token")
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200)
                    .expect((res) => {
                        expect(res.body.address).toBe(updatedDto.address)
                        expect(res.body.phone).toBe(updatedDto.phone)
                        expect(res.body.email).toBe(updatedDto.email)
                    });
            
        })
    })

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
        })

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
                    .expect(res => {
                        expect(res.body.role).toBe("user")
                    });
        })
    })

    describe("deleteUser", () => {
        it("should be available only for ADMIN", async () => {
            const token1 = users.get("user")?.token;
            const token2 = users.get("moderator")?.token;

            await request(server)
                    .delete("/user/1")
                    .set("Authorization", `Bearer ${token1}`)
                    .expect(403);

            await request(server)
                    .delete("/user/1")
                    .set("Authorization", `Bearer ${token2}`)
                    .expect(403);
        })

        it("should softly remove user", async () => {
            const token = users.get("admin")?.token;
            const moderatorId = users.get("moderator")?.id;

            await request(server)
                    .delete(`/user/${moderatorId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200);

            await request(server)
                    .get(`/user/${moderatorId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(404);
        })
    })


    describe("cartProduct", () => {
        let productId: number;
        let categoryId: number;
        let supplierId: number;

        beforeEach(async () => {
            const id = users.get("user")!.id;

            categoryId = await entityBuilder.createCategory()
            supplierId = await entityBuilder.createSupplier()

            productId = await entityBuilder.createProduct(supplierId, categoryId);
            await entityBuilder.createCartProduct(id, productId)
        })

        describe("addCartProduct", () => {
            it("should add new product to user's cart", async () => {
                const token = users.get("user")?.token;

                const productId2 = await entityBuilder.createProduct(supplierId, categoryId);

                await request(server)
                        .post(`/cart/${productId2}`)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(201);

                await request(server)
                        .get("/user/token")
                        .set("Authorization", `Bearer ${token}`)
                        .expect(200)
                        .expect(res => {
                            expect(res.body.cart.length).toBe(2)
                        })
            })
        })

        describe("updateCartProduct", () => {
            it("should add new product to user's cart", async () => {
                const token = users.get("user")?.token;
                
                const updateCPDto: UpdateCartProductDto = {
                    amount: 3,
                    productId
                }

                await request(server)
                        .patch("/cart")
                        .set("Authorization", `Bearer ${token}`)
                        .send(updateCPDto)
                        .expect(200)

                await request(server)
                        .get("/user/token")
                        .set("Authorization", `Bearer ${token}`)
                        .expect(200)
                        .expect(res => expect(res.body.cart[0].amount).toBe(updateCPDto.amount))
            })
        })

        describe("removeCartProduct", () => {
            it("should delete product from user's cart", async () => {
                const token = users.get("user")?.token;

                await request(server)
                        .delete(`/cart/${productId}`)
                        .set("Authorization", `Bearer ${token}`)
                        .expect(200)

                await request(server)
                        .get("/user/token")
                        .set("Authorization", `Bearer ${token}`)
                        .expect(200)
                        .expect(res => expect(res.body.cart.length).toBe(0))
            })
        })
    })
});
