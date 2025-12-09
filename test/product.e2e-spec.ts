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

describe("Product test", () => {
    let test: TestBuilder;
    let server: any;
    let entityBuilder: EntityBuilder;

    let tokens: Map<string, ITestPayload>;
    let categoryId: number;
    let supplierId: number;
    
    beforeAll(async () => {
        test = await TestBuilder.create();
        server = test.app.getHttpServer();
        entityBuilder = new EntityBuilder(test.app, server);
    });
    
    beforeAll(async () => {
        tokens = await entityBuilder.createUsers();
        
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
            const token1 = tokens.get("user")?.token;
            const token2 = tokens.get("moderator")?.token;

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
        })

        it("should create product successfully", async () => {
            const token = tokens.get("admin")?.token;

            await request(server)
                    .post("/product")
                    .set("Authorization", `Bearer ${token}`)
                    .send({ ...productTest, categoryId, supplierId })
                    .expect(201)
                    .expect(res => {
                        expect(res.body.deletedAt).toBeUndefined()
                        expect(res.body.productId).toBeDefined()
                        expect(res.body.name).toBe(productTest.name)
                        expect(res.body.price).toBe(productTest.price)
                        expect(res.body.description).toBe(productTest.description)
                        expect(res.body.isInStock).toBe(true)
                        expect(res.body.imgUrl).toBeDefined()
                        expect(res.body.createdAt).toBeDefined()
                        expect(res.body.updatedAt).toBeDefined()    
                        expect(res.body.categoryId).toBe(categoryId)   
                        expect(res.body.supplierId).toBe(supplierId)   
                    });
        })
    })

    describe("findAll", () => {
        it("should return all available products", async () => {
            const token = tokens.get("user")?.token;

            await entityBuilder.createProduct(supplierId, categoryId);
            await entityBuilder.createProduct(supplierId, categoryId);
            await entityBuilder.createProduct(supplierId, categoryId);

            await request(server)
                    .get("/product")
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200)
                    .expect(res => expect(res.body.length).toBe(3));
        })
    })

    describe("findByCategory", () => {
        it("should return all available products", async () => {
            const token = tokens.get("user")?.token;

            const categoryId2 = await entityBuilder.createCategory();

            await entityBuilder.createProduct(supplierId, categoryId);
            await entityBuilder.createProduct(supplierId, categoryId);
            await entityBuilder.createProduct(supplierId, categoryId2);

            await request(server)
                    .get(`/product/byCategory?orderBy=name&categoryId=${categoryId}&isInStock=true`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200)
                    .expect(res => expect(res.body.length).toBe(2));
        })
    })

    describe("findOne", () => {
        const findByDto: FindProductByCategoryDto = {
            orderBy: "name",
            categoryId,
            isInStock: true
        }

        it("should return product by id", async () => {
            const token = tokens.get("user")?.token;

            const productId = await entityBuilder.createProduct(supplierId, categoryId);

            await request(server)
                    .get(`/product/${productId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .send(findByDto)
                    .expect(200)
                    .expect(res => {
                        expect(res.body.deletedAt).toBeUndefined()
                        expect(res.body.productId).toBeDefined()
                        expect(res.body.name).toBe(productTest.name)
                        expect(res.body.price).toBe(productTest.price)
                        expect(res.body.description).toBe(productTest.description)
                        expect(res.body.isInStock).toBe(true)
                        expect(res.body.imgUrl).toBeDefined()
                        expect(res.body.createdAt).toBeDefined()
                        expect(res.body.updatedAt).toBeDefined()    
                        expect(res.body.categoryId).toBe(categoryId)   
                        expect(res.body.supplierId).toBe(supplierId)   
                    });
        })
    })

    describe("updateProduct", () => {
        const updateProductDto: UpdateProductDto = {
            name: "new-product",
            description: "new-desc",
            price: 999,
            isInStock: false
        }

        it("should be available only for ADMIN", async () => {
            const token1 = tokens.get("user")?.token;
            const token2 = tokens.get("moderator")?.token;

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
        })

        it("should update product", async () => {
            const token = tokens.get("admin")?.token;

            const productId = await entityBuilder.createProduct(supplierId, categoryId);

            await request(server)
                    .patch(`/product/${productId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .send({ ...updateProductDto })
                    .expect(200)
                    .expect(res => {
                        expect(res.body.deletedAt).toBeUndefined()
                        expect(res.body.productId).toBeDefined()
                        expect(res.body.name).toBe(updateProductDto.name)
                        expect(res.body.price).toBe(updateProductDto.price)
                        expect(res.body.description).toBe(updateProductDto.description)
                        expect(res.body.isInStock).toBe(updateProductDto.isInStock)
                        expect(res.body.imgUrl).toBeDefined()
                        expect(res.body.createdAt).toBeDefined()
                        expect(res.body.updatedAt).toBeDefined()    
                        expect(res.body.categoryId).toBe(categoryId)   
                        expect(res.body.supplierId).toBe(supplierId)   
                    });
        })
    })

    describe("deleteUser", () => {
        it("should be available only for ADMIN", async () => {
            const token1 = tokens.get("user")?.token;
            const token2 = tokens.get("moderator")?.token;

            const productId = await entityBuilder.createProduct(supplierId, categoryId);

            await request(server)
                    .delete(`/product/${productId}`)
                    .set("Authorization", `Bearer ${token1}`)
                    .expect(403);

            await request(server)
                    .delete(`/product/${productId}`)
                    .set("Authorization", `Bearer ${token2}`)
                    .expect(403);
        })

        it("should remove product", async () => {
            const token = tokens.get("admin")?.token;

            const productId = await entityBuilder.createProduct(supplierId, categoryId);

            await request(server)
                    .delete(`/product/${productId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(200);

            await request(server)
                    .get(`/product/${productId}`)
                    .set("Authorization", `Bearer ${token}`)
                    .expect(404);
        })
    })
});
