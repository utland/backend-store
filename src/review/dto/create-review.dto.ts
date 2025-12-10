import { IsIn, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateReviewDto {
    @IsNotEmpty()
    @IsNumber()
    productId: number;

    @IsNotEmpty()
    @IsIn([1, 2, 3, 4, 5])
    evaluation: number;

    @IsNotEmpty()
    @IsString()
    comment: string;
}
