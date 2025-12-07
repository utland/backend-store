import { Test } from "@nestjs/testing";
import { ReviewController } from "./review.controller";
import { ReviewService } from "./review.service";
import { number } from "joi";
import { Review } from "./entities/review.entity";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { ForbiddenException } from "@nestjs/common";
import { Role } from "src/common/enums/role.enum";

describe("ReviewController", () => {
    let reviewController: ReviewController;
    let reviewService: ReviewService;

    const testReview = {
        reviewId: 0,
        userId: 0,
        productId: 0,
        evaluation: 0,
        comment: "text"
    };

    const updateDto: UpdateReviewDto = {
        evaluation: 0,
        comment: ""
    };

    beforeEach(async () => {
        const moduleRef = await Test.createTestingModule({
            controllers: [ReviewController],
            providers: [
                {
                    provide: ReviewService,
                    useValue: {
                        findReview: jest.fn(),
                        updateReview: jest.fn(),
                        removeReview: jest.fn()
                    }
                }
            ]
        }).compile();

        reviewController = moduleRef.get<ReviewController>(ReviewController);
        reviewService = moduleRef.get<ReviewService>(ReviewService);

        jest.spyOn(reviewService, "findReview").mockResolvedValueOnce(testReview as Review);
    });

    it("should throw exception if user doenst have access to update review", async () => {
        await expect(reviewController.update(0, updateDto, 1)).rejects.toThrow(ForbiddenException);
    });

    it("should throw exception if user doenst have access to delete review", async () => {
        await expect(reviewController.remove(0, 1, false)).rejects.toThrow(ForbiddenException);
    });

    it("should remove review if user is ADMIN", async () => {
        const saveSpy = jest.spyOn(reviewService, "removeReview");

        await reviewController.remove(1, 0, true);

        expect(saveSpy).toHaveBeenCalled();
    });

    it("should remove review successfully", async () => {
        const saveSpy = jest.spyOn(reviewService, "removeReview");

        await reviewController.remove(0, 0, true);

        expect(saveSpy).toHaveBeenCalled();
    });

    it("should update review successfully", async () => {
        jest.spyOn(reviewService, "updateReview").mockResolvedValueOnce(Object.assign(testReview, updateDto) as Review);

        const review = await reviewController.update(0, updateDto, 0);

        expect(review).toEqual(Object.assign(testReview, updateDto));
    });
});
