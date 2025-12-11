import { CreateCategoryDto } from "src/category/dto/create-category.dto";
import { EntityBuilder, ITestPayload } from "./config/entity-builder";
import { TestBuilder } from "./config/test-builder";
import request from "supertest";
import { UpdateCategoryDto } from "src/category/dto/update-category.dto";

describe("Category Test", () => {
    let test: TestBuilder;
    let server: any;
    let entityBuilder: EntityBuilder;

    let users: Map<string, ITestPayload>;
    let categoryId: number;

    beforeAll(async () => {
        test = await TestBuilder.create();
        server = test.app.getHttpServer();
        entityBuilder = new EntityBuilder(test.app, server);
    });

    beforeAll(async () => {
        users = await entityBuilder.createUsers();
    });

    beforeEach(async () => {
        categoryId = await entityBuilder.createCategory();
    });

    afterEach(async () => {
        await test.clearDb(["users"]);
    });

    afterAll(async () => {
        await test.clearDb();
        await test.closeApp();
    });

    describe("createCategory", () => {
        const createCategoryDto: CreateCategoryDto = {
            name: "supplier",
            img_url: "url"
        };

        it("should be available only for ADMIN", async () => {
            const token1 = users.get("user")?.token;
            const token2 = users.get("moderator")?.token;

            await request(server)
                .post("/category")
                .set("Authorization", `Bearer ${token1}`)
                .send(createCategoryDto)
                .expect(403);

            await request(server)
                .post("/category")
                .set("Authorization", `Bearer ${token2}`)
                .send(createCategoryDto)
                .expect(403);
        });

        it("should create new category", async () => {
            const token = users.get("admin")?.token;

            await request(server)
                .post("/category")
                .set("Authorization", `Bearer ${token}`)
                .send(createCategoryDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body.categoryId).toBeDefined();
                    expect(res.body.name).toBe(createCategoryDto.name);
                    expect(res.body.img_url).toBe(createCategoryDto.img_url);
                });
        });
    });

    describe("findAll", () => {
        it("should return all categories", async () => {
            const token = users.get("user")?.token;

            await entityBuilder.createCategory();
            await entityBuilder.createCategory();

            await request(server)
                .get("/category")
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect((res) => expect(res.body.length).toBe(3));
        });
    });

    describe("findCategory", () => {
        it("should return certain category by id", async () => {
            const token = users.get("user")?.token;

            await request(server)
                .get(`/category/${categoryId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.categoryId).toBe(categoryId);
                    expect(res.body.name).toBeDefined();
                    expect(res.body.img_url).toBeDefined();
                });
        });
    });

    describe("updateCategory", () => {
        const updateCategoryDto: UpdateCategoryDto = {
            name: "new-supplier",
            img_url: "new-url"
        };

        it("should be available only for ADMIN", async () => {
            const token1 = users.get("user")?.token;
            const token2 = users.get("moderator")?.token;

            await request(server)
                .patch(`/category/${categoryId}`)
                .set("Authorization", `Bearer ${token1}`)
                .send(updateCategoryDto)
                .expect(403);

            await request(server)
                .patch(`/category/${categoryId}`)
                .set("Authorization", `Bearer ${token2}`)
                .send(updateCategoryDto)
                .expect(403);
        });

        it("should update category", async () => {
            const token = users.get("admin")?.token;

            await request(server)
                .patch(`/category/${categoryId}`)
                .set("Authorization", `Bearer ${token}`)
                .send(updateCategoryDto)
                .expect(200);

            await request(server)
                .get(`/category/${categoryId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.categoryId).toBeDefined();
                    expect(res.body.name).toBe(updateCategoryDto.name);
                    expect(res.body.img_url).toBe(updateCategoryDto.img_url);
                });
        });
    });

    describe("deleteCategory", () => {
        it("should be available only for ADMIN", async () => {
            const token1 = users.get("user")?.token;
            const token2 = users.get("moderator")?.token;

            await request(server)
                .delete(`/category/${categoryId}`)
                .set("Authorization", `Bearer ${token1}`)
                .expect(403);

            await request(server)
                .delete(`/category/${categoryId}`)
                .set("Authorization", `Bearer ${token2}`)
                .expect(403);
        });

        it("should remove category", async () => {
            const token = users.get("admin")?.token;

            await request(server).delete(`/category/${categoryId}`).set("Authorization", `Bearer ${token}`).expect(200);

            await request(server).get(`/category/${categoryId}`).set("Authorization", `Bearer ${token}`).expect(404);
        });

        it("should be unavailable if related entries are not deleted", async () => {
            const token = users.get("admin")?.token;
            
            const supplierId = await entityBuilder.createSupplier();
            await entityBuilder.createProduct(supplierId, categoryId);

            await request(server).delete(`/category/${categoryId}`).set("Authorization", `Bearer ${token}`).expect(400);
        });
    });
});
