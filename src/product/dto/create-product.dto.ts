import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { PrimaryGeneratedColumn } from "typeorm";

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    price: number;

    @IsNotEmpty()
    @IsNumber()
    supplierId: number;

    @IsNotEmpty()
    @IsNumber()
    categoryId: number;

    @IsOptional()
    @IsNumber()
    inStock: number;
}
