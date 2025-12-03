import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateOrderProductDto {
    @IsNumber()
    @IsNotEmpty()
    productId: number;

    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @IsNumber()
    @IsNotEmpty()
    price: number;
}