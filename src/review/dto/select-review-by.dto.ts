import { IsIn, IsNotEmpty, IsNumber } from "class-validator";

export class SelectReviewsByDto {
    @IsNotEmpty()
    @IsIn(["DESC", "ASC"])
    order: "DESC" | "ASC";

    @IsNotEmpty()
    @IsNumber()
    productId: number;
}
