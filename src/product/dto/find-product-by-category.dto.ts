import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { number } from "joi";

const allowedOrderBy = ["name", "price"] as const;

export type OrderByType = typeof allowedOrderBy[number]

export class FindProductByCategoryDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(allowedOrderBy)
    orderBy: OrderByType;

    @IsNumber()
    @IsNotEmpty()
    categoryId: number;

    @IsNotEmpty()
    @IsBoolean()
    isInStock: boolean;
}