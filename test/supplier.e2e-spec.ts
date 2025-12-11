import { TestBuilder } from "./config/test-builder";
import { EntityBuilder, ITestPayload, productTest, supplierTest } from "./config/entity-builder";
import request from "supertest";
import { CreateSupplierDto } from "src/supplier/dto/create-supplier.dto";
import { UpdateSupplierDto } from "src/supplier/dto/update-supplier.dto";
import { takeWhile } from "rxjs";
import { OrderStatus } from "src/common/enums/status.enum";

describe("Product test", () => {
    let test: TestBuilder;
    let server: any;
    let entityBuilder: EntityBuilder;

    let users: Map<string, ITestPayload>;
    let supplierId: number;

    beforeAll(async () => {
        test = await TestBuilder.create();
        server = test.app.getHttpServer();
        entityBuilder = new EntityBuilder(test.app, server);
    });

    beforeAll(async () => {
        users = await entityBuilder.createUsers();
    });

    beforeEach(async () => {
        supplierId = await entityBuilder.createSupplier();
    });

    afterEach(async () => {
        await test.clearDb(["users"]);
    });

    afterAll(async () => {
        await test.clearDb();
        await test.closeApp();
    });

    describe("createSupplier", () => {
        const createSupplierDto: CreateSupplierDto = {
            name: "supplier",
            phone: "+380489599",
            email: "example@gmail.com"
        };

        it("should be available only for ADMIN", async () => {
            const token1 = users.get("user")?.token;
            const token2 = users.get("moderator")?.token;

            await request(server)
                .post("/supplier")
                .set("Authorization", `Bearer ${token1}`)
                .send(createSupplierDto)
                .expect(403);

            await request(server)
                .post("/supplier")
                .set("Authorization", `Bearer ${token2}`)
                .send(createSupplierDto)
                .expect(403);
        });

        it("should create new supplier", async () => {
            const token = users.get("admin")?.token;

            await request(server)
                .post("/supplier")
                .set("Authorization", `Bearer ${token}`)
                .send(createSupplierDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body.supplierId).toBeDefined();
                    expect(res.body.email).toBe(createSupplierDto.email);
                    expect(res.body.phone).toBe(createSupplierDto.phone);
                    expect(res.body.name).toBe(createSupplierDto.name);
                    expect(res.body.logoUrl).toBeDefined();
                });
        });
    });

    describe("findAll", () => {
        it("should return all suppliers", async () => {
            const token = users.get("user")?.token;

            await entityBuilder.createSupplier();
            await entityBuilder.createSupplier();

            await request(server)
                .get("/supplier")
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect((res) => expect(res.body.length).toBe(3));
        });
    });

    describe("findOne", () => {
        it("should return certain supplier by id", async () => {
            const token = users.get("user")?.token;

            await request(server)
                .get(`/supplier/${supplierId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.supplierId).toBe(supplierId);
                });
        });
    });

    describe("updateSupplier", () => {
        const updateSupplierDto: UpdateSupplierDto = {
            name: "new-supplier",
            phone: "+000000000",
            email: "new@gmail.com",
            logo: "url-for-newlogo"
        };

        it("should be available only for ADMIN", async () => {
            const token1 = users.get("user")?.token;
            const token2 = users.get("moderator")?.token;

            await request(server)
                .patch(`/supplier/${supplierId}`)
                .set("Authorization", `Bearer ${token1}`)
                .send(updateSupplierDto)
                .expect(403);

            await request(server)
                .patch(`/supplier/${supplierId}`)
                .set("Authorization", `Bearer ${token2}`)
                .send(updateSupplierDto)
                .expect(403);
        });

        it("should update supplier", async () => {
            const token = users.get("admin")?.token;

            await request(server)
                .patch(`/supplier/${supplierId}`)
                .set("Authorization", `Bearer ${token}`)
                .send(updateSupplierDto)
                .expect(200);

            await request(server)
                .get(`/supplier/${supplierId}`)
                .set("Authorization", `Bearer ${token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.supplierId).toBeDefined();
                    expect(res.body.email).toBe(updateSupplierDto.email);
                    expect(res.body.phone).toBe(updateSupplierDto.phone);
                    expect(res.body.name).toBe(updateSupplierDto.name);
                    expect(res.body.logoUrl).toBeDefined();
                });
        });
    });

    describe("deleteSupplier", () => {
        it("should be available only for ADMIN", async () => {
            const token1 = users.get("user")?.token;
            const token2 = users.get("moderator")?.token;

            await request(server)
                .delete(`/supplier/${supplierId}`)
                .set("Authorization", `Bearer ${token1}`)
                .expect(403);

            await request(server)
                .delete(`/supplier/${supplierId}`)
                .set("Authorization", `Bearer ${token2}`)
                .expect(403);
        });

        it("should remove supplier", async () => {
            const token = users.get("admin")?.token;

            await request(server).delete(`/supplier/${supplierId}`).set("Authorization", `Bearer ${token}`).expect(200);

            await request(server).get(`/supplier/${supplierId}`).set("Authorization", `Bearer ${token}`).expect(404);
        });
    });

    describe("getInfoAboutSales", () => {
        const salesDto = {
            year: "2025",
            month: "12"
        };

        it("should be available only for ADMIN", async () => {
            const token1 = users.get("user")?.token;
            const token2 = users.get("moderator")?.token;

            await request(server)
                .get("/supplier/sales")
                .set("Authorization", `Bearer ${token1}`)
                .send(salesDto)
                .expect(403);

            await request(server)
                .get("/supplier/sales")
                .set("Authorization", `Bearer ${token2}`)
                .send(salesDto)
                .expect(403);
        });

        it("should return analytics about sales of supplier for a month", async () => {
            const token = users.get("admin")?.token;
            const id = Number(users.get("user")?.id);

            const categoryId = await entityBuilder.createCategory();

            const productId1 = await entityBuilder.createProduct(supplierId, categoryId);
            const productId2 = await entityBuilder.createProduct(supplierId, categoryId);
            const productId3 = await entityBuilder.createProduct(supplierId, categoryId);

            const orderId = await entityBuilder.createOrder(id, OrderStatus.COMPLETED);

            await entityBuilder.createOrderProduct(orderId, productId1);
            await entityBuilder.createOrderProduct(orderId, productId2);
            await entityBuilder.createOrderProduct(orderId, productId3);

            await request(server)
                .get("/supplier/sales")
                .set("Authorization", `Bearer ${token}`)
                .send(salesDto)
                .expect(200)
                .expect((res) => {
                    expect(res.body).toBeInstanceOf(Array);
                    expect(res.body[0].companyName).toBe(supplierTest.name);
                    expect(res.body[0].soldProducts).toBe("3");
                    expect(res.body[0].avgPrice).toBeDefined();
                });
        });

        it("should be unavailable if related entries are not deleted", async () => {
            const token = users.get("admin")?.token;
            
            const categoryId = await entityBuilder.createCategory();
            await entityBuilder.createProduct(supplierId, categoryId);

            await request(server).delete(`/supplier/${supplierId}`).set("Authorization", `Bearer ${token}`).expect(400);
        });
    });
});
