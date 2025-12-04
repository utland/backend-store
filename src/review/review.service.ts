import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Review } from "./entities/review.entity";
import { Repository } from "typeorm";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";

@Injectable()
export class ReviewService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepo: Repository<Review>,
    ) {}

    public async createReview(
        userId: number,
        createReviewDto: CreateReviewDto,
    ): Promise<Review> {
        const { productId, evaluation, comment } = createReviewDto;

        const review = this.reviewRepo.create({
            userId,
            productId,
            evaluation,
            comment,
        });

        await this.reviewRepo.save(review);

        return review;
    }

    public async findReviewsByProductId(productId: number): Promise<Review[]> {
        const reviews = await this.reviewRepo.find({ where: { productId } });

        return reviews;
    }

    public async findReview(reviewId: number): Promise<Review> {
        const review = await this.reviewRepo.findOne({
            where: { reviewId },
            relations: ["user"],
        });

        if (!review) throw new NotFoundException();

        return review;
    }

    public async updateReview(
        review: Review,
        updateReviewDto: UpdateReviewDto,
    ): Promise<Review> {
        return await this.reviewRepo.save(
            Object.assign(review, updateReviewDto),
        );
    }

    public async removeReview(review: Review): Promise<void> {
        await this.reviewRepo.remove(review);
    }
}
