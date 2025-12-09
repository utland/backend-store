import { Transform, Type } from "class-transformer";
import { IsBoolean, IsIn, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { number } from "joi";

const allowedOrderBy = ["name", "price"] as const;

export type OrderByType = (typeof allowedOrderBy)[number];

export class FindProductByCategoryDto {
    @IsString()
    @IsNotEmpty()
    @IsIn(allowedOrderBy)
    orderBy: OrderByType;

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    categoryId: number;

    @IsNotEmpty()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isInStock: boolean;
}
