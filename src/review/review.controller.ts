import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    ParseIntPipe,
    Patch,
    Post,
} from "@nestjs/common";
import { ReviewService } from "./review.service";
import { CurrentUserId } from "src/common/decorators/current-user-id.decorator";
import { CreateReviewDto } from "./dto/create-review.dto";
import { Review } from "./entities/review.entity";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { isAdmin } from "src/common/decorators/is-admin.decorator";

@Controller("review")
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @Post()
    public async create(
        @CurrentUserId() userId: number,
        @Body() createReviewDto: CreateReviewDto,
    ): Promise<Review> {
        return this.reviewService.createReview(userId, createReviewDto);
    }

    @Get("/:id")
    public async findByProductId(
        @Param("id", ParseIntPipe) productId: number,
    ): Promise<Review[]> {
        return await this.reviewService.findReviewsByProductId(productId);
    }

    @Patch("/:id")
    public async update(
        @Param("id", ParseIntPipe) reviewId: number,
        @Body() updateReviewDto: UpdateReviewDto,
        @CurrentUserId() userId: number,
    ): Promise<Review> {
        const review = await this.reviewService.findReview(reviewId);
        this.checkOwnerchip(review, userId);

        return this.reviewService.updateReview(review, updateReviewDto);
    }

    @Delete("/:id")
    public async remove(
        @Param("id", ParseIntPipe) reviewId: number,
        @CurrentUserId() userId: number,
        @isAdmin() isAdmin: boolean,
    ): Promise<void> {
        const review = await this.reviewService.findReview(reviewId);
        if (!isAdmin) this.checkOwnerchip(review, userId);

        return this.reviewService.removeReview(review);
    }

    private checkOwnerchip(review: Review, userId: number): void {
        if (review.userId !== userId) {
            throw new ForbiddenException();
        }
    }
}
