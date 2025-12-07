import { IsArray, IsNotEmpty, IsString, Validate, ValidateNested } from "class-validator";
import { CreateOrderProductDto } from "./create-order-product.dto";
import { Type } from "class-transformer";

export class CreateOrderDto {
    @IsNotEmpty()
    @IsString()
    address: string;

    @IsNotEmpty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateOrderProductDto)
    createOrderProductsDto: CreateOrderProductDto[];
}
