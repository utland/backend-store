import { CreateCategoryDto } from "src/category/dto/create-category.dto";
import { EntityBuilder, ITestPayload, reviewTest } from "./config/entity-builder";
import { TestBuilder } from "./config/test-builder";
import request from "supertest";
import { UpdateCategoryDto } from "src/category/dto/update-category.dto";
import { CreateReviewDto } from "src/review/dto/create-review.dto";
import { UpdateReviewDto } from "src/review/dto/update-review.dto";

describe("Review Test", () => {
    let test: TestBuilder;
    let server: any;
    let entityBuilder: EntityBuilder;
    let user: ITestPayload;
    let productId: number;

    beforeAll(async () => {
        test = await TestBuilder.create();
        server = test.app.getHttpServer();
        entityBuilder = new EntityBuilder(test.app, server);
    });

    beforeAll(async () => {
        user = await entityBuilder.createUser();
        const categoryId = await entityBuilder.createCategory();
        const supplierId = await entityBuilder.createSupplier();

        productId = await entityBuilder.createProduct(supplierId, categoryId);
    });

    afterEach(async () => {
        await test.clearDb(["users", "category", "supplier", "product"]);
    });

    afterAll(async () => {
        await test.clearDb();
        await test.closeApp();
    });

    describe("createReview", () => {
        it("should create new review", async () => {
            const createReviewDto: CreateReviewDto = {
                productId,
                evaluation: 1,
                comment: "text"
            };

            await request(server)
                .post("/review")
                .set("Authorization", `Bearer ${user.token}`)
                .send(createReviewDto)
                .expect(201)
                .expect((res) => {
                    expect(res.body.reviewId).toBeDefined();
                    expect(res.body.productId).toBe(createReviewDto.productId);
                    expect(res.body.evaluation).toBe(createReviewDto.evaluation);
                    expect(res.body.comment).toBe(createReviewDto.comment);
                });
        });
    });

    describe("findReview", () => {
        it("should return certain review", async () => {
            const reviewId = await entityBuilder.createReview(user.id, productId);

            await request(server)
                .get(`/review/${reviewId}`)
                .set("Authorization", `Bearer ${user.token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.reviewId).toBe(reviewId);
                    expect(res.body.comment).toBe(reviewTest.comment);
                    expect(res.body.evaluation).toBe(reviewTest.evaluation);
                });
        });
    });

    describe("updateReview", () => {
        const updateReviewDto: UpdateReviewDto = {
            evaluation: 2,
            comment: "new-comment"
        };

        it("should update review", async () => {
            const reviewId = await entityBuilder.createReview(user.id, productId);

            await request(server)
                .patch(`/review/${reviewId}`)
                .set("Authorization", `Bearer ${user.token}`)
                .send(updateReviewDto)
                .expect(200);

            await request(server)
                .get(`/review/${reviewId}`)
                .set("Authorization", `Bearer ${user.token}`)
                .expect(200)
                .expect((res) => {
                    expect(res.body.evaluation).toBe(updateReviewDto.evaluation);
                    expect(res.body.comment).toBe(updateReviewDto.comment);
                });
        });
    });

    describe("deleteReview", () => {
        it("should remove review", async () => {
            const reviewId = await entityBuilder.createReview(user.id, productId);

            await request(server)
                .delete(`/review/${reviewId}`)
                .set("Authorization", `Bearer ${user.token}`)
                .expect(200);

            await request(server).get(`/review/${reviewId}`).set("Authorization", `Bearer ${user.token}`).expect(404);
        });
    });
});
