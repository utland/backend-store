import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class AddProductDto {
    @IsNotEmpty()
    @IsNumber()
    productId: number;
}