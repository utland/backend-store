import { TestBuilder } from "./config/test-builder";
import { SignUpDto } from "../src/auth/dto/sign-up.dto";
import request from "supertest";
import { getRepositoryToken } from "@nestjs/typeorm";
import { User } from "src/user/entities/user.entity";
import { Repository } from "typeorm";
import { Role } from "src/common/enums/role.enum";
import { EntityBuilder, ITestPayload, productTest } from "./config/entity-builder";
import { CreateProductDto } from "src/product/dto/create-product.dto";
import { CreateSupplierDto } from "src/supplier/dto/create-supplier.dto";
import { CreateCategoryDto } from "src/category/dto/create-category.dto";
import { FindProductByCategoryDto } from "src/product/dto/find-product-by-category.dto";
import { UpdateProductDto } from "src/product/dto/update-product.dto";
import { Review } from "src/review/entities/review.entity";

describe("Product test", () => {
    let test: TestBuilder;
    let server: any;
    let entityBuilder: EntityBuilder;

    let users: Map<string, ITestPayload>;
    let categoryId: number;
    let supplierId: number;

    beforeAll(async () => {
        test = await TestBuilder.create();
        server = test.app.getHttpServer();
        entityBuilder = new EntityBuilder(test.app, server);
    });

    beforeAll(async () => {
        users = await entityBuilder.createUsers();

        supplierId = await entityBuilder.createSupplier();
        categoryId = await entityBuilder.createCategory();
    });

    afterEach(async () => {
        await test.clearDb(["users", "category", "supplier"]);
    });

    afterAll(async () => {
        await test.clearDb();
        await test.closeApp();
    });

    describe("createProduct", () => {
        it("should be available only for ADMIN", async () => {
            const token1 = users.get("user")?.token;
            const token2 = users.get("moderator")?.token;

            await request(server)
                .post("/product")
                .set("Authorization", `Bearer ${token1}`)
                .send({ ...productTest, categoryId, supplierId })
                .expect(403);

            await request(server)
                .post("/product")
                .set("Authorization", `Bearer ${token2}`)
                .send({ ...productTest, categoryId, supplierId })
                .expect(403);
        });

        it("should create product successfully", async () => {
            const token = users.get("admin")?.token;

            await request(server)
                .post("/product")
                .set("Authorization", `Bearer ${token}`)
                .send({ ...productTest, categoryId, supplierId })
                .expect(201)
                .expect((res) => {
                    expect(res.body.deletedAt).toBeUndefined();
                    expect(res.body.productId).toBeDefined();
                    expect(res.body.name).toBe(productTest.name);
                    expect(res.body.price).toBe(productTest.price);
                    expect(res.body.description).toBe(productTest.description);
                    expect(res.body.inStock).toBe(1);
                    expect(res.body.imgUrl).toBeDefined();
                    expect(res.body.createdAt).toBeDefined();
                    expect(res.body.updatedAt).toBeDefined();
                    expect(res.body.categoryId).toBe(categoryId);
                    expect(res.body.supplierId).toBe(supplierId);
                });
        });
    });

    describe("findAll", () => {
        it("should return all available products", async () => {
            const token = users.get("user")?.token;

            await entityBuilder.createProduct(supplierId, categoryId);
            await entityBuilder.createProduct(supplierId, categoryId);
            await entityBuilder.createProduct(supplierId, categoryId);

            await request(server)
                .get("/product")
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect((res) => expect(res.body.length).toBe(3));
        });
    });

    describe("findByCategory", () => {
        it("should return all available products", async () => {
            const token = users.get("user")?.token;

            const categoryId2 = await entityBuilder.createCategory();

            await entityBuilder.createProduct(supplierId, categoryId);
            await entityBuilder.createProduct(supplierId, categoryId);
            await entityBuilder.createProduct(supplierId, categoryId2);

            await request(server)
                .get(`/product/byCategory?orderBy=name&categoryId=${categoryId}&isInStock=true`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect((res) => expect(res.body.length).toBe(2));
        });
    });

    describe("findOne", () => {
        const findByDto: FindProductByCategoryDto = {
            orderBy: "name",
            categoryId,
            isInStock: true
        };

        it("should return product by id", async () => {
            const token = users.get("user")?.token;

            const productId = await entityBuilder.createProduct(supplierId, categoryId);

            await request(server)
                .get(`/product/${productId}`)
                .set("Authorization", `Bearer ${token}`)
                .send(findByDto)
                .expect(200)
                .expect((res) => {
                    expect(res.body.deletedAt).toBeUndefined();
                    expect(res.body.productId).toBeDefined();
                    expect(res.body.name).toBe(productTest.name);
                    expect(res.body.price).toBe(productTest.price);
                    expect(res.body.description).toBe(productTest.description);
                    expect(res.body.inStock).toBe(1);
                    expect(res.body.imgUrl).toBeDefined();
                    expect(res.body.createdAt).toBeDefined();
                    expect(res.body.updatedAt).toBeDefined();
                    expect(res.body.categoryId).toBe(categoryId);
                    expect(res.body.supplierId).toBe(supplierId);
                });
        });
    });

    describe("updateProduct", () => {
        const updateProductDto: UpdateProductDto = {
            name: "new-product",
            description: "new-desc",
            price: 999,
            inStock: 78
        };

        it("should be available only for ADMIN", async () => {
            const token1 = users.get("user")?.token;
            const token2 = users.get("moderator")?.token;

            await request(server)
                .post("/product")
                .set("Authorization", `Bearer ${token1}`)
                .send(updateProductDto)
                .expect(403);

            await request(server)
                .post("/product")
                .set("Authorization", `Bearer ${token2}`)
                .send(updateProductDto)
                .expect(403);
        });

        it("should update product", async () => {
            const token = users.get("admin")?.token;

            const productId = await entityBuilder.createProduct(supplierId, categoryId);

            await request(server)
                .patch(`/product/${productId}`)
                .set("Authorization", `Bearer ${token}`)
                .send({ ...updateProductDto })
                .expect(200)
                .expect((res) => {
                    expect(res.body.deletedAt).toBeUndefined();
                    expect(res.body.productId).toBeDefined();
                    expect(res.body.name).toBe(updateProductDto.name);
                    expect(res.body.price).toBe(updateProductDto.price);
                    expect(res.body.description).toBe(updateProductDto.description);
                    expect(res.body.inStock).toBe(updateProductDto.inStock);
                    expect(res.body.imgUrl).toBeDefined();
                    expect(res.body.createdAt).toBeDefined();
                    expect(res.body.updatedAt).toBeDefined();
                    expect(res.body.categoryId).toBe(categoryId);
                    expect(res.body.supplierId).toBe(supplierId);
                });
        });
    });

    describe("deleteUser", () => {
        it("should be available only for ADMIN", async () => {
            const token1 = users.get("user")?.token;
            const token2 = users.get("moderator")?.token;

            const productId = await entityBuilder.createProduct(supplierId, categoryId);

            await request(server).delete(`/product/${productId}`).set("Authorization", `Bearer ${token1}`).expect(403);

            await request(server).delete(`/product/${productId}`).set("Authorization", `Bearer ${token2}`).expect(403);
        });

        it("should remove product with CASCADE", async () => {
            const token = users.get("admin")?.token;
            const id = users.get("user")!.id;
            const id2 = users.get("moderator")!.id;

            
            const productId = await entityBuilder.createProduct(supplierId, categoryId);
            await entityBuilder.createReview(id, productId);
            await entityBuilder.createReview(id2, productId);

            const reviewRepo = test.app.get<Repository<Review>>(getRepositoryToken(Review));

            const countBefore = await reviewRepo.countBy({ productId });
            expect(countBefore).toBe(2);

            await request(server).delete(`/product/${productId}`).set("Authorization", `Bearer ${token}`).expect(200);

            await request(server).get(`/product/${productId}`).set("Authorization", `Bearer ${token}`).expect(404);

            const countAfter = await reviewRepo.countBy({ productId });
            expect(countAfter).toBe(0);
        });

        it("should be unavailable if related entries are not deleted", async () => {
            const token = users.get("admin")?.token;
            const id = users.get("user")!.id;

            
            const productId = await entityBuilder.createProduct(supplierId, categoryId);
            await entityBuilder.createCartProduct(id, productId);


            await request(server).delete(`/product/${productId}`).set("Authorization", `Bearer ${token}`).expect(400);
        });
    });
});
