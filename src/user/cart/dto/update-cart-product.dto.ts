import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class UpdateCartProductDto {
    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    amount: number;

    @IsNumber()
    @IsNotEmpty()
    productId: number;
}
